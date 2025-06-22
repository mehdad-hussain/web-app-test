import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(1, { message: "Name is required." }),
  email: z
    .string({ required_error: "Email is required." })
    .email({ message: "Invalid email address." }),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email({ message: "Please enter a valid email." }),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, { message: "Password is required." }),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export interface LoginResponse {
  accessToken: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}

export interface ApiErrorData {
  message: string | Record<string, string[]>;
  error?: string;
  statusCode?: number;
  path?: string;
  timestamp?: string;
} 