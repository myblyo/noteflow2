import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ThemeMode } from "../constants/theme";

interface ThemeStore {
  /** User preference: "light" | "dark" | "system" */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "light",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "noteflow-theme",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
