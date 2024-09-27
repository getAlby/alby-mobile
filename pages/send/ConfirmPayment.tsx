import { Invoice } from "@getalby/lightning-tools";

import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { ZapIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function ConfirmPayment() {
  const { invoice, originalText, comment } = useLocalSearchParams() as {
    invoice: string;
    originalText: string;
    comment: string;
  };
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);

  async function pay() {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      const response = await nwcClient.payInvoice({
        invoice,
      });

      console.log("payInvoice Response", response);

      router.dismissAll();
      router.replace({
        pathname: "/send/success",
        params: {
          preimage: response.preimage,
          originalText,
          invoice,
          amount: decodedInvoice.satoshi,
        },
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setLoading(false);
  }

  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  return (
    <>
      <Screen title="Confirm Payment" />
      <View className="flex-1 justify-center items-center gap-8 p-6">
        <View className="flex flex-col gap-2">
          <View className="flex flex-row items-center justify-center gap-2">
            <Text className="text-5xl font-bold2 text-foreground">
              {new Intl.NumberFormat().format(decodedInvoice.satoshi)}
            </Text>
            <Text className="text-3xl font-bold2 text-muted-foreground">
              sats
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-center text-muted-foreground text-3xl font-semibold2">
              {getFiatAmount(decodedInvoice.satoshi)}
            </Text>
          )}
        </View>
        {decodedInvoice.description ? (
          <View className="flex flex-col gap-2 justify-center items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Description
            </Text>
            <Text className="text-center text-foreground text-2xl font-medium2">
              {decodedInvoice.description}
            </Text>
          </View>
        ) : (
          comment && (
            <View className="flex flex-col gap-2">
              <Text className="text-muted-foreground text-center font-semibold2">
                Comment
              </Text>
              <Text className="text-center text-foreground text-2xl font-medium2">
                {comment}
              </Text>
            </View>
          )
        )}
        {
          /* only show "To" for lightning addresses */ originalText !==
            invoice &&
            originalText
              .toLowerCase()
              .replace("lightning:", "")
              .includes("@") && (
              <View className="flex flex-col gap-2">
                <Text className="text-muted-foreground text-center font-semibold2">
                  To
                </Text>
                <Text className="text-center text-foreground text-2xl font-medium2">
                  {originalText.toLowerCase().replace("lightning:", "")}
                </Text>
              </View>
            )
        }
      </View>
      <View className="p-6">
        <Button
          size="lg"
          onPress={pay}
          className="flex flex-row gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loading className="text-primary-foreground" />
          ) : (
            <ZapIcon className="text-primary-foreground" />
          )}
          <Text>Pay</Text>
        </Button>
      </View>
    </>
  );
}
