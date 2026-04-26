import { useRouter } from "expo-router";
import { useState } from "react";
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
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function BibleInputScreen() {
  const router = useRouter();
  const colors = useColors();

  const assignmentQuery = trpc.bibleAssignment.get.useQuery();
  const recordsQuery = trpc.bibleRecord.listByBook.useQuery(
    { bookCode: assignmentQuery.data?.bookCode ?? "" },
    { enabled: !!assignmentQuery.data?.bookCode }
  );

  const addRecordMutation = trpc.bibleRecord.add.useMutation({
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("완료", "성경 쓰기가 기록되었습니다! 🎉", [
        { text: "확인", onPress: () => router.back() },
      ]);
    },
    onError: (err) => {
      Alert.alert("오류", err.message);
    },
  });

  const assignment = assignmentQuery.data;
  const [chapter, setChapter] = useState("");
  const [verseStart, setVerseStart] = useState("");
  const [verseEnd, setVerseEnd] = useState("");

  // 이미 기록된 장 목록
  const recordedChapters = new Set(recordsQuery.data?.map((r) => r.chapter) ?? []);

  const handleSubmit = () => {
    if (!assignment) {
      Alert.alert("알림", "할당된 성경이 없습니다. 셀 리더에게 성경 권을 할당받으세요.");
      return;
    }
    const chapterNum = parseInt(chapter);
    const verseStartNum = parseInt(verseStart);
    const verseEndNum = parseInt(verseEnd);

    if (!chapterNum || chapterNum < 1 || chapterNum > assignment.totalChapters) {
      Alert.alert("알림", `장을 1~${assignment.totalChapters} 사이로 입력해주세요.`);
      return;
    }

    addRecordMutation.mutate({
      bookCode: assignment.bookCode,
      bookName: assignment.bookName,
      chapter: chapterNum,
      verseStart: verseStartNum,
      verseEnd: verseEndNum,
      recordDate: getTodayString(),
    });
  };

  if (assignmentQuery.isLoading) {
    return (
      <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.cancelText, { color: colors.muted }]}>취소</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>성경 쓰기 기록</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!assignment ? (
          <View style={styles.noAssignmentContainer}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
            <Text style={[styles.noAssignmentTitle, { color: colors.foreground }]}>
              할당된 성경이 없습니다
            </Text>
            <Text style={[styles.noAssignmentDesc, { color: colors.muted }]}>
              셀 리더에게 성경 권을 할당받은 후{"\n"}기록할 수 있습니다.
            </Text>
          </View>
        ) : (
          <>
            {/* 할당된 성경 정보 */}
            <View style={[styles.assignmentCard, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
              <Text style={[styles.assignmentLabel, { color: colors.primary }]}>할당된 성경</Text>
              <Text style={[styles.assignmentBook, { color: colors.foreground }]}>
                {assignment.bookName}
              </Text>
              <Text style={[styles.assignmentChapters, { color: colors.muted }]}>
                전체 {assignment.totalChapters}장
              </Text>
            </View>

            {/* 오늘 날짜 */}
            <View style={[styles.dateRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.dateLabel, { color: colors.muted }]}>기록 날짜</Text>
              <Text style={[styles.dateValue, { color: colors.foreground }]}>{getTodayString()}</Text>
            </View>

            {/* 장 입력 */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>장 (Chapter)</Text>
              <TextInput
                value={chapter}
                onChangeText={setChapter}
                placeholder={`1 ~ ${assignment.totalChapters}`}
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                returnKeyType="next"
              />
            </View>

            {/* 기록된 장 표시 */}
            {recordedChapters.size > 0 && (
              <View style={styles.recordedSection}>
                <Text style={[styles.recordedLabel, { color: colors.muted }]}>기록된 장</Text>
                <View style={styles.recordedChapters}>
                  {Array.from(recordedChapters).sort((a, b) => a - b).map((ch) => (
                    <View key={ch} style={[styles.chapterBadge, { backgroundColor: colors.success + "20" }]}>
                      <Text style={[styles.chapterBadgeText, { color: colors.success }]}>{ch}장 ✓</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 저장 버튼 */}
      {assignment && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleSubmit}
            disabled={addRecordMutation.isPending}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: colors.primary, opacity: pressed || addRecordMutation.isPending ? 0.8 : 1 },
            ]}
          >
            {addRecordMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>기록 저장</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  cancelText: { fontSize: 16 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  noAssignmentContainer: { alignItems: "center", paddingTop: 60, gap: 8 },
  noAssignmentTitle: { fontSize: 18, fontWeight: "700" },
  noAssignmentDesc: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  assignmentCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 4,
  },
  assignmentLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  assignmentBook: { fontSize: 24, fontWeight: "700" },
  assignmentChapters: { fontSize: 14 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  dateLabel: { fontSize: 14 },
  dateValue: { fontSize: 14, fontWeight: "600" },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    textAlign: "center",
  },
  verseRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  verseInput: { flex: 1 },
  verseSeparator: { fontSize: 20, fontWeight: "300" },
  previewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewText: { fontSize: 14 },
  previewCount: { fontSize: 16, fontWeight: "700" },
  recordedSection: { gap: 8 },
  recordedLabel: { fontSize: 13, fontWeight: "500" },
  recordedChapters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chapterBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chapterBadgeText: { fontSize: 13, fontWeight: "600" },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 0.5,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
