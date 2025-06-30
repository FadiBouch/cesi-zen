import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Button } from "../common/Button";
import { BreathingExerciseConfiguration } from "../../types/breathing";

// Interface pour s'assurer de la compatibilité avec votre structure
interface BreathingConfig {
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
  type: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  user: any | null;
}
import { Colors } from "../../utils/colors";

interface BreathingAnimationViewProps {
  exercise: BreathingExerciseConfiguration | BreathingConfig;
  onComplete?: () => void;
}

enum BreathState {
  READY = "Prêt à commencer",
  INHALE = "Inspirez",
  HOLD_INHALE = "Retenez",
  EXHALE = "Expirez",
  HOLD_EXHALE = "Pause",
  COMPLETE = "Terminé",
}

const { width } = Dimensions.get("window");
const MIN_CIRCLE_SIZE = width * 0.3;
const MAX_CIRCLE_SIZE = width * 0.8;

export const BreathingAnimationView: React.FC<BreathingAnimationViewProps> = ({
  exercise,
  onComplete,
}) => {
  const [started, setStarted] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [breathState, setBreathState] = useState<BreathState>(
    BreathState.READY
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  const animatedSize = useRef(new Animated.Value(MIN_CIRCLE_SIZE)).current;
  const fadeInstructions = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const totalCycleDuration =
    exercise.inhaleTime +
    exercise.holdInhaleTime +
    exercise.exhaleTime +
    exercise.holdExhaleTime;

  const totalDuration = totalCycleDuration * exercise.cycles;

  // Fonction pour nettoyer les timers et animations
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  };

  // Fonction pour exécuter une phase de respiration
  const executePhase = (
    state: BreathState,
    duration: number,
    animationConfig?: { toValue: number }
  ): Promise<void> => {
    return new Promise((resolve) => {
      setBreathState(state);
      setTimeLeft(duration);

      let remainingTime = duration;
      timerRef.current = setInterval(() => {
        remainingTime--;
        setTimeLeft(remainingTime);
        setTotalTimeElapsed((prev) => prev + 1);

        if (remainingTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          resolve();
        }
      }, 1000);

      // Animation si spécifiée
      if (animationConfig) {
        animationRef.current = Animated.timing(animatedSize, {
          toValue: animationConfig.toValue,
          duration: duration * 1000,
          useNativeDriver: false,
        });
        animationRef.current.start();
      }
    });
  };

  // Fonction pour exécuter un cycle complet
  const executeCycle = async (): Promise<void> => {
    // Phase d'inspiration
    await executePhase(BreathState.INHALE, exercise.inhaleTime, {
      toValue: MAX_CIRCLE_SIZE,
    });

    // Phase de rétention après inspiration (si > 0)
    if (exercise.holdInhaleTime > 0) {
      await executePhase(BreathState.HOLD_INHALE, exercise.holdInhaleTime);
    }

    // Phase d'expiration
    await executePhase(BreathState.EXHALE, exercise.exhaleTime, {
      toValue: MIN_CIRCLE_SIZE,
    });

    // Phase de pause après expiration (si > 0)
    if (exercise.holdExhaleTime > 0) {
      await executePhase(BreathState.HOLD_EXHALE, exercise.holdExhaleTime);
    }
  };

  // Fonction principale pour lancer l'exercice
  const startExercise = async () => {
    try {
      for (let cycle = 1; cycle <= exercise.cycles; cycle++) {
        setCurrentCycle(cycle);
        await executeCycle();
      }

      // Exercice terminé
      setBreathState(BreathState.COMPLETE);
      if (onComplete) onComplete();
    } catch (error) {
      console.log("Exercise interrupted");
    }
  };

  useEffect(() => {
    if (started) {
      startExercise();
    }

    return cleanup;
  }, [started]); // Seulement quand started change

  const handleStart = () => {
    setStarted(true);
    setTotalTimeElapsed(0);
    setCurrentCycle(1);
    setBreathState(BreathState.INHALE);
    animatedSize.setValue(MIN_CIRCLE_SIZE);
  };

  const handleReset = () => {
    cleanup();
    setStarted(false);
    setTotalTimeElapsed(0);
    setCurrentCycle(1);
    setBreathState(BreathState.READY);
    setTimeLeft(0);
    animatedSize.setValue(MIN_CIRCLE_SIZE);
  };

  const getProgressPercent = () => {
    return Math.min((totalTimeElapsed / totalDuration) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.cycleText}>
          Cycle {currentCycle} / {exercise.cycles}
        </Text>
      </View>

      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            {
              width: animatedSize,
              height: animatedSize,
              borderRadius: Animated.divide(animatedSize, 2),
            },
          ]}
        />

        <Animated.View
          style={[styles.instructionContainer, { opacity: fadeInstructions }]}
        >
          <Text style={styles.instructionText}>{breathState}</Text>
          {timeLeft > 0 &&
            started &&
            breathState !== BreathState.COMPLETE &&
            breathState !== BreathState.READY && (
              <Text style={styles.timerText}>{timeLeft}</Text>
            )}
        </Animated.View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${getProgressPercent()}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.floor(totalTimeElapsed / 60)}:
          {(totalTimeElapsed % 60).toString().padStart(2, "0")} /{" "}
          {Math.floor(totalDuration / 60)}:
          {(totalDuration % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!started ? (
          <Button title="Commencer" onPress={handleStart} />
        ) : (
          <Button
            title={
              breathState === BreathState.COMPLETE
                ? "Recommencer"
                : "Réinitialiser"
            }
            onPress={handleReset}
            variant="outline"
          />
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: 8,
  },
  cycleText: {
    fontSize: 16,
    color: Colors.textMedium,
  },
  animationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
    height: MAX_CIRCLE_SIZE,
  },
  breathCircle: {
    backgroundColor: Colors.secondary,
    opacity: 0.5,
    position: "absolute",
  },
  instructionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.textDark,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textMedium,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: "center",
  },
});
