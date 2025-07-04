// Routes d'utilisateur protégées avec Prisma
import express, { Request, Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../utils/database";
import { authenticateToken, authorize } from "../middlewares/authMiddleware";
import { AuthRequest } from "../types/auth";
import UserController from "../controllers/userController";

const router = express.Router();

router.get(
  "/admin",
  authenticateToken,
  authorize("Admin"),
  (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    res.json({
      message: "Bienvenue dans la section admin!",
      user: authRequest.user,
    });
  }
);

router.get(
  "/",
  authenticateToken,
  authorize("Admin"),
  async (_req: Request, res: Response) => {
    try {
      const users = await UserController.getAll();

      res.json(users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).json({
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

router.delete(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const deletedUser = await UserController.deleteUser(parseInt(id));
      res.json({
        message: `Utilisateur supprimé avec succès`,
        deletedUser,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

router.put(
  "/:id/status",
  authenticateToken,
  authorize("Admin"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body as { isActive: boolean };

      const user = await UserController.setActiveStatus(parseInt(id), isActive);

      res.json({
        message: `Utilisateur ${isActive ? "activé" : "désactivé"} avec succès`,
        user,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la modification du statut utilisateur:",
        error
      );
      res.status(500).json({
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
