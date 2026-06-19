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
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useThemeColors } from "../hooks/useTheme";
import { spacing, radius, typography } from "../constants/theme";
import { PageTransition } from "../components/PageTransition";

export default function LoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const auth = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      await auth.login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      /* error en authStore */
    }
  };

  return (
    <PageTransition variant="fade">
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Noteflow
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Inicia sesión para ver tus notas
          </Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            ¿Primera vez? Pulsa «Crear cuenta».
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
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <View
            style={[
              styles.passwordRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: colors.textPrimary }]}
              placeholder="Contraseña"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPressIn={() => setShowPassword(true)}
              onPressOut={() => setShowPassword(false)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Mostrar contraseña"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          {auth.error ? (
            <Text style={[styles.error, { color: colors.error }]}>{auth.error}</Text>
          ) : null}

          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handleLogin}
            disabled={auth.isLoading}
          >
            <Text style={styles.buttonText}>
              {auth.isLoading ? "Entrando..." : "Entrar"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/register")}>
            <Text style={[styles.link, { color: colors.accent }]}>
              Crear cuenta
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
  title: { ...typography.h1, textAlign: "center" },
  subtitle: { ...typography.body, textAlign: "center" },
  hint: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    paddingRight: spacing.sm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
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
