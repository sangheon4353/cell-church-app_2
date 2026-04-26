import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAppAuth } from "@/lib/auth-context";

function ProgressBar({ progress, color, delay = 0 }: { progress: number; color: string; delay?: number }) {
  const colors = useColors();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(delay, withTiming(Math.min(progress, 1), { duration: 700 }));
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, animStyle]} />
    </View>
  );
}

export default function BibleScreen() {
  const router = useRouter();
  const colors = useColors();
  const { userId } = useAppAuth();
  const [showInputModal, setShowInputModal] = useState(false);

  const weeklyStatsQuery = trpc.cell.weeklyStats.useQuery();
  const myAssignmentQuery = trpc.bibleAssignment.get.useQuery();

  const isLoading = weeklyStatsQuery.isLoading;
  const isRefreshing = weeklyStatsQuery.isFetching;

  const onRefresh = () => {
    weeklyStatsQuery.refetch();
    myAssignmentQuery.refetch();
  };

  const handleAddRecord = (mode: 'verse' | 'chapter') => {
    setShowInputModal(false);
    if (mode === 'verse') {
      router.push("/bible-input" as never);
    } else {
      router.push("/bible-chapter-input" as never);
    }
  };

  const totalVerses = weeklyStatsQuery.data?.totalVerses ?? 0;
  const membersProgress = weeklyStatsQuery.data?.membersProgress ?? [];

  const renderMember = ({ item, index }: { item: typeof membersProgress[0]; index: number }) => {
    const isMe = item.userId === userId;
    const progress = item.assignment
      ? item.completedChapters / item.assignment.totalChapters
      : 0;

    return (
      <View
        style={[
          styles.memberCard,
          {
            backgroundColor: isMe ? colors.accent : colors.surface,
            borderColor: isMe ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.memberHeader}>
          <View style={styles.memberInfo}>
            <View style={[styles.avatar, { backgroundColor: isMe ? colors.primary : colors.border }]}>
              <Text style={[styles.avatarText, { color: isMe ? "#fff" : colors.muted }]}>
                {item.displayName.charAt(0)}
              </Text>
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={[styles.memberName, { color: colors.foreground }]}>{item.displayName}</Text>
                {isMe && (
                  <View style={[styles.meBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.meBadgeText}>나</Text>
                  </View>
                )}
              </View>
              {item.assignment ? (
                <Text style={[styles.bookName, { color: colors.muted }]}>
                  {item.assignment.bookName} ({item.assignment.totalChapters}장)
                </Text>
              ) : (
                <Text style={[styles.bookName, { color: colors.muted }]}>할당된 성경 없음</Text>
              )}
            </View>
          </View>
          {item.assignment && (
            <View style={styles.progressInfo}>
              <Text style={[styles.progressPercent, { color: isMe ? colors.primary : colors.foreground }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
        </View>

        {item.assignment && (
          <>
            <ProgressBar
              progress={progress}
              color={isMe ? colors.primary : colors.success}
              delay={index * 100}
            />
            <Text style={[styles.chapterText, { color: colors.muted }]}>
              {item.completedChapters}장 완료 / {item.assignment.totalChapters}장
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>성경 쓰기</Text>
        <Pressable
          onPress={() => setShowInputModal(true)}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.addButtonText}>+ 기록</Text>
        </Pressable>
      </View>

      {/* 이번 주 합계 */}
      <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.totalLabel}>이번 주 셀 전체 작성</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalNumber}>{totalVerses.toLocaleString()}</Text>
          <Text style={styles.totalUnit}>장</Text>
        </View>
      </View>

      {/* 셀원 목록 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={membersProgress}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderMember}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📖</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                아직 셀원이 없습니다.{"\n"}셀 리더에게 승인을 요청해주세요.
              </Text>
            </View>
          }
        />
      )}


      {/* 입력 방식 선택 모달 */}
      <Modal visible={showInputModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInputModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>입력 방식 선택</Text>
            <Text style={[styles.modalDesc, { color: colors.muted }]}>어떤 방식으로 기록하시겠어요?</Text>

              {/* 장 기반 입력 */}
              <Pressable
                onPress={() => handleAddRecord('chapter')}
                style={({ pressed }) => [
                  styles.modalOption,
                  { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.modalOptionEmoji]}>📚</Text>
                <Text style={[styles.modalOptionTitle, { color: colors.foreground }]}>장 기반</Text>
                <Text style={[styles.modalOptionDesc, { color: colors.muted }]}>장 범위 입력</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowInputModal(false)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.modalCancel, { color: colors.muted }]}>취소</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: "85%",
    gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalDesc: { fontSize: 14 },
  modalOptions: { gap: 12 },
  modalOption: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  modalOptionEmoji: { fontSize: 32 },
  modalOptionTitle: { fontSize: 16, fontWeight: "600" },
  modalOptionDesc: { fontSize: 13 },
  modalCancel: { fontSize: 16, fontWeight: "500", textAlign: "center", paddingVertical: 12 },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  totalCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    gap: 4,
  },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  totalRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  totalNumber: { color: "#fff", fontSize: 40, fontWeight: "700", letterSpacing: -1 },
  totalUnit: { color: "rgba(255,255,255,0.9)", fontSize: 18, fontWeight: "600" },
  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  memberCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  memberHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  memberInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberName: { fontSize: 16, fontWeight: "600" },
  meBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  meBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  bookName: { fontSize: 13, marginTop: 2 },
  progressInfo: { alignItems: "flex-end" },
  progressPercent: { fontSize: 20, fontWeight: "700" },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  chapterText: { fontSize: 12 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 15, textAlign: "center", lineHeight: 24 },
});
