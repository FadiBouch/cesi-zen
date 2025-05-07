import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Button } from "../common/Button";
import { BreathingExerciseConfiguration } from "../../types/breathing";
import { Colors } from "../../utils/colors";

interface BreathingAnimationViewProps {
  exercise: BreathingExerciseConfiguration;
  onComplete?: () => void;
}

enum BreathState {
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
    BreathState.INHALE
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  const animatedSize = useRef(new Animated.Value(MIN_CIRCLE_SIZE)).current;
  const fadeInstructions = useRef(new Animated.Value(1)).current;

  const totalCycleDuration =
    exercise.inhaleTime +
    exercise.holdInhaleTime +
    exercise.exhaleTime +
    exercise.holdExhaleTime;

  const totalDuration = totalCycleDuration * exercise.cycles;

  useEffect(() => {
    if (!started) return;

    let timer: NodeJS.Timeout;

    const startBreathingCycle = () => {
      // Inhale phase
      setBreathState(BreathState.INHALE);
      setTimeLeft(exercise.inhaleTime);

      Animated.sequence([
        // Inhale Animation - Circle grows
        Animated.timing(animatedSize, {
          toValue: MAX_CIRCLE_SIZE,
          duration: exercise.inhaleTime * 1000,
          useNativeDriver: false,
        }),

        // Hold after inhale
        ...(exercise.holdInhaleTime > 0
          ? [
              Animated.timing(fadeInstructions, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
              }),
              Animated.timing(fadeInstructions, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
              }),
            ]
          : []),

        // Exhale Animation - Circle shrinks
        Animated.timing(animatedSize, {
          toValue: MIN_CIRCLE_SIZE,
          duration: exercise.exhaleTime * 1000,
          useNativeDriver: false,
        }),

        // Hold after exhale
        ...(exercise.holdExhaleTime > 0
          ? [
              Animated.timing(fadeInstructions, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
              }),
              Animated.timing(fadeInstructions, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
              }),
            ]
          : []),
      ]).start();

      let timer = setInterval(() => {
        setTotalTimeElapsed((prev) => {
          const newTotal = prev + 1;

          // Check if we've reached the end of the entire exercise
          if (newTotal >= totalDuration) {
            clearInterval(timer);
            setBreathState(BreathState.COMPLETE);
            if (onComplete) onComplete();
            return totalDuration;
          }

          // Calculate current position in the cycle
          const positionInCurrentCycle = newTotal % totalCycleDuration;

          // Update cycle number
          const newCycle = Math.floor(newTotal / totalCycleDuration) + 1;
          if (newCycle !== currentCycle) {
            setCurrentCycle(newCycle);
          }

          // Determine breath state and remaining time
          if (positionInCurrentCycle < exercise.inhaleTime) {
            // Inhale phase
            setBreathState(BreathState.INHALE);
            setTimeLeft(exercise.inhaleTime - positionInCurrentCycle);
          } else if (
            positionInCurrentCycle <
            exercise.inhaleTime + exercise.holdInhaleTime
          ) {
            // Hold after inhale
            setBreathState(BreathState.HOLD_INHALE);
            setTimeLeft(
              exercise.inhaleTime +
                exercise.holdInhaleTime -
                positionInCurrentCycle
            );
          } else if (
            positionInCurrentCycle <
            exercise.inhaleTime + exercise.holdInhaleTime + exercise.exhaleTime
          ) {
            // Exhale phase
            setBreathState(BreathState.EXHALE);
            setTimeLeft(
              exercise.inhaleTime +
                exercise.holdInhaleTime +
                exercise.exhaleTime -
                positionInCurrentCycle
            );
          } else {
            // Hold after exhale
            setBreathState(BreathState.HOLD_EXHALE);
            setTimeLeft(totalCycleDuration - positionInCurrentCycle);
          }

          return newTotal;
        });
      }, 1000);
    };

    startBreathingCycle();

    // return () => {
    //   if (timer) clearInterval(timer);
    // };
  }, [started, exercise]);

  const handleStart = () => {
    setStarted(true);
    setTotalTimeElapsed(0);
    setCurrentCycle(1);
    animatedSize.setValue(MIN_CIRCLE_SIZE);
  };

  const handleReset = () => {
    setStarted(false);
    setTotalTimeElapsed(0);
    setCurrentCycle(1);
    setBreathState(BreathState.INHALE);
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
          {timeLeft > 0 && <Text style={styles.timerText}>{timeLeft}</Text>}
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
          {(totalTimeElapsed % 60).toString().padStart(2, "0")} /
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
