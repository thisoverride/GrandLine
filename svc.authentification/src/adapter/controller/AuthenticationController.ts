import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ControllerImpl } from "./ControllerInterface";
import UserDto from "../dto/UserDto";
import UserRepository from "../repositories/UserRepository";
import AuthenticatorService from "../../externals/services/AuthenticatorService";
import User from "../../framework/sequelize/repositories/User.model";
import PathValidator from "../../framework/validator/PathValidator";
import EmailNotification from "../../externals/services/notification/EmailNotificator";
import VerificationCodeRepository from "../repositories/VerificationCodeRepository";
import randomstring from 'randomstring';
import { VerificationCodeDto } from "../dto/VerificationCodeDto";
import VerificationCode from "../../framework/sequelize/repositories/VerificationCode.model";

export default class AuthenticationController implements ControllerImpl {
  public readonly ROUTE: Array<string>;
  private readonly USER_STATUS = {
    UNCONFIRMED: 'UNCONFIRMED',
    PASSWORD_RESET_REQUIRED: 'PASSWORD_RESET_REQUIRED',
  };

  public constructor() {
    this.ROUTE = [
      "@POST(/signin-grandline,authenticator)",
      "@POST(/portal.signup.grandline,registrator)",
      "@POST(/forgot-password,resetPasswordRequest)",
    ];

  }

  /**
   * Authenticates a user.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async authenticator(request: Request, response: Response): Promise<void> {

    try {
      const { grandLineId, password } = request.body;

      if (!grandLineId || !password || password.trim().length < 8) {
        response.status(400).json({ message: "Invalid input data." });
        return;
      }
      
      const pathValidator: PathValidator = new PathValidator()
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId)

      if(!isValidEmail){
        response.status(400).json({ message: "Invalid grandLine Id." });
        return;
      }

      const userRepository = new UserRepository();
      const storedUser = await userRepository.findByGrandLineId(grandLineId);

      if (!storedUser || !(await bcrypt.compare(password, storedUser.password))) {
        response.status(401).json({ message: "Authentication failed." });
        return;
      }
      
      if(storedUser.status === "UNCONFIRMED"){
        response.status(401).json({ message: `Authentication failed. user status is UNCONFIRMED` });
        return;
      }

      const authenticatorService = new AuthenticatorService();
      const token: string = authenticatorService.generateAuthToken(storedUser.id);
      response.status(200).json({ message: token });
    } catch (error) {
      console.error("Authentication error:", error);
      response.status(500).json({ message: "Server error during authentication." });
    }
  }

    /**
   * Registers a new user.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async registrator(request: Request, response: Response): Promise<void> {
    try {
      const { firstname, lastname, grandLineId, password } = request.body;

      if (!firstname || !lastname || !grandLineId || !password || password.trim().length < 8) {
        response.status(400).json({ message: "Invalid input data." });
        return;
      }

      const pathValidator: PathValidator = new PathValidator()
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId)

      if(!isValidEmail){
        response.status(400).json({ message: "Invalid grandLine Id." });
        return;
      }

      const isValidName: RegExp = /^[A-Za-zÀ-ÖØ-öø-ÿ-' ]+$/;
      const names: Array<string> = [firstname, lastname];

      for (const name of names) {
        if (!isValidName.test(name.trim())) {
          response.status(400).json({ message: "Invalid name." });
          return;
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10); // push in function
      const userDto = new UserDto({
        firstName: firstname,
        lastName: lastname,
        grandLineId: grandLineId,
        password: hashedPassword,
        status:'UNCONFIRMED'
      });

      const userRepository = new UserRepository();
      const isUnique: User | null = await userRepository.findByGrandLineId(userDto.grandLineId);

      if(isUnique === null){

        const result: User = await userRepository.create(userDto);

        if(result.dataValues.id){
          const verificationCode: VerificationCodeRepository = new VerificationCodeRepository();
        
          const verifyCode: VerificationCode = 
              await verificationCode.create(new VerificationCodeDto({
              userId: result.dataValues.id ,
              email: result.dataValues.grand_line_id,
              code: randomstring.generate(12)
            }));

            const emailNotification = new EmailNotification();
            const messageId = await emailNotification.sendVerificationCode(verifyCode)


          response.status(201).json({ message: messageId['messageId'] });
        }
      }else{
        response.status(400).json({ message: "grandLine Id already exists." });
      }

    } catch (error) {
      console.error("Registration error:", error);
      response.status(500).json({ message: "Server error during registration." });
    }
  }

   /**
   * Rest user password and sending email.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
   public async resetPasswordRequest(request: Request, response: Response): Promise<void> {
    const { grandLineId } = request.body;

    if (!grandLineId) {
      response.status(400).json({ message: "Invalid input data." });
      return;
    }

    const pathValidator: PathValidator = new PathValidator()
    const isValidEmail: boolean = pathValidator.checkEmail(grandLineId)

    if(!isValidEmail){
      response.status(400).json({ message: "Invalid grandLine Id." });
      return;
    }
    const userRepository = new UserRepository();
    const user: User | null = await userRepository.findByGrandLineId(grandLineId);

    if(user !== null){
      const restCode: string = pathValidator.randomPassword(12)
      const hashedPassword = await bcrypt.hash(restCode, 10);
      
      const userDto = new UserDto({
        id: user.dataValues.id,
        firstName: user.dataValues.first_name,
        lastName: user.dataValues.last_name,
        grandLineId: grandLineId,
        password: hashedPassword,
        status : 'PASSWORD_RESET_REQUIRED'
      });
      
      const resultPasswordUpdate: User | null = await userRepository.updatePassword(userDto);
      
      const emailNotification = new EmailNotification();

      if(resultPasswordUpdate){

        userDto.password = resultPasswordUpdate.dataValues.password;
        const message = await emailNotification.sendEmailNotification(userDto,restCode);
        response.status(200).json({ message:message });

      }else{
        response.status(500).json({ message: "Password update failed." });
      }
      
    }else{
      
      response.status(404).json({ message: "Account is not exist" });
    }

   }
}
