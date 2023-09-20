import express, { Application ,Request, Response,NextFunction  } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from 'cors';
import database from "./sequelize/sequelize";
import Paths from "./sequelize/repositories/Route.model";
import proxy from 'express-http-proxy';
export default class ExpressApp {
  public app: Application;

  /**
   * Creates an instance of ExpressApp.
   * Initializes middleware and sets up error handling.
   * @memberof ExpressApp
   */
  public constructor() {
    this.app = express();
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(morgan("dev"));
    this.injectPath();
    this.setupErrorHandling();
  }

  /**
   *
   * Injects controller routes into the Express.
   * @private
   * @memberof ExpressApp
   */
  private async injectPath(): Promise<void> {
    const route: Paths[] = await Paths.findAll()

    route.forEach((paths)=>{

      console.log(paths.dataValues.port)
      this.app.use(paths.dataValues.path,proxy(`http://localhost:${paths.dataValues.port}`))
      console.log(this.app.use)
      // this.app.get('/publish',async(req,res)=>{
      //   await Paths.create({
      //     path: req.body.path,
      //     port: req.body.port
        
      //   })
      // })

      // this.app.use()
    })

    console.log()
      
    //   (this.app as unknown as { [key: string]: Function })[method](path, controllerObject[controller]);
  }

  
  /**
   *
   * Sets up error handling middleware.
   * @private
   * @memberof ExpressApp
   */
  private setupErrorHandling() {
    this.app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
      console.error(err); 
      response.status(500).json({ error: 'An unexpected error occurred.' });
    });
  }

  /**
   *
   * Starts the Express application on the specified port.
   * @param {number} port
   * @memberof ExpressApp
   */
  public async startEngine(port: number) {
   
    try{
      database.authenticate().then(async(res)=>{

        // await Paths.create({
        //   path: '/auth',
        //   port: 8001
          

        // })
      
        // await database.sync()
      })
      this.app.listen(port,() => {
        console.info(`Service running on http://localhost:${port}`);
      });
      }catch(error){
        console.error(error) 
      }  
  }
}
