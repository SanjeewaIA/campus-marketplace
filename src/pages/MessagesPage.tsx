// Feature Implemented by Sahan: Buyer/Seller Messaging & Campus Meetup Coordination
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { EmptyState } from "../components/EmptyState";
import { PageTitle } from "../components/PageTitle";
import { Conversation } from "../types";


const QUICK_REPLIES = [
  "Is this still available?",
  "Can we meet at the Main Library?",
  "Would you take a slightly lower price?",
  "I can pick this up today on campus!",
];

export function MessagesPage({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onBrowse,
}: {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onBrowse: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const filteredConversations = conversations.filter(
    (c) =>
      c.listingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sellerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSend = (textToSend?: string) => {
    const content = (textToSend ?? draft).trim();
    if (!content || !activeConversation) return;
    onSendMessage(activeConversation.id, content);
    if (!textToSend) {
      setDraft("");
    }
  };

  if (activeConversation) {
    return (
      <View style={styles.chatContainer}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <Pressable
            style={styles.backBtn}
            onPress={() => onSelectConversation(null)}
          >
            <Text style={styles.backBtnText}>← Inbox</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSellerName}>
              {activeConversation.sellerName}
            </Text>
            <Text style={styles.headerCampus}>
              📍 {activeConversation.campus}
            </Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Active</Text>
          </View>
        </View>

        {/* Listing Context Banner */}
        <View style={styles.listingBanner}>
          <Image
            source={{ uri: activeConversation.listingImage }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {activeConversation.listingTitle}
            </Text>
            <Text style={styles.bannerPrice}>
              ${activeConversation.listingPrice} · Campus Pickup
            </Text>
          </View>
        </View>

        {/* Messages Thread */}
        <ScrollView contentContainerStyle={styles.messagesList}>
          <View style={styles.safetyTip}>
            <Text style={styles.safetyTipText}>
              🛡️ Campus Safety Tip: Meet in public campus spaces like the
              Library or Student Center.
            </Text>
          </View>

          {activeConversation.messages.map((msg) => {
            const isBuyer = msg.sender === "buyer";
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isBuyer ? styles.messageRowRight : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isBuyer ? styles.bubbleBuyer : styles.bubbleSeller,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleSender,
                      isBuyer
                        ? styles.bubbleSenderBuyer
                        : styles.bubbleSenderSeller,
                    ]}
                  >
                    {msg.senderName}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleText,
                      isBuyer
                        ? styles.bubbleTextBuyer
                        : styles.bubbleTextSeller,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      isBuyer
                        ? styles.bubbleTimeBuyer
                        : styles.bubbleTimeSeller,
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Reply Chips */}
        <View style={styles.quickReplySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickReplyList}
          >
            {QUICK_REPLIES.map((reply) => (
              <Pressable
                key={reply}
                style={styles.quickReplyChip}
                onPress={() => handleSend(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Message Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={`Message ${activeConversation.sellerName}...`}
              placeholderTextColor="#87918C"
              style={styles.chatInput}
              onSubmitEditing={() => handleSend()}
            />
            <Pressable
              disabled={!draft.trim()}
              style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PageTitle
        title="Messages"
        subtitle="Buyer & seller conversations • Keep campus meetups simple"
      />

      {conversations.length > 0 && (
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search conversations by item or seller..."
            placeholderTextColor="#87918C"
            style={styles.searchInput}
          />
        </View>
      )}

      {filteredConversations.length === 0 ? (
        <EmptyState
          title="Your inbox is quiet"
          message="When you message a seller from a listing, your conversation will show up here."
          action="Browse listings"
          onAction={onBrowse}
        />
      ) : (
        <View style={styles.inboxList}>
          {filteredConversations.map((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <Pressable
                key={conv.id}
                style={[
                  styles.convCard,
                  conv.unreadCount > 0 && styles.convCardUnread,
                ]}
                onPress={() => onSelectConversation(conv.id)}
              >
                <Image
                  source={{ uri: conv.listingImage }}
                  style={styles.convImage}
                />
                <View style={styles.convBody}>
                  <View style={styles.convTopRow}>
                    <Text style={styles.convSeller}>{conv.sellerName}</Text>
                    <Text style={styles.convTime}>{conv.updatedAt}</Text>
                  </View>
                  <Text style={styles.convItemTitle} numberOfLines={1}>
                    {conv.listingTitle} · ${conv.listingPrice}
                  </Text>
                  <View style={styles.convBottomRow}>
                    <Text
                      style={[
                        styles.convPreview,
                        conv.unreadCount > 0 && styles.convPreviewUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {lastMsg
                        ? `${lastMsg.sender === "buyer" ? "You: " : ""}${lastMsg.text}`
                        : "Start chatting..."}
                    </Text>
                    {conv.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {conv.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110 },
  searchBar: {
    height: 46,
    backgroundColor: "#FFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E6E9E2",
    marginBottom: 16,
  },
  searchIcon: { color: "#49635A", fontSize: 22, marginRight: 8 },
  searchInput: { flex: 1, color: "#173C34", fontSize: 13 },
  inboxList: { gap: 12 },
  convCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E9ECE6",
    alignItems: "center",
    gap: 14,
  },
  convCardUnread: {
    borderColor: "#1F5D4C",
    backgroundColor: "#F4F9F6",
  },
  convImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#E6E9E2",
  },
  convBody: { flex: 1 },
  convTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  convSeller: { color: "#173C34", fontSize: 15, fontWeight: "800" },
  convTime: { color: "#87918C", fontSize: 11, fontWeight: "600" },
  convItemTitle: {
    color: "#23775D",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  convBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  convPreview: { flex: 1, color: "#66736D", fontSize: 13 },
  convPreviewUnread: { color: "#173C34", fontWeight: "700" },
  unreadBadge: {
    backgroundColor: "#1F5D4C",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  chatContainer: {
    flex: 1,
    paddingBottom: 82,
    backgroundColor: "#F8F8F4",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EBE5",
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ECEFE9",
  },
  backBtnText: { color: "#1F5D4C", fontSize: 13, fontWeight: "800" },
  headerCenter: { alignItems: "center" },
  headerSellerName: { color: "#173C34", fontSize: 16, fontWeight: "800" },
  headerCampus: { color: "#65766D", fontSize: 11, marginTop: 2 },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5EE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#23775D",
  },
  onlineText: { color: "#1F5D4C", fontSize: 11, fontWeight: "700" },
  listingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EBE5",
    gap: 12,
  },
  bannerImage: { width: 42, height: 42, borderRadius: 8 },
  bannerInfo: { flex: 1 },
  bannerTitle: { color: "#173C34", fontSize: 14, fontWeight: "700" },
  bannerPrice: { color: "#23775D", fontSize: 12, fontWeight: "700" },
  messagesList: { padding: 16, gap: 12, paddingBottom: 24 },
  safetyTip: {
    backgroundColor: "#EBF5EE",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#C5E2CF",
    marginBottom: 6,
  },
  safetyTipText: {
    color: "#1F5D4C",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  messageRow: { flexDirection: "row", width: "100%" },
  messageRowRight: { justifyContent: "flex-end" },
  messageRowLeft: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleBuyer: {
    backgroundColor: "#1F5D4C",
    borderBottomRightRadius: 4,
  },
  bubbleSeller: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E6E9E2",
  },
  bubbleSender: { fontSize: 10, fontWeight: "800", marginBottom: 3 },
  bubbleSenderBuyer: { color: "#B8DEC9" },
  bubbleSenderSeller: { color: "#23775D" },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextBuyer: { color: "#FFF" },
  bubbleTextSeller: { color: "#173C34" },
  bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  bubbleTimeBuyer: { color: "#C5E2CF" },
  bubbleTimeSeller: { color: "#87918C" },
  quickReplySection: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EBE5",
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  quickReplyList: { gap: 8, paddingBottom: 10 },
  quickReplyChip: {
    backgroundColor: "#ECEFE9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  quickReplyText: { color: "#1F5D4C", fontSize: 12, fontWeight: "700" },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#F8F8F4",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#173C34",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#DDE4DC",
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 18,
    backgroundColor: "#1F5D4C",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
});

