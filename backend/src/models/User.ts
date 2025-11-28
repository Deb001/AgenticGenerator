import bcrypt from 'bcryptjs';

/**
 * Simple in‑memory user model for demonstration.
 * In a real app replace with proper DB queries.
 */
export interface IUser {
  id: number;
  email: string;
  passwordHash: string;
}

export class User implements IUser {
  id: number;
  email: string;
  passwordHash: string;

  private static users: IUser[] = [];

  private constructor(id: number, email: string, passwordHash: string) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  /**
   * Initialize a default user if none exist.
   */
  private static ensureDefaultUser() {
    if (this.users.length === 0) {
      const defaultPassword = 'password123';
      const hash = bcrypt.hashSync(defaultPassword, 10);
      this.users.push({ id: 1, email: 'advisor@example.com', passwordHash: hash });
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    this.ensureDefaultUser();
    const record = this.users.find(u => u.email === email);
    return record ? new User(record.id, record.email, record.passwordHash) : null;
  }
}
