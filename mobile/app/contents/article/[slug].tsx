import React from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContentBySlug } from "../../../hooks/useContent";
import { MarkdownRenderer } from "../../../components/content/MarkdownRenderer";
import { Loading } from "../../../components/common/Loading";
import { Colors } from "../../../utils/colors";

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { content, loading, error } = useContentBySlug(slug);

  if (loading) {
    return <Loading fullScreen message="Chargement de l'article..." />;
  }

  if (error || !content) {
    return (
      <View style={styles.errorContainer}>
        <Loading message={error || "L'article demandé n'existe pas."} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: content.title,
          headerTitleStyle: {
            fontSize: 16,
          },
        }}
      />

      <MarkdownRenderer content={content.content} />
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
  },
});
