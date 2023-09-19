import { Sequelize } from "sequelize-typescript";
import { Dialect } from "sequelize";
import  User from "./repositories/User.model";
import VerificationCode from "./repositories/VerificationCode.model";
import 'dotenv/config';
const isLocal: boolean = true;

const database = new Sequelize({
  dialect: process.env.DB_DIALECT as Dialect,
  host: !isLocal ? process.env.DB_HOST : process.env.DB_HOST_LOCAL,
  username: !isLocal ?process.env.DB_USER : process.env.DB_USER_LOCAL,
  password: !isLocal ?process.env.DB_PASS : process.env.DB_PASS_LOCAL,
  database: !isLocal ?process.env.DB_NAME : process.env.DB_NAME_LOCAL,
  logging: console.log,
  models: [User,VerificationCode]
});

export default database;