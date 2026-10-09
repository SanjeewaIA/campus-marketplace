import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PageTitle } from "../components/PageTitle";
import { Listing } from "../types";

export function DashboardPage({
  listings,
  savedCount,
  onNavigate,
  onSell,
}: {
  listings: Listing[];
  savedCount: number;
  onNavigate: (tab: "Explore" | "MyListings" | "Saved") => void;
  onSell: () => void;
}) {
  const activeListings = listings.filter((item) => item.status !== "sold");
  const soldListings = listings.filter((item) => item.status === "sold");
  const totalValue = listings.reduce((sum, item) => sum + item.price, 0);
  const totalEarned = soldListings.reduce((sum, item) => sum + item.price, 0);

  // Group listings by category
  const categoriesCount = listings.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PageTitle
        title="Seller Dashboard"
        subtitle="Performance, analytics and inventory overview"
      />

      {/* Analytics Cards */}
      <View style={styles.grid}>
        <View style={[styles.card, styles.cardGreen]}>
          <Text style={styles.cardVal}>${totalEarned}</Text>
          <Text style={styles.cardLabel}>Total Earned</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardVal}>${totalValue}</Text>
          <Text style={styles.cardLabel}>Inventory Value</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardVal}>{activeListings.length}</Text>
          <Text style={styles.cardLabel}>Active Listings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardVal}>{soldListings.length}</Text>
          <Text style={styles.cardLabel}>Items Sold</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory by Category</Text>
        <View style={styles.categoryBox}>
          {Object.keys(categoriesCount).length === 0 ? (
            <Text style={styles.muted}>No listings added yet.</Text>
          ) : (
            Object.entries(categoriesCount).map(([cat, count]) => (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catName}>{cat}</Text>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{count} items</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Pressable style={styles.actionBtnPrimary} onPress={onSell}>
          <Text style={styles.actionBtnPrimaryText}>＋ Create New Listing</Text>
        </Pressable>
        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => onNavigate("MyListings")}
          >
            <Text style={styles.actionBtnText}>Manage My Listings</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => onNavigate("Explore")}
          >
            <Text style={styles.actionBtnText}>Browse Marketplace</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  card: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECE6",
  },
  cardGreen: {
    backgroundColor: "#EBF5EE",
    borderColor: "#C5E2CF",
  },
  cardVal: {
    color: "#173C34",
    fontSize: 26,
    fontWeight: "900",
  },
  cardLabel: {
    color: "#65766D",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: "#173C34",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  categoryBox: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECE6",
    gap: 12,
  },
  catRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F6F4",
  },
  catName: {
    color: "#173C34",
    fontSize: 14,
    fontWeight: "700",
  },
  catBadge: {
    backgroundColor: "#ECEFE9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  catBadgeText: {
    color: "#1F5D4C",
    fontSize: 12,
    fontWeight: "700",
  },
  muted: {
    color: "#87918C",
    fontSize: 13,
  },
  actionBtnPrimary: {
    height: 48,
    backgroundColor: "#1F5D4C",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtnPrimaryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BCD0C3",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    color: "#1F5D4C",
    fontSize: 13,
    fontWeight: "700",
  },
});
