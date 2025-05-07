import React from "react";
import { ScrollView, StyleSheet, TextStyle } from "react-native";
import Markdown from "react-native-markdown-display";
import { Colors } from "../../utils/colors";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  const markdownStyles = StyleSheet.create({
    heading1: {
      fontSize: 24,
      color: Colors.textDark,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 12,
    },
    heading2: {
      fontSize: 20,
      color: Colors.textDark,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 10,
    },
    heading3: {
      fontSize: 18,
      color: Colors.textDark,
      fontWeight: "bold",
      marginTop: 12,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      color: Colors.textDark,
      marginBottom: 12,
    },
    list_item: {
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 12,
    },
    ordered_list: {
      marginBottom: 12,
    },
    blockquote: {
      backgroundColor: Colors.backgroundDark,
      borderLeftWidth: 4,
      borderLeftColor: Colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 12,
    },
    code_block: {
      backgroundColor: Colors.backgroundDark,
      padding: 12,
      borderRadius: 6,
      marginVertical: 12,
    },
    code_inline: {
      backgroundColor: Colors.backgroundDark,
      fontFamily: "monospace",
      paddingHorizontal: 4,
      borderRadius: 3,
    },
    link: {
      color: Colors.primary,
      textDecorationLine: "underline" as const,
    },
    image: {
      width: "100%",
      height: 200,
      marginVertical: 12,
      borderRadius: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Markdown style={markdownStyles}>{content}</Markdown>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
