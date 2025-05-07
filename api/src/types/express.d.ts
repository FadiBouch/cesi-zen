import { JwtPayload } from "./index";

// Étendre les définitions de types d'Express
declare global {
  namespace Express {
    // Étendre l'interface Request pour inclure user
    interface Request {
      user?: JwtPayload;
    }
  }
}
