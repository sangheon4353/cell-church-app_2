import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

const BIBLE_BOOKS = [
  { code: "GEN", name: "창세기", chapters: 50 },
  { code: "EXO", name: "출애굽기", chapters: 40 },
  { code: "LEV", name: "레위기", chapters: 27 },
  { code: "NUM", name: "민수기", chapters: 36 },
  { code: "DEU", name: "신명기", chapters: 34 },
  { code: "JOS", name: "여호수아", chapters: 24 },
  { code: "JDG", name: "사사기", chapters: 21 },
  { code: "RUT", name: "룻기", chapters: 4 },
  { code: "PSA", name: "시편", chapters: 150 },
  { code: "PRO", name: "잠언", chapters: 31 },
  { code: "MAT", name: "마태복음", chapters: 28 },
  { code: "MRK", name: "마가복음", chapters: 16 },
  { code: "LUK", name: "누가복음", chapters: 24 },
  { code: "JHN", name: "요한복음", chapters: 21 },
  { code: "ACT", name: "사도행전", chapters: 28 },
  { code: "ROM", name: "로마서", chapters: 16 },
  { code: "1CO", name: "고린도전서", chapters: 16 },
  { code: "EPH", name: "에베소서", chapters: 6 },
  { code: "PHP", name: "빌립보서", chapters: 4 },
  { code: "REV", name: "요한계시록", chapters: 22 },
];

type TabType = "pending" | "members";

export default function LeaderScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedMember, setSelectedMember] = useState<{ userId: number; displayName: string } | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const pendingQuery = trpc.cell.pendingMembers.useQuery();
  const membersQuery = trpc.cell.members.useQuery();
  const cellAssignmentsQuery = trpc.bibleAssignment.cellList.useQuery();

  const approveMutation = trpc.cell.approve.useMutation({
    onSuccess: () => pendingQuery.refetch(),
    onError: (err: { message: string }) => Alert.alert("오류", err.message),
  });
  const rejectMutation = trpc.cell.approve.useMutation({
    onSuccess: () => pendingQuery.refetch(),
    onError: (err: { message: string }) => Alert.alert("오류", err.message),
  });
  const assignBookMutation = trpc.bibleAssignment.assign.useMutation({
    onSuccess: () => {
      setShowBookModal(false);
      setSelectedMember(null);
      membersQuery.refetch();
      cellAssignmentsQuery.refetch();
      Alert.alert("완료", "성경 권이 할당되었습니다.");
    },
    onError: (err: { message: string }) => Alert.alert("오류", err.message),
  });

  const pendingCount = pendingQuery.data?.length ?? 0;
  const assignmentMap = new Map((cellAssignmentsQuery.data ?? []).map((a) => [a.userId, a]));

  const handleApprove = (userId: number, name: string) => {
    Alert.alert("승인", `${name}님을 승인하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      { text: "승인", onPress: () => approveMutation.mutate({ targetUserId: userId, status: "approved" }) },
    ]);
  };

  const handleReject = (userId: number, name: string) => {
    Alert.alert("거절", `${name}님의 가입을 거절하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      { text: "거절", style: "destructive", onPress: () => rejectMutation.mutate({ targetUserId: userId, status: "rejected" }) },
    ]);
  };

  const handleAssignBook = (userId: number, displayName: string) => {
    setSelectedMember({ userId, displayName });
    setShowBookModal(true);
  };

  const renderPendingItem = ({ item }: { item: NonNullable<typeof pendingQuery.data>[0] }) => (
    <View style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.memberInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{item.displayName.charAt(0)}</Text>
        </View>
        <View>
          <Text style={[styles.memberName, { color: colors.foreground }]}>{item.displayName}</Text>
          <Text style={[styles.memberSub, { color: colors.muted }]}>{item.phoneNumber}</Text>
          <Text style={[styles.memberSub, { color: colors.muted }]}>
            {item.gender === "male" ? "남성" : "여성"} · {item.birthDate}
          </Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => handleReject(item.userId, item.displayName)}
          disabled={rejectMutation.isPending}
          style={({ pressed }) => [
            styles.rejectBtn,
            { borderColor: colors.error, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.rejectBtnText, { color: colors.error }]}>거절</Text>
        </Pressable>
        <Pressable
          onPress={() => handleApprove(item.userId, item.displayName)}
          disabled={approveMutation.isPending}
          style={({ pressed }) => [
            styles.approveBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.approveBtnText}>승인</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderMemberItem = ({ item }: { item: NonNullable<typeof membersQuery.data>[0] }) => {
    const assignment = assignmentMap.get(item.userId);
    return (
      <View style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.memberInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{item.displayName.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.memberName, { color: colors.foreground }]}>{item.displayName}</Text>
            <Text style={[styles.memberSub, { color: colors.muted }]}>{item.phoneNumber}</Text>
            {assignment ? (
              <View style={[styles.bookBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.bookBadgeText, { color: colors.primary }]}>
                  {"\uD83D\uDCD6"} {assignment.bookName} ({assignment.totalChapters}장)
                </Text>
              </View>
            ) : (
              <Text style={[styles.noBook, { color: colors.warning }]}>성경 미할당</Text>
            )}
          </View>
        </View>
        <Pressable
          onPress={() => handleAssignBook(item.userId, item.displayName)}
          style={({ pressed }) => [
            styles.assignBtn,
            { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.assignBtnText, { color: colors.primary }]}>
            {assignment ? "변경" : "할당"}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>리더 관리</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["pending", "members"] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={({ pressed }) => [
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.muted }]}>
              {tab === "pending" ? "승인 대기" : "셀원 목록"}
              {tab === "pending" && pendingCount > 0 && (
                <Text style={[styles.badge, { color: colors.error }]}> {pendingCount}</Text>
              )}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "pending" ? (
        <FlatList
          data={pendingQuery.data ?? []}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderPendingItem}
          refreshControl={
            <RefreshControl refreshing={pendingQuery.isFetching} onRefresh={() => pendingQuery.refetch()} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>대기 중인 가입 신청이 없습니다.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={membersQuery.data ?? []}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderMemberItem}
          refreshControl={
            <RefreshControl refreshing={membersQuery.isFetching} onRefresh={() => membersQuery.refetch()} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>👥</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>승인된 셀원이 없습니다.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showBookModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowBookModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.muted }]}>취소</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {selectedMember?.displayName}님 성경 할당
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.bookList}>
            {BIBLE_BOOKS.map((book) => (
              <Pressable
                key={book.code}
                onPress={() => {
                  if (!selectedMember) return;
                  assignBookMutation.mutate({
                    targetUserId: selectedMember.userId,
                    bookCode: book.code,
                    bookName: book.name,
                    totalChapters: book.chapters,
                  });
                }}
                disabled={assignBookMutation.isPending}
                style={({ pressed }) => [
                  styles.bookItem,
                  { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.bookName, { color: colors.foreground }]}>{book.name}</Text>
                <Text style={[styles.bookChapters, { color: colors.muted }]}>{book.chapters}장</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabText: { fontSize: 15, fontWeight: "600" },
  badge: { fontSize: 13, fontWeight: "700" },
  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  memberCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  memberInfo: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700" },
  memberName: { fontSize: 16, fontWeight: "600" },
  memberSub: { fontSize: 13, marginTop: 2 },
  bookBadge: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  bookBadgeText: { fontSize: 12, fontWeight: "600" },
  noBook: { fontSize: 13, marginTop: 4, fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  rejectBtnText: { fontSize: 15, fontWeight: "600" },
  approveBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  approveBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  assignBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
  },
  assignBtnText: { fontSize: 14, fontWeight: "600" },
  emptyContainer: { alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 15, textAlign: "center" },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: "600" },
  bookList: { paddingBottom: 40 },
  bookItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  bookName: { fontSize: 16 },
  bookChapters: { fontSize: 14 },
});
