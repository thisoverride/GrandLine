export default class RegistratorException extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  }