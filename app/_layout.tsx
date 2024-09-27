import "../lib/applyGlobalPolyfills";

import "~/global.css";
import { Theme, ThemeProvider } from "@react-navigation/native";
import {
  router,
  SplashScreen,
  Stack,
  useRootNavigationState,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import PolyfillCrypto from "react-native-webview-crypto";
import { SWRConfig } from "swr";
import { swrConfiguration } from "lib/swr";
import Toast from "react-native-toast-message";
import { toastConfig } from "~/components/ToastConfig";
import * as Font from "expo-font";
import { useInfo } from "~/hooks/useInfo";
import { secureStorage } from "~/lib/secureStorage";
import { hasOnboardedKey, useAppStore } from "~/lib/state/appStore";
import { usePathname } from "expo-router";
import { UserInactivityProvider } from "~/context/UserInactivity";
import { PortalHost } from "@rn-primitives/portal";
import { isBiometricSupported } from "~/lib/isBiometricSupported";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

// export const unstable_settings = {
//   initialRouteName: "index",
// };

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [checkedOnboarding, setCheckedOnboarding] = React.useState(false);
  const isUnlocked = useAppStore((store) => store.unlocked);
  const pathname = usePathname();
  useConnectionChecker();

  const rootNavigationState = useRootNavigationState();
  const hasNavigationState = !!rootNavigationState?.key;

  async function checkOnboardingStatus() {
    const hasOnboarded = await secureStorage.getItem(hasOnboardedKey);
    if (!hasOnboarded && hasNavigationState) {
      router.replace("/onboarding");
    }

    setCheckedOnboarding(true);
  }

  async function loadFonts() {
    await Font.loadAsync({
      OpenRunde: require("./../assets/fonts/OpenRunde-Regular.otf"),
      "OpenRunde-Medium": require("./../assets/fonts/OpenRunde-Medium.otf"),
      "OpenRunde-Semibold": require("./../assets/fonts/OpenRunde-Semibold.otf"),
      "OpenRunde-Bold": require("./../assets/fonts/OpenRunde-Bold.otf"),
    });

    setFontsLoaded(true);
  }

  async function checkBiometricStatus() {
    const isSupported = await isBiometricSupported();
    if (!isSupported) {
      useAppStore.getState().setSecurityEnabled(false);
    }
  }

  React.useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          checkOnboardingStatus(),
          loadFonts(),
          checkBiometricStatus(),
        ]);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    init();
  }, [hasNavigationState]);

  React.useEffect(() => {
    if (hasNavigationState && !isUnlocked) {
      if (pathname !== "/unlock") {
        router.push("/unlock");
      }
    }
  }, [isUnlocked, hasNavigationState]);

  if (!fontsLoaded || !checkedOnboarding) {
    return null;
  }

  return (
    <SWRConfig value={swrConfiguration}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <PolyfillCrypto />
        <SafeAreaView className="w-full h-full bg-background">
          <UserInactivityProvider>
            <Stack />
          </UserInactivityProvider>
          <Toast
            config={toastConfig}
            position="bottom"
            bottomOffset={140}
            topOffset={140}
          />
          <PortalHost />
        </SafeAreaView>
      </ThemeProvider>
    </SWRConfig>
  );
}

function useConnectionChecker() {
  const { error } = useInfo();
  React.useEffect(() => {
    if (error?.message) {
      Toast.show({
        type: "connectionError",
        text1: error.message,
      });
    }
  }, [error?.message]);
}
