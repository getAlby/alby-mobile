import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Toast from "react-native-toast-message";

export function NameWallet() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const [name, setName] = React.useState(
    wallets[selectedWalletId].name || ""
  );

  return (
    <DismissableKeyboardView>
      <View className="flex-1 p-6">
        <Screen
          title="Name Wallet"
        />
        <View className="flex-1 flex flex-col gap-3 items-center justify-center">
          <Label nativeID="name" className="text-muted-foreground text-center">
            Wallet name
          </Label>
          <Input
            autoFocus
            className="w-full border-transparent bg-transparent native:text-2xl text-center"
            value={name}
            onChangeText={setName}
            aria-labelledbyledBy="name"
            placeholder="Enter a name for your wallet"
            returnKeyType="done"
          // aria-errormessage="inputError"
          />
        </View>
        <Button
          size="lg"
          onPress={() => {
            useAppStore.getState().updateCurrentWallet({ name });
            Toast.show({
              type: "success",
              text1: "Wallet Connected",
              text2: "Your lightning wallet is ready to use",
              position: "top"
            });
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace("/");
          }}
        >
          <Text>Continue</Text>
        </Button>
      </View>
    </DismissableKeyboardView>
  );
}
