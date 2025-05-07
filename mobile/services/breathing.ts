import { fetchWithToken } from "./api";
import {
  BreathingExerciseConfiguration,
  BreathingExerciseType,
  CreateBreathingExerciseData,
} from "../types/breathing";

export const getAllBreathingExercises = async (): Promise<
  BreathingExerciseConfiguration[]
> => {
  return fetchWithToken("/breathing/exercises");
};

export const getPublicBreathingExercises = async (): Promise<
  BreathingExerciseConfiguration[]
> => {
  return fetchWithToken("/breathing/exercises/public");
};

export const getUserBreathingExercises = async (): Promise<
  BreathingExerciseConfiguration[]
> => {
  return fetchWithToken("/breathing/exercises/user");
};

export const getBreathingExerciseById = async (
  id: number
): Promise<BreathingExerciseConfiguration> => {
  return fetchWithToken(`/breathing/exercises/${id}`);
};

export const createBreathingExercise = async (
  data: CreateBreathingExerciseData
): Promise<BreathingExerciseConfiguration> => {
  return fetchWithToken("/breathing/exercises", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateBreathingExercise = async (
  id: number,
  data: Partial<CreateBreathingExerciseData>
): Promise<BreathingExerciseConfiguration> => {
  return fetchWithToken(`/breathing/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteBreathingExercise = async (id: number): Promise<void> => {
  return fetchWithToken(`/breathing/exercises/${id}`, {
    method: "DELETE",
  });
};

export const getAllBreathingExerciseTypes = async (): Promise<
  BreathingExerciseType[]
> => {
  return fetchWithToken("/breathing/types");
};
