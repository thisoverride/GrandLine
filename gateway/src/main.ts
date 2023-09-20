// import express, { Application,Request,Response } from "express";
// import proxy from 'express-http-proxy';
// import cors from 'cors';
// import morgan from "morgan";

// const app: Application = express();

// app.use(morgan('dev'));
// app.use(cors()) ;
// app.use (express.json());

// const init = (r: string) =>{
//     app.use(`/${r}`,proxy('https://google.com'))
// }

// app.use('/auth',proxy('http://localhost:8001'))

// app.use((req, res, next) => {
//     if (!req.path.startsWith('/auth')) {
//       // Le chemin de l'URL ne commence pas par "/auth", donc c'est une route non autorisée.
//       return res.status(404).send('Route non autorisée');
//     }
//     next(); // Passez au middleware suivant
//   });
  

// // app.get('/aled',(req:Request,res:Response)=>{
// //    init('devon')
// //    res.json({end:'end'})
// // })

// app. listen (8000, () => {
// console.log( 'Gateway is Listening to Port 8000 access to http://localhost:8000')
// })



import ExpressApp from "./test"

const port: number = 8000;
const expressApp = new ExpressApp();
expressApp.startEngine(port); 