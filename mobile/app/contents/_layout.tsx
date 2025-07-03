import React from "react";
import { Stack } from "expo-router";
import { Colors } from "../../utils/colors";

export default function ContentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    />
  );
}
