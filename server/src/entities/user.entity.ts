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
    console.log(`[User.validatePassword] Attempting to validate password for user ${this.email}`);
    console.log(`[User.validatePassword] Hashed password on this entity is: '${this.hashedPassword}'`);
    if (!this.hashedPassword) {
      console.log('[User.validatePassword] No hashed password present on the user entity.');
      return false;
    }
    const isValid = await argon2.verify(this.hashedPassword, password);
    console.log(`[User.validatePassword] argon2.verify result: ${isValid}`);
    return isValid;
  }
}
