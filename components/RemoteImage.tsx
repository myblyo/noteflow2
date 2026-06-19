import React, { createElement, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useTheme";
import { resolveMediaUrl } from "../lib/mediaUrl";

type RemoteImageProps = {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  placeholder?: React.ReactNode;
  recyclingKey?: string;
  /** Ocultar spinner de carga (útil en avatares pequeños). */
  showLoading?: boolean;
  /** Ocultar overlay de error (útil en avatares con fallback externo). */
  showErrorOverlay?: boolean;
};

function flattenSize(style: StyleProp<ViewStyle>): { width?: number; height?: number; borderRadius?: number } {
  const flat = StyleSheet.flatten(style) ?? {};
  return {
    width: typeof flat.width === "number" ? flat.width : undefined,
    height: typeof flat.height === "number" ? flat.height : undefined,
    borderRadius: typeof flat.borderRadius === "number" ? flat.borderRadius : undefined,
  };
}

/**
 * Imagen remota con caché y placeholder. En web usa <img> nativo (mejor con S3).
 */
export function RemoteImage({
  uri,
  style,
  contentFit = "cover",
  placeholder,
  recyclingKey,
  showLoading = true,
  showErrorOverlay = true,
}: RemoteImageProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(showLoading && Boolean(uri));
  const [failed, setFailed] = useState(false);
  const displayUri = resolveMediaUrl(uri) ?? uri;

  useEffect(() => {
    setLoading(showLoading && Boolean(displayUri));
    setFailed(false);
  }, [displayUri, showLoading]);

  const markLoaded = () => {
    setFailed(false);
    setLoading(false);
  };

  const markFailed = () => {
    setLoading(false);
    setFailed(true);
  };

  const checkAlreadyLoaded = (node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      markLoaded();
    }
  };

  if (!uri) {
    return (
      <View style={[styles.fallback, style, { backgroundColor: colors.accentLight }]}>
        {placeholder ?? (
          <ActivityIndicator size="small" color={colors.accent} />
        )}
      </View>
    );
  }

  if (Platform.OS === "web") {
    const size = flattenSize(style);
    const objectFit = contentFit === "contain" ? "contain" : "cover";
    return (
      <View style={[styles.wrap, style]}>
        {createElement("img", {
          key: recyclingKey ?? displayUri,
          src: displayUri,
          alt: "",
          ref: checkAlreadyLoaded,
          onLoad: markLoaded,
          onError: markFailed,
          style: {
            width: size.width ?? "100%",
            height: size.height ?? "100%",
            objectFit,
            borderRadius: size.borderRadius,
            display: "block",
          },
        })}
        {showLoading && loading && !failed ? (
          <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : null}
        {showErrorOverlay && failed ? (
          <View style={[styles.overlay, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="image-outline" size={22} color={colors.textTertiary} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={{ uri: displayUri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        transition={200}
        recyclingKey={recyclingKey ?? displayUri}
        onLoadStart={() => {
          if (!showLoading) return;
          setFailed(false);
          setLoading(true);
        }}
        onLoad={markLoaded}
        onError={markFailed}
      />
      {showLoading && loading ? (
        <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      ) : null}
      {showErrorOverlay && failed ? (
        <View style={[styles.overlay, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="image-outline" size={22} color={colors.textTertiary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85,
  },
});
