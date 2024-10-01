import { Invoice } from "@getalby/lightning-tools";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Tick } from "~/animations/Tick";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";

export function ReceiveSuccess() {
  const { invoice } = useLocalSearchParams() as { invoice: string };

  const getFiatAmount = useGetFiatAmount();
  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  return (
    <View className="flex-1 flex flex-col">
      <Screen
        title="Payment Successful"
      />
      <View className="flex-1 justify-center items-center gap-2">
        <View className="-mt-32">
          <Tick />
        </View>
        <Text className="text-3xl font-bold2 text-muted-foreground -mt-32">
          Received
        </Text>
        <View className="flex flex-row gap-2 mt-10">
          <Text className="text-receive text-3xl font-semibold2">
            + {decodedInvoice.satoshi}
          </Text>
          <Text className="text-3xl font-semibold2 text-muted-foreground">
            sats
          </Text>
        </View>
        {getFiatAmount &&
          <Text className="text-muted-foreground text-2xl font-semibold2">
            {getFiatAmount(decodedInvoice.satoshi) ?? ""}
          </Text>
        }
        {decodedInvoice.description && (
          <Text className="mt-4">{decodedInvoice.description}</Text>
        )}
      </View>
      <View className="flex flex-col gap-3 m-6">
        <Button
          size="lg"
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
