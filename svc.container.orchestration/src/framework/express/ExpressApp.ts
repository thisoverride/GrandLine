import express, { Application,Request ,Response ,NextFunction} from "express";
import morgan from "morgan";
import ContainerController from "../../controller/ContainerController";
import PathValidator from "../validator/PathValidator";

export default class ExpressApp {
  public app: Application;
  public controller: Array<any>;
  public PathValidator: PathValidator;

  public constructor() {
    this.app = express();
    this.app.use(morgan("dev"));
    this.PathValidator = new PathValidator();
    this.controller = [new ContainerController()];
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.injectControllers();
  }

  private injectControllers(): void {
    this.controller.forEach((controllerObject) => {
      controllerObject.ROUTE.forEach((controllerProperties: string) => {
        const [method, path, controller] = this.PathValidator.checkPath(controllerProperties);

        switch (method) {
          case "GET":
            this.app.get(path, controllerObject[controller]);
            break;
          case "POST":
            this.app.post(path, controllerObject[controller]);
            break;
            case "PUT":
              this.app.put(path, controllerObject[controller]);
              break;
          case "DELETE":
            this.app.delete(path, controllerObject[controller]);
            break;
          default:
            break;
        }
      });
    });
  }

  public startEngine(port: number): void {
    
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err); 
      res.status(500).json({ error: err.message || 'Une erreur inattendue s\'est produite.' });
    });

    this.app.listen(port, () => {
      console.info(`Service running on http://localhost:${port}`);
    });
  }
}