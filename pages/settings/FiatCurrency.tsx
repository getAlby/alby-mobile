import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";
import { cn } from "~/lib/utils";
import CurrencyList from "currency-list";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const currencies: [string, string][] = Object.entries(
  CurrencyList.getAll("en_US"),
).map(([code, details]) => [code, details.name]);

export function FiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency,
  );

  function select(iso: string) {
    setFiatCurrency(iso);
    useAppStore.getState().setFiatCurrency(iso);
    Toast.show({
      type: "success",
      text1: "Fiat currency updated",
    });
    router.back();
  }

  const renderCurrencyItem = ({ item }: { item: [string, string] }) => (
    <TouchableOpacity
      className={cn(
        "p-4 flex flex-row gap-2 border-b border-input",
        item[0] === fiatCurrency && "bg-muted",
      )}
      onPress={() => select(item[0])}
    >
      <Text className={cn("text-lg", item[0] === fiatCurrency && "font-bold2")}>
        {item[1]}
      </Text>
      <Text className="text-lg text-muted-foreground">({item[0]})</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 flex flex-col p-6">
      <Screen title="Fiat Currency" />
      <FlatList
        data={currencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item[0]}
        className="flex-1 mb-4"
      />
    </View>
  );
}
