import { fetchWithToken } from "./api";
import {
  BreathingExerciseConfiguration,
  BreathingExerciseType,
  CreateBreathingExerciseData,
} from "../types/breathing";

export const getAllBreathingExercises = async () => {
  return fetchWithToken("/breathing-configs");
};

export const getPublicBreathingExercises = async () => {
  return fetchWithToken("/breathing-configs");
};

export const getUserBreathingExercises = async () => {
  return fetchWithToken("/breathing-configs/user");
};

export const getBreathingExerciseById = async (id: number) => {
  return fetchWithToken(`/breathing-configs/${id}`);
};

export const createBreathingExercise = async (
  data: CreateBreathingExerciseData
) => {
  return fetchWithToken("/breathing-configs", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateBreathingExercise = async (
  id: number,
  data: Partial<CreateBreathingExerciseData>
) => {
  return fetchWithToken(`/breathing-configs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteBreathingExercise = async (id: number) => {
  return fetchWithToken(`/breathing-configs/${id}`, {
    method: "DELETE",
  });
};

export const getAllBreathingExerciseTypes = async () => {
  return fetchWithToken("/breathing-types");
};
