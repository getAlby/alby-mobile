import { Stack, router } from "expo-router";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import * as Clipboard from "expo-clipboard";
import React from "react";
import { useAppStore } from "~/lib/state/appStore";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import QRCode from "react-native-qrcode-svg";
import { Text } from "~/components/ui/text";

export function Receive() {
  const [isLoading, setLoading] = React.useState(false);
  const [invoice, _setInvoice] = React.useState("");
  const invoiceRef = React.useRef("");
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [addComment, setAddComment] = React.useState(false);
  function copyInvoice() {
    Clipboard.setStringAsync(invoice);
  }
  function setInvoice(invoice: string) {
    _setInvoice(invoice);
    invoiceRef.current = invoice;
  }

  function generateInvoice(amount?: number) {
    (async () => {
      setLoading(true);
      try {
        const nwcClient = useAppStore.getState().nwcClient;
        if (!nwcClient) {
          throw new Error("NWC client not connected");
        }
        const response = await nwcClient.makeInvoice({
          amount: (amount as number) * 1000 /*FIXME: allow 0-amount invoices */,
          ...(comment ? { description: comment } : {}),
        });

        console.log("makeInvoice Response", response);

        setInvoice(response.invoice);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    })();
  }

  // TODO: move this somewhere else to have app-wide notifications of incoming payments
  React.useEffect(() => {
    const nwcClient = useAppStore.getState().nwcClient;
    if (!nwcClient) {
      throw new Error("NWC client not connected");
    }
    let unsub: (() => void) | undefined = undefined;
    (async () => {
      unsub = await nwcClient.subscribeNotifications((notification) => {
        console.log("RECEIVED notification", notification);
        if (notification.notification_type === "payment_received") {
          if (
            invoiceRef.current &&
            notification.notification.invoice === invoiceRef.current
          ) {
            router.dismissAll();
            router.navigate({
              pathname: "/receive/success",
              params: { invoice: invoiceRef.current },
            });
          } else {
            console.log("Received another payment");
          }
        }
      });
    })();
    return () => {
      unsub?.();
    };
  }, []);

  /*React.useEffect(() => {
    generateInvoice();
  }, []);*/

  return (
    <>
      <Stack.Screen
        options={{
          title: "Receive",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      )}
      {!isLoading && (
        <>
          {invoice && (
            <View className="flex-1 justify-center items-center">
              <View className="flex flex-row justify-center items-center gap-3 mb-3">
                <ActivityIndicator />
                <Text>Waiting for payment</Text>
              </View>
              <QRCode value={invoice} size={300} />
            </View>
          )}
          {/* TODO: move to one place - this is all copied from LNURL-Pay */}
          {!invoice && (
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <View className="flex-1 h-full flex flex-col items-center justify-center gap-5 p-3">
                <Input
                  className="w-full border-transparent text-center bg-muted"
                  placeholder="0"
                  keyboardType="number-pad"
                  value={amount}
                  onChangeText={setAmount}
                  aria-labelledbyledBy="amount"
                  style={styles.amountInput}
                  // aria-errormessage="inputError"
                />
                <Label
                  nativeID="amount"
                  className="self-start justify-self-start"
                >
                  sats
                </Label>
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
                    aria-labelledbyledBy="comment"
                    // aria-errormessage="inputError"
                  />
                )}

                <Button onPress={() => generateInvoice(+amount)}>
                  <Text>Generate</Text>
                </Button>
              </View>
            </TouchableWithoutFeedback>
          )}

          <View className="absolute bottom-12 w-full flex flex-col items-center justify-center gap-3">
            {invoice && (
              <Button onPress={copyInvoice}>
                <Text className="text-background">Copy Invoice</Text>
              </Button>
            )}
            {/* <Button onPress={openKeyboard}>
            <Text className="text-background">Enter Custom Amount</Text>
          </Button> */}
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  amountInput: {
    fontSize: 80,
    height: 100,
  },
});
