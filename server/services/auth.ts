import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@shared/schema";

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (user: User): string => {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  const expiresIn = "7d"; // Token expires in 7 days
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      planType: user.planType,
    },
    secret,
    { expiresIn }
  );
};

// Verify JWT token
export const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    return jwt.verify(token, secret) as jwt.JwtPayload;
  } catch (error) {
    return null;
  }
};
