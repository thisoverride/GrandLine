export default class AuthenticationException extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  }