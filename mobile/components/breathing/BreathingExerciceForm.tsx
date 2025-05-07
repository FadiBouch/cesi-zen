import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Card } from "../common/Card";
import {
  BreathingExerciseType,
  CreateBreathingExerciseData,
} from "../../types/breathing";
import { Colors } from "../../utils/colors";
import RNPickerSelect from "react-native-picker-select";

interface BreathingExerciseFormProps {
  types: BreathingExerciseType[];
  onSubmit: (data: CreateBreathingExerciseData) => Promise<void>;
  loading: boolean;
}

export const BreathingExerciseForm: React.FC<BreathingExerciseFormProps> = ({
  types,
  onSubmit,
  loading,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateBreathingExerciseData>({
    name: "",
    description: "",
    inhaleTime: 4,
    holdInhaleTime: 0,
    exhaleTime: 4,
    holdExhaleTime: 0,
    cycles: 5,
    typeId: 0,
    isPublic: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default typeId when types are loaded
  useEffect(() => {
    if (types.length > 0 && formData.typeId === 0) {
      setFormData((prev) => ({ ...prev, typeId: types[0].id }));
    }
  }, [types, formData.typeId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est obligatoire";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est obligatoire";
    }

    if (formData.inhaleTime <= 0) {
      newErrors.inhaleTime = "Le temps d'inspiration doit être supérieur à 0";
    }

    if (formData.exhaleTime <= 0) {
      newErrors.exhaleTime = "Le temps d'expiration doit être supérieur à 0";
    }

    if (formData.holdInhaleTime < 0) {
      newErrors.holdInhaleTime =
        "Le temps de rétention doit être positif ou nul";
    }

    if (formData.holdExhaleTime < 0) {
      newErrors.holdExhaleTime = "Le temps de pause doit être positif ou nul";
    }

    if (formData.cycles <= 0) {
      newErrors.cycles = "Le nombre de cycles doit être supérieur à 0";
    }

    if (formData.typeId <= 0) {
      newErrors.typeId = "Veuillez sélectionner un type d'exercice";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(formData);
        router.push("/");
      } catch (error) {
        // Error is handled by the parent component
      }
    }
  };

  const handleChange = (
    name: keyof CreateBreathingExerciseData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>
          Créer un nouvel exercice de respiration
        </Text>

        <Input
          label="Nom de l'exercice"
          value={formData.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="Ex: Respiration 4-7-8 personnalisée"
          error={errors.name}
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => handleChange("description", text)}
          placeholder="Décrivez votre exercice de respiration..."
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        <Text style={styles.sectionTitle}>Type d'exercice</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => handleChange("typeId", value)}
            value={formData.typeId}
            items={types.map((type) => ({
              label: type.name,
              value: type.id,
              key: type.id.toString(),
            }))}
            style={{
              inputIOS: styles.picker,
              inputAndroid: styles.picker,
            }}
            placeholder={{ label: "Sélectionnez un type d'exercice", value: 0 }}
          />
          {errors.typeId && (
            <Text style={styles.errorText}>{errors.typeId}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Paramètres de respiration</Text>
        <View style={styles.paramContainer}>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>
              Temps d'inspiration (secondes)
            </Text>
            <Input
              value={formData.inhaleTime.toString()}
              onChangeText={(text) =>
                handleChange("inhaleTime", parseInt(text) || 0)
              }
              keyboardType="numeric"
              containerStyle={styles.paramInput}
              error={errors.inhaleTime}
            />
          </View>

          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>
              Temps de rétention après inspiration (secondes)
            </Text>
            <Input
              value={formData.holdInhaleTime.toString()}
              onChangeText={(text) =>
                handleChange("holdInhaleTime", parseInt(text) || 0)
              }
              keyboardType="numeric"
              containerStyle={styles.paramInput}
              error={errors.holdInhaleTime}
            />
          </View>

          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Temps d'expiration (secondes)</Text>
            <Input
              value={formData.exhaleTime.toString()}
              onChangeText={(text) =>
                handleChange("exhaleTime", parseInt(text) || 0)
              }
              keyboardType="numeric"
              containerStyle={styles.paramInput}
              error={errors.exhaleTime}
            />
          </View>

          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>
              Temps de pause après expiration (secondes)
            </Text>
            <Input
              value={formData.holdExhaleTime.toString()}
              onChangeText={(text) =>
                handleChange("holdExhaleTime", parseInt(text) || 0)
              }
              keyboardType="numeric"
              containerStyle={styles.paramInput}
              error={errors.holdExhaleTime}
            />
          </View>

          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Nombre de cycles</Text>
            <Input
              value={formData.cycles.toString()}
              onChangeText={(text) =>
                handleChange("cycles", parseInt(text) || 0)
              }
              keyboardType="numeric"
              containerStyle={styles.paramInput}
              error={errors.cycles}
            />
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Rendre cet exercice public</Text>
          <Switch
            value={formData.isPublic}
            onValueChange={(value) => handleChange("isPublic", value)}
            trackColor={{ false: Colors.textLight, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Créer l'exercice"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    padding: 12,
    fontSize: 16,
    color: Colors.textDark,
  },
  paramContainer: {
    marginBottom: 16,
  },
  paramRow: {
    marginBottom: 12,
  },
  paramLabel: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 4,
  },
  paramInput: {
    marginBottom: 0,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.textDark,
  },
  buttonContainer: {
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 12,
  },
});
