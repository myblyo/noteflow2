import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import { useThemeColors } from "../hooks/useTheme";

type RemoteImageProps = {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  placeholder?: React.ReactNode;
  recyclingKey?: string;
};

/**
 * Imagen remota con caché (expo-image) y placeholder mientras descarga desde S3/AWS.
 */
export function RemoteImage({
  uri,
  style,
  contentFit = "cover",
  placeholder,
  recyclingKey,
}: RemoteImageProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(Boolean(uri));

  if (!uri) {
    return (
      <View style={[styles.fallback, style, { backgroundColor: colors.accentLight }]}>
        {placeholder ?? (
          <ActivityIndicator size="small" color={colors.accent} />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        transition={200}
        recyclingKey={recyclingKey ?? uri}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading ? (
        <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.accent} />
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
