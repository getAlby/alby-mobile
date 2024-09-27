import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";

export function NewWallet() {
  const [name, setName] = React.useState("");
  return (
    <DismissableKeyboardView>
      <View className="flex-1 p-6">
        <Screen title="Connect Wallet" />
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
            useAppStore.getState().addWallet({ name });
            Toast.show({
              type: "success",
              text1: "New wallet created",
              text2: "Please configure your wallet connection",
            });
            router.dismissAll();
          }}
        >
          <Text>Continue</Text>
        </Button>
      </View>
    </DismissableKeyboardView>
  );
}
