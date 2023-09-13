import User, { UserI } from "../../framework/sequelize/repositories/User.model";
export default class UserRepository {
  public async findById(id: string): Promise<void> {}

  public async create(user: UserI): Promise<User> {
    return await User.create({
      firstname: user.firstname,
      lastname: user.lastname,
      grandLineId: user.grandLineId,
      password: user.password,
    });
  }
  public async findByGrandLineId(grandLineId: string): Promise<User | null> {
    return await User.findOne({ where: { grandLineId: grandLineId } });

  }

  public async update(scenario: string): Promise<void> {}

  public async delete(id: string): Promise<void> {}
}
