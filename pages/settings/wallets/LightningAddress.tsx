import { router } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";

export function LightningAddress() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const [lightningAddress, setLightningAddress] = React.useState("");
  React.useEffect(() => {
    setLightningAddress(wallets[selectedWalletId].lightningAddress || "");
  }, [wallets, selectedWalletId]);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 flex flex-col">
        <View className="flex-1 flex flex-col p-3 gap-3">
          <Screen
            title="Lightning Address"
          />
          <View className="flex-1 flex flex-col items-center justify-center">
            <Text className="text-muted-foreground text-center">Lightning Address</Text>
            <Input
              autoComplete="email"
              inputMode="email"
              autoFocus
              className="w-full text-center border-transparent bg-transparent native:text-2xl font-semibold2"
              placeholder="hello@getalby.com"
              value={lightningAddress}
              onChangeText={setLightningAddress}
            // aria-errormessage="inputError"
            />
          </View>
        </View>
        <View className="p-6">
          <Button
            size="lg"
            onPress={() => {
              useAppStore.getState().updateCurrentWallet({ lightningAddress });
              Toast.show({
                type: "success",
                text1: "Lightning address updated",
              });
              router.back();
            }}
          >
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
