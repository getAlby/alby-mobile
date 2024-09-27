import { openURL } from "expo-linking";
import { Link, Stack, router } from "expo-router";
import React from "react";
import { View, Image } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { secureStorage } from "~/lib/secureStorage";
import { hasOnboardedKey } from "~/lib/state/appStore";

export function Onboarding() {
  async function finish() {
    secureStorage.setItem(hasOnboardedKey, "true");
    router.replace("/");
  }

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: "Onboarding",
          headerShown: false,
        }}
      />
      <View className="flex-1 flex items-center justify-center gap-4">
        <Image
          source={require("./../assets/logo.png")}
          className="mb-10 w-52 h-52 object-contain"
        />
        <Text className="font-semibold2 text-4xl text-center text-foreground">
          Hello there 👋
        </Text>
        <Text className="font-medium2 text-xl text-muted-foreground text-center">
          <Text className="font-semibold2 text-xl text-muted-foreground">
            Alby Go
          </Text>{" "}
          works best with Alby Hub and is the easiest way to use Bitcoin
          wherever you are.
        </Text>
      </View>
      <Link href="/" asChild>
        <Button size="lg" onPress={finish}>
          <Text>Connect Wallet</Text>
        </Button>
      </Link>
      <Button
        variant="secondary"
        size="lg"
        onPress={() => openURL("https://albyhub.com/")}
      >
        <Text>Learn more</Text>
      </Button>
    </View>
  );
}
