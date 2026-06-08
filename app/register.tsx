import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { useNotesStore } from "../store/noteStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import { PageTransition } from "../components/PageTransition";

export default function RegisterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const auth = useAuthStore();
  const fetchNotes = useNotesStore((s) => s.fetchNotes);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await auth.register(name.trim(), email.trim(), password);
    await fetchNotes();
    router.replace("/(tabs)");
  };

  return (
    <PageTransition variant="fade">
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Crear cuenta
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="Nombre"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="Contraseña (mín. 6)"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {auth.error ? (
            <Text style={[styles.error, { color: colors.error }]}>{auth.error}</Text>
          ) : null}

          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handleRegister}
            disabled={auth.isLoading}
          >
            <Text style={styles.buttonText}>
              {auth.isLoading ? "Creando..." : "Registrarse"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={[styles.link, { color: colors.accent }]}>
              Ya tengo cuenta
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", padding: spacing.xl },
  card: { gap: spacing.md },
  title: { ...typography.h1, textAlign: "center", marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { textAlign: "center", marginTop: spacing.md },
  error: { textAlign: "center" },
});
