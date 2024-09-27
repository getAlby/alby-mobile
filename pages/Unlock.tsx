import { router, Stack } from "expo-router";
import React from "react";
import { View, Image } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function Unlock() {
  const [isUnlocking, setIsUnlocking] = React.useState(false);

  const handleUnlock = async () => {
    try {
      setIsUnlocking(true);
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock Alby Go",
      });
      if (biometricAuth.success) {
        useAppStore.getState().setUnlocked(true);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/");
        }
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  React.useEffect(() => {
    handleUnlock();
  }, []);

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: "Unlock",
          headerShown: false,
        }}
      />
      <View className="flex-1 flex items-center justify-center gap-4">
        <Image
          source={require("./../assets/logo.png")}
          className="mb-10 w-52 h-52 object-contain"
        />
        <Text className="font-semibold2 text-4xl text-center text-foreground">
          Unlock to continue
        </Text>
      </View>
      <Button size="lg" onPress={handleUnlock} disabled={isUnlocking}>
        <Text>{isUnlocking ? "Unlocking..." : "Unlock Wallet"}</Text>
      </Button>
    </View>
  );
}
