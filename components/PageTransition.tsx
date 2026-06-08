import React, { useCallback, useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { usePathname } from "expo-router";

import { SMOOTH_EASING, TRANSITION } from "../constants/transitions";
import type { TabRouteName } from "../utils/routes";

type PageTransitionVariant = "tab" | "stack" | "fade";

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: PageTransitionVariant;
  routeKey?: TabRouteName;
  style?: StyleProp<ViewStyle>;
}

function isTabRouteActive(pathname: string, routeKey: TabRouteName) {
  if (routeKey === "index") {
    return (
      pathname === "/(tabs)" ||
      pathname.endsWith("/index") ||
      pathname === "/" ||
      pathname === "/(tabs)/"
    );
  }
  return pathname.includes(`/${routeKey}`);
}

export function PageTransition({
  children,
  variant = "tab",
  routeKey,
  style,
}: PageTransitionProps) {
  const pathname = usePathname();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(TRANSITION.drift)).current;

  const playEnter = useCallback(() => {
    const drift =
      variant === "fade" ? TRANSITION.drift * 1.5 : TRANSITION.drift;

    opacity.setValue(0.92);
    translateY.setValue(drift);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: TRANSITION.duration,
        easing: SMOOTH_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: TRANSITION.duration,
        easing: SMOOTH_EASING,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, variant]);

  useEffect(() => {
    if (variant === "tab") {
      if (!routeKey || !isTabRouteActive(pathname, routeKey)) return;
      playEnter();
      return;
    }
    playEnter();
  }, [pathname, routeKey, variant, playEnter]);

  return (
    <Animated.View
      style={[
        { flex: 1, opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
