import { useMemo } from "react";
import { useWindowDimensions, ViewStyle } from "react-native";

import { spacing } from "../constants/theme";
import { getDeviceSize, type DeviceSize } from "../constants/breakpoints";

function scaleByDevice(
  deviceSize: DeviceSize,
  values: Record<DeviceSize, number>,
): number {
  return values[deviceSize];
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const deviceSize = getDeviceSize(width);

  return useMemo(() => {
    const isMobile = deviceSize === "mobile";
    const isTablet = deviceSize === "tablet";
    const isDesktop = deviceSize === "desktop";
    const isWide = deviceSize === "wide";
    const isXL = deviceSize === "xl";
    const isLargeScreen = isDesktop || isWide || isXL;

    const pagePadding = scaleByDevice(deviceSize, {
      mobile: spacing.md,
      tablet: spacing.xl,
      desktop: spacing.xl,
      wide: 28,
      xl: 40,
    });

    const contentMaxWidth = scaleByDevice(deviceSize, {
      mobile: width,
      tablet: 1024,
      desktop: 1280,
      wide: 1600,
      xl: 1920,
    });

    const dashboardGap = scaleByDevice(deviceSize, {
      mobile: spacing.md,
      tablet: spacing.xl,
      desktop: spacing.xl,
      wide: 28,
      xl: spacing.xxl + 16,
    });

    const sidePanelWidth = isMobile
      ? undefined
      : isTablet
        ? Math.min(300, width * 0.28)
        : isDesktop
          ? Math.min(340, width * 0.22)
          : isWide
            ? Math.min(400, width * 0.2)
            : Math.min(440, width * 0.18);

    const tabBarOffset = spacing.lg;

    const baseContent: ViewStyle = {
      flex: 1,
      width: "100%",
      maxWidth: contentMaxWidth,
      alignSelf: "center",
      paddingHorizontal: pagePadding,
      paddingBottom: tabBarOffset,
    };

    const shellBody: ViewStyle = { ...baseContent };

    const dashboardBody: ViewStyle = {
      ...baseContent,
      flexDirection: isMobile ? "column" : "row",
      gap: dashboardGap,
    };

    const toolbarContainer: ViewStyle = {
      paddingHorizontal: pagePadding,
      maxWidth: contentMaxWidth,
      width: "100%",
      alignSelf: "center",
    };

    const tabBarMargin = scaleByDevice(deviceSize, {
      mobile: 5,
      tablet: 15,
      desktop: 22,
      wide: 28,
      xl: 32,
    });

    const tabBarMaxWidth = isMobile
      ? undefined
      : scaleByDevice(deviceSize, {
          tablet: 520,
          desktop: 600,
          wide: 680,
          xl: 760,
          mobile: 0,
        });

    const tabBarStyle: ViewStyle = {
      marginHorizontal: `${tabBarMargin}%`,
      marginBottom: isMobile ? spacing.lg : spacing.xl,
      maxWidth: tabBarMaxWidth,
      alignSelf: "center",
      width: isMobile ? undefined : "100%",
      height: isMobile ? 60 : isXL ? 68 : 64,
      borderRadius: 32,
    };

    const modalMaxWidth = scaleByDevice(deviceSize, {
      mobile: width,
      tablet: 600,
      desktop: 720,
      wide: 800,
      xl: 880,
    });

    const editorTitleSize = scaleByDevice(deviceSize, {
      mobile: 32,
      tablet: 40,
      desktop: 48,
      wide: 52,
      xl: 56,
    });

    const editorBodySize = scaleByDevice(deviceSize, {
      mobile: 16,
      tablet: 17,
      desktop: 18,
      wide: 19,
      xl: 20,
    });

    const listContainerFlex: ViewStyle = isMobile
      ? { flex: 1, minHeight: 280 }
      : { flex: 1 };

    const centerPanelMinHeight = isMobile ? 320 : isLargeScreen ? 400 : undefined;

    const centerPanelPadding = scaleByDevice(deviceSize, {
      mobile: spacing.md,
      tablet: spacing.lg,
      desktop: spacing.xl,
      wide: 28,
      xl: 36,
    });

    return {
      width,
      height,
      deviceSize,
      isMobile,
      isTablet,
      isDesktop,
      isWide,
      isXL,
      isLargeScreen,
      pagePadding,
      contentMaxWidth,
      dashboardGap,
      sidePanelWidth,
      shellBody,
      dashboardBody,
      toolbarContainer,
      tabBarStyle,
      modalMaxWidth,
      editorTitleSize,
      editorBodySize,
      listContainerFlex,
      centerPanelMinHeight,
      centerPanelPadding,
      tabBarOffset,
    };
  }, [width, height, deviceSize]);
}

export type ResponsiveLayout = ReturnType<typeof useResponsive>;
