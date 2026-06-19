import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { BackButton } from "../components/BackButton";
import { ImageAttachButton } from "../components/ImageAttachButton";
import { RemoteImage } from "../components/RemoteImage";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../store/authStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import { updateUserAvatarUrl } from "../lib/firebaseAuth";
import * as api from "../lib/api";
import { TAB_ROUTES } from "../utils/routes";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);

  useEffect(() => {
    setAvatarUrl(user?.avatarUrl ?? null);
  }, [user?.avatarUrl]);

  const handleAvatarUploaded = async (publicUrl: string) => {
    if (!user) return;
    try {
      if (Platform.OS === "web") {
        const updated = await api.updateAvatarUrl(publicUrl);
        await setSession({
          id: updated.id,
          email: updated.email,
          name: updated.name,
          avatarUrl: updated.avatarUrl ?? null,
        });
      } else {
        await updateUserAvatarUrl(user.id, publicUrl);
        await setSession({ ...user, avatarUrl: publicUrl });
      }
      setAvatarUrl(publicUrl);
      Alert.alert("Listo", "Foto de perfil actualizada");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo guardar la foto",
      );
    }
  };

  return (
    <PageTransition variant="fade">
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <BackButton fallback={TAB_ROUTES.index} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Perfil
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.accentLight }]}>
            {avatarUrl ? (
              <RemoteImage
                uri={avatarUrl}
                style={styles.avatar}
                recyclingKey={avatarUrl}
              />
            ) : (
              <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                {(user?.name?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}
              </Text>
            )}
          </View>

          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {user?.name || "Sin nombre"}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>

          <ImageAttachButton
            label="Cambiar foto de perfil"
            folder="avatars"
            onUploaded={handleAvatarUploaded}
            variant="primary"
          />
        </View>
      </ScrollView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { ...typography.h2 },
  card: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: { width: 120, height: 120 },
  avatarInitial: { fontSize: 40, fontWeight: "700" },
  name: { ...typography.h3 },
  email: { ...typography.body },
});
