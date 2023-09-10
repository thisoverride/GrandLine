import express, { Application } from "express";
import proxy from 'express-http-proxy';
import cors from 'cors';
import morgan from "morgan";

const app: Application = express();

app.use(morgan('dev'));
app.use(cors()) ;
app.use (express.json());

app.use('/metrics',proxy('http://localhost:8001'))

app. listen (8000, () => {
console.log( 'Gateway is Listening to Port 8000 access to http://localhost:8000')
})