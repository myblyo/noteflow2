import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { BackButton } from "../components/BackButton";
import { ImageAttachButton } from "../components/ImageAttachButton";
import { RemoteImage } from "../components/RemoteImage";
import { PageTransition } from "../components/PageTransition";
import { useAuthStore } from "../store/authStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import { updateUserProfile } from "../lib/firebaseAuth";
import * as api from "../lib/api";
import { TAB_ROUTES } from "../utils/routes";

function mergeProfile(
  user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>,
  updated: api.AuthResponse["user"],
  fallbackBio: string,
): NonNullable<ReturnType<typeof useAuthStore.getState>["user"]> {
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    bio: updated.bio ?? fallbackBio,
    avatarUrl: updated.avatarUrl ?? user.avatarUrl,
  };
}

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const logout = useAuthStore((s) => s.logout);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      void refreshUser();
    }
  }, [refreshUser]);

  useEffect(() => {
    setBio(user?.bio ?? "");
  }, [user?.bio]);

  const savedAvatarUrl = user?.avatarUrl ?? null;
  const displayAvatarUrl = previewAvatarUrl ?? savedAvatarUrl;
  const bioChanged = bio.trim() !== (user?.bio ?? "");
  const hasChanges = bioChanged;

  const handleAvatarUploaded = async (publicUrl: string) => {
    if (!user) return;

    setPreviewAvatarUrl(publicUrl);
    setSaving(true);
    try {
      if (Platform.OS === "web") {
        const updated = await api.updateProfile({ avatarUrl: publicUrl });
        await setSession(mergeProfile(user, updated, bio.trim()));
      } else {
        await updateUserProfile(user.id, { avatarUrl: publicUrl });
        await setSession({ ...user, avatarUrl: publicUrl });
      }
      setPreviewAvatarUrl(null);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo guardar la foto",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPreview = (localUri: string) => {
    setPreviewAvatarUrl(localUri);
  };

  const handleSave = async () => {
    if (!user || !hasChanges) return;
    setSaving(true);
    try {
      if (Platform.OS === "web") {
        const updated = await api.updateProfile({ bio: bio.trim() });
        await setSession(mergeProfile(user, updated, bio.trim()));
      } else {
        await updateUserProfile(user.id, { bio: bio.trim() });
        await setSession({ ...user, bio: bio.trim() });
      }
      Alert.alert("Listo", "Cambios guardados");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudieron guardar los cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  const performLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (globalThis.confirm?.("¿Quieres salir de tu cuenta?")) {
        void performLogout();
      }
      return;
    }

    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          void performLogout();
        },
      },
    ]);
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
            {displayAvatarUrl ? (
              <RemoteImage
                uri={displayAvatarUrl}
                style={styles.avatar}
                recyclingKey={displayAvatarUrl}
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

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Biografía
          </Text>
          <TextInput
            style={[
              styles.bioInput,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Cuéntanos algo sobre ti..."
            placeholderTextColor={colors.textTertiary}
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />

          <ImageAttachButton
            label="Cambiar foto de perfil"
            folder="avatars"
            onPreview={handleAvatarPreview}
            onUploaded={handleAvatarUploaded}
            variant="secondary"
          />

          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: hasChanges ? colors.accent : colors.surfaceSecondary,
                opacity: hasChanges && !saving ? 1 : 0.55,
              },
            ]}
            onPress={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.actionButtonText,
                  { color: hasChanges ? "#fff" : colors.textSecondary },
                ]}
              >
                Guardar cambios
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              styles.logoutButton,
              { borderColor: colors.error },
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, { color: colors.error }]}>
              Cerrar sesión
            </Text>
          </Pressable>
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
    alignItems: "stretch",
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
    alignSelf: "center",
  },
  avatar: { width: 120, height: 120 },
  avatarInitial: { fontSize: 40, fontWeight: "700" },
  name: { ...typography.h3, textAlign: "center" },
  email: { ...typography.body, textAlign: "center", marginBottom: spacing.sm },
  label: { ...typography.caption, fontWeight: "600" },
  bioInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
  },
  actionButton: {
    width: "100%",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
});
