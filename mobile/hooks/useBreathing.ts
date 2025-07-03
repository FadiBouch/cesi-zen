import { useState, useEffect, useCallback } from "react";
import {
  BreathingExerciseConfiguration,
  BreathingExerciseType,
  CreateBreathingExerciseData,
} from "../types/breathing";
import * as breathingService from "../services/breathing";

export const useBreathingExercises = (publicOnly: boolean = false) => {
  const [exercises, setExercises] = useState<BreathingExerciseConfiguration[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (publicOnly) {
        data = await breathingService.getPublicBreathingExercises();
      } else {
        data = await breathingService.getAllBreathingExercises();
      }
      setExercises(data.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors du chargement des exercices de respiration");
      }
    } finally {
      setLoading(false);
    }
  }, [publicOnly]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, loading, error, refreshExercises: fetchExercises };
};

export const useUserBreathingExercises = () => {
  const [exercises, setExercises] = useState<BreathingExerciseConfiguration[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await breathingService.getUserBreathingExercises();
      setExercises(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors du chargement des exercices de respiration");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { exercises, loading, error, refreshExercises: fetchExercises };
};

export const useBreathingExerciseById = (id: number) => {
  const [exercise, setExercise] =
    useState<BreathingExerciseConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const data = await breathingService.getBreathingExerciseById(id);
        setExercise(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur lors du chargement de l'exercice de respiration");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExercise();
    }
  }, [id]);

  return { exercise, loading, error };
};

export const useBreathingExerciseTypes = () => {
  const [types, setTypes] = useState<BreathingExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await breathingService.getAllBreathingExerciseTypes();

      console.log("data : ", JSON.stringify(resp.data));
      setTypes(resp.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Erreur lors du chargement des types d'exercices de respiration"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, refreshTypes: fetchTypes };
};

export const useCreateBreathingExercise = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createExercise = async (data: CreateBreathingExerciseData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await breathingService.createBreathingExercise(data);
      setSuccess(true);
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la création de l'exercice de respiration");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createExercise, loading, error, success };
};
