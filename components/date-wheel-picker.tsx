import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface DateWheelPickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  minYear?: number;
  maxYear?: number;
}

export function DateWheelPicker({
  value,
  onChange,
  minYear = 1950,
  maxYear = new Date().getFullYear(),
}: DateWheelPickerProps) {
  const colors = useColors();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  // 초기값 파싱
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, []);

  // 날짜 변경 시 콜백
  useEffect(() => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
  }, [year, month, day]);

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };

  const maxDay = getDaysInMonth(year, month);

  const renderWheel = (
    items: number[],
    selected: number,
    onSelect: (value: number) => void,
    label: string
  ) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const itemHeight = 40;

    useEffect(() => {
      const index = items.indexOf(selected);
      if (index >= 0 && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: index * itemHeight - itemHeight,
            animated: false,
          });
        }, 0);
      }
    }, []);

    return (
      <View style={styles.wheelContainer}>
        <Text style={[styles.wheelLabel, { color: colors.muted }]}>{label}</Text>
        <View style={[styles.wheelBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <ScrollView
            ref={scrollViewRef}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / itemHeight);
              const newValue = items[Math.max(0, Math.min(index, items.length - 1))];
              onSelect(newValue);
            }}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: itemHeight }}
          >
            {items.map((item) => (
              <View key={item} style={{ height: itemHeight, justifyContent: "center" }}>
                <Text
                  style={[
                    styles.wheelItem,
                    {
                      color: item === selected ? colors.primary : colors.muted,
                      fontWeight: item === selected ? "700" : "400",
                    },
                  ]}
                >
                  {String(item).padStart(2, "0")}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.wheelsRow}>
        {renderWheel(years, year, setYear, "년")}
        {renderWheel(months, month, setMonth, "월")}
        {renderWheel(days, day, setDay, "일")}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  wheelsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  wheelContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  wheelLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  wheelBox: {
    width: 80,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  wheelItem: {
    fontSize: 18,
    textAlign: "center",
  },
});
