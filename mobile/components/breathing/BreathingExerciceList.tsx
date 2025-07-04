import React from "react";
import { FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import { BreathingExerciseCard } from "./BreathingExerciceCard";
import { Loading } from "../common/Loading";
import { BreathingExerciseConfiguration } from "../../types/breathing";
import { Colors } from "../../utils/colors";

interface BreathingExerciseListProps {
  exercises: BreathingExerciseConfiguration[];
  loading: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
}

export const BreathingExerciseList: React.FC<BreathingExerciseListProps> = ({
  exercises,
  loading,
  onRefresh,
  refreshing = false,
  emptyMessage = "Aucun exercice de respiration disponible",
}) => {
  if (loading && !refreshing) {
    return <Loading message="Chargement des exercices..." />;
  }

  if (exercises.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <BreathingExerciseCard exercise={item} />}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: "center",
  },
});
