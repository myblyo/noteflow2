/** Anchos mínimos para cada tamaño de pantalla */
export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  xl: 1536,
  xxl: 1920,
} as const;

export type DeviceSize = "mobile" | "tablet" | "desktop" | "wide" | "xl";

export function getDeviceSize(width: number): DeviceSize {
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.wide) return "wide";
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}
