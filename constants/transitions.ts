import { Easing } from "react-native";

/** Curva suave tipo ease-in-out, sin rebote */
export const SMOOTH_EASING = Easing.bezier(0.4, 0, 0.2, 1);

export const TRANSITION = {
  duration: 380,
  durationFast: 260,
  /** Desplazamiento mínimo — casi solo fade */
  drift: 6,
} as const;
