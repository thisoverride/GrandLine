import ExpressApp from "./framework/express/ExpressApp";

const port: number = 8001;
const expressApp = new ExpressApp();
expressApp.startEngine(port);