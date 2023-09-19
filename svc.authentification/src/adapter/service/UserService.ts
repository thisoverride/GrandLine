import UserRepository from "../repositories/UserRepository";
import PathValidator from "../../framework/validator/PathValidator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AuthenticationException from "./exception/AuthenticationException";
import RegistratorException from "./exception/RegistratorException";
import { HttpResponse } from "../controller/ControllerInterface";
import UserDto from "../dto/UserDto";
import User from "../../framework/sequelize/repositories/User.model";
import VerificationCodeRepository from "../repositories/VerificationCodeRepository";
import VerificationCode from "../../framework/sequelize/repositories/VerificationCode.model";
import { VerificationCodeDto } from "../dto/VerificationCodeDto";
import randomstring from "randomstring";
import EmailNotification from "../../externals/services/notification/EmailNotificator";

export default class UserService {
  private readonly userRepository: UserRepository;
  private readonly verificationCodeRepository: VerificationCodeRepository;
  private readonly USER_STATUS = {
    CONFIRMED: 'CONFIRMED',
    UNCONFIRMED: 'UNCONFIRMED',
    PASSWORD_RESET_REQUIRED: 'PASSWORD_RESET_REQUIRED'
  };

  public constructor(userRepository: UserRepository,verificationCodeRepository: VerificationCodeRepository) {
    this.userRepository = userRepository;
    this.verificationCodeRepository = verificationCodeRepository;
  }

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
          const expirationDate = new Date();
          expirationDate.setMinutes(expirationDate.getMinutes() + 10);
          
          const verifyCode: VerificationCode =
            await this.verificationCodeRepository.create(
              new VerificationCodeDto({
                userId: result.dataValues.id,
                email: result.dataValues.grand_line_id,
                code: randomstring.generate(12),
                expAt: expirationDate
              })
            );

          const emailNotification = new EmailNotification();

          try {
            messageId = await emailNotification.sendVerificationCode(verifyCode);
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
        const restCode: string = pathValidator.randomPassword(12);
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

          const emailNotification = new EmailNotification();
          const test = await emailNotification.sendForgotPassword(
            userDto,
            restCode
          );

          return { message: test, status: 200 };
        } else {
          return this.handleError(
            new AuthenticationException("Password update failed.", 404)
          );
        }
      } else {
        return this.handleError(
          new AuthenticationException("Account is not exist.", 404)
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return this.handleError(error);
      } else {
        throw error;
      }
    }
  }

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

  public async resendCode(grandLineId: string): Promise<HttpResponse>{
    try {
      if (!grandLineId) {
        throw new AuthenticationException('Invalid input data.',400)
      }

      const pathValidator: PathValidator = new PathValidator();
      const isValidEmail: boolean = pathValidator.checkEmail(grandLineId);

      if (!isValidEmail) {
        throw new AuthenticationException('Invalid grandLine Id.',400);
      }

      const user = await this.userRepository.findByGrandLineId(grandLineId);

      if (!user) {
        throw new AuthenticationException('User not found.',404);
      }

      if (user.status === this.USER_STATUS.CONFIRMED) {
        throw new AuthenticationException('User is already confirmed.',400);
      }

      const existingCode = await this.verificationCodeRepository.findByUserId(user.id.toString());

      

      if (existingCode) {
        if(existingCode.expAt >= new Date()){
          throw new AuthenticationException('A confirmation code has already been sent.',400);
        }else{
          throw new Error('')
        }
      }

      // const newCode = randomstring.generate(12);

      // const newVerificationCode = await verificationCodeRepository.create(
      //   new VerificationCodeDto({
      //     userId: user.id,
      //     email: grandLineId,
      //     code: newCode,
      //   })
      // );

      // const emailNotification = new EmailNotification();
      // const messageId = await emailNotification.sendVerificationCode(newVerificationCode);

      return {message :'', status:200}
      // response.status(200).json({ message: "Confirmation code has been resent.", messageId: messageId });
      
    } catch (error) {
      if (error instanceof AuthenticationException) {
        return this.handleError(error);
      } else {
        throw error;
      }
    }
     

  }

  private handleError(error: AuthenticationException) {
    return { message: error.message, status: error.status || 500 };
  }
}
