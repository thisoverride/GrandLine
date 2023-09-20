import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CryptoJS from 'crypto-js'
import UserRepository from "../repositories/UserRepository";
import PathValidator from "../../framework/validator/PathValidator";
import AuthenticationException from "./exception/AuthenticationException";
import RegistratorException from "./exception/RegistratorException";
import { HttpResponse } from "../controller/ControllerInterface";
import UserDto from "../dto/UserDto";
import User from "../../framework/sequelize/repositories/User.model";
import VerificationCodeRepository from "../repositories/VerificationCodeRepository";
import VerificationCode from "../../framework/sequelize/repositories/VerificationCode.model";
import { VerificationCodeDto } from "../dto/VerificationCodeDto";
import EmailNotification from "../../externals/services/notification/EmailNotificator";

export default class UserService {
  private readonly userRepository: UserRepository;
  private readonly verificationCodeRepository: VerificationCodeRepository;
  private readonly emailNotification: EmailNotification;
  private readonly USER_STATUS = {
    CONFIRMED: 'CONFIRMED',
    UNCONFIRMED: 'UNCONFIRMED',
    PASSWORD_RESET_REQUIRED: 'PASSWORD_RESET_REQUIRED'
  };

  public constructor(userRepository: UserRepository,verificationCodeRepository: VerificationCodeRepository) {
    this.userRepository = userRepository;
    this.verificationCodeRepository = verificationCodeRepository;
    this.emailNotification = new EmailNotification();
  }

    /**
   * Authenticates a user with their Grand Line ID and password.
   * @param {string} grandLineId - The user's Grand Line ID (email).
   * @param {string} password - The user's password.
   * @returns {Promise<HttpResponse>} - An HTTP response with an authentication token or an error message.
   */
  public async authenticateUser(grandLineId: string,password: string): Promise<HttpResponse> {
    try {
      if (!grandLineId || !password || password.trim().length < 8) {
        throw new AuthenticationException("Invalid data", 400);
      }

      const pathValidator: PathValidator = new PathValidator();
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId);

      if (!isValidEmail) {
        throw new AuthenticationException("Invalid grandLine Id.", 400);
      }

      const storedUser = await this.userRepository.findByGrandLineId(grandLineId);

      if (!storedUser || !(await bcrypt.compare(password, storedUser.password))) {
        throw new AuthenticationException("Authentication failed.", 401);
      }

      const secretKey = process.env.SECRET_KEY as string;
      const token = jwt.sign({ userId: storedUser.id }, secretKey, {
        expiresIn: "1h",
      });

      return { message: token, status: 200 };
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return this.handleError(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Registers a new user with the provided information.
   * @param {string} firstname - The user's first name.
   * @param {string} lastname - The user's last name.
   * @param {string} grandLineId - The user's Grand Line ID (email).
   * @param {string} password - The user's password.
   * @returns {Promise<HttpResponse>} - An HTTP response with a success message or an error message.
   */
  public async registratorUser(firstname: string,lastname: string,grandLineId: string,password: string): Promise<HttpResponse> {
    try {
      if (!firstname || !lastname || !grandLineId || !password || password.trim().length < 8) {
        throw new RegistratorException("Invalid input data.", 400);
      }

      const pathValidator: PathValidator = new PathValidator();
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId);

      if (!isValidEmail) {
        throw new RegistratorException("Invalid grandLine Id.", 400);
      }

      const isValidName: RegExp = /^[A-Za-zÀ-ÖØ-öø-ÿ-' ]+$/;
      const names: Array<string> = [firstname, lastname];

      for (const name of names) {
        if (!isValidName.test(name.trim())) {
          throw new RegistratorException("Invalid name", 400);
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10); // push in function
      const userDto = new UserDto({
        firstName: firstname,
        lastName: lastname,
        grandLineId: grandLineId,
        password: hashedPassword,
        status: this.USER_STATUS.UNCONFIRMED,
      });

      const isUnique: User | null = await this.userRepository.findByGrandLineId(
        userDto.grandLineId
      );

      if (isUnique === null) {
        const result: User = await this.userRepository.create(userDto);
        let messageId: any;
        if (result.dataValues.id) {
          const expirationDate = new Date(Date.now() + 10 * 60 * 1000)
          // expirationDate.setMinutes(expirationDate.getMinutes() + 10);
          
          const verifyCode: VerificationCode =
          await this.verificationCodeRepository.create(
            new VerificationCodeDto({
              userId: result.dataValues.id,
                email: result.dataValues.grand_line_id,
                code: CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Base64).toLocaleUpperCase(),
                expAt: expirationDate
              })
              );
            
          try {
            messageId = await this.emailNotification.sendVerificationCode(verifyCode);
          } catch (error) {
            throw new RegistratorException("email no sended", 500);
          }
        }
        return { message: messageId["response"], status: 201 };
      } else {
        throw new RegistratorException("grandLine Id already exists.", 400);
      }
    } catch (error) {
      if (error instanceof RegistratorException) {
        return this.handleError(error);
      } else {
        throw error;
      }
    }
  }

    /**
   * Initiates a password reset for a user based on their Grand Line ID.
   * @param {string} grandLineId - The user's Grand Line ID (email).
   * @returns {Promise<HttpResponse>} - An HTTP response with a success message or an error message.
   */
  public async passwordReset(grandLineId: string): Promise<HttpResponse> {
    try {
      if (!grandLineId) {
        throw new AuthenticationException("Invalid data.", 400);
      }

      const pathValidator: PathValidator = new PathValidator();
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId);

      if (!isValidEmail) {
        return this.handleError(
          new AuthenticationException("Invalid grandLine Id.", 400)
        );
      }

      const user: User | null = await this.userRepository.findByGrandLineId(grandLineId);

      if (user !== null) {
        const restCode: string = CryptoJS.lib.WordArray.random(10).toString(CryptoJS.enc.Hex);
        const hashedPassword = await bcrypt.hash(restCode, 10);

        const userDto = new UserDto({
          id: user.dataValues.id,
          firstName: user.dataValues.first_name,
          lastName: user.dataValues.last_name,
          grandLineId: grandLineId,
          password: hashedPassword,
          status: this.USER_STATUS.PASSWORD_RESET_REQUIRED,
        });

        const resultPasswordUpdate: User | null =
          await this.userRepository.updatePassword(userDto);

        if (resultPasswordUpdate) {
          userDto.password = resultPasswordUpdate.dataValues.password;
          const notification = await this.emailNotification.sendForgotPassword(userDto,restCode);

          return { message: notification, status: 200 };
        } else {
          return this.handleError(new AuthenticationException("Password update failed.", 404));
        }
      } else {
        return this.handleError(new AuthenticationException("Account is not exist.", 404));
      }
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return this.handleError(error);
      } else {
        throw error;
      }
    }
  }

   /**
   * Validates a verification code sent to a user's Grand Line ID.
   * @param {string} grandLineId - The user's Grand Line ID (email).
   * @param {string} code - The verification code to validate.
   * @returns {Promise<HttpResponse>} - An HTTP response with a success message or an error message.
   */
  public async codeValidator(grandLineId: string, code: string): Promise<HttpResponse>{
    try {

      if (!grandLineId || !code || code.trim().length !== 12) {
        throw new AuthenticationException('Invalid input data.',400)
      }
      
      const pathValidator: PathValidator = new PathValidator()
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId)
      
      if (!isValidEmail) {
        throw new AuthenticationException('Invalid grandLine Id.',400);
      }

      const verificationCodeRepository = new VerificationCodeRepository();
      const verificationCode = await verificationCodeRepository.findByCode(grandLineId, code);

      if (verificationCode === null) {
        throw new AuthenticationException('Verification code not found.',400);
      }

      if (verificationCode?.userId) {
        const userRepository = new UserRepository();
        await userRepository.updateStatus(verificationCode.userId.toString(), this.USER_STATUS.CONFIRMED);
      }
      return {message :'Code confirmed successfully.',status: 200}
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return this.handleError(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Resends a verification code to a user's Grand Line ID.
   * @param {string} grandLineId - The user's Grand Line ID (email).
   * @returns {Promise<HttpResponse>} - An HTTP response with a success message or an error message.
   */

  public async resendCode(grandLineId: string): Promise<HttpResponse>{
    try {
      if (!grandLineId) {
        throw new AuthenticationException('Invalid input data.', 400);
      }

      const pathValidator = new PathValidator();
      const isValidEmail = pathValidator.checkEmail(grandLineId);

      if (!isValidEmail) {
        throw new AuthenticationException('Invalid grandLine Id.', 400);
      }

      const user = await this.userRepository.findByGrandLineId(grandLineId);

      if (!user) {
        throw new AuthenticationException('User not found.', 404);
      }

      if (user.status === this.USER_STATUS.CONFIRMED) {
        throw new AuthenticationException('User is already confirmed.', 400);
      }

      const existingCode = await this.verificationCodeRepository.findByUserId(user.id);

      if (existingCode && existingCode.expAt >= new Date()) {
        throw new AuthenticationException('A confirmation code has already been sent.', 400);
      }

      const newCode = CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Base64);
      const expirationDate: Date = new Date(Date.now() + 10 * 60 * 1000);

      const updatedVerificationCode: [affectedCount: number] =  await this.verificationCodeRepository.update(newCode,user.id,expirationDate);

        if(updatedVerificationCode.length !> 1 ){
          throw new AuthenticationException('An error occurred unable to update verification code',500)
        }

        const newVerificationCode = await this.verificationCodeRepository.findByUserId(user.id);

        if(newVerificationCode == null){
          throw new AuthenticationException('verification code does not exist',404)          
        }

      const messageId = await this.emailNotification.sendVerificationCode(newVerificationCode);

      return { message: `Confirmation code has been resent ${messageId['messageId']}`, status: 200};
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return this.handleError(error);
      } else {
        throw error;
      }      
    } 
  }

  /**
   * Handles errors by returning an HTTP response with an error message and status code.
   * @param {AuthenticationException} error - The error to handle.
   * @returns {HttpResponse} - An HTTP response with an error message and status code.
   * @private
   */
  private handleError(error: AuthenticationException) {
    return { message: error.message, status: error.status || 500 };
  }
}
