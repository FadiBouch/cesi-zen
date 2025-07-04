// middlewares/authMiddleware.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import UserController from "../controllers/userController";
import { AuthRequest, JwtPayload } from "../types/auth";
import prisma from "../utils/database";
import { log } from "console";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Accès refusé. Token requis." });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: "Erreur de configuration du serveur." });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Token invalide ou expiré." });
      return;
    }

    const payload = decoded as JwtPayload & { type?: string };
    
    if (payload.type && payload.type !== 'access') {
      res.status(403).json({ message: "Type de token invalide." });
      return;
    }

    req.user = payload;
    next();
  });
};

export const authorize = (roles: string | string[] = []) => {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    try {
      const user = await UserController.findById(req.user.id);

      if (!user) {
        res.status(404).json({ message: "Utilisateur non trouvé." });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ message: "Ce compte a été désactivé." });
        return;
      }

      const userRole = await prisma.role.findFirst({
        where: { id: user.roleId },
      });

      if (!userRole) {
        res.status(404).json({ message: "Le rôle est introuvable." });
        return;
      }

      if (roles.length && !roles.includes(userRole.name)) {
        res.status(403).json({
          message: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Erreur d'autorisation:", error);
      res.status(500).json({
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
};
