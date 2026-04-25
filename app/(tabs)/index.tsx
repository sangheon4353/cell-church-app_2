import { useRouter } from "expo-router";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAppAuth } from "@/lib/auth-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { useEffect } from "react";

// 이번 주 날짜 범위 계산
function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(monday)} ~ ${fmt(sunday)}`;
}

// 오늘 날짜 포맷
function getTodayString() {
  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
}

// 진행률 바 컴포넌트
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const colors = useColors();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(300, withTiming(Math.min(progress, 1), { duration: 800 }));
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

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { displayName } = useAppAuth();

  const weeklyBibleQuery = trpc.bibleRecord.weeklyTotal.useQuery();
  const prayerStatsQuery = trpc.prayerRecord.weeklyStats.useQuery();
  const profileQuery = trpc.profile.get.useQuery();
  const bibleTop3Query = trpc.rankings.bibleTop3.useQuery();
  const prayerTop3Query = trpc.rankings.prayerTop3.useQuery();

  const isRefreshing = weeklyBibleQuery.isFetching || prayerStatsQuery.isFetching || bibleTop3Query.isFetching || prayerTop3Query.isFetching;

  const onRefresh = () => {
    weeklyBibleQuery.refetch();
    prayerStatsQuery.refetch();
    profileQuery.refetch();
    bibleTop3Query.refetch();
    prayerTop3Query.refetch();
  };

  const totalVerses = weeklyBibleQuery.data?.total ?? 0;
  const cellPrayerMinutes = prayerStatsQuery.data?.cellMinutes ?? 0;
  const myPrayerMinutes = prayerStatsQuery.data?.myMinutes ?? 0;
  const PRAYER_GOAL = 120; // 목표: 120분

  const prayerProgress = cellPrayerMinutes / PRAYER_GOAL;

  const openDailyBible = () => {
    Linking.openURL("https://sum.su.or.kr:8888/bible/today");
  };

  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요";
    if (hour < 18) return "좋은 오후예요";
    return "좋은 저녁이에요";
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>{greetingText()},</Text>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              {displayName ?? "성도"}님 👋
            </Text>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.dateText, { color: colors.primary }]}>{getTodayString()}</Text>
          </View>
        </View>

        {/* 매일성경 카드 */}
        <Pressable
          onPress={openDailyBible}
          style={({ pressed }) => [
            styles.card,
            styles.bibleCard,
            { backgroundColor: "#5B9BD5", opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={styles.bibleCardContent}>
            <View>
              <Text style={styles.bibleCardLabel}>오늘의 매일성경</Text>
              <Text style={styles.bibleCardTitle}>큐티 바로가기</Text>
              <Text style={styles.bibleCardDesc}>말씀으로 하루를 시작해요</Text>
            </View>
            <View style={styles.bibleCardIcon}>
              <Text style={{ fontSize: 36 }}>📖</Text>
            </View>
          </View>
          <View style={styles.bibleCardFooter}>
            <Text style={styles.bibleCardLink}>sum.su.or.kr → 바로가기</Text>
          </View>
        </Pressable>

        {/* 이번 주 현황 */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>이번 주 현황</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{getWeekRange()}</Text>

        {/* 성경 쓰기 카드 */}
        <Pressable
          onPress={() => router.push("/(tabs)/bible" as never)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={{ fontSize: 22 }}>✍️</Text>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>성경 쓰기</Text>
            </View>
            <Text style={[styles.cardArrow, { color: colors.muted }]}>›</Text>
          </View>
          <View style={styles.cardStats}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {totalVerses.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>절 작성</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.muted }]}>셀 전체 이번 주 작성 절 수</Text>
        </Pressable>

        {/* 기도 시간 카드 */}
        <Pressable
          onPress={() => router.push("/(tabs)/prayer" as never)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={{ fontSize: 22 }}>🙏</Text>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>기도 시간</Text>
            </View>
            <Text style={[styles.cardArrow, { color: colors.muted }]}>›</Text>
          </View>
          <View style={styles.cardStats}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {cellPrayerMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>분 / 목표 {PRAYER_GOAL}분</Text>
          </View>
          <ProgressBar progress={prayerProgress} color={colors.success} />
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: colors.muted }]}>0분</Text>
            <Text style={[styles.progressLabel, { color: colors.muted }]}>{PRAYER_GOAL}분</Text>
          </View>
          {cellPrayerMinutes >= PRAYER_GOAL && (
            <View style={[styles.achievedBadge, { backgroundColor: "#EDF7F0" }]}>
              <Text style={[styles.achievedText, { color: colors.success }]}>🎉 이번 주 목표 달성!</Text>
            </View>
          )}
        </Pressable>

        {/* 내 기도 현황 */}
        <View style={[styles.myStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.myStatLabel, { color: colors.muted }]}>내 이번 주 기도 시간</Text>
          <Text style={[styles.myStatValue, { color: colors.foreground }]}>{myPrayerMinutes}분</Text>
        </View>

        {/* TOP 3 카드 */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>이번 주 TOP 3</Text>

        {/* 성경 쓰기 TOP 3 */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={{ fontSize: 22 }}>🏆</Text>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>성경 쓰기 TOP 3</Text>
            </View>
          </View>
          <View style={styles.top3List}>
            {(bibleTop3Query.data ?? []).length > 0 ? (
              (bibleTop3Query.data ?? []).map((item, idx) => (
                <View key={idx} style={styles.top3Item}>
                  <Text style={[styles.top3Rank, { color: colors.primary }]}>{idx + 1}</Text>
                  <Text style={[styles.top3Name, { color: colors.foreground }]}>{item.displayName}</Text>
                  <Text style={[styles.top3Value, { color: colors.success }]}>{item.chapters}장</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyTop3, { color: colors.muted }]}>아직 기록이 없습니다</Text>
            )}
          </View>
        </View>

        {/* 기도 TOP 3 */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={{ fontSize: 22 }}>🙏</Text>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>기도 TOP 3</Text>
            </View>
          </View>
          <View style={styles.top3List}>
            {(prayerTop3Query.data ?? []).length > 0 ? (
              (prayerTop3Query.data ?? []).map((item, idx) => (
                <View key={idx} style={styles.top3Item}>
                  <Text style={[styles.top3Rank, { color: colors.primary }]}>{idx + 1}</Text>
                  <Text style={[styles.top3Name, { color: colors.foreground }]}>{item.displayName}</Text>
                  <Text style={[styles.top3Value, { color: colors.success }]}>{item.minutes}분</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyTop3, { color: colors.muted }]}>아직 기록이 없습니다</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40, gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  greeting: { fontSize: 14, marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  dateBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dateText: { fontSize: 12, fontWeight: "600" },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  bibleCard: {
    borderWidth: 0,
    padding: 20,
    gap: 12,
  },
  bibleCardContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bibleCardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "500", marginBottom: 4 },
  bibleCardTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  bibleCardDesc: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  bibleCardIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  bibleCardFooter: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)", paddingTop: 10 },
  bibleCardLink: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  sectionSubtitle: { fontSize: 13, marginTop: -4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardArrow: { fontSize: 24 },
  cardStats: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  statNumber: { fontSize: 36, fontWeight: "700", letterSpacing: -1 },
  statLabel: { fontSize: 14 },
  cardDesc: { fontSize: 13 },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11 },
  achievedBadge: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: "center" },
  achievedText: { fontSize: 14, fontWeight: "600" },
  myStatCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  myStatLabel: { fontSize: 14 },
  myStatValue: { fontSize: 20, fontWeight: "700" },
  top3List: { gap: 8 },
  top3Item: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  top3Rank: { fontSize: 18, fontWeight: "700", width: 30, textAlign: "center" },
  top3Name: { flex: 1, fontSize: 14, fontWeight: "500", marginLeft: 12 },
  top3Value: { fontSize: 14, fontWeight: "700" },
  emptyTop3: { textAlign: "center", paddingVertical: 16, fontSize: 13 },
});

// TOP 3 스타일 추가 (마지막 스타일 정의 전에 삽입)
const top3Styles = `
  top3List: { gap: 8 },
  top3Item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  top3Rank: { fontSize: 18, fontWeight: '700', width: 30, textAlign: 'center' },
  top3Name: { flex: 1, fontSize: 14, fontWeight: '500', marginLeft: 12 },
  top3Value: { fontSize: 14, fontWeight: '700' },
  emptyTop3: { textAlign: 'center', paddingVertical: 16, fontSize: 13 },
`;
