export interface ControllerImpl {
    ROUTE: Array<string>;
  }
  export type Route = {
    method: string;
    path: string;
    controller:string;
  };
