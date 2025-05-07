import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack, Link, useRouter, Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useBreathingExercises,
  useBreathingExerciseTypes,
} from "../../hooks/useBreathing";
import { BreathingExerciseList } from "../../components/breathing/BreathingExerciceList";
import { Loading } from "../../components/common/Loading";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";
import { Colors } from "../../utils/colors";
import { useFocusEffect } from "@react-navigation/native";
import { BreathingExerciseConfiguration } from "@/types/breathing";

export default function BreathingExercisesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showMyExercises, setShowMyExercises] = useState(false);
  const {
    exercises: publicExercises,
    loading: loadingPublic,
    error: errorPublic,
    refreshExercises: refreshPublic,
  } = useBreathingExercises(true);

  const { types, loading: loadingTypes } = useBreathingExerciseTypes();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshPublic();
    }, [refreshPublic, isAuthenticated])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPublic();
    setRefreshing(false);
  };

  const filteredExercises = (() => {
    const sourceExercises = publicExercises;
    if (selectedTypeId) {
      return sourceExercises.filter(
        (exercise: BreathingExerciseConfiguration) =>
          exercise.typeId === selectedTypeId
      );
    }
    return sourceExercises;
  })();

  const loading = loadingPublic;
  const error = errorPublic;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Exercices de Respiration" }} />

      <View style={styles.content}>
        {isAuthenticated && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !showMyExercises && styles.activeTab]}
              onPress={() => setShowMyExercises(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  !showMyExercises && styles.activeTabText,
                ]}
              >
                Exercices Publics
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, showMyExercises && styles.activeTab]}
              onPress={() => setShowMyExercises(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  showMyExercises && styles.activeTabText,
                ]}
              >
                Mes Exercices
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loadingTypes ? (
          <Loading message="Chargement des types d'exercices..." />
        ) : (
          <FlatList
            horizontal
            data={[{ id: null, name: "Tous" }, ...types]}
            keyExtractor={(item) => (item.id ? item.id.toString() : "all")}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  selectedTypeId === item.id && styles.selectedTypeButton,
                ]}
                onPress={() => setSelectedTypeId(item.id)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedTypeId === item.id && styles.selectedTypeButtonText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typesContainer}
          />
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Une erreur est survenue : {error}
            </Text>
          </View>
        ) : (
          <BreathingExerciseList
            exercises={filteredExercises}
            loading={loading}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            emptyMessage={
              showMyExercises
                ? "Vous n'avez pas encore créé d'exercices de respiration"
                : selectedTypeId
                ? "Aucun exercice disponible pour ce type"
                : "Aucun exercice de respiration disponible"
            }
          />
        )}

        {isAuthenticated && (
          <View style={styles.actionContainer}>
            <Link href={"/breathing/create" as Href} asChild>
              <Button title="Créer un exercice" onPress={() => {}} />
            </Link>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textMedium,
  },
  activeTabText: {
    fontWeight: "600",
    color: Colors.primary,
  },
  typesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  selectedTypeButtonText: {
    color: Colors.white,
    fontWeight: "600",
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
  actionContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
});
