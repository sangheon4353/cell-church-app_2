import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type Step = 1 | 2 | 3;

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useColors();
  const [step, setStep] = useState<Step>(1);

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState<number | null>(null);
  const [isLeader, setIsLeader] = useState(false);

  const leadersQuery = trpc.leaders.list.useQuery();
  const createProfileMutation = trpc.profile.create.useMutation({
    onSuccess: () => {
      router.replace("/(auth)/pending" as never);
    },
    onError: (err) => {
      Alert.alert("오류", err.message);
    },
  });

  const handleNext = () => {
    if (step === 1) {
      if (!displayName.trim()) {
        Alert.alert("알림", "이름을 입력해주세요.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        Alert.alert("알림", "생년월일을 YYYY-MM-DD 형식으로 입력해주세요.");
        return;
      }
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert("알림", "올바른 전화번호를 입력해주세요.");
        return;
      }
      setStep(3);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    if (!isLeader && !selectedLeaderId) {
      Alert.alert("알림", "셀 리더를 선택하거나 '셀 리더입니다'를 선택해주세요.");
      return;
    }
    createProfileMutation.mutate({
      displayName: displayName.trim(),
      gender,
      birthDate,
      phoneNumber,
      leaderId: isLeader ? undefined : (selectedLeaderId ?? undefined),
      isLeader,
    });
  };

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {step > 1 ? (
          <Pressable onPress={handleBack} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.backText, { color: colors.primary }]}>← 이전</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>회원가입</Text>
        <Text style={[styles.stepText, { color: colors.muted }]}>{step}/3</Text>
      </View>

      {/* 진행률 바 */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: progressWidth as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: 이름 & 성별 */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>기본 정보</Text>
            <Text style={[styles.stepDesc, { color: colors.muted }]}>이름과 성별을 입력해주세요.</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>이름</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="이름을 입력하세요"
                placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                returnKeyType="done"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>성별</Text>
              <View style={styles.genderRow}>
                {(["male", "female"] as const).map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={({ pressed }) => [
                      styles.genderBtn,
                      {
                        backgroundColor: gender === g ? colors.primary : colors.surface,
                        borderColor: gender === g ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.genderBtnText, { color: gender === g ? "#fff" : colors.foreground }]}>
                      {g === "male" ? "남성" : "여성"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 2: 생년월일 & 전화번호 */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>연락처 정보</Text>
            <Text style={[styles.stepDesc, { color: colors.muted }]}>생년월일과 전화번호를 입력해주세요.</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>생년월일</Text>
              <TextInput
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={10}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                returnKeyType="done"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>전화번호</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="010-0000-0000"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                maxLength={13}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                returnKeyType="done"
              />
            </View>
          </View>
        )}

        {/* Step 3: 셀 리더 선택 */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>셀 리더 선택</Text>
            <Text style={[styles.stepDesc, { color: colors.muted }]}>소속 셀 리더를 선택해주세요.</Text>

            {/* 셀 리더 본인 여부 */}
            <Pressable
              onPress={() => { setIsLeader(!isLeader); setSelectedLeaderId(null); }}
              style={({ pressed }) => [
                styles.leaderToggle,
                {
                  backgroundColor: isLeader ? colors.accent : colors.surface,
                  borderColor: isLeader ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.checkbox, { borderColor: isLeader ? colors.primary : colors.border, backgroundColor: isLeader ? colors.primary : "transparent" }]}>
                {isLeader && <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>}
              </View>
              <Text style={[styles.leaderToggleText, { color: colors.foreground }]}>저는 셀 리더입니다</Text>
            </Pressable>

            {!isLeader && (
              <>
                <Text style={[styles.subLabel, { color: colors.muted }]}>셀 리더 목록</Text>
                {leadersQuery.isLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
                ) : leadersQuery.data?.length === 0 ? (
                  <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.emptyText, { color: colors.muted }]}>등록된 셀 리더가 없습니다.{"\n"}셀 리더에게 먼저 가입을 요청해주세요.</Text>
                  </View>
                ) : (
                  leadersQuery.data?.map((leader) => (
                    <Pressable
                      key={leader.userId}
                      onPress={() => setSelectedLeaderId(leader.userId)}
                      style={({ pressed }) => [
                        styles.leaderCard,
                        {
                          backgroundColor: selectedLeaderId === leader.userId ? colors.accent : colors.surface,
                          borderColor: selectedLeaderId === leader.userId ? colors.primary : colors.border,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <View style={styles.leaderCardInner}>
                        <View style={[styles.leaderAvatar, { backgroundColor: colors.accent }]}>
                          <Text style={{ fontSize: 18 }}>👤</Text>
                        </View>
                        <View>
                          <Text style={[styles.leaderName, { color: colors.foreground }]}>{leader.displayName}</Text>
                          <Text style={[styles.leaderPhone, { color: colors.muted }]}>{leader.phoneNumber}</Text>
                        </View>
                      </View>
                      {selectedLeaderId === leader.userId && (
                        <Text style={{ color: colors.primary, fontSize: 18 }}>✓</Text>
                      )}
                    </Pressable>
                  ))
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* 다음 버튼 */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleNext}
          disabled={createProfileMutation.isPending}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: colors.primary, opacity: pressed || createProfileMutation.isPending ? 0.8 : 1 },
          ]}
        >
          {createProfileMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{step === 3 ? "가입 완료" : "다음"}</Text>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backText: { fontSize: 15, fontWeight: "500" },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  stepText: { fontSize: 14, width: 60, textAlign: "right" },
  progressBg: { height: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  stepContainer: { gap: 20 },
  stepTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  stepDesc: { fontSize: 15, lineHeight: 22, marginTop: -8 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  subLabel: { fontSize: 14, fontWeight: "500", marginTop: 4 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  genderBtnText: { fontSize: 16, fontWeight: "600" },
  leaderToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  leaderToggleText: { fontSize: 16, fontWeight: "500" },
  leaderCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  leaderCardInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  leaderAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  leaderName: { fontSize: 16, fontWeight: "600" },
  leaderPhone: { fontSize: 13, marginTop: 2 },
  emptyCard: { borderWidth: 1, borderRadius: 14, padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 0.5,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
