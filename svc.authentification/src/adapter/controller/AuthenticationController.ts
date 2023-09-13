import e, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ControllerImpl } from "./ControllerInterface";
import UserRepository from "../repositories/UserRepository";
import { UserI } from "../../framework/sequelize/repositories/User.model";
import AuthentificatorService from "../../externals/services/AuthentificatorService";

export default class AuthenticationController implements ControllerImpl {
  public readonly ROUTE: Array<string>;

  public constructor() {
    this.ROUTE = [
      "@POST(/signin-grandline,authenticator)",
      "@POST(/portal.signup.grandline,registrator)",
    ];
  }
  public async authenticator(request: Request,response: Response): Promise<void> {
    try {
      const { grandLineId, password } = request.body;
      const error: Array<string> = [];

      if (!grandLineId || !password) {
        response.status(400).json({message:'Both grandLineId and password are required.'})
        return;
      }

      if (password.trim().length < 8) {
        error.push("The password must be at least 8 characters long.");
      }

      if (error.length > 0) {
        response.status(400).json({ message: error });
        return;
      }

      const userRepository: UserRepository = new UserRepository();
      const storedUser = await userRepository.findByGrandLineId(grandLineId);

      if (!storedUser) {
        response.status(401).json({ message: "User not found." });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, storedUser.password);

      if (!passwordMatch) {
        error.push("Incorrect password.");
      }

      if (error.length > 0) {
        response.status(401).json({ error: "Incorrect password." });
        return;
      }

      const authentificatorService = new AuthentificatorService()
      const token: string = authentificatorService.generateAuthToken(storedUser.id) 
      response.status(200).json({ message: token });
    } catch (error) {
      console.error("Authentication error:", error);
      response.status(500).json({ message: "Server error during authentication." });
    }
  }

  public async registrator(request: Request, response: Response): Promise<void> {
    try {
      const { lastname, firstname, grandLineId, password } = request.body;
      const error: Array<string> = [];
      if (!lastname || !firstname || !grandLineId || !password) {
        response.status(400).json({message:'All fields are required.'});
        return;
      }

      if (password.trim().length < 8) {
        error.push("The password must be at least 8 characters long");
      }
      if (error.length > 0) {
        response.status(400).json({ error: error });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user: UserI = {
        lastname,
        firstname,
        grandLineId,
        password: hashedPassword,
      };
      const userRepository: UserRepository = new UserRepository();
      const result = await userRepository.create(user);

      response.status(201).json({ message: result });
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      response.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
  }
}
