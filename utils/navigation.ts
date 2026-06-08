import type { Href } from "expo-router";
import type { useRouter } from "expo-router";

import { useNavTransitionStore } from "../store/navTransitionStore";

type AppRouter = ReturnType<typeof useRouter>;

export function setSlideForward() {
  useNavTransitionStore.getState().setSlideDirection("forward");
}

export function setSlideBack() {
  useNavTransitionStore.getState().setSlideDirection("back");
}

export function navigateForward(router: AppRouter, href: Href) {
  setSlideForward();
  router.push(href);
}

export function goBack(router: AppRouter, fallback: Href) {
  setSlideBack();
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
