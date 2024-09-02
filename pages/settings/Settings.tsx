import { Link, router } from "expo-router";
import { Alert, Pressable, TouchableOpacity, View } from "react-native";
import { Bitcoin, Egg, Palette, Power, Wallet2 } from "~/components/Icons";

import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { Text } from "~/components/ui/text";
import React from "react";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { useColorScheme } from "~/lib/useColorScheme";
import Screen from "~/components/Screen";

export function Settings() {
  const wallet = useAppStore((store) => store.wallets[store.selectedWalletId]);
  const [developerCounter, setDeveloperCounter] = React.useState(0);
  const [developerMode, setDeveloperMode] = React.useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 flex flex-col p-6 gap-6">
      <Screen
        title="Settings"
      />
      <Link href="/settings/wallets" asChild>
        <TouchableOpacity className="flex flex-row items-center gap-4">
          <Wallet2 className="text-foreground" />
          <Text className="font-medium2 text-xl text-foreground">Wallets</Text>
          <Text className="text-muted-foreground text-xl">
            ({wallet.name || DEFAULT_WALLET_NAME})
          </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/settings/fiat-currency" asChild>
        <TouchableOpacity className="flex flex-row gap-4">
          <Bitcoin className="text-foreground" />
          <Text className="text-foreground font-medium2 text-xl">
            Units & Currency
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        className="flex flex-row gap-4"
        onPress={toggleColorScheme}
      >
        <Palette className="text-foreground" />
        <Text className="text-foreground font-medium2 text-xl">Theme</Text>
        <Text className="text-muted-foreground text-xl">
          ({colorScheme.charAt(0).toUpperCase() + colorScheme.substring(1)})
        </Text>
      </TouchableOpacity>

      {developerMode && (
        <>
          <View className="mt-5 flex flex-col gap-6">
            <Text className="text-muted-foreground uppercase">
              Developer mode
            </Text>
            <Pressable
              className="flex flex-row gap-4"
              onPress={() => {
                router.dismissAll();
                useAppStore.getState().showOnboarding();
                router.replace("/onboarding");
              }}
            >
              <Egg className="text-foreground" />
              <Text className="font-medium2 text-xl">Open Onboarding</Text>
            </Pressable>
            <Pressable
              className="flex flex-row gap-4"
              onPress={() => {
                Alert.alert(
                  "Reset",
                  "Are you sure you want to reset? You will be signed out of all your wallets. Your connection secrets and address book will be lost.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Confirm",
                      onPress: () => {
                        router.dismissAll();
                        useAppStore.getState().reset();
                      },
                    },
                  ],
                );
              }}
            >
              <Power className="text-destructive" />
              <Text className="text-destructive font-medium2 text-xl">
                Reset Wallet
              </Text>
            </Pressable>
          </View>
        </>
      )}
      <TouchableOpacity
        className="flex-1"
        onPress={() => {
          const newCounter = developerCounter + 1;
          setDeveloperCounter(newCounter);

          if (newCounter === 5) {
            setDeveloperMode(true);
            Toast.show({
              text1: "You are now a developer",
            });
          } else if (newCounter > 1 && newCounter < 5) {
            Toast.show({
              text1: `Tap ${5 - newCounter} more times`,
            });
          }
        }}
      >
        <View className="flex-1 flex-col items-center justify-end">
          <Text className="text-foreground">Alby Go v{Constants.expoConfig?.version}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
