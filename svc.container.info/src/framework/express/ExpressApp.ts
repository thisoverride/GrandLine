import express, { Application } from "express";
import morgan from "morgan";
import ContainerController from "../../controller/ContainerController";
import PathValidator from "../validator/PathValidator";

export default class ExpressApp {
  private app: Application;
  private controller: Array<any>;
  private PathValidator: PathValidator;

  public constructor() {
    this.app = express();
    this.app.use(morgan("dev"));
    this.PathValidator = new PathValidator();
    this.controller = [new ContainerController()];
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
    this.app.listen(port, () => {
      console.info(`Service running on http://localhost:${port}`);
    });
  }
}
