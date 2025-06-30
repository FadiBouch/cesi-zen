import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import { Stack, router } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { Colors } from "../utils/colors";

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          await logout();
          setLoggingOut(false);
          router.replace("/");
        },
      },
    ]);
  };

  // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Profil",
            headerShown: true,
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
          }}
        />
        <View style={styles.notLoggedInContainer}>
          <FontAwesome5 name="user-circle" size={80} color={Colors.textLight} />
          <Text style={styles.notLoggedInTitle}>Vous n'êtes pas connecté</Text>
          <Text style={styles.notLoggedInText}>
            Connectez-vous pour accéder à votre profil et personnaliser votre
            expérience.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    showChevron = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          <FontAwesome5 name={icon} size={18} color={Colors.primary} />
        </View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.profileItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.profileItemRight}>
        {rightComponent ||
          (showChevron && (
            <FontAwesome5
              name="chevron-right"
              size={14}
              color={Colors.textLight}
            />
          ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Mon Profil",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec informations utilisateur */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <FontAwesome5 name="user" size={36} color="white" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <FontAwesome5 name="camera" size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.username || "Utilisateur"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "email@example.com"}
          </Text>
          <Text style={styles.joinDate}>
            Membre depuis {new Date().toLocaleDateString("fr-FR")}
          </Text>
        </View>

        {/* Section Zen & Bien-être */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Zen & Bien-être</Text>

          <ProfileItem
            icon="chart-line"
            title="Mes statistiques"
            subtitle="Voir mes progrès en gestion du stress"
            onPress={() => console.log("Statistiques")}
          />

          <ProfileItem
            icon="target"
            title="Mes objectifs"
            subtitle="Définir et suivre mes objectifs de bien-être"
            onPress={() => console.log("Objectifs")}
          />

          <ProfileItem
            icon="history"
            title="Historique des sessions"
            subtitle="Revoir mes sessions de respiration"
            onPress={() => router.push("/breathing")}
          />

          <ProfileItem
            icon="heart"
            title="Exercices favoris"
            subtitle="Accès rapide à vos exercices préférés"
            onPress={() => console.log("Favoris")}
          />
        </View>

        {/* Section Paramètres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>

          <ProfileItem
            icon="bell"
            title="Notifications"
            subtitle="Rappels et notifications de bien-être"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.textLight, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
            showChevron={false}
          />

          <ProfileItem
            icon="moon"
            title="Mode sombre"
            subtitle="Interface adaptée pour le soir"
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: Colors.textLight, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
            showChevron={false}
          />

          <ProfileItem
            icon="shield-alt"
            title="Confidentialité"
            subtitle="Gérer vos données personnelles"
            onPress={() => console.log("Confidentialité")}
          />

          <ProfileItem
            icon="globe"
            title="Langue"
            subtitle="Français"
            onPress={() => console.log("Langue")}
          />
        </View>

        {/* Section Contenu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Contenu</Text>

          <ProfileItem
            icon="book"
            title="Articles et ressources"
            subtitle="Accéder aux contenus sur le bien-être"
            onPress={() => router.push("/contents")}
          />

          <ProfileItem
            icon="plus-circle"
            title="Créer un exercice"
            subtitle="Personnaliser vos exercices de respiration"
            onPress={() => router.push("/breathing/create")}
          />
        </View>

        {/* Section Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Support</Text>

          <ProfileItem
            icon="question-circle"
            title="Centre d'aide"
            subtitle="FAQ et guides d'utilisation"
            onPress={() => console.log("Aide")}
          />

          <ProfileItem
            icon="envelope"
            title="Nous contacter"
            subtitle="Besoin d'aide ? Contactez notre équipe"
            onPress={() => console.log("Contact")}
          />

          <ProfileItem
            icon="star"
            title="Évaluer l'application"
            subtitle="Partagez votre expérience"
            onPress={() => console.log("Évaluation")}
          />
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              loggingOut && styles.logoutButtonDisabled,
            ]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <FontAwesome5
              name="sign-out-alt"
              size={16}
              color="white"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutButtonText}>
              {loggingOut ? "Déconnexion..." : "Se déconnecter"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version de l'app */}
        <Text style={styles.versionText}>CESIZen v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textDark,
    marginTop: 24,
    marginBottom: 12,
  },
  notLoggedInText: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textMedium,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textDark,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textDark,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: Colors.textMedium,
    marginTop: 2,
  },
  profileItemRight: {
    alignItems: "center",
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: Colors.textLight,
    fontSize: 12,
    marginBottom: 32,
  },
});
