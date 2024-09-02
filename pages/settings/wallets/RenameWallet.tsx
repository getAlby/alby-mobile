import { router } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";

export function RenameWallet() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const [walletName, setWalletName] = React.useState(
    wallets[selectedWalletId].name || ""
  );
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 flex flex-col p-6 gap-3">
        <Screen
          title="Wallet Name"
        />
        <View className="flex-1 flex flex-col items-center justify-center">
          <Text className="text-muted-foreground text-center">Wallet Name</Text>
          <Input
            autoFocus
            className="w-full text-center border-transparent bg-transparent native:text-2xl"
            placeholder={DEFAULT_WALLET_NAME}
            value={walletName}
            onChangeText={setWalletName}
          // aria-errormessage="inputError"
          />
        </View>
        <Button
          size="lg"
          onPress={() => {
            useAppStore.getState().updateCurrentWallet({
              name: walletName,
            });
            Toast.show({
              type: "success",
              text1: "Wallet name updated"
            });
            router.back();
          }}
        >
          <Text>Save</Text>
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
