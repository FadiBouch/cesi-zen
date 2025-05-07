import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContents, useCategories } from "../../hooks/useContent";
import { ContentList } from "../../components/content/ContentList";
import { Card } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";
import { Colors } from "../../utils/colors";
import { useFocusEffect } from "@react-navigation/native";

export default function ContentListScreen() {
  const router = useRouter();
  const { contents, loading, error, refreshContents } = useContents();
  const { categories, loading: loadingCategories } = useCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      refreshContents();
    }, [refreshContents])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshContents();
    setRefreshing(false);
  };

  const filteredContents = selectedCategoryId
    ? contents.filter((content) => content.categoryId === selectedCategoryId)
    : contents;

  if (loading && !refreshing) {
    return <Loading fullScreen message="Chargement des contenus..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Articles et Contenus" }} />

      <View style={styles.content}>
        {loadingCategories ? (
          <Loading message="Chargement des catégories..." />
        ) : (
          <FlatList
            horizontal
            data={[{ id: null, name: "Tous" }, ...categories]}
            keyExtractor={(item) => (item.id ? item.id.toString() : "all")}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryId === item.id &&
                    styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategoryId(item.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategoryId === item.id &&
                      styles.selectedCategoryButtonText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Une erreur est survenue lors du chargement des contenus : {error}
            </Text>
          </View>
        ) : (
          <ContentList
            contents={filteredContents}
            loading={loading}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            emptyMessage={
              selectedCategoryId
                ? "Aucun contenu disponible dans cette catégorie"
                : "Aucun contenu disponible"
            }
          />
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
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  selectedCategoryButtonText: {
    color: Colors.white,
    fontWeight: "600",
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
