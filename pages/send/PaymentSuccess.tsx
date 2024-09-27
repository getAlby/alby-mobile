import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Paid } from "~/animations/Paid";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import Screen from "~/components/Screen";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";

export function PaymentSuccess() {
  const getFiatAmount = useGetFiatAmount();
  const { preimage, originalText, invoice, amount } =
    useLocalSearchParams() as {
      preimage: string;
      originalText: string;
      invoice: string;
      amount: string;
    };
  return (
    <View className="flex-1 flex flex-col">
      <Screen title="Success" />
      <View className="flex-1 justify-center items-center gap-8 p-6">
        <Paid />
        <View className="flex flex-col items-center gap-2 -mt-24">
          <View className="flex flex-row items-end justify-center">
            <Text className="text-3xl text-foreground font-semibold2">
              {new Intl.NumberFormat().format(+amount)}{" "}
            </Text>
            <Text className="text-2xl text-muted-foreground font-semibold2">
              sats
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-2xl text-muted-foreground font-semibold2">
              {getFiatAmount(+amount)}
            </Text>
          )}
        </View>
        {originalText !== invoice && (
          <View>
            <Text className="text-muted-foreground text-center font-semibold2">
              Sent to
            </Text>
            <Text className="text-foreground text-center text-2xl font-medium2">
              {originalText}
            </Text>
          </View>
        )}
      </View>
      <View className="p-6">
        <Button
          size="lg"
          className="w-full"
          onPress={() => {
            router.replace("/");
          }}
        >
          <Text>Close</Text>
        </Button>
      </View>
    </View>
  );
}
