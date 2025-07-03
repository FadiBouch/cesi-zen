export interface BreathingExerciseType {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    configurations: number;
  };
}

export interface BreathingExerciseConfiguration {
  id: number;
  name: string;
  inhaleTime: number;
  holdInhaleTime: number;
  exhaleTime: number;
  holdExhaleTime: number;
  cycles: number;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  typeId: number;
  userId: number | null;
  type: BreathingExerciseType;
  user: User | null;
}

export interface CreateBreathingExerciseData {
  name: string;
  inhaleTime: number;
  holdInhaleTime: number;
  exhaleTime: number;
  holdExhaleTime: number;
  cycles: number;
  description: string;
  typeId: number;
  isPublic?: boolean;
}
