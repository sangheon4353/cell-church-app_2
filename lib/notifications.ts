import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 알림 핸들러 설정 (앱이 포그라운드일 때도 알림 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return false;
  }

  // Android 채널 설정
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("cell-church", {
      name: "셀 모임 알림",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleDailyBibleReminder() {
  if (Platform.OS === "web") return;

  // 기존 알림 취소
  await Notifications.cancelAllScheduledNotificationsAsync();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // 매일 오전 8시 - 말씀 확인 알림
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📖 오늘의 말씀",
      body: "오늘 말씀을 확인하셨나요? 매일성경 큐티를 시작해보세요.",
      data: { type: "bible_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  // 매일 저녁 9시 - 기도 시간 입력 알림
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🙏 기도 시간 기록",
      body: "오늘 기도 시간을 입력해보세요.",
      data: { type: "prayer_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}

export async function scheduleWeeklyProgressReminder() {
  if (Platform.OS === "web") return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  // 매주 일요일 오후 6시 - 주간 진행 알림
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 이번 주 셀 활동",
      body: "이번 주 성경 쓰기와 기도 현황을 확인해보세요!",
      data: { type: "weekly_progress" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 18,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
