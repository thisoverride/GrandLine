import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import  Paths from "./repositories/Route.model";
import 'dotenv/config';


const database = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "", 
  database: "grandline",
  logging: console.log,
  models: [Paths]
});

export default database;