import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, useSegments } from "expo-router";
import { trpc } from "@/lib/trpc";

type ApprovalStatus = "pending" | "approved" | "rejected" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  approvalStatus: ApprovalStatus;
  isLeader: boolean;
  displayName: string | null;
  userId: number | null;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  approvalStatus: null,
  isLeader: false,
  displayName: null,
  userId: null,
  refreshProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();

  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false });
  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: !!meQuery.data,
    retry: false,
  });

  const isAuthenticated = !!meQuery.data;
  const isLoading = meQuery.isLoading || (isAuthenticated && profileQuery.isLoading);
  const approvalStatus = (profileQuery.data?.approvalStatus ?? null) as ApprovalStatus;
  const isLeader = profileQuery.data?.isLeader ?? false;
  const displayName = profileQuery.data?.displayName ?? meQuery.data?.name ?? null;
  const userId = meQuery.data?.id ?? null;

  const refreshProfile = useCallback(() => {
    profileQuery.refetch();
  }, [profileQuery]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === "(auth)";
    const inTabsGroup = (segments[0] as string) === "(tabs)";

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace("/(auth)/onboarding" as never);
      return;
    }

    // 인증됨 - 프로필 없으면 회원가입으로
    if (!profileQuery.data && !profileQuery.isLoading) {
      if (!inAuthGroup) router.replace("/(auth)/register" as never);
      return;
    }

    if (profileQuery.data) {
      if (approvalStatus === "pending" || approvalStatus === "rejected") {
        if (!inAuthGroup) router.replace("/(auth)/pending" as never);
        return;
      }
      if (approvalStatus === "approved") {
        if (inAuthGroup) router.replace("/(tabs)" as never);
        return;
      }
    }
  }, [isAuthenticated, isLoading, approvalStatus, profileQuery.data, profileQuery.isLoading, segments]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, approvalStatus, isLeader, displayName, userId, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
