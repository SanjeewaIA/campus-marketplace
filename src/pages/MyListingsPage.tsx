import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EditListingModal } from "../components/EditListingModal";
import { EmptyState } from "../components/EmptyState";
import { ListingCard } from "../components/ListingCard";
import { PageTitle } from "../components/PageTitle";
import { Listing } from "../types";

export function MyListingsPage({
  items,
  onOpen,
  onSell,
  onToggleSold,
}: {
  items: Listing[];
  onOpen: (item: Listing) => void;
  onSell: () => void;
  onToggleSold?: (id: string) => void;
}) {
  // ⭐ [Member 5 Feature]: State for Edit and Delete
  const [localItems, setLocalItems] = useState<Listing[]>(items);
  const [editingItem, setEditingItem] = useState<Listing | null>(null);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleSaveEdit = (updated: Listing) => {
    setLocalItems((prev) =>
      prev.map((it) => (it.id === updated.id ? updated : it))
    );
    Alert.alert("Success", "Listing updated successfully!");
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setLocalItems((prev) => prev.filter((it) => it.id !== id));
            Alert.alert("Deleted", "Listing has been removed.");
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* 🟢 [Original]: Page Title (100% Intact) */}
      <PageTitle
        title="My listings"
        subtitle="Items you have posted to campus marketplace"
      />
      <FlatList
        data={localItems}
        scrollEnabled={false}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <EmptyState
            title="No listings yet"
            message="Publish an item and it will appear here."
            action="Sell an item"
            onAction={onSell}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            {/* 🟢 [Heshara's Feature]: ListingCard with onToggleSold (100% Intact) */}
            <ListingCard
              item={item}
              saved={false}
              onSave={() => undefined}
              onOpen={() => onOpen(item)}
              onToggleSold={
                onToggleSold ? () => onToggleSold(item.id) : undefined
              }
            />

            {/* ⭐ [Member 5 Feature]: Edit & Delete Action Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.editBtn}
                onPress={() => setEditingItem(item)}
              >
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </Pressable>
              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* ⭐ [Member 5 Feature]: Edit Modal Component */}
      <EditListingModal
        visible={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110 },
  columns: { gap: 14 },
  grid: { gap: 14 },
  cardContainer: { flex: 1 },
  actionRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#E8F4F0",
    borderWidth: 1,
    borderColor: "#B4D8CB",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  editBtnText: { color: "#1F5D4C", fontSize: 11, fontWeight: "700" },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FDF0F0",
    borderWidth: 1,
    borderColor: "#F5C2C2",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  deleteBtnText: { color: "#C3535B", fontSize: 11, fontWeight: "700" },
});