import express, { Application ,NextFunction,Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import PathValidator from "../validator/PathValidator";
import AuthenticationController from '../../adapter/controller/AuthenticationController'
import UserService from "../../adapter/service/UserService";
import UserRepository from "../../adapter/repositories/UserRepository";
import database from '../sequelize/sequelize'
import VerificationCodeRepository from "../../adapter/repositories/VerificationCodeRepository";


export default class ExpressApp {
  public app: Application;
  public controller: Array<any>;
  public PathValidator: PathValidator;

  /**
   * Creates an instance of ExpressApp.
   * Initializes middleware and sets up error handling.
   * @memberof ExpressApp
   */
  public constructor() {
    this.app = express();
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(morgan("dev"));
    this.PathValidator = new PathValidator();
    this.controller = [
      new AuthenticationController(
        new UserService(new UserRepository(), new VerificationCodeRepository())
      ),
    ];
    this.injectControllers();
    this.setupErrorHandling();
  }

  /**
   *
   * Injects controllers http methods routes and dependency into the Express.
   * @private
   * @memberof ExpressApp
   * @return {void}
   */
  private injectControllers(): void {
    this.controller.forEach((controllerObject) => {
      controllerObject.ROUTE.forEach((controllerProperties: string) => {
        const [method, path, controller] = this.PathValidator.checkPath(controllerProperties);
        (this.app as unknown as { [key: string]: Function })[method](path, (req: Request, res: Response) =>
          controllerObject[controller](req, res)
        );
      });
    });
  }

  /**
   *
   * Sets up error handling middleware.
   * @private
   * @memberof ExpressApp
   * @return {void}
   */
  private setupErrorHandling(): void {
    this.app.use((err: Error, request: Request, response: Response) => {
      console.error(err); 
      response.status(500).json({ error: 'An unexpected error occurred.' });
    });

    this.app.use((err: Error, request: Request, response: Response ,next: NextFunction) => {
      if (err instanceof SyntaxError) {
        response.status(400).json({message: 'Bad request: the format body is incorrect.'});
      } else {
        next(err);
      }
    });
  }

  /**
   *
   * Start the Express application on the specified port, 
   * and connect database. 
   * @param {number} port
   * @memberof ExpressApp
   * @return {Promise<void>}
   */
  public async startEngine(port: number):Promise<void> {
    try {
      await database.authenticate()
      
      this.app.listen(port, async() => {
        // await database.sync({force:true})
        console.info(`Service running on http://localhost:${port}`);
      });
    } catch (error) {
      if(error)
      throw new Error(`Connection to database failed: ${error}`);
    }
  }
}
