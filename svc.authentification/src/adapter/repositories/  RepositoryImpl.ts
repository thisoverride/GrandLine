
/**
 * Repository for managing Data.
 */
export interface RepositoryImpl {

  /**
   * Find a data by ID.
   * @param {string} id - The user's ID to search for.
   * @returns {Promise<User | null>} The found user or null if it doesn't exist.
   * @throws {Error} If an error occurs during the search.
   */
findById(id: string): Promise<any>

  /**
   * Create a new elemnt.
   * @param {UserDto} userDto - The user data to create.
   * @returns {Promise<User>} The newly created user.
   * @throws {Error} If an error occurs during the creation.
   */
create(userDto: any): Promise<any>

  /**
   * Find a user by their Grand Line identifier.
   * @param {string} grandLineId - The Grand Line identifier of the user to search for.
   * @returns {Promise<User | null>} The found user or null if it doesn't exist.
   * @throws {Error} If an error occurs during the search.
   */
    findByGrandLineId(grandLineId: string): Promise<any>
}
