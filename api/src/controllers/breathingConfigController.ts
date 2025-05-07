// Contrôleur pour les configurations d'exercices respiratoires
import { Request, Response } from "express";
import prisma from "../utils/database";
import {
  CreateBreathingExerciseConfigData,
  UpdateBreathingExerciseConfigData,
  PaginationParams,
} from "../types/breath";

export const getAllBreathingConfigs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      order = "asc",
      orderBy = "name",
      typeId,
      isPublic,
    } = req.query as unknown as PaginationParams & {
      typeId?: string;
      isPublic?: string;
    };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};

    if (typeId) {
      whereClause.typeId = parseInt(typeId);
    }

    const userId = req.user?.id;
    if (userId) {
      if (isPublic === "true") {
        whereClause.isPublic = true;
      } else if (isPublic === "false") {
        whereClause.isPublic = false;
        whereClause.userId = userId;
      } else {
        whereClause.OR = [{ isPublic: true }, { userId: userId }];
      }
    } else {
      whereClause.isPublic = true;
    }

    const [configs, total] = await Promise.all([
      prisma.breathingExerciseConfiguration.findMany({
        where: whereClause,
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          type: true,
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
      data: configs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des configurations d'exercices respiratoires:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getBreathingConfigById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const configId = parseInt(id);

    const config = await prisma.breathingExerciseConfiguration.findUnique({
      where: { id: configId },
      include: {
        type: true,
        user: {
          select: {
            id: true,
            userName: true,
          },
        },
      },
    });

    if (!config) {
      res
        .status(404)
        .json({ message: "Configuration d'exercice respiratoire non trouvée" });
      return;
    }

    if (!config.isPublic && config.userId !== req.user?.id) {
      res.status(403).json({
        message: "Vous n'avez pas accès à cette configuration privée",
      });
      return;
    }

    res.json(config);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la configuration d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getUserFavoriteConfigs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Authentification requise" });
      return;
    }

    const { page = 1, limit = 10 } = req.query as unknown as PaginationParams;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [configs, total] = await Promise.all([
      prisma.breathingExerciseConfiguration.findMany({
        where: {
          userId: req.user.id,
        },
        skip,
        take: limitNumber,
        orderBy: {
          name: "asc",
        },
        include: {
          type: true,
        },
      }),
      prisma.breathingExerciseConfiguration.count({
        where: {
          userId: req.user.id,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: configs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des configurations favorites:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createBreathingConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      inhaleTime,
      holdInhaleTime,
      exhaleTime,
      holdExhaleTime,
      cycles,
      description,
      isPublic = false,
      typeId,
    } = req.body as CreateBreathingExerciseConfigData;

    const type = await prisma.breathingExerciseType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      res.status(400).json({
        message: "Le type d'exercice respiratoire spécifié n'existe pas",
      });
      return;
    }

    if (
      inhaleTime <= 0 ||
      holdInhaleTime < 0 ||
      exhaleTime <= 0 ||
      holdExhaleTime < 0 ||
      cycles <= 0
    ) {
      res.status(400).json({
        message:
          "Les valeurs temporelles doivent être positives et les cycles supérieurs à zéro",
      });
      return;
    }

    const userId = req.user?.id;

    const newConfig = await prisma.breathingExerciseConfiguration.create({
      data: {
        name,
        inhaleTime,
        holdInhaleTime,
        exhaleTime,
        holdExhaleTime,
        cycles,
        description,
        isPublic,
        typeId,
        userId: userId || null,
      },
      include: {
        type: true,
        user: userId
          ? {
              select: {
                id: true,
                userName: true,
              },
            }
          : undefined,
      },
    });

    res.status(201).json({
      message: "Configuration d'exercice respiratoire créée avec succès",
      config: newConfig,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la configuration d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateBreathingConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const configId = parseInt(id);
    const {
      name,
      inhaleTime,
      holdInhaleTime,
      exhaleTime,
      holdExhaleTime,
      cycles,
      description,
      isPublic,
      typeId,
    } = req.body as UpdateBreathingExerciseConfigData;

    const existingConfig =
      await prisma.breathingExerciseConfiguration.findUnique({
        where: { id: configId },
      });

    if (!existingConfig) {
      res
        .status(404)
        .json({ message: "Configuration d'exercice respiratoire non trouvée" });
      return;
    }

    if (existingConfig.userId && existingConfig.userId !== req.user?.id) {
      res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cette configuration",
      });
      return;
    }

    if (typeId !== undefined) {
      const type = await prisma.breathingExerciseType.findUnique({
        where: { id: typeId },
      });

      if (!type) {
        res.status(400).json({
          message: "Le type d'exercice respiratoire spécifié n'existe pas",
        });
        return;
      }
    }

    if (
      (inhaleTime !== undefined && inhaleTime <= 0) ||
      (holdInhaleTime !== undefined && holdInhaleTime < 0) ||
      (exhaleTime !== undefined && exhaleTime <= 0) ||
      (holdExhaleTime !== undefined && holdExhaleTime < 0) ||
      (cycles !== undefined && cycles <= 0)
    ) {
      res.status(400).json({
        message:
          "Les valeurs temporelles doivent être positives et les cycles supérieurs à zéro",
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (inhaleTime !== undefined) updateData.inhaleTime = inhaleTime;
    if (holdInhaleTime !== undefined)
      updateData.holdInhaleTime = holdInhaleTime;
    if (exhaleTime !== undefined) updateData.exhaleTime = exhaleTime;
    if (holdExhaleTime !== undefined)
      updateData.holdExhaleTime = holdExhaleTime;
    if (cycles !== undefined) updateData.cycles = cycles;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (typeId !== undefined) updateData.typeId = typeId;

    const updatedConfig = await prisma.breathingExerciseConfiguration.update({
      where: { id: configId },
      data: updateData,
      include: {
        type: true,
        user: existingConfig.userId
          ? {
              select: {
                id: true,
                userName: true,
              },
            }
          : undefined,
      },
    });

    res.json({
      message: "Configuration d'exercice respiratoire mise à jour avec succès",
      config: updatedConfig,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la configuration d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteBreathingConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const configId = parseInt(id);

    const existingConfig =
      await prisma.breathingExerciseConfiguration.findUnique({
        where: { id: configId },
      });

    if (!existingConfig) {
      res
        .status(404)
        .json({ message: "Configuration d'exercice respiratoire non trouvée" });
      return;
    }

    if (existingConfig.userId && existingConfig.userId !== req.user?.id) {
      res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cette configuration",
      });
      return;
    }

    await prisma.breathingExerciseConfiguration.delete({
      where: { id: configId },
    });

    res.json({
      message: "Configuration d'exercice respiratoire supprimée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la configuration d'exercice respiratoire:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// export const addToFavorites = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     if (!req.user?.id) {
//       res.status(401).json({ message: "Authentification requise" });
//       return;
//     }

//     const { id } = req.params;
//     const configId = parseInt(id);

//     const config = await prisma.breathingExerciseConfiguration.findUnique({
//       where: { id: configId },
//     });

//     if (!config) {
//       res
//         .status(404)
//         .json({ message: "Configuration d'exercice respiratoire non trouvée" });
//       return;
//     }

//     if (!config.isPublic && config.userId !== req.user.id) {
//       res.status(403).json({
//         message:
//           "Vous ne pouvez pas ajouter une configuration privée d'un autre utilisateur",
//       });
//       return;
//     }

//     const userConfig = await prisma.breathingExerciseConfiguration.create({
//       data: {
//         name: `${config.name} (Favori)`,
//         inhaleTime: config.inhaleTime,
//         holdInhaleTime: config.holdInhaleTime,
//         exhaleTime: config.exhaleTime,
//         holdExhaleTime: config.holdExhaleTime,
//         cycles: config.cycles,
//         description: config.description,
//         isPublic: false,
//         typeId: config.typeId,
//         userId: req.user.id,
//       },
//       include: {
//         type: true,
//       },
//     });

//     res.status(201).json({
//       message: "Configuration ajoutée aux favoris avec succès",
//       config: userConfig,
//     });
//   } catch (error) {
//     console.error("Erreur lors de l'ajout aux favoris:", error);
//     res.status(500).json({
//       message: "Erreur serveur",
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// };
