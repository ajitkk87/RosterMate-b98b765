import User, { IUser } from '../models/User';
import { generatePasswordHash, validatePassword } from '../utils/password';

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

class UserService {
  static async list(): Promise<IUser[]> {
    try {
      return await User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findByEmail(email);
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      return await User.updateOne(id, data as any);
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      return await User.deleteOne(id as any);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email: string, password: string): Promise<IUser | null> {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findByEmail(email);
      if (!user) return null;

      if (!user.password) {
        throw new Error('This account uses OAuth authentication. Please login with OAuth.');
      }

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      // update last login timestamp
      await User.updateOne(user._id as string, { lastLoginAt: new Date().toISOString() } as any);
      return await User.findById(user._id as string);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('This account uses')) {
        throw err;
      }
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '' }: CreateUserData): Promise<IUser> {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      const created = await User.create({ email, password: hash, name, isActive: true, role: ROLES.USER } as any);
      return created as IUser;
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user: IUser, password: string): Promise<IUser> {
    if (!password) throw new Error('Password is required');
    const hash = await generatePasswordHash(password);
    try {
      await User.updateOne(user._id as string, { password: hash } as any);
      return (await User.findById(user._id as string)) as IUser;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

export default UserService;
