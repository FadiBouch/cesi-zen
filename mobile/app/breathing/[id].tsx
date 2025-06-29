import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBreathingExerciseById } from "../../hooks/useBreathing";
import { BreathingAnimationView } from "../../components/breathing/BreathingAnimationView";
import { Loading } from "../../components/common/Loading";
import { Card } from "../../components/common/Card";
import { Colors } from "../../utils/colors";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = parseInt(id);
  const { exercise, loading, error } = useBreathingExerciseById(exerciseId);

  if (loading) {
    return <Loading fullScreen message="Chargement de l'exercice..." />;
  }

  if (error || !exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || "L'exercice demandé n'existe pas."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: exercise.name,
        }}
      />

      <Card style={styles.infoCard}>
        <Text style={styles.typeTitle}>{exercise.type.name}</Text>
        <Text style={styles.description}>{exercise.description}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cycles:</Text>
            <Text style={styles.detailValue}>{exercise.cycles}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Inspiration:</Text>
            <Text style={styles.detailValue}>
              {exercise.inhaleTime} secondes
            </Text>
          </View>
          {exercise.holdInhaleTime > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rétention:</Text>
              <Text style={styles.detailValue}>
                {exercise.holdInhaleTime} secondes
              </Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expiration:</Text>
            <Text style={styles.detailValue}>
              {exercise.exhaleTime} secondes
            </Text>
          </View>
          {exercise.holdExhaleTime > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pause:</Text>
              <Text style={styles.detailValue}>
                {exercise.holdExhaleTime} secondes
              </Text>
            </View>
          )}
        </View>
      </Card>

      <BreathingAnimationView exercise={exercise} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  infoCard: {
    margin: 16,
  },
  typeTitle: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: Colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textMedium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    fontSize: 16,
  },
});
