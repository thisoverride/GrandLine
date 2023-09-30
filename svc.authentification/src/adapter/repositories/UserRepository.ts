import User from "../../framework/sequelize/repositories/User.model";
import UserDto from "../dto/UserDto";
import { RepositoryImpl } from "./  RepositoryImpl";

/**
 * Repository for managing users.
 */
export default class UserRepository implements RepositoryImpl{

  /**
   * Find a user by ID.
   * @param {string} id - The user's ID to search for.
   * @returns {Promise<User | null>} The found user or null if it doesn't exist.
   * @throws {Error} If an error occurs during the search.
   */
  public async findById(id: string): Promise<User | null> {
    try {
      return await User.findByPk(id);
    } catch (error) {
      // Handle errors here, e.g., log errors.
      throw new Error(`Error while searching for user by ID: ${error}`);
    }
  }

  /**
   * Create a new user.
   * @param {UserDto} userDto - The user data to create.
   * @returns {Promise<User>} The newly created user.
   * @throws {Error} If an error occurs during the creation.
   */
  public async create(userDto: UserDto): Promise<User> {
    try {
      const newUser: User = await User.create({
        first_name: userDto.firstName,
        last_name: userDto.lastName,
        grand_line_id: userDto.grandLineId,
        password: userDto.password,
        status: userDto.status
      });

      return newUser;
    } catch (error) {
      throw new Error(`Error while creating the user: ${error}`);
    }
  }

  /**
   * Find a user by their Grand Line identifier.
   * @param {string} grandLineId - The Grand Line identifier of the user to search for.
   * @returns {Promise<User | null>} The found user or null if it doesn't exist.
   * @throws {Error} If an error occurs during the search.
   */
  public async findByGrandLineId(grandLineId: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { grand_line_id: grandLineId } });
    } catch (error) {
      // Handle errors here, e.g., log errors.
      throw new Error(`Error while searching for user by Grand Line ID: ${error}`);
    }
  }

  /**
   * Update the status of a user by their ID.
   * @param {string} id - The user's ID.
   * @param {string} status - The new status value.
   * @returns {Promise<User | null>} - The updated user if found, or null if not found.
   */
  public async updateStatus(id: string, status: string): Promise<User | null> {
    try {
      const updatedUser = await User.update(
        { status: status },
        {
          where: {
            id: id,
          },
          returning: true, 
        }
      );
      const updatedUserRow = updatedUser[1][0];

      return updatedUserRow || null;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  }

  /**
   * Update the information of an existing user.
   * @param {UserDto} user - The user data to update.
   * @returns {Promise<void>}
   * @throws {Error} If an error occurs during the update.
   */
  public async updatePassword(user: UserDto): Promise<User | null> {
    try {
      
    if(!user.id){
        return null
      }
      const id: string = user.id.toString()

        const existingUser = await this.findById(id);
    
      if (existingUser) {
        return await existingUser.update({
          password: user.password,
        });
      } else {
        // Handle the case where the user doesn't exist.
        throw new Error("User does not exist.");
      }
    } catch (error) {
      // Handle errors here, e.g., log errors.
      throw new Error(`Error while updating the user: ${error}`);
    }
  }
}
