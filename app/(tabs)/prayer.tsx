import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const PRAYER_GOAL = 120;

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const colors = useColors();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(300, withTiming(Math.min(progress, 1), { duration: 900 }));
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

function QuickAddButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.9, { duration: 80 }), withSpring(1, { damping: 10 }));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.quickBtn,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={[styles.quickBtnText, { color: colors.primary }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PrayerScreen() {
  const colors = useColors();
  const [customMinutes, setCustomMinutes] = useState("");

  const weeklyStatsQuery = trpc.prayerRecord.weeklyStats.useQuery();
  const todayQuery = trpc.prayerRecord.todayMinutes.useQuery();
  const addMutation = trpc.prayerRecord.add.useMutation({
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      weeklyStatsQuery.refetch();
      todayQuery.refetch();
    },
    onError: (err: { message: string }) => Alert.alert("오류", err.message),
  });

  const myMinutes = weeklyStatsQuery.data?.myMinutes ?? 0;
  const cellMinutes = weeklyStatsQuery.data?.cellMinutes ?? 0;
  const todayMinutes = todayQuery.data?.minutes ?? 0;
  const cellProgress = cellMinutes / PRAYER_GOAL;
  const isGoalAchieved = cellMinutes >= PRAYER_GOAL;

  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const addMinutes = (minutes: number) => {
    addMutation.mutate({ minutes, recordDate: getTodayString() });
  };

  const handleCustomAdd = () => {
    const mins = parseInt(customMinutes);
    if (!mins || mins < 1) {
      Alert.alert("알림", "1분 이상 입력해주세요.");
      return;
    }
    if (mins > 480) {
      Alert.alert("알림", "한 번에 최대 480분(8시간)까지 입력 가능합니다.");
      return;
    }
    addMinutes(mins);
    setCustomMinutes("");
  };

  const onRefresh = () => {
    weeklyStatsQuery.refetch();
    todayQuery.refetch();
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={
          <RefreshControl
            refreshing={weeklyStatsQuery.isFetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>기도 시간</Text>
            </View>

            {/* 셀 전체 현황 카드 */}
            <View style={[styles.mainCard, { backgroundColor: "#5B9BD5" }]}>
              <Text style={styles.mainCardLabel}>이번 주 셀 전체 기도</Text>
              <View style={styles.mainCardRow}>
                <Text style={styles.mainCardNumber}>{cellMinutes}</Text>
                <Text style={styles.mainCardUnit}>분</Text>
              </View>
              <Text style={styles.mainCardGoal}>목표 {PRAYER_GOAL}분</Text>
              <View style={[styles.progressBg, { backgroundColor: "rgba(255,255,255,0.3)", marginTop: 12 }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: "#fff",
                      width: `${Math.min(cellProgress * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              {isGoalAchieved && (
                <View style={styles.achievedRow}>
                  <Text style={styles.achievedText}>🎉 이번 주 목표 달성!</Text>
                </View>
              )}
            </View>

            {/* 내 현황 */}
            <View style={styles.myStatsRow}>
              <View style={[styles.myStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.myStatLabel, { color: colors.muted }]}>내 이번 주</Text>
                <Text style={[styles.myStatValue, { color: colors.foreground }]}>{myMinutes}분</Text>
              </View>
              <View style={[styles.myStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.myStatLabel, { color: colors.muted }]}>오늘</Text>
                <Text style={[styles.myStatValue, { color: colors.foreground }]}>{todayMinutes}분</Text>
              </View>
            </View>

            {/* 기도 시간 입력 */}
            <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.inputCardTitle, { color: colors.foreground }]}>기도 시간 기록</Text>

              {/* 빠른 입력 버튼 */}
              <View style={styles.quickBtnsRow}>
                {[1, 5, 10, 15, 30].map((min) => (
                  <QuickAddButton
                    key={min}
                    label={`+${min}분`}
                    onPress={() => addMinutes(min)}
                  />
                ))}
              </View>

              {/* 직접 입력 */}
              <View style={styles.customInputRow}>
                <TextInput
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  placeholder="직접 입력 (분)"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  style={[
                    styles.customInput,
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground },
                  ]}
                  returnKeyType="done"
                  onSubmitEditing={handleCustomAdd}
                />
                <Pressable
                  onPress={handleCustomAdd}
                  disabled={addMutation.isPending}
                  style={({ pressed }) => [
                    styles.customAddBtn,
                    { backgroundColor: colors.primary, opacity: pressed || addMutation.isPending ? 0.8 : 1 },
                  ]}
                >
                  {addMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.customAddBtnText}>추가</Text>
                  )}
                </Pressable>
              </View>
            </View>

            {/* 안내 문구 */}
            <View style={[styles.tipCard, { backgroundColor: colors.accent, borderColor: colors.border }]}>
              <Text style={[styles.tipText, { color: colors.primary }]}>
                🙏 기도 후 바로 기록해보세요.{"\n"}작은 기도도 소중한 한 걸음입니다.
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  header: { paddingBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    gap: 4,
  },
  mainCardLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  mainCardRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  mainCardNumber: { color: "#fff", fontSize: 48, fontWeight: "700", letterSpacing: -2 },
  mainCardUnit: { color: "rgba(255,255,255,0.9)", fontSize: 20, fontWeight: "600" },
  mainCardGoal: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  progressBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  achievedRow: { marginTop: 8, alignItems: "center" },
  achievedText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  myStatsRow: { flexDirection: "row", gap: 12 },
  myStatCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  myStatLabel: { fontSize: 13 },
  myStatValue: { fontSize: 24, fontWeight: "700" },
  inputCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputCardTitle: { fontSize: 16, fontWeight: "600" },
  quickBtnsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickBtnText: { fontSize: 15, fontWeight: "600" },
  customInputRow: { flexDirection: "row", gap: 10 },
  customInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  customAddBtn: {
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 64,
  },
  customAddBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  tipText: { fontSize: 14, lineHeight: 22 },
});
