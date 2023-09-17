import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import  User from "./repositories/User.model";
import VerificationCode from "./repositories/VerificationCode.model";
import 'dotenv/config';

const database = new Sequelize({
  dialect: process.env.DB_DIALECT as Dialect,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: console.log,
  models: [User,VerificationCode]
});

export default database;