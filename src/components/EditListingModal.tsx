import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Listing } from "../types";

export function EditListingModal({
  visible,
  item,
  onClose,
  onSave,
}: {
  visible: boolean;
  item: Listing | null;
  onClose: () => void;
  onSave: (updatedItem: Listing) => void;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setPrice(String(item.price));
      setDescription(item.description || "");
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    const priceNum = Number(price);
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid price");
      return;
    }

    onSave({
      ...item,
      title: title.trim(),
      price: priceNum,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible && item !== null} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Listing</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Item title"
            style={styles.input}
          />

          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Price"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Item description"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,40,33,.45)",
    justifyContent: "flex-end",
  },
  body: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#173C34" },
  closeBtn: { fontSize: 22, color: "#173C34", padding: 4 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#365B4C",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#DDE4DD",
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#173C34",
  },
  textArea: { height: 70, paddingTop: 10, textAlignVertical: "top" },
  saveBtn: {
    height: 48,
    backgroundColor: "#1F5D4C",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
});