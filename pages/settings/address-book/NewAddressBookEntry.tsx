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

export function NewAddressBookEntry() {
  const [name, setName] = React.useState("");
  const [lightningAddress, setLightningAddress] = React.useState("");
  return (
    <DismissableKeyboardView>
      <View className="flex-1 flex flex-col">
        <View className="flex-1 flex flex-col p-3 gap-3">
          <Screen title="New Address Book Entry" />
          <Label nativeID="name" className="self-start justify-self-start">
            Name
          </Label>
          <Input
            autoFocus
            placeholder="Satoshi"
            inputMode="email"
            className="w-full"
            value={name}
            onChangeText={setName}
            aria-labelledbyledBy="name"
            returnKeyType="done"
            // aria-errormessage="inputError"
          />
          <Label
            nativeID="lightningAddress"
            className="self-start justify-self-start"
          >
            Lightning address
          </Label>
          <Input
            className="w-full"
            inputMode="email"
            value={lightningAddress}
            placeholder="hello@getalby.com"
            onChangeText={setLightningAddress}
            aria-labelledbyledBy="lightningAddress"
            returnKeyType="done"
            // aria-errormessage="inputError"
          />
        </View>
        <View className="p-6">
          <Button
            onPress={() => {
              useAppStore
                .getState()
                .addAddressBookEntry({ name, lightningAddress });
              Toast.show({
                type: "success",
                text1: "New address book entry entry added",
              });
              router.back();
            }}
            size="lg"
          >
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </DismissableKeyboardView>
  );
}
