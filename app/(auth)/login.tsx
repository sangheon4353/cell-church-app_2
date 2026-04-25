import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { startOAuthLogin } from "@/constants/oauth";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await startOAuthLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        {/* 로고 영역 */}
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
            <Text style={styles.logoEmoji}>✝️</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>셀모임</Text>
          <Text style={[styles.tagline, { color: colors.muted }]}>함께 자라는 신앙</Text>
        </View>

        {/* 설명 카드 */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            로그인하고 셀 모임을 시작하세요
          </Text>
          <Text style={[styles.cardDesc, { color: colors.muted }]}>
            성경 쓰기와 기도 시간을 기록하고{"\n"}셀 구성원들과 함께 성장해요.
          </Text>
        </View>

        {/* 로그인 버튼 */}
        <View style={styles.buttonSection}>
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "로그인 중..." : "로그인 / 회원가입"}
            </Text>
          </Pressable>

          <Text style={[styles.hint, { color: colors.muted }]}>
            처음 방문이시면 자동으로 회원가입이 진행됩니다.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 32,
  },
  logoSection: {
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonSection: {
    gap: 16,
  },
  loginButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#5B9BD5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
