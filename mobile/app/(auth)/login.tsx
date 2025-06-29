// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { useAuth } from "../../hooks/useAuth";
import { Colors } from "../../utils/colors";

export default function LoginScreen() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = "Le nom d'utilisateur est obligatoire";
      isValid = false;
    }

    if (!password) {
      errors.password = "Le mot de passe est obligatoire";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err: any) {
      console.log(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Connexion" }} />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Connexion</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <Input
            label="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            placeholder="Votre nom d'utilisateur"
            autoCapitalize="none"
            error={formErrors.username}
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Votre mot de passe"
            secureTextEntry
            error={formErrors.password}
          />

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.loginButton}
          />

          <View style={styles.registerLink}>
            <Text style={styles.registerText}>Vous n'avez pas de compte ?</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLinkText}>S'inscrire</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Card>
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
    padding: 16,
    justifyContent: "center",
  },
  card: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
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
  loginButton: {
    marginTop: 16,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: Colors.textMedium,
    marginRight: 4,
  },
  registerLinkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
