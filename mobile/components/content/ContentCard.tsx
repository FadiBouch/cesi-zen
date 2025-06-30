import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Href, Link, useRouter } from "expo-router";
import { Card } from "../common/Card";
import { Content } from "../../types/content";
import { formatDate } from "../../utils/format";
import { Colors } from "../../utils/colors";

interface ContentCardProps {
  content: Content;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const router = useRouter();

  const previewText =
    content.content
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .slice(0, 1)
      .join("")
      .replace(/[#*_]/g, "")
      .substring(0, 100) + "...";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/contents/article/${content.slug}` as Href)}
    >
      <Card>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{content.category.name}</Text>
        </View>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.preview}>{previewText}</Text>
        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(content.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  categoryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.textDark,
  },
  preview: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  date: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
