import express, { Application ,Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import PathValidator from "../validator/PathValidator";
import AuthenticationController from '../../adapter/controller/AuthenticationController'
import database from '../sequelize/sequelize'


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
    this.controller = [new AuthenticationController()];
    this.injectControllers();
    this.setupErrorHandling();
  }

  /**
   *
   * Injects controllers http methods and routes into the Express.
   * @private
   * @memberof ExpressApp
   */
  private injectControllers(): void {
    this.controller.forEach((controllerObject) => {
      controllerObject.ROUTE.forEach((controllerProperties: string) => {
        const [method, path, controller] = this.PathValidator.checkPath(controllerProperties);        
         (this.app as unknown as { [key: string]: Function })[method](path, controllerObject[controller]);
      });
    });
  }

  /**
   *
   * Sets up error handling middleware.
   * @private
   * @memberof ExpressApp
   */
  private setupErrorHandling() {
    this.app.use((err: Error, request: Request, response: Response) => {
      console.error(err); 
      response.status(500).json({ error: 'An unexpected error occurred.' });
    });
  }

  /**
   *
   * Start the Express application on the specified port, 
   * and connect database. 
   * @param {number} port
   * @memberof ExpressApp
   */
  public async startEngine(port: number) {
    // const al = new EmailNotification()
    // const dd = al.setEmailTemplate('signup')

    try {
      await database.authenticate();
  
      this.app.listen(port, async() => {
        // await database.sync({force:true})
        console.info(`Service running on http://localhost:${port}`);
      });
    } catch (error) {
      throw new Error(`Connection to database failed: ${error}`);
    }
  }
}
