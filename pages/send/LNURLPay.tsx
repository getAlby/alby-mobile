import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { LNURLPayServiceResponse, lnurl } from "~/lib/lnurl";
import { Input } from "~/components/ui/input";
import { errorToast } from "~/lib/errorToast";
import Loading from "~/components/Loading";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";

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
  const [addComment, setAddComment] = React.useState(false);

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
        params: { invoice: lnurlPayInfo.pr, originalText },
      });
    } catch (error) {
      console.error(error);
      errorToast(error as Error);
    }
    setLoading(false);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Send",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      )}

      {!isLoading && (
        <>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View className="flex-1 justify-center items-center p-3">
              <Text className="text-sm text-muted-foreground">Payment to</Text>
              <Text className="text-sm max-w-sm text-muted-foreground">
                {originalText}
              </Text>

              <DualCurrencyInput amount={amount} setAmount={setAmount} />

              {!addComment && (
                <Button
                  variant="ghost"
                  className="mt-3"
                  onPress={() => setAddComment(true)}
                >
                  <Text className="text-muted-foreground">+ add comment</Text>
                </Button>
              )}
              {addComment && (
                <Input
                  className="w-full text-center mt-6"
                  placeholder="comment"
                  value={comment}
                  onChangeText={setComment}
                // aria-labelledbyledBy="comment"
                // aria-errormessage="inputError"
                />
              )}
            </View>
          </TouchableWithoutFeedback>

          <Button className="flex-1" size="lg" onPress={requestInvoice}>
            <Text>Next</Text>
          </Button>

        </>
      )}
    </>
  );
}
