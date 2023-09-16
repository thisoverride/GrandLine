export default class PathValidator {
  
  public checkPath(route: string): Array<string> {
    
    const validHttpMethods: string[] = ["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"];
    const regex: RegExp = /@([A-Z]+)\(([^)]+)\)/;
    const matches: RegExpExecArray | null = regex.exec(route);

    if (!matches) {
      throw new Error(`Error route injection ${route} is not a correct route injection.`);
    }

    let httpMethod: string = matches[1];

    if (!validHttpMethods.includes(httpMethod)) {
      throw new Error(`Error route injection ${route} has an invalid HTTP method ${httpMethod}.`);
    }
    httpMethod = httpMethod.toLowerCase().trim();
    const endpoints: string[] = matches[2].split(",");
    const path: string = endpoints[0].trim() || "";
    const controller: string = endpoints[1].trim() || "";

    return [httpMethod, path, controller];
  }

  public checkEmail(strEmail: string): boolean{
    const isValidateEmail: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return isValidateEmail.test(strEmail) ;
  }

  public randomPassword(length: number) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let password = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }
  
    return password;
  }
  


}
