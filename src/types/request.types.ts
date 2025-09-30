import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  full_name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
