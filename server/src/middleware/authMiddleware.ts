import { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    sub : string;
    "custom:role" ?:string;
}

declare global {
    namespace Express {
      interface Request {
        user?: {
          id: string;
          role: string;
        };
      }
    }
  }
  