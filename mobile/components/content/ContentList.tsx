import React from "react";
import { FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import { ContentCard } from "./ContentCard";
import { Loading } from "../common/Loading";
import { Content } from "../../types/content";
import { Colors } from "../../utils/colors";

interface ContentListProps {
  contents: Content[];
  loading: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
}

export const ContentList: React.FC<ContentListProps> = ({
  contents,
  loading,
  onRefresh,
  refreshing = false,
  emptyMessage = "Aucun contenu disponible",
}) => {
  if (loading && !refreshing) {
    return <Loading message="Chargement des contenus..." />;
  }

  if (contents.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={contents}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <ContentCard content={item} />}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: "center",
  },
});
