import * as React from "react";
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from "react-native";
import { secureStorage } from "~/lib/secureStorage";
import { INACTIVITY_THRESHOLD } from "~/lib/constants";
import { lastActiveTimeKey, useAppStore } from "~/lib/state/appStore";

export const UserInactivityProvider = ({ children }: any) => {
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState,
  );
  const isSecurityEnabled = useAppStore((store) => store.isSecurityEnabled);

  const handleAppStateChange = async (nextState: AppStateStatus) => {
    if (appState === "active" && nextState.match(/inactive|background/)) {
      const now = Date.now();
      secureStorage.setItem(lastActiveTimeKey, now.toString());
    } else if (
      appState.match(/inactive|background/) &&
      nextState === "active"
    ) {
      const lastActiveTime = secureStorage.getItem(lastActiveTimeKey);
      if (lastActiveTime) {
        const timeElapsed = Date.now() - parseInt(lastActiveTime, 10);
        if (timeElapsed >= INACTIVITY_THRESHOLD) {
          useAppStore.getState().setUnlocked(false);
        }
      }
      await secureStorage.removeItem(lastActiveTimeKey);
    }
    setAppState(nextState);
  };

  React.useEffect(() => {
    let subscription: NativeEventSubscription;
    if (isSecurityEnabled) {
      subscription = AppState.addEventListener("change", handleAppStateChange);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [appState, isSecurityEnabled]);

  return children;
};
