import { User } from "./generated/prisma";

export type decodedUser = Pick<User, "id" | "username">;

declare global {
  namespace Express {
    interface Request {
      user: decodedUser;
    }
  }
}
export {};
