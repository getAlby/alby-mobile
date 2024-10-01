import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Tick } from "~/animations/Tick";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import Screen from "~/components/Screen";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { LNURLPaymentSuccessAction } from "lib/lnurl";
import { openURL } from "expo-linking";
import { Receiver } from "~/components/Receiver";

export function PaymentSuccess() {
  const getFiatAmount = useGetFiatAmount();
  const { preimage, originalText, invoice, amount, successAction } = useLocalSearchParams() as {
    preimage: string;
    originalText: string;
    invoice: string;
    amount: string;
    successAction: string;
  };

  const lnurlSuccessAction: LNURLPaymentSuccessAction = successAction ? JSON.parse(successAction) : undefined;

  return (
    <View className="flex-1 flex flex-col">
      <Screen
        title="Success"
      />
      <View className="flex-1 justify-center items-center gap-8 p-6">
        <Tick />
        <View className="flex flex-col items-center gap-2 -mt-24">
          <View className="flex flex-row items-end justify-center">
            <Text className="text-3xl text-foreground font-semibold2">{new Intl.NumberFormat().format(+amount)}{" "}</Text>
            <Text className="text-2xl text-muted-foreground font-semibold2">sats</Text>
          </View>
          {getFiatAmount &&
            <Text className="text-2xl text-muted-foreground font-semibold2">{getFiatAmount(+amount)}</Text>
          }
        </View>
        <Receiver originalText={originalText} invoice={invoice} />
        {lnurlSuccessAction &&
          <View className="flex flex-col gap-2 items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Message From Receiver
            </Text>
            {lnurlSuccessAction.tag == "message" &&
              <Text className="text-foreground text-center text-2xl font-medium2">
                {lnurlSuccessAction.message}
              </Text>
            }
            {lnurlSuccessAction.tag == "url" &&
              <>
                {lnurlSuccessAction.description &&
                  <Text className="text-foreground text-center text-2xl font-medium2">
                    {lnurlSuccessAction.description}
                  </Text>
                }
                {lnurlSuccessAction.url &&
                  <Button variant="secondary" onPress={() => openURL(lnurlSuccessAction.url ?? "")}>
                    <Text>Open Link</Text>
                  </Button>
                }
              </>
            }
          </View>
        }

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
