import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContentsByCategory } from "../../../hooks/useContent";
import { ContentList } from "../../../components/content/ContentList";
import { Loading } from "../../../components/common/Loading";
import { Colors } from "../../../utils/colors";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { contents, loading, error } = useContentsByCategory(slug);
  const [refreshing, setRefreshing] = useState(false);

  // Cette fonction devrait être définie dans useContentsByCategory mais nous créons un stub ici
  const handleRefresh = async () => {
    setRefreshing(true);
    // Attendons une seconde pour simuler le rafraîchissement
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <Loading
        fullScreen
        message="Chargement des contenus de la catégorie..."
      />
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Une erreur est survenue : {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: `Catégorie: ${slug}`,
        }}
      />

      <ContentList
        contents={contents}
        loading={loading}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyMessage="Aucun contenu disponible dans cette catégorie"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
});
