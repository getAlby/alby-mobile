import Screen from "~/components/Screen";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { LNURLPayServiceResponse, lnurl } from "~/lib/lnurl";
import { Input } from "~/components/ui/input";
import { errorToast } from "~/lib/errorToast";
import Loading from "~/components/Loading";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";

export function LNURLPay() {
  const { lnurlDetailsJSON, originalText } =
    useLocalSearchParams() as unknown as {
      lnurlDetailsJSON: string;
      originalText: string;
    };
  const lnurlDetails: LNURLPayServiceResponse = JSON.parse(lnurlDetailsJSON);
  const [isLoading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [isAmountReadOnly, setAmountReadOnly] = React.useState(false);

  useEffect(() => {
    // Handle fixed amount LNURLs
    if (lnurlDetails.minSendable === lnurlDetails.maxSendable) {
      setAmount((lnurlDetails.minSendable / 1000).toString());
      setAmountReadOnly(true);
    }
  }, [lnurlDetails.minSendable, lnurlDetails.maxSendable]);

  async function requestInvoice() {
    setLoading(true);
    try {
      const callback = new URL(lnurlDetails.callback);
      callback.searchParams.append("amount", (+amount * 1000).toString());
      if (comment) {
        callback.searchParams.append("comment", comment);
      }
      //callback.searchParams.append("payerdata", JSON.stringify({ test: 1 }));
      const lnurlPayInfo = await lnurl.getPayRequest(callback.toString());
      //console.log("Got pay request", lnurlPayInfo.pr);
      router.push({
        pathname: "/send/confirm",
        params: { invoice: lnurlPayInfo.pr, originalText, comment },
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setLoading(false);
  }

  return (
    <>
      <Screen title="Send" />
      <DismissableKeyboardView>
        <View className="flex-1 flex flex-col">
          <View className="flex-1 justify-center items-center p-6 gap-6">
            <DualCurrencyInput
              amount={amount}
              setAmount={setAmount}
              readOnly={isAmountReadOnly}
              autoFocus={!isAmountReadOnly}
            />
            {lnurlDetails.commentAllowed && (
              <View className="w-full">
                <Text className="text-muted-foreground text-center font-semibold2">
                  Comment
                </Text>
                <Input
                  className="w-full border-transparent bg-transparent text-center native:text-2xl font-semibold2"
                  placeholder="Enter an optional comment"
                  value={comment}
                  onChangeText={setComment}
                  returnKeyType="done"
                  maxLength={lnurlDetails.commentAllowed}
                />
              </View>
            )}
            <View>
              <Text className="text-muted-foreground text-center font-semibold2">
                To
              </Text>
              <Text className="text-center text-foreground text-2xl font-medium2">
                {originalText}
              </Text>
            </View>
          </View>
          <View className="p-6">
            <Button
              size="lg"
              className="flex flex-row gap-2"
              onPress={requestInvoice}
              disabled={isLoading}
            >
              {isLoading && <Loading className="text-primary-foreground" />}
              <Text>Next</Text>
            </Button>
          </View>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
