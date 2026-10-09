import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Listing } from "../types";

export function ListingCard({
  item,
  saved,
  onSave,
  onOpen,
}: {
  item: Listing;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
}) {
  const isSold = item.status === "sold";
  return (
    <Pressable style={[styles.card, isSold && styles.soldCard]} onPress={onOpen}>
      <View style={styles.photo}>
        <Image source={{ uri: item.image }} style={[styles.image, isSold && styles.dimImage]} />
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldBadgeText}>SOLD</Text>
          </View>
        )}
        <Pressable
          accessibilityLabel={saved ? "Remove saved item" : "Save item"}
          style={styles.save}
          onPress={onSave}
        >
          <Text style={[styles.heart, saved && styles.red]}>
            {saved ? "♥" : "♡"}
          </Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.title, isSold && styles.strikeText]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.price, isSold && styles.mutedPrice]}>${item.price}</Text>
        </View>
        <Text style={styles.muted}>
          {item.condition} · {item.campus}
        </Text>
        <Text style={styles.tiny}>Listed by {item.seller}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9ECE6",
  },
  soldCard: {
    borderColor: "#D3DCD6",
    backgroundColor: "#F4F6F4",
  },
  photo: { height: 148, backgroundColor: "#E5ECE5", position: "relative" },
  image: { width: "100%", height: "100%" },
  dimImage: { opacity: 0.55 },
  soldBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#C3535B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  soldBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  save: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,.92)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  heart: { color: "#365B4C", fontSize: 21 },
  red: { color: "#C3535B" },
  body: { padding: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 5 },
  title: {
    flex: 1,
    minHeight: 34,
    color: "#1B3A33",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  strikeText: {
    textDecorationLine: "line-through",
    color: "#7E8B85",
  },
  price: { color: "#1C7057", fontSize: 14, fontWeight: "800" },
  mutedPrice: { color: "#7E8B85" },
  muted: { color: "#87918C", fontSize: 12 },
  tiny: { color: "#A0AAA4", fontSize: 10, marginTop: 5 },
});
