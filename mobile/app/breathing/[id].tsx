import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Play, Pause, RotateCcw, Info } from "lucide-react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useBreathingExerciseById } from "@/hooks/useBreathing";

const { width } = Dimensions.get("window");

const BreathingExerciseApp = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, loading, error } = useBreathingExerciseById(parseInt(id));
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("ready");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getCurrentPhaseIndex = () => {
    return phases.findIndex((phase) => phase.name === currentPhase);
  };

  const getNextPhase = () => {
    const currentIndex = getCurrentPhaseIndex();
    if (currentIndex === -1) return phases[0];
    return phases[(currentIndex + 1) % phases.length];
  };

  const animateCircle = (phase: any) => {
    let toValue = 1;
    if (phase === "inhale") toValue = 1.2;
    if (phase === "exhale") toValue = 0.8;

    Animated.timing(scaleAnim, {
      toValue,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const startExercise = () => {
    if (currentPhase === "ready" || currentPhase === "complete") {
      setCurrentPhase("inhale");
      setCurrentCycle(1);
      setTimeRemaining(exerciseData.inhaleTime);
      animateCircle("inhale");
    }
    setIsActive(true);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase("ready");
    setCurrentCycle(0);
    setTimeRemaining(0);
    scaleAnim.setValue(1);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            const nextPhase = getNextPhase();
            const currentIndex = getCurrentPhaseIndex();

            if (currentIndex === phases.length - 1) {
              if (currentCycle >= exerciseData.cycles) {
                setCurrentPhase("complete");
                setIsActive(false);
                scaleAnim.setValue(1);
                return 0;
              } else {
                setCurrentCycle((prev) => prev + 1);
                setCurrentPhase(phases[0].name);
                animateCircle(phases[0].name);
                return phases[0].duration;
              }
            } else {
              setCurrentPhase(nextPhase.name);
              animateCircle(nextPhase.name);
              return nextPhase.duration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, currentPhase, currentCycle]);

  if (error || !exercise) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || "Exercice non trouvé"}</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement de l'exercice...</Text>
      </View>
    );
  }

  const exerciseData = exercise;

  const phases = [
    {
      name: "inhale",
      duration: exerciseData.inhaleTime,
      label: "Inspirez",
      color: "#3B82F6",
    },
    {
      name: "holdInhale",
      duration: exerciseData.holdInhaleTime,
      label: "Retenez",
      color: "#EAB308",
    },
    {
      name: "exhale",
      duration: exerciseData.exhaleTime,
      label: "Expirez",
      color: "#10B981",
    },
    {
      name: "holdExhale",
      duration: exerciseData.holdExhaleTime,
      label: "Pause",
      color: "#6B7280",
    },
  ].filter((phase) => phase.duration > 0);

  const getCurrentPhaseData = () => {
    return (
      phases.find((phase) => phase.name === currentPhase) || {
        label: "Prêt",
        color: "#9CA3AF",
      }
    );
  };

  const getPhaseLabel = () => {
    if (currentPhase === "ready") return "Prêt à commencer";
    if (currentPhase === "complete") return "Exercice terminé !";
    return getCurrentPhaseData().label;
  };

  const progress =
    currentCycle > 0 ? (currentCycle / exerciseData.cycles) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Configuration du titre de la page */}
      <Stack.Screen
        options={{
          title: exerciseData.name,
          headerBackTitle: "Retour",
        }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.subtitle}>
              Catégorie : {exerciseData.type.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfo(!showInfo)}
          >
            <Info size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Info Panel */}
        {showInfo && (
          <TouchableOpacity
            style={styles.tooltipOverlay}
            activeOpacity={1}
            onPress={() => setShowInfo(false)}
          >
            <View style={styles.tooltipContainer}>
              <View style={styles.infoTooltip}>
                <View style={styles.tooltipHeader}>
                  <Text style={styles.infoTitle}>Description</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowInfo(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.infoDescription}>
                  {exerciseData.description}
                </Text>
                <View style={styles.infoGrid}>
                  <View style={[styles.infoItem, styles.inhaleInfo]}>
                    <Text style={styles.infoLabel}>
                      Inspiration: {exerciseData.inhaleTime}s
                    </Text>
                  </View>
                  {exerciseData.holdInhaleTime > 0 && (
                    <View style={[styles.infoItem, styles.holdInfo]}>
                      <Text style={styles.infoLabel}>
                        Rétention: {exerciseData.holdInhaleTime}s
                      </Text>
                    </View>
                  )}
                  <View style={[styles.infoItem, styles.exhaleInfo]}>
                    <Text style={styles.infoLabel}>
                      Expiration: {exerciseData.exhaleTime}s
                    </Text>
                  </View>
                  <View style={[styles.infoItem, styles.cyclesInfo]}>
                    <Text style={styles.infoLabel}>
                      Cycles: {exerciseData.cycles}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Main Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                backgroundColor: getCurrentPhaseData().color,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.circleContent}>
              <Text style={styles.phaseLabel}>{getPhaseLabel()}</Text>
              {timeRemaining > 0 && (
                <Text style={styles.timer}>{timeRemaining}</Text>
              )}
            </View>
          </Animated.View>

          {/* Cycle Counter */}
          <View style={styles.cycleCounter}>
            {currentCycle > 0 && currentPhase !== "complete" && (
              <Text style={styles.cycleText}>
                Cycle {currentCycle} / {exerciseData.cycles}
              </Text>
            )}
            {currentPhase === "complete" && (
              <Text style={styles.completeText}>✓ Exercice terminé !</Text>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isActive &&
            (currentPhase === "ready" || currentPhase === "complete") && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startExercise}
              >
                <Play size={20} color="white" />
                <Text style={styles.buttonText}>Commencer</Text>
              </TouchableOpacity>
            )}

          {isActive && (
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={pauseExercise}
            >
              <Pause size={20} color="white" />
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
          )}

          {!isActive && currentPhase !== "ready" && (
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={startExercise}
            >
              <Play size={20} color="white" />
              <Text style={styles.buttonText}>Reprendre</Text>
            </TouchableOpacity>
          )}

          {currentPhase !== "ready" && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetExercise}
            >
              <RotateCcw size={20} color="white" />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Phase Indicators */}
        {currentPhase !== "ready" && currentPhase !== "complete" && (
          <View style={styles.phaseIndicators}>
            <View style={styles.phasesContainer}>
              {phases.map((phase, index) => (
                <View
                  key={phase.name}
                  style={[
                    styles.phaseIndicator,
                    currentPhase === phase.name && styles.activePhaseIndicator,
                  ]}
                >
                  <View
                    style={[styles.phaseDot, { backgroundColor: phase.color }]}
                  />
                  <Text style={styles.phaseIndicatorLabel}>{phase.label}</Text>
                  <Text style={styles.phaseIndicatorTime}>
                    {phase.duration}s
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6B7280",
  },
  tooltipOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tooltipContainer: {
    width: "100%",
    maxWidth: 350,
  },
  infoTooltip: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  tooltipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoButton: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoPanel: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoItem: {
    flex: 1,
    minWidth: "45%",
    padding: 8,
    borderRadius: 6,
  },
  inhaleInfo: {
    backgroundColor: "#DBEAFE",
  },
  holdInfo: {
    backgroundColor: "#FEF3C7",
  },
  exhaleInfo: {
    backgroundColor: "#D1FAE5",
  },
  cyclesInfo: {
    backgroundColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  circleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  breathingCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 16,
  },
  circleContent: {
    alignItems: "center",
  },
  phaseLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  timer: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    fontFamily: "monospace",
  },
  cycleCounter: {
    alignItems: "center",
  },
  cycleText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  completeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  startButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 8,
  },
  pauseButton: {
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 8,
  },
  resumeButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 8,
  },
  resetButton: {
    backgroundColor: "#6B7280",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  phaseIndicators: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  phasesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  phaseIndicator: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    flex: 1,
  },
  activePhaseIndicator: {
    backgroundColor: "#F3F4F6",
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  phaseIndicatorLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  phaseIndicatorTime: {
    fontSize: 10,
    color: "#6B7280",
  },
});

export default BreathingExerciseApp;
