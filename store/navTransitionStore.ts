import { create } from "zustand";

export type SlideDirection = "forward" | "back" | "neutral";

interface NavTransitionState {
  slideDirection: SlideDirection;
  setSlideDirection: (direction: SlideDirection) => void;
  setSlideByTabIndex: (fromIndex: number, toIndex: number) => void;
}

export const useNavTransitionStore = create<NavTransitionState>((set) => ({
  slideDirection: "neutral",
  setSlideDirection: (direction) => set({ slideDirection: direction }),
  setSlideByTabIndex: (fromIndex, toIndex) =>
    set({
      slideDirection:
        toIndex > fromIndex
          ? "forward"
          : toIndex < fromIndex
            ? "back"
            : "neutral",
    }),
}));
