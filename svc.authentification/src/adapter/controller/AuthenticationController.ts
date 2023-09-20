import { Request, Response } from "express";
import { ControllerImpl, HttpResponse } from "./ControllerInterface";
import UserService from "../service/UserService";

export default class AuthenticationController implements ControllerImpl {
  public readonly ROUTE: Array<string>;
  private userService: UserService;

  public constructor(userService: UserService) {
    this.ROUTE = [
      "@POST(/signin-grandline,authenticator)",
      "@POST(/portal.signup.grandline,registrator)",
      "@POST(/forgot-password,resetPassword)",
      "@POST(/confirm-code,confirmCode)",
      "@POST(/resend-confirmation-code,resendConfirmationCode)",
    ];
    this.userService = userService;
  }

  /**
   * @Mapping POST(/signin-grandline)
   * Authenticates a user.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async authenticator(request: Request,response: Response): Promise<void> {
    try {
      const { grandLineId, password } = request.body;
      const serviceResponse: HttpResponse =
        await this.userService.authenticateUser(grandLineId, password);

      response.status(serviceResponse.status)
        .json({ message: serviceResponse.message });

    } catch (error: any) {
      response.status(error.status || 500).json({ message: error.message });
    }
  }

  /**
   * @Mapping POST(/portal.signup.grandline)
   * Registers a new user.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async registrator(request: Request,response: Response): Promise<void> {
    try {
      const { firstname, lastname, grandLineId, password } = request.body;

      const serviceResponse: HttpResponse =
        await this.userService.registratorUser(
          firstname,
          lastname,
          grandLineId,
          password
        );

      response.status(serviceResponse.status)
        .json({ message: serviceResponse.message });
    } catch (error: any) {
      response.status(error.status || 500).json({ message: error.message });
    }
  }

  /**
   * @Mapping POST(/resetPassword)
   * Rest user password and sending email.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async resetPassword(request: Request, response: Response): Promise<void> {
    try {
      const { grandLineId } = request.body;

      const serviceResponse: HttpResponse =
        await this.userService.passwordReset(grandLineId)

      response.status(serviceResponse.status)
        .json({ message: serviceResponse.message });
    } catch (error: any) {
      response.status(error.status || 500).json({ message: error.message });
    }
  }

  /**
   * Confirms the verification code.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async confirmCode(request: Request, response: Response): Promise<void> {
    try {
      const { grandLineId, code } = request.body;

      const serviceResponse: HttpResponse =
      await this.userService.codeValidator(grandLineId,code);

    response.status(serviceResponse.status)
      .json({ message: serviceResponse.message });

    } catch (error: any) {
      response.status(error.status || 500).json({ message: error.message });
    }
  }

  /**
   * @Mapping @POST(/resend-confirmation-code)
   * Resend confirmation code to the user's email.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @returns {Promise<void>}
   */
  public async resendConfirmationCode(request: Request, response: Response): Promise<void> {
    try {
      const { grandLineId } = request.body;

      const serviceResponse : HttpResponse = await this.userService.resendCode(grandLineId);

      response.status(serviceResponse.status)
      .json({ message: serviceResponse.message });

    } catch (error: any) {
      response.status(error.status || 500).json({ message: error.message });
      console.error("Resend confirmation code error:", error);
      response.status(500).json({ message: "Server error during code resending." });
    }
  }
}