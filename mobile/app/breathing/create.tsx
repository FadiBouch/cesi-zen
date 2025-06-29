import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Href, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useBreathingExerciseTypes,
  useCreateBreathingExercise,
} from "../../hooks/useBreathing";
import { BreathingExerciseForm } from "../../components/breathing/BreathingExerciceForm";
import { Loading } from "../../components/common/Loading";
import { Colors } from "../../utils/colors";
import { useAuth } from "../../hooks/useAuth";
import { Redirect } from "expo-router";

export default function CreateExerciseScreen() {
  const { isAuthenticated } = useAuth();
  const {
    types,
    loading: loadingTypes,
    error: typesError,
  } = useBreathingExerciseTypes();
  const {
    createExercise,
    loading: creatingExercise,
    error: createError,
  } = useCreateBreathingExercise();

  if (!isAuthenticated) {
    return <Redirect href={"/login" as Href} />;
  }

  const handleCreateExercise = async (data: any) => {
    try {
      await createExercise(data);
      Alert.alert(
        "Succès",
        "Votre exercice de respiration a été créé avec succès !",
        [{ text: "OK" }]
      );
      return Promise.resolve();
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la création de l'exercice. Veuillez réessayer.",
        [{ text: "OK" }]
      );
      return Promise.reject(error);
    }
  };

  if (loadingTypes) {
    return <Loading fullScreen message="Chargement des types d'exercices..." />;
  }

  if (typesError) {
    return (
      <View style={styles.errorContainer}>
        <Loading message={`Erreur: ${typesError}`} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Créer un Exercice de Respiration" }} />

      <BreathingExerciseForm
        types={types}
        onSubmit={handleCreateExercise}
        loading={creatingExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
