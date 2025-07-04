import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserController from "../controllers/userController";
import {
  AuthRequest,
  RegisterData,
  LoginData,
  UpdateProfileData,
  ChangePasswordData,
} from "../types/auth";
import prisma from "../utils/database";
import { log } from "console";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      role = "User",
    } = req.body as RegisterData;

    const exists = await UserController.exists(username, email);
    if (exists) {
      res.status(400).json({
        message: "Cet utilisateur ou cette adresse email existe déjà.",
      });
      return;
    }

    if (role.toUpperCase() === "ADMIN") {
      // Vérifier si la requête vient d'un utilisateur authentifié et admin
      if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({
          message:
            "Seuls les administrateurs peuvent créer d'autres administrateurs",
        });
        return;
      }
    }

    const newUser = await UserController.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, email, firstName, lastName } =
      req.body as RegisterData;

    const exists = await UserController.exists(username, email);
    if (exists) {
      res.status(400).json({
        message: "Cet utilisateur ou cette adresse email existe déjà.",
      });
      return;
    }
    const newUser = await UserController.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: "Admin",
    });

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Administrateur créé avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as LoginData;

    const user = await UserController.findByUsername(username);
    if (!user) {
      res.status(400).json({
        message: "Nom d'utilisateur ou mot de passe incorrect.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        message: "Ce compte a été désactivé.",
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({
        message: "Nom d'utilisateur ou mot de passe incorrect.",
      });
      return;
    }

    const role = await prisma.role.findFirst({ where: { id: user.roleId } });
    if (!role) {
      res.status(404).json({ message: "Le rôle est introuvable." });
      return;
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
    if (!jwtExpiresIn) {
      res.status(400).json({ message: "Erreur JWT (expiresIn)." });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.userName,
        role: role.name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: parseInt(jwtExpiresIn) }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const user = await UserController.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        message: "Ce compte a été désactivé.",
      });
      return;
    }

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const { firstName, lastName, email } = req.body as UpdateProfileData;

    if (email) {
      const existingUser = await UserController.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        res.status(400).json({
          message: "Cette adresse email est déjà utilisée.",
        });
        return;
      }
    }

    const updatedUser = await UserController.update(req.user.id, {
      firstName,
      lastName,
      email,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      message: "Profil mis à jour avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Utilisateur non authentifié." });
      return;
    }

    const { currentPassword, newPassword } = req.body as ChangePasswordData;

    const user = await UserController.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé." });
      return;
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      res.status(400).json({
        message: "Le mot de passe actuel est incorrect.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserController.updatePassword(req.user.id, hashedPassword);

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
