export default class UserDto {
  public id?: number | undefined;
  public status: string;
  public firstName: string;
  public lastName: string;
  public grandLineId: string;
  public password: string;

  public constructor(data: {
    id?: number | undefined;
    firstName: string;
    lastName: string;
    grandLineId: string;
    password: string;
    status: string;
  }) {
    this.id = data.id;
    this.status = data.status;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.grandLineId = data.grandLineId;
    this.password = data.password;
  }
}
