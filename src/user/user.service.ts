import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt, { compare, hash } from 'bcryptjs';
import { ChangePasswordDto } from 'src/user/dtos/change-password-user.schema';
import { BaseUserDto } from './dtos/base-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRepository } from './user.repository';
import { ApiResponse } from 'src/common/types/ApiResponse';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  private saltRounds = 10;
  private readonly logger = new Logger(UserService.name);

  /**
   * Retrieves all User objects from the database.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>[]>} - A promise that resolves to an array of User objects
   * excluding the password field.
   *
   * @example
   * const users = await userService.retrieveAll();
   */
  async retrieveAll(): Promise<Omit<BaseUserDto, 'password'>[]> {
    const retrivedUsers = await this.userRepository.findMany();

    return retrivedUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo!,
    }));
  }

  /**
   * Retrieves a single User object by its unique email.
   *
   * @param {string} email - The email of the User to retrieve.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>>} - A promise that resolves to the User object with the given email.
   *
   * @throws {BadRequestException} - Thrown if the email is missing or undefined.
   * @throws {NotFoundException} - Thrown if the User with the given email does not exist in the database.
   *
   * @example
   * const user = await userService.retrieveByEmail('john@example.com');
   */
  async retrieveByEmail(email: string): Promise<Omit<BaseUserDto, 'password'>> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const retrivedUser = await this.userRepository.findUniqueByEmail(email);

    if (!retrivedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: retrivedUser.id,
      name: retrivedUser.name,
      email: retrivedUser.email,
      phone: retrivedUser.phone,
      photo: retrivedUser.photo!,
    };
  }

  /**
   * Retrieves a single User object by its unique id.
   *
   * @param {string} userId - The id of the User to retrieve.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>>} - A promise that resolves to the User object with the given id.
   *
   * @throws {MissingRequiredPropertiesException} - Thrown if the id is missing.
   * @throws {NotFoundException} - Thrown if no User with the given id is found in the database.
   *
   * @example
   * const user = await userService.retrieveById('dYH2M');
   *
   */
  async retrieveById(userId: string): Promise<Omit<BaseUserDto, 'password'>> {
    this.logger.log('Retrieving user by id...');
    if (!userId) {
      this.logger.error('User id is required');
      throw new BadRequestException('User id is required');
    }

    const retrivedUser = await this.userRepository.findUnique(userId);

    if (!retrivedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: retrivedUser.id,
      name: retrivedUser.name,
      email: retrivedUser.email,
      phone: retrivedUser.phone,
      photo: retrivedUser.photo!,
    };
  }

  /**
   * Creates a new User in the database.
   *
   * @param {CreateUserDto} user - The User data to create, which may include optional availability.
   *
   * @returns {Promise<ApiResponse<Omit<BaseUserDto, 'id' | 'password' | 'role'>>>>} - A promise that resolves to an ApiResponse object containing the newly created User's base data.
   *
   * @throws {BadRequestException} - Thrown if the User data is missing required fields.
   * @throws {ConflictException} - Thrown if the email or phone is already registered.
   *
   * @example
   * const user = await userService.create({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   password: 'mySecretPassword',
   *   phone: '123-456-7890',
   *   photo: 'https://example.com/john.jpg',
   * });
   */
  async create(
    user: CreateUserDto,
  ): Promise<ApiResponse<Omit<BaseUserDto, 'id' | 'password' | 'role'>>> {
    if (!user.name || !user.email) {
      throw new BadRequestException('Name and email are required');
    }

    if (await this.userRepository.findUniqueByEmail(user.email)) {
      throw new ConflictException('Email already registered! Try logging in.');
    }

    if (await this.userRepository.findUniqueByPhone(user.phone)) {
      throw new ConflictException('Phone already registered! Try logging in.');
    }

    await this.userRepository.create({
      name: user.name,
      email: user.email,
      password: await hash(user.password, this.saltRounds),
      phone: user.phone,
      photo: user.photo,
    });

    return {
      message: 'User created successfully',
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo ? user.photo : '',
      },
    };
  }

  /**
   * Deletes a User from the database.
   *
   * @param {string} id - The id of the User to delete.
   *
   * @returns {Promise<void>} - A promise that resolves when the User has been deleted.
   *
   * @throws {NotFoundException} - Thrown if the User with the given id does not exist in the database.
   */
  async delete(id: string): Promise<void> {
    if (!(await this.userRepository.findUnique(id))) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  /**
   * Updates a User in the database.
   *
   * @param {string} id - The id of the User to update.
   * @param {UpdateUserDto} user - The User data to update.
   *
   * @returns {Promise<void>} - A promise that resolves when the User has been updated.
   *
   * @throws {NotFoundException} - Thrown if the User with the given id does not exist in the database.
   */
  async update(id: string, user: UpdateUserDto): Promise<void> {
    if (!(await this.userRepository.findUnique(id))) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, user);
  }

  /**
   * Changes the password of a User in the database.
   *
   * @param {string} userId - The id of the User whose password is to be changed.
   * @param {ChangePasswordDto} - The object containing the current password and the new password.
   *
   * @returns {Promise<void>} - A promise that resolves when the User's password has been changed.
   *
   * @throws {BadRequestException} - Thrown if the userId is missing or undefined.
   * @throws {NotFoundException} - Thrown if the User with the given id does not exist in the database.
   * @throws {UnauthorizedException} - Thrown if the current password is invalid.
   */
  async changePassword(
    userId: string,
    { currentPassword, newPassword }: ChangePasswordDto,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userRepository.findUnique(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const hashedPassword = await hash(newPassword, 10);

    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  /**
   * Resets the password of a User in the database.
   *
   * @param {string} userId - The id of the User to reset the password of.
   * @param {string} newPassword - The new password of the User.
   *
   * @returns {Promise<string>} - A promise that resolves to a string indicating the success of the password reset operation.
   *
   * @throws {BadRequestException} - Thrown if the userId or newPassword is missing or undefined.
   * @throws {NotFoundException} - Thrown if the User with the given id does not exist in the database.
   */
  async resetPassword(userId: string, newPassword: string): Promise<string> {
    if (!userId || !newPassword) {
      throw new BadRequestException('Missing required properties');
    }

    const retrievedUser = await this.userRepository.findUnique(userId);

    if (!retrievedUser) {
      throw new NotFoundException('User not found');
    }

    const hashedNewPassword = await hash(newPassword, 10);

    await this.userRepository.updatePassword(
      retrievedUser.id,
      hashedNewPassword,
    );

    return 'Password reset successfully';
  }

  /**
   * Verifies a User in the database.
   *
   * @param {string} email - The email of the User to verify.
   *
   * @returns {Promise<string>} - A promise that resolves to a string 'User verified successfully' if the operation is successful.
   *
   * @throws {NotFoundException} - Thrown if the User with the given email does not exist in the database.
   * @throws {BadRequestException} - Thrown if the User with the given email is already verified.
   * @throws {NotFoundException} - Thrown if the User with the given email does not exist in the database after verification.
   */
  async verifyUser(email: string): Promise<string> {
    const user = await this.retrieveByEmail(email);

    if (!user.id) {
      throw new NotFoundException('User not found');
    }

    if (user.verifiedAt) {
      throw new BadRequestException('User already verified');
    }

    const retrievedUser = await this.userRepository.verifyUser(user.id);

    if (!retrievedUser) {
      throw new NotFoundException('User not found');
    }

    if (!retrievedUser.verifiedAt || retrievedUser.verifiedAt === null) {
      throw new NotFoundException('Error verifying user');
    }

    return 'User verified successfully';
  }

  /**
   * Validates the given User credentials.
   *
   * @param {LoginUserDto} user - The User data to validate.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>>} - A promise that resolves to the User data without the password if the
   * credentials are valid, or throws an error if they are not.
   *
   * @throws {NotFoundException} - Thrown if the User with the given email does not exist in the database.
   * @throws {BadRequestException} - Thrown if the email or password is missing or undefined.
   * @throws {UnauthorizedException} - Thrown if the given password does not match the User's password in the database.
   */
  async _validateCredentials(
    user: LoginUserDto,
  ): Promise<Omit<BaseUserDto, 'password'>> {
    const { email, password } = user;

    const retrivedUser = await this.userRepository.findUniqueByEmail(email);

    if (!retrivedUser) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(password, retrivedUser.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: retrivedUser.id,
      name: retrivedUser.name,
      email: retrivedUser.email,
      phone: retrivedUser.phone,
      photo: retrivedUser.photo!,
    };
  }
}
