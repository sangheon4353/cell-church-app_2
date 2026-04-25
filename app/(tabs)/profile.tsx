import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useAppAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  const colors = useColors();
  const { logout } = useAuth();
  const { displayName, isLeader } = useAppAuth();

  const profileQuery = trpc.profile.get.useQuery();
  const profile = profileQuery.data;

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: logout },
    ]);
  };

  const genderLabel = profile?.gender === "male" ? "남성" : "여성";
  const statusLabel = profile?.approvalStatus === "approved" ? "승인됨" : profile?.approvalStatus === "pending" ? "대기 중" : "거절됨";
  const statusColor = profile?.approvalStatus === "approved" ? colors.success : profile?.approvalStatus === "pending" ? colors.warning : colors.error;

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>마이페이지</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(displayName ?? "?").charAt(0)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>{displayName ?? "이름 없음"}</Text>
          {isLeader && (
            <View style={[styles.leaderBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.leaderBadgeText}>셀 리더</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* 정보 섹션 */}
        {profile && (
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>내 정보</Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>성별</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{genderLabel}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>생년월일</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile.birthDate}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>전화번호</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{profile.phoneNumber}</Text>
            </View>
          </View>
        )}

        {/* 앱 정보 */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>앱 정보</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>버전</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>1.0.0</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>개발</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>셀모임 앱</Text>
          </View>
        </View>

        {/* 로그아웃 버튼 */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { borderColor: colors.error, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.logoutText, { color: colors.error }]}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { paddingBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 36, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700" },
  leaderBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  leaderBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: "600" },
  infoCard: {
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
  sectionTitle: { fontSize: 15, fontWeight: "600" },
  divider: { height: 0.5 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "500" },
  logoutButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
