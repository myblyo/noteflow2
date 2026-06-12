import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 3000;
const API_PATH = "/api";

/** IP/host del PC donde corre Metro (ej. 192.168.1.28). Null en release builds. */
function getDevServerHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.linkingUri;

  if (!hostUri) return null;

  const withoutProtocol = hostUri.replace(/^[a-z]+:\/\//i, "");
  const host = withoutProtocol.split(":")[0]?.split("/")[0];
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }
  return host;
}

/** URL base de la API según plataforma (web / emulador / móvil físico). */
export function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  const devHost = getDevServerHost();

  if (Platform.OS === "web") {
    if (configured?.includes("10.0.2.2")) {
      return configured.replace("10.0.2.2", "localhost");
    }
    return configured ?? `http://localhost:${API_PORT}${API_PATH}`;
  }

  if (Platform.OS === "android") {
    if (devHost) {
      const useLan =
        !configured ||
        configured.includes("10.0.2.2") ||
        configured.includes("localhost");
      if (useLan) {
        return `http://${devHost}:${API_PORT}${API_PATH}`;
      }
    }

    if (!configured) {
      return `http://10.0.2.2:${API_PORT}${API_PATH}`;
    }

    return configured;
  }

  // iOS sim → localhost; dispositivo físico → IP del Mac vía Metro
  if (devHost && (!configured || configured.includes("localhost"))) {
    return `http://${devHost}:${API_PORT}${API_PATH}`;
  }

  return configured ?? `http://localhost:${API_PORT}${API_PATH}`;
}
