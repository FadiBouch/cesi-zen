import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Href, Link, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { useAuth } from "../../hooks/useAuth";
import { Colors } from "../../utils/colors";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est obligatoire";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Veuillez saisir un email valide";
      isValid = false;
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est obligatoire";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
    } catch (err) {
      // Error is handled by the useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Inscription" }} />

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Créer un compte</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <Input
            label="Nom d'utilisateur"
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
            placeholder="Votre nom d'utilisateur"
            error={formErrors.username}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={formErrors.email}
          />

          <Input
            label="Mot de passe"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            placeholder="Votre mot de passe"
            secureTextEntry
            error={formErrors.password}
          />

          <Input
            label="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            placeholder="Confirmez votre mot de passe"
            secureTextEntry
            error={formErrors.confirmPassword}
          />

          <Text style={styles.optionalTitle}>Informations optionnelles</Text>

          <Input
            label="Prénom"
            value={formData.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
            placeholder="Votre prénom"
          />

          <Input
            label="Nom"
            value={formData.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
            placeholder="Votre nom"
          />

          <Button
            title="S'inscrire"
            onPress={handleRegister}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.registerButton}
          />

          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
            <Link href={"/login" as Href} asChild>
              <TouchableOpacity>
                <Text style={styles.loginLinkText}>Se connecter</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Card>
      </ScrollView>
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
    padding: 16,
  },
  card: {
    padding: 24,
    marginVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: Colors.textDark,
  },
  optionalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: Colors.textDark,
  },
  errorContainer: {
    backgroundColor: Colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    color: Colors.error,
    fontSize: 14,
  },
  registerButton: {
    marginTop: 16,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: Colors.textMedium,
    marginRight: 4,
  },
  loginLinkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
