import { randomUUID } from 'crypto';
import { ROLES, ALL_ROLES, RoleValues } from 'shared';
import { csvDb } from '../config/database';

export interface IUser {
  _id?: string;
  email: string;
  password: string | null;
  createdAt: string; // ISO string for CSV
  lastLoginAt: string; // ISO string for CSV
  isActive: boolean;
  role: RoleValues;
  refreshToken: string;
  oauthProvider?: string;
  oauthId?: string;
}

class UserModel {
  private collection = 'users';

  async create(data: Omit<IUser, '_id' | 'createdAt' | 'refreshToken'>): Promise<IUser> {
    const user: IUser = {
      _id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      refreshToken: randomUUID(),
    };
    await csvDb.insertOne(this.collection, user as any);
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    return (await csvDb.findById(this.collection, id)) as IUser | null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return (await csvDb.findOne(this.collection, { email })) as IUser | null;
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return (await csvDb.findOne(this.collection, { refreshToken })) as IUser | null;
  }

  async find(filter?: Partial<IUser>): Promise<IUser[]> {
    return (await csvDb.find(this.collection, filter)) as IUser[];
  }

  async updateOne(id: string, update: Partial<IUser>): Promise<IUser | null> {
    return (await csvDb.updateOne(this.collection, id, update as any)) as IUser | null;
  }

  async deleteOne(id: string): Promise<boolean> {
    return csvDb.deleteOne(this.collection, id);
  }

  async countDocuments(filter?: Partial<IUser>): Promise<number> {
    return csvDb.countDocuments(this.collection, filter);
  }
}

const User = new UserModel();
export default User;
