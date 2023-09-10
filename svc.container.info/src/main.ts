import express, { Application, Request , Response } from "express";
import morgan from "morgan";

const app: Application = express();
const port: number = 8001;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use((request: Request, response: Response) => {
  response.status(404).json({Error: `Not found ${request.url}`});
});


  app.listen(port, () => {
    console.log(`Service running on ${port}`);
});
