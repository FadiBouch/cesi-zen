import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Href, Link, useRouter } from "expo-router";
import { Card } from "../common/Card";
import { BreathingExerciseConfiguration } from "../../types/breathing";
import { Colors } from "../../utils/colors";

interface BreathingExerciseCardProps {
  exercise: BreathingExerciseConfiguration;
}

export const BreathingExerciseCard: React.FC<BreathingExerciseCardProps> = ({
  exercise,
}) => {
  const router = useRouter();

  const timingSummary = `${exercise.inhaleTime}s inspire, ${
    exercise.holdInhaleTime > 0 ? `${exercise.holdInhaleTime}s retenir, ` : ""
  }${exercise.exhaleTime}s expire${
    exercise.holdExhaleTime > 0 ? `, ${exercise.holdExhaleTime}s pause` : ""
  }`;

  return (
    <Link href={`/exercise/${exercise.id}` as Href} asChild>
      <TouchableOpacity activeOpacity={0.7}>
        <Card>
          <View style={styles.header}>
            <Text style={styles.title}>{exercise.name}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{exercise.type.name}</Text>
            </View>
          </View>
          <Text style={styles.description}>{exercise.description}</Text>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Timing:</Text>
              <Text style={styles.detailValue}>{timingSummary}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cycles:</Text>
              <Text style={styles.detailValue}>{exercise.cycles}</Text>
            </View>
          </View>
          {exercise.user && (
            <View style={styles.footer}>
              <Text style={styles.authorText}>
                Créé par: {exercise.user.username}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textDark,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textDark,
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textMedium,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  authorText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: "italic",
  },
});
