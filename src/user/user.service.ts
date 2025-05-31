import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { AuthService } from 'src/auth/auth.service';
import { ChangePasswordDto } from 'src/auth/dtos/change-password-user.schema';
import { BaseUserDto } from './dtos/base-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRepository } from './user.repository';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}
  private saltRounds = 10;

  /**
   * Retrieves all User objects from the database.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>[]>} - A promise that resolves to an array of User objects
   * excluding the password field.
   *
   * @example
   * const users = await userService.retrieveAll();
   */
  async retrieveAll(): Promise<
    Omit<BaseUserDto, 'password' | 'availability'>[]
  > {
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
   * @throws {BadRequestException} - Thrown if the email is missing.
   * @throws {NotFoundException} - Thrown if no User with the given email is found in the database.
   *
   * @example
   * const user = await userService.retrieveByEmail('dYH2M@example.com');
   *
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
   * Retrieves a single User object by its unique email and password.
   *
   * @param {LoginUserDto} body - The email and password of the User to retrieve.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>>} - A promise that resolves to the User object with the given email.
   *
   * @throws {UnauthorizedException} - Thrown if the email or password is invalid.
   *
   * @example
   * const user = await userService.retrieveUserByCredentials({
   *   email: 'dYH2M@example.com',
   *   password: 'securePassword123',
   * });
   */
  async retrieveUserByCredentials(
    body: LoginUserDto,
  ): Promise<Omit<BaseUserDto, 'password'>> {
    const user = await this.userRepository.findUniqueByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo!,
    };
  }

  /**
   * Retrieves a single User object by its unique id.
   *
   * @param {string} userId - The id of the User to retrieve.
   *
   * @returns {Promise<Omit<BaseUserDto, 'password'>>} - A promise that resolves to the User object with the given email.
   *
   * @example
   * const user = await userService.retrieveById('1')
   *
   * @throws {BadRequestException} - Thrown if the userId is missing or undefined.
   * @throws {NotFoundException} - Thrown if the User with the given id does not exist in the database.
   */
  async retrieveById(userId: string): Promise<BaseUserDto> {
    if (!userId) {
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
      password: retrivedUser.password,
      phone: retrivedUser.phone,
      photo: retrivedUser.photo!,
    };
  }

  /**
   * Creates a new User in the database.
   *
   * @param {CreateUserDto} user - The User data to create.
   *
   * @returns {Promise<{message: string, data: Omit<BaseUserDto, 'id'|'password'>}>} - A promise that resolves to the newly created User's data.
   *
   * @example
   * const user = await userService.create({
   *   name: 'John Doe',
   *   email: 'john.doe@example.com',
   *   password: 'securePassword123',
   *   phone: '1234567890',
   *   photo: 'https://example.com/john-doe.jpg'
   * });
   *
   * @throws {BadRequestException} - Thrown if the name or email is missing or undefined.
   * @throws {UnauthorizedException} - Thrown if the email format is invalid.
   * @throws {ConflictException} - Thrown if the email or phone is already registered.
   */
  async create(
    user: CreateUserDto,
  ): Promise<{ message: string; data: Omit<BaseUserDto, 'id' | 'password'> }> {
    if (!user.name || !user.email) {
      throw new BadRequestException('Name and email are required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      throw new UnauthorizedException('Invalid email format');
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
   * @param {string} id - The unique identifier of the User whose password is to be changed.
   * @param {ChangePasswordDto} changePasswordDto - Data transfer object containing the current and new passwords of the User.
   *
   * @returns {Promise<void>} - A promise that resolves when the User's password has been successfully updated.
   *
   * @throws {BadRequestException} - Thrown if the id is missing or undefined.
   * @throws {NotFoundException} - Thrown if the User with the given id does not exist in the database.
   * @throws {UnauthorizedException} - Thrown if the provided current password does not match the stored password.
   */
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    if (!id) {
      throw new BadRequestException('User id is required');
    }

    const retrievedCustomer = await this.userRepository.findUnique(id);

    if (!retrievedCustomer) {
      throw new NotFoundException('User not found');
    }

    if (
      !(await compare(
        changePasswordDto.currentPassword,
        retrievedCustomer.password,
      ))
    ) {
      throw new UnauthorizedException('The password is incorrect.');
    }

    const hashedNewPassword = await hash(changePasswordDto.newPassword, 10);

    await this.userRepository.updatePassword(id, hashedNewPassword);
  }
}
