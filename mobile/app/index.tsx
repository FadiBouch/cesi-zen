// app/index.tsx - Updated with profile access
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Href, Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { Colors } from "../utils/colors";

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };
  console.log(user);
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Accueil",
          headerRight: () =>
            isAuthenticated ? (
              <View style={styles.headerButtons}>
                <Link href={"/profile" as Href} asChild>
                  <TouchableOpacity style={styles.headerButton}>
                    <FontAwesome5
                      name="user"
                      size={16}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity
                  onPress={handleLogout}
                  disabled={loggingOut}
                  style={styles.headerButton}
                >
                  <Text style={styles.logoutText}>
                    {loggingOut ? "..." : "Déconnexion"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Link href={"/login" as Href} asChild>
                <TouchableOpacity>
                  <Text style={styles.loginText}>Connexion</Text>
                </TouchableOpacity>
              </Link>
            ),
        }}
      />

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            {isAuthenticated
              ? `Bienvenue, ${user?.userName || "utilisateur"} !`
              : "Bienvenue dans notre application de respiration " +
                process.env.EXPO_PUBLIC_BASE_URL}
          </Text>
          <Text style={styles.welcomeText}>
            Découvrez des exercices de respiration et des contenus pour vous
            aider à gérer votre stress et améliorer votre bien-être.
          </Text>
        </View>

        <View style={styles.menuSection}>
          <Link href={"/contents" as Href} asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View
                style={[styles.menuIcon, { backgroundColor: Colors.primary }]}
              >
                <FontAwesome5 name="book" size={24} color="white" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Articles et Contenus</Text>
                <Text style={styles.menuDescription}>
                  Découvrez nos articles et ressources sur la respiration, la
                  méditation et la gestion du stress.
                </Text>
              </View>
            </TouchableOpacity>
          </Link>

          {isAuthenticated && (
            <>
              <Link href={"/breathing" as Href} asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: Colors.secondary },
                    ]}
                  >
                    <FontAwesome5 name="lungs" size={24} color="white" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>
                      Exercices de Respiration
                    </Text>
                    <Text style={styles.menuDescription}>
                      Accédez à notre bibliothèque d'exercices de respiration
                      pour vous détendre et vous recentrer.
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
              <Link href={"/breathing/create" as Href} asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: Colors.accent },
                    ]}
                  >
                    <FontAwesome5 name="plus" size={24} color="white" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Créer un Exercice</Text>
                    <Text style={styles.menuDescription}>
                      Créez et personnalisez vos propres exercices de
                      respiration adaptés à vos besoins.
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>

              <Link href={"/profile" as Href} asChild>
                <TouchableOpacity style={styles.menuItem}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: Colors.primary },
                    ]}
                  >
                    <FontAwesome5 name="user-cog" size={24} color="white" />
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>Mon Profil</Text>
                    <Text style={styles.menuDescription}>
                      Gérez vos paramètres, consultez vos statistiques et
                      personnalisez votre expérience.
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </>
          )}
        </View>

        {!isAuthenticated && (
          <View style={styles.actionSection}>
            <Text style={styles.actionText}>
              Connectez-vous pour créer vos propres exercices de respiration et
              accéder à votre profil personnalisé
            </Text>
            <Link href={"/login" as Href} asChild>
              <Button title="Se connecter" onPress={() => {}} />
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
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textMedium,
    lineHeight: 22,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: Colors.textMedium,
    lineHeight: 20,
  },
  actionSection: {
    alignItems: "center",
    marginTop: 16,
  },
  actionText: {
    fontSize: 16,
    color: Colors.textMedium,
    marginBottom: 16,
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 12,
    padding: 8,
  },
  loginText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 16,
    padding: 8,
  },
  logoutText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: 16,
  },
});
