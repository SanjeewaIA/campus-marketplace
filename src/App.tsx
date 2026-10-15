import { StatusBar } from "expo-status-bar";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { EmptyState } from "./components/EmptyState";
import { DashboardPage } from "./pages/DashboardPage";
import { ExplorePage } from "./pages/ExplorePage";
import { MessagesPage } from "./pages/MessagesPage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { seedConversations, seedListings } from "./data";
import { auth, db, firebaseConfigured } from "./firebase";
import { Conversation, Listing, Tab } from "./types";

async function registerUser(user: User) {
  if (!db) return;
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName:
        user.displayName || user.email?.split("@")[0] || "Campus student",
      email: user.email || "",
      photoURL: user.photoURL || null,
      campus: "North Campus",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Explore");
  const [items, setItems] = useState(seedListings);
  const [conversations, setConversations] =
    useState<Conversation[]>(seedConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [queryText, setQueryText] = useState("");
  const [category, setCategory] = useState("All items");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [user, setUser] = useState<User | null>(auth?.currentUser || null);
  const [authOpen, setAuthOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    const firebaseAuth = auth;
    if (!firebaseAuth) return;
    const handleUser = (nextUser: User | null) => {
      setUser(nextUser);
      if (nextUser)
        registerUser(nextUser)
          .then(() => setProfileReady(true))
          .catch((error) =>
            setAuthError(
              error instanceof Error
                ? error.message
                : "Could not create profile.",
            ),
          );
      else setProfileReady(false);
    };
    let unsubscribe: () => void = () => undefined;
    setPersistence(firebaseAuth, browserLocalPersistence)
      .then(() => {
        unsubscribe = onAuthStateChanged(firebaseAuth, handleUser);
        return getRedirectResult(firebaseAuth);
      })
      .then((result) => {
        if (result?.user) handleUser(result.user);
      })
      .catch((error) =>
        setAuthError(
          error instanceof Error
            ? error.message
            : "Google sign-in could not be completed.",
        ),
      );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const listingsQuery = query(
      collection(db, "listings"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      listingsQuery,
      (snapshot) =>
        setItems(
          snapshot.empty
            ? seedListings
            : snapshot.docs.map(
              (entry) => ({ id: entry.id, ...entry.data() }) as Listing,
            ),
        ),
      () => setItems(seedListings),
    );
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          category === "All items" || item.category === category;
        const matchesQuery = item.title
          .toLowerCase()
          .includes(queryText.toLowerCase());
        const min = minPrice ? Number(minPrice) : 0;
        const max = maxPrice ? Number(maxPrice) : Infinity;
        const matchesPrice = item.price >= min && item.price <= max;
        return matchesCategory && matchesQuery && matchesPrice;
      }),
    [category, items, queryText, minPrice, maxPrice],
  );

  const myListings = useMemo(
    () =>
      user
        ? items.filter((item) => item.sellerId === user.uid)
        : items.filter((_, idx) => idx % 2 === 0), // Show demo listings when guest
    [items, user],
  );

  const toggleSaved = (id: string) =>
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );

  const toggleSoldStatus = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    const nextStatus = item?.status === "sold" ? "available" : "sold";

    setItems((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, status: nextStatus } : entry,
      ),
    );
    setSelected((current) =>
      current && current.id === id
        ? {
          ...current,
          status: nextStatus,
        }
        : current,
    );

    if (db) {
      try {
        await updateDoc(doc(db, "listings", id), { status: nextStatus });
      } catch (e) {
        // demo mode / fallback without Firestore writes
      }
    }
  };
  const signInWithGoogle = async () => {
    if (!auth) return;
    setAuthError("");
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (Platform.OS === "web") {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        await registerUser(result.user);
        setUser(result.user);
        setProfileReady(true);
        setAuthOpen(false);
      } else {
        await signInAnonymously(auth);
        setAuthOpen(false);
      }
    } catch (error) {
      const code =
        error instanceof Error ? error.message : "Google sign-in failed.";
      if (
        Platform.OS === "web" &&
        /popup|cancelled-popup-request/i.test(code)
      ) {
        await signInWithRedirect(auth, new GoogleAuthProvider());
        return;
      }
      setAuthError(code);
      Alert.alert("Google sign-in failed", code);
    }
  };
  const publish = async (
    title: string,
    price: string,
    listingCategory: string,
  ) => {
    if (!user) {
      setSellOpen(false);
      setAuthOpen(true);
      return;
    }
    await addDoc(collection(db!, "listings"), {
      title,
      price: Number(price),
      category: listingCategory,
      seller: user.displayName || user.email || "You",
      sellerId: user.uid,
      campus: "North Campus",
      condition: "Good condition",
      image: seedListings[0].image,
      description: "New listing from a campus seller.",
      createdAt: serverTimestamp(),
    });
    setSellOpen(false);
  };
  const selectConversation = (id: string | null) => {
    setActiveConversationId(id);
    if (id) {
      setConversations((current) =>
        current.map((conv) =>
          conv.id === id ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    }
  };

  const sendMessage = (conversationId: string, text: string) => {
    const buyerName =
      user?.displayName || user?.email?.split("@")[0] || "You";
    const now = "Just now";
    const newMsgId = `msg-${Date.now()}`;

    setConversations((current) =>
      current.map((conv) =>
        conv.id === conversationId
          ? {
            ...conv,
            updatedAt: now,
            unreadCount: 0,
            messages: [
              ...conv.messages,
              {
                id: newMsgId,
                sender: "buyer",
                senderName: buyerName,
                text,
                timestamp: now,
              },
            ],
          }
          : conv,
      ),
    );
  };

  const contactSeller = () => {
    if (!selected) return;
    const existing = conversations.find((c) => c.listingId === selected.id);
    if (existing) {
      selectConversation(existing.id);
    } else {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        listingId: selected.id,
        listingTitle: selected.title,
        listingPrice: selected.price,
        listingImage: selected.image,
        sellerName: selected.seller,
        campus: selected.campus,
        unreadCount: 0,
        updatedAt: "Just now",
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: "seller",
            senderName: selected.seller,
            text: `Hi! Feel free to ask any questions about "${selected.title}" or suggest a campus meetup spot.`,
            timestamp: "Just now",
          },
        ],
      };
      setConversations((current) => [newConv, ...current]);
      setActiveConversationId(newConv.id);
    }
    setSelected(null);
    setTab("Messages");
  };

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {tab === "Explore" && (
        <ExplorePage
          items={filteredItems}
          query={queryText}
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          savedIds={savedIds}
          onQueryChange={setQueryText}
          onCategoryChange={setCategory}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onSave={toggleSaved}
          onOpen={setSelected}
          onProfile={() => setTab("Profile")}
        />
      )}
      {tab === "Saved" && (
        <SavedPage
          items={items.filter((item) => savedIds.includes(item.id))}
          onSave={toggleSaved}
          onOpen={setSelected}
        />
      )}
      {tab === "Messages" && (
        <MessagesPage
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onSendMessage={sendMessage}
          onBrowse={() => setTab("Explore")}
        />
      )}
      {tab === "MyListings" && (
        <MyListingsPage
          items={myListings}
          onOpen={setSelected}
          onSell={() => setSellOpen(true)}
          onToggleSold={toggleSoldStatus}
        />
      )}
      {tab === "Dashboard" && (
        <DashboardPage
          listings={items}
          savedCount={savedIds.length}
          onNavigate={setTab}
          onSell={() => setSellOpen(true)}
        />
      )}
      {tab === "Profile" && (
        <ProfilePage
          user={user}
          savedCount={savedIds.length}
          listingCount={myListings.length}
          firebaseConfigured={firebaseConfigured}
          profileReady={profileReady}
          error={authError}
          onMyListings={() => setTab("MyListings")}
          onSaved={() => setTab("Saved")}
          onSignIn={() => setAuthOpen(true)}
          onSignOut={() => auth && signOut(auth)}
        />
      )}
      <BottomNav
        tab={tab}
        savedCount={savedIds.length}
        unreadCount={unreadTotal}
        onChange={setTab}
        onSell={() => setSellOpen(true)}
      />
      <ListingModal
        item={selected}
        user={user}
        onClose={() => setSelected(null)}
        onContact={contactSeller}
        onToggleSold={toggleSoldStatus}
        onReport={() => setReportOpen(true)}
      />
      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(reason) => {
          setReportOpen(false);
          Alert.alert(
            "Report Submitted",
            `Thank you. This listing has been flagged for "${reason}".`,
          );
        }}
      />
      <AuthModal
        visible={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignIn={signInWithGoogle}
        error={authError}
      />
      <SellModal
        visible={sellOpen}
        onClose={() => setSellOpen(false)}
        onSubmit={publish}
      />
    </SafeAreaView>
  );
}

function BottomNav({
  tab,
  savedCount,
  unreadCount,
  onChange,
  onSell,
}: {
  tab: Tab;
  savedCount: number;
  unreadCount: number;
  onChange: (tab: Tab) => void;
  onSell: () => void;
}) {
  return (
    <View style={styles.nav}>
      <NavItem
        label="Explore"
        icon="⌂"
        active={tab === "Explore"}
        onPress={() => onChange("Explore")}
      />
      <NavItem
        label="Saved"
        icon="♡"
        active={tab === "Saved"}
        badge={savedCount}
        onPress={() => onChange("Saved")}
      />
      <NavItem
        label="Messages"
        icon="□"
        active={tab === "Messages"}
        badge={unreadCount}
        onPress={() => onChange("Messages")}
      />
      <NavItem
        label="Dashboard"
        icon="📊"
        active={tab === "Dashboard"}
        onPress={() => onChange("Dashboard")}
      />
      <Pressable style={styles.sellButton} onPress={onSell}>
        <Text style={styles.sellPlus}>＋</Text>
        <Text style={styles.sellText}>Sell</Text>
      </Pressable>
    </View>
  );
}
function NavItem({
  label,
  icon,
  active,
  badge,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <View>
        <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}
function ListingModal({
  item,
  user,
  onClose,
  onContact,
  onToggleSold,
  onReport,
}: {
  item: Listing | null;
  user: User | null;
  onClose: () => void;
  onContact: () => void;
  onToggleSold: (id: string) => void;
  onReport: () => void;
}) {
  if (!item) return null;
  const isSold = item.status === "sold";
  const isOwner = user && user.uid === item.sellerId;

  return (
    <Modal
      visible={item !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.detail}>
          <Image source={{ uri: item.image }} style={styles.detailImage} />
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <View style={styles.detailBody}>
            <View style={styles.categoryBadgeRow}>
              <Text style={styles.detailCategory}>
                {item.category.toUpperCase()}
              </Text>
              {isSold && (
                <View style={styles.modalSoldBadge}>
                  <Text style={styles.modalSoldBadgeText}>SOLD</Text>
                </View>
              )}
            </View>

            <Text style={styles.detailTitle}>{item.title}</Text>
            <Text style={styles.detailPrice}>${item.price}</Text>
            <Text style={styles.muted}>
              {item.condition} · {item.campus} · {item.seller}
            </Text>
            <Text style={styles.description}>{item.description}</Text>

            {/* Action buttons: Toggle Sold & Contact Seller */}
            <View style={styles.actionGroup}>
              <Pressable
                style={[
                  styles.soldToggleBtn,
                  isSold && styles.soldToggleBtnActive,
                ]}
                onPress={() => onToggleSold(item.id)}
              >
                <Text
                  style={[
                    styles.soldToggleText,
                    isSold && styles.soldToggleTextActive,
                  ]}
                >
                  {isSold ? "✓ Mark as Available" : "✓ Mark as Sold"}
                </Text>
              </Pressable>

              <Pressable
                disabled={isSold}
                style={[styles.primary, isSold && styles.disabled]}
                onPress={onContact}
              >
                <Text style={styles.primaryText}>
                  {isSold
                    ? "Contact Seller — Disabled"
                    : `💬 Message ${item.seller}`}
                </Text>
              </Pressable>

              <Pressable style={styles.reportBtn} onPress={onReport}>
                <Text style={styles.reportText}>🚩 Report this listing</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ReportModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [selectedReason, setSelectedReason] = useState("Inappropriate content");
  const reasons = [
    "Inappropriate content",
    "Fake or scam listing",
    "Misleading description / price",
    "Duplicate listing",
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.auth}>
          <Text style={styles.formTitle}>Report Listing</Text>
          <Text style={styles.authMessage}>
            Please select a reason for flagging this listing:
          </Text>

          <View style={styles.reasonsList}>
            {reasons.map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.reasonOption,
                  selectedReason === r && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(r)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === r && styles.reasonTextSelected,
                  ]}
                >
                  {selectedReason === r ? "◉ " : "◯ "}
                  {r}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.primary}
            onPress={() => onSubmit(selectedReason)}
          >
            <Text style={styles.primaryText}>Submit Report</Text>
          </Pressable>

          <Pressable style={styles.outline} onPress={onClose}>
            <Text style={styles.outlineText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function AuthModal({
  visible,
  onClose,
  onSignIn,
  error,
}: {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => Promise<void>;
  error: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.auth}>
          <Text style={styles.formTitle}>Welcome to campus marketplace</Text>
          <Text style={styles.authMessage}>
            Sign in to save listings, message sellers, and publish your own
            items.
          </Text>
          {error ? <Text style={styles.authError}>{error}</Text> : null}
          <Pressable style={styles.googleButton} onPress={onSignIn}>
            <Text style={styles.googleMark}>G</Text>
            <Text style={styles.outlineText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={styles.outline} onPress={onClose}>
            <Text style={styles.outlineText}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
function SellModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, price: string, category: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Textbooks");
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Sell an item</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.label}>What are you selling?</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Organic Chemistry textbook"
            style={styles.field}
          />
          <Text style={styles.label}>Price</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="$ 0"
            style={styles.field}
          />
          <Pressable
            disabled={!title || !price}
            style={[styles.primary, (!title || !price) && styles.disabled]}
            onPress={() => onSubmit(title, price, category)}
          >
            <Text style={styles.primaryText}>Publish listing</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F4" },
  nav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EBE5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: { alignItems: "center", minWidth: 54 },
  navIcon: { color: "#83918A", fontSize: 22 },
  navLabel: { color: "#83918A", fontSize: 10, marginTop: 3 },
  navActive: { color: "#1D6B54" },
  badge: {
    position: "absolute",
    right: -12,
    top: -3,
    backgroundColor: "#C3535B",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "800" },
  sellButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F0E6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  sellPlus: { color: "#247055", fontSize: 20 },
  sellText: { color: "#247055", fontWeight: "800", fontSize: 12 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,40,33,.45)",
    justifyContent: "flex-end",
  },
  detail: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  detailImage: { width: "100%", height: 230 },
  close: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#173C34", fontSize: 26 },
  detailBody: { padding: 24 },
  detailCategory: {
    color: "#23775D",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  detailTitle: {
    color: "#173C34",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 8,
  },
  detailPrice: {
    color: "#1C7057",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  muted: { color: "#87918C", fontSize: 12 },
  description: {
    color: "#66736D",
    fontSize: 14,
    lineHeight: 21,
    marginVertical: 20,
  },
  primary: {
    height: 50,
    backgroundColor: "#1F5D4C",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  primaryText: { color: "#FFF", fontWeight: "800" },
  auth: { backgroundColor: "#FFF", borderRadius: 20, padding: 24, margin: 20 },
  form: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formTitle: { color: "#173C34", fontSize: 22, fontWeight: "800" },
  authMessage: { color: "#87918C", lineHeight: 20, marginTop: 10 },
  authError: {
    color: "#B64950",
    backgroundColor: "#FBECEE",
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    marginTop: 16,
  },
  googleButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7DDD8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 10,
  },
  googleMark: { color: "#4285F4", fontSize: 18, fontWeight: "800" },
  outline: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BCD0C3",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  outlineText: { color: "#1F5D4C", fontWeight: "800" },
  label: {
    color: "#365B4C",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 7,
  },
  field: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDE4DC",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#173C34",
  },
  disabled: { opacity: 0.45 },
  categoryBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalSoldBadge: {
    backgroundColor: "#C3535B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalSoldBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  actionGroup: {
    marginTop: 10,
    gap: 10,
  },
  soldToggleBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EBF3EE",
    borderWidth: 1,
    borderColor: "#BDD4C6",
    alignItems: "center",
    justifyContent: "center",
  },
  soldToggleBtnActive: {
    backgroundColor: "#FCEEEF",
    borderColor: "#E6B8BC",
  },
  soldToggleText: {
    color: "#1F5D4C",
    fontWeight: "800",
    fontSize: 14,
  },
  soldToggleTextActive: {
    color: "#C3535B",
  },
  reportBtn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reportText: {
    color: "#A0AAA4",
    fontSize: 13,
    fontWeight: "600",
  },
  reasonsList: {
    marginVertical: 16,
    gap: 10,
  },
  reasonOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E5E2",
    backgroundColor: "#FAFAFA",
  },
  reasonOptionSelected: {
    borderColor: "#1F5D4C",
    backgroundColor: "#EBF5EE",
  },
  reasonText: {
    color: "#55645E",
    fontSize: 14,
  },
  reasonTextSelected: {
    color: "#1F5D4C",
    fontWeight: "700",
  },
});
