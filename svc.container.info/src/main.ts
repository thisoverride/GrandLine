import express, { Application } from "express";
import morgan from "morgan";

const app: Application = express();
const port: number = 3000;

/**
 * @Express configuration
 */

app.use(morgan("dev"));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

/**
 * @Router configuration
 */

app.use((req, res, next) => {
  res.status(404).json({ Error: `Not found ${req.url}` });
});

/**
 * @Run configuration
 */

console.log(process.env.ED)
  app.listen('80001', () => {
    console.log(`Service running on `);
});
