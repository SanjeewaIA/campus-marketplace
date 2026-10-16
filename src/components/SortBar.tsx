import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type SortOption = "newest" | "price_asc" | "price_desc";

export function SortBar({
  sortBy,
  onSortChange,
  totalItems,
}: {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  totalItems: number;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Pressable
            style={[styles.chip, sortBy === "newest" && styles.chipActive]}
            onPress={() => onSortChange("newest")}
          >
            <Text style={[styles.chipText, sortBy === "newest" && styles.chipTextActive]}>
              ✨ Newest
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, sortBy === "price_asc" && styles.chipActive]}
            onPress={() => onSortChange("price_asc")}
          >
            <Text style={[styles.chipText, sortBy === "price_asc" && styles.chipTextActive]}>
              💲 Price: Low to High
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, sortBy === "price_desc" && styles.chipActive]}
            onPress={() => onSortChange("price_desc")}
          >
            <Text style={[styles.chipText, sortBy === "price_desc" && styles.chipTextActive]}>
              💰 Price: High to Low
            </Text>
          </Pressable>
        </ScrollView>
      </View>
      <Text style={styles.countText}>
        Showing {totalItems} {totalItems === 1 ? "item" : "items"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 14, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 12, fontWeight: "700", color: "#365B4C", marginRight: 8 },
  scroll: { gap: 8 },
  chip: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDE4DD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: "#1F5D4C",
    borderColor: "#1F5D4C",
  },
  chipText: { fontSize: 12, color: "#365B4C", fontWeight: "600" },
  chipTextActive: { color: "#FFF", fontWeight: "700" },
  countText: { fontSize: 12, color: "#87918C", marginTop: 8 },
});