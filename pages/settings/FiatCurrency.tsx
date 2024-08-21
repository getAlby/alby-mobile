import { Stack, router } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Bitcoin } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function FiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency
  );
  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: "Units & Currency",
        }}
      />
      <View className="flex-1">
        <Input
          autoFocus
          className="w-full text-center mt-6"
          placeholder="USD"
          value={fiatCurrency}
          onChangeText={setFiatCurrency}
        // aria-errormessage="inputError"
        />
      </View>
      <Button
        size="lg"
        onPress={() => {
          useAppStore.getState().setFiatCurrency(fiatCurrency);
          Toast.show({
            type: "success",
            text1: "Fiat currency updated",
            text2: "Your fiat currency is now " + fiatCurrency,
          });
          router.back();
        }}
      >
        <Text>Update Fiat Currency</Text>
      </Button>
    </View>
  );
}
