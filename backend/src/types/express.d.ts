import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: "user";
      };
    }
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "user";
};

export type ObjectIdString = Types.ObjectId | string;
