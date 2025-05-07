// Contrôleur pour les types d'exercices respiratoires
import { Request, Response } from "express";
import prisma from "../utils/database";
import {
  CreateBreathingExerciseTypeData,
  UpdateBreathingExerciseTypeData,
  PaginationParams,
} from "../types/breath";

// Récupérer tous les types d'exercices respiratoires
export const getAllBreathingTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      order = "asc",
      orderBy = "name",
    } = req.query as unknown as PaginationParams;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [types, total] = await Promise.all([
      prisma.breathingExerciseType.findMany({
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          _count: {
            select: { configurations: true },
          },
        },
      }),
      prisma.breathingExerciseType.count(),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: types,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des types d'exercices respiratoires:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getBreathingTypeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id);

    const type = await prisma.breathingExerciseType.findUnique({
      where: { id: typeId },
      include: {
        _count: {
          select: { configurations: true },
        },
      },
    });

    if (!type) {
      res
        .status(404)
        .json({ message: "Type d'exercice respiratoire non trouvé" });
      return;
    }

    res.json(type);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du type d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createBreathingType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description } = req.body as CreateBreathingExerciseTypeData;

    const existingType = await prisma.breathingExerciseType.findFirst({
      where: { name },
    });

    if (existingType) {
      res.status(400).json({
        message: "Un type d'exercice respiratoire avec ce nom existe déjà",
      });
      return;
    }

    const newType = await prisma.breathingExerciseType.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      message: "Type d'exercice respiratoire créé avec succès",
      type: newType,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création du type d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateBreathingType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id);
    const { name, description } = req.body as UpdateBreathingExerciseTypeData;

    // Vérifier si le type existe
    const existingType = await prisma.breathingExerciseType.findUnique({
      where: { id: typeId },
    });

    if (!existingType) {
      res
        .status(404)
        .json({ message: "Type d'exercice respiratoire non trouvé" });
      return;
    }

    // Vérifier si le nouveau nom existe déjà (s'il est fourni)
    if (name && name !== existingType.name) {
      const nameExists = await prisma.breathingExerciseType.findFirst({
        where: { name },
      });

      if (nameExists) {
        res.status(400).json({
          message: "Un type d'exercice respiratoire avec ce nom existe déjà",
        });
        return;
      }
    }

    const updatedType = await prisma.breathingExerciseType.update({
      where: { id: typeId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.json({
      message: "Type d'exercice respiratoire mis à jour avec succès",
      type: updatedType,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du type d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteBreathingType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id);

    const existingType = await prisma.breathingExerciseType.findUnique({
      where: { id: typeId },
      include: {
        _count: {
          select: { configurations: true },
        },
      },
    });

    if (!existingType) {
      res
        .status(404)
        .json({ message: "Type d'exercice respiratoire non trouvé" });
      return;
    }

    if (existingType._count.configurations > 0) {
      res.status(400).json({
        message:
          "Impossible de supprimer ce type car il est utilisé par des configurations",
        count: existingType._count.configurations,
      });
      return;
    }

    await prisma.breathingExerciseType.delete({
      where: { id: typeId },
    });

    res.json({ message: "Type d'exercice respiratoire supprimé avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du type d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getTypeConfigurations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const typeId = parseInt(id);
    const { page = 1, limit = 10 } = req.query as unknown as PaginationParams;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const type = await prisma.breathingExerciseType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      res
        .status(404)
        .json({ message: "Type d'exercice respiratoire non trouvé" });
      return;
    }

    const userId = req.user?.id;
    const whereClause = userId
      ? {
          typeId,
          OR: [{ isPublic: true }, { userId: userId }],
        }
      : {
          typeId,
          isPublic: true,
        };

    const [configurations, total] = await Promise.all([
      prisma.breathingExerciseConfiguration.findMany({
        where: whereClause,
        skip,
        take: limitNumber,
        orderBy: {
          name: "asc",
        },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
            },
          },
        },
      }),
      prisma.breathingExerciseConfiguration.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: configurations,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      type,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des configurations du type:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
