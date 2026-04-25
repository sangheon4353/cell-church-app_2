import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function PendingScreen() {
  const colors = useColors();
  const { logout } = useAuth();
  const profileQuery = trpc.profile.get.useQuery(undefined, {
    refetchInterval: 10000, // 10초마다 자동 새로고침
  });

  const profile = profileQuery.data;
  const isRejected = profile?.approvalStatus === "rejected";

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        {/* 아이콘 */}
        <View style={[styles.iconContainer, { backgroundColor: isRejected ? "#FFF0F0" : colors.accent }]}>
          <Text style={styles.icon}>{isRejected ? "😢" : "⏳"}</Text>
        </View>

        {/* 상태 메시지 */}
        <View style={styles.textSection}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isRejected ? "가입이 거절되었습니다" : "승인 대기 중입니다"}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            {isRejected
              ? "셀 리더에게 문의해 주세요.\n다시 가입 신청을 할 수 있습니다."
              : "셀 리더가 가입을 승인하면\n앱을 사용할 수 있습니다.\n잠시만 기다려주세요."}
          </Text>
        </View>

        {/* 정보 카드 */}
        {profile && (
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>이름</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile.displayName}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>상태</Text>
              <View style={[styles.statusBadge, { backgroundColor: isRejected ? "#FFF0F0" : colors.accent }]}>
                <Text style={[styles.statusText, { color: isRejected ? "#D96B6B" : colors.primary }]}>
                  {isRejected ? "거절됨" : "대기 중"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 새로고침 버튼 */}
        <Pressable
          onPress={() => profileQuery.refetch()}
          disabled={profileQuery.isFetching}
          style={({ pressed }) => [
            styles.refreshButton,
            { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          {profileQuery.isFetching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.refreshText, { color: colors.primary }]}>새로고침</Text>
          )}
        </Pressable>

        {/* 로그아웃 */}
        <Pressable
          onPress={logout}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.logoutText, { color: colors.muted }]}>로그아웃</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 56 },
  textSection: { alignItems: "center", gap: 10 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  description: { fontSize: 15, textAlign: "center", lineHeight: 24 },
  infoCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 15, fontWeight: "600" },
  divider: { height: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: "600" },
  refreshButton: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 140,
    alignItems: "center",
  },
  refreshText: { fontSize: 15, fontWeight: "600" },
  logoutText: { fontSize: 14 },
});
