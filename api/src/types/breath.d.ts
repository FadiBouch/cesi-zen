// Types pour les exercices respiratoires
import {
  BreathingExerciseType,
  BreathingExerciseConfiguration,
  BreathingExerciseSession,
} from "@prisma/client";

// Type pour la création d'un type d'exercice respiratoire
export interface CreateBreathingExerciseTypeData {
  name: string;
  description?: string;
}

// Type pour la mise à jour d'un type d'exercice respiratoire
export interface UpdateBreathingExerciseTypeData {
  name?: string;
  description?: string;
}

// Type pour la création d'une configuration d'exercice respiratoire
export interface CreateBreathingExerciseConfigData {
  name: string;
  inhaleTime: number;
  holdInhaleTime: number;
  exhaleTime: number;
  holdExhaleTime: number;
  cycles: number;
  description?: string;
  isPublic?: boolean;
  typeId: number;
}

// Type pour la mise à jour d'une configuration d'exercice respiratoire
export interface UpdateBreathingExerciseConfigData {
  name?: string;
  inhaleTime?: number;
  holdInhaleTime?: number;
  exhaleTime?: number;
  holdExhaleTime?: number;
  cycles?: number;
  description?: string;
  isPublic?: boolean;
  typeId?: number;
}

// Type pour la création d'une session d'exercice respiratoire
export interface CreateBreathingExerciseSessionData {
  configurationId: number;
  startTime?: Date;
}

// Type pour la mise à jour d'une session d'exercice respiratoire
export interface UpdateBreathingExerciseSessionData {
  endTime?: Date;
  completedCycles?: number;
}

// Type pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Type pour les paramètres de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
  orderBy?: string;
}
