import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Listing } from "../types";

export function ListingCard({
  item,
  saved,
  onSave,
  onOpen,
  onToggleSold,
  onContact,
}: {
  item: Listing;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  onToggleSold?: () => void;
  onContact?: () => void;
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

        {onToggleSold && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSold ? "Mark as Available" : "Mark as Sold"}
            style={[styles.soldBtn, isSold && styles.soldBtnActive]}
            onPress={(e: any) => {
              e?.stopPropagation?.();
              onToggleSold();
            }}
          >
            <Text style={[styles.soldBtnText, isSold && styles.soldBtnTextActive]}>
              {isSold ? "✓ Sold (Make Available)" : "Mark as Sold"}
            </Text>
          </Pressable>
        )}

        {onContact && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSold ? "Contact seller disabled, item is sold" : "Contact Seller"}
            disabled={isSold}
            style={[styles.contactBtn, isSold && styles.contactBtnDisabled]}
            onPress={(e: any) => {
              e?.stopPropagation?.();
              if (!isSold) onContact();
            }}
          >
            <Text style={[styles.contactBtnText, isSold && styles.contactBtnTextDisabled]}>
              {isSold ? "Contact Seller — Disabled" : "Contact Seller"}
            </Text>
          </Pressable>
        )}
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
  soldBtn: {
    marginTop: 10,
    backgroundColor: "#1F5D4C",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  soldBtnActive: {
    backgroundColor: "#FCEEEF",
    borderWidth: 1,
    borderColor: "#E6B8BC",
  },
  soldBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  soldBtnTextActive: {
    color: "#C3535B",
  },
  contactBtn: {
    marginTop: 6,
    backgroundColor: "#1F5D4C",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  contactBtnDisabled: {
    backgroundColor: "#E2E7E4",
    opacity: 0.65,
  },
  contactBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  contactBtnTextDisabled: {
    color: "#7E8B85",
  },
});
