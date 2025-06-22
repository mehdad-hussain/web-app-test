import argon2 from "argon2";

export class User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  hashedPassword?: string | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.hashedPassword) {
      return false;
    }
    const isValid = await argon2.verify(this.hashedPassword, password);
    return isValid;
  }
}
