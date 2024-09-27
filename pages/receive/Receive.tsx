import { Link, router } from "expo-router";
import { Share, View } from "react-native";
import { Button } from "~/components/ui/button";
import * as Clipboard from "expo-clipboard";
import React from "react";
import { useAppStore } from "~/lib/state/appStore";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { Copy, Share2, ZapIcon } from "~/components/Icons";
import Toast from "react-native-toast-message";
import { errorToast } from "~/lib/errorToast";
import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import Loading from "~/components/Loading";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import QRCode from "~/components/QRCode";
import Screen from "~/components/Screen";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";

export function Receive() {
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const [invoice, _setInvoice] = React.useState("");
  const invoiceRef = React.useRef("");
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [addComment, setAddComment] = React.useState(false);
  const [enterCustomAmount, setEnterCustomAmount] = React.useState(false);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const lightningAddress = wallets[selectedWalletId].lightningAddress;
  const nwcCapabilities = wallets[selectedWalletId].nwcCapabilities;

  function setInvoice(invoice: string) {
    _setInvoice(invoice);
    invoiceRef.current = invoice;
  }

  function generateInvoice(amount?: number) {
    if (!amount) {
      console.error("0-amount invoices are currently not supported");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const nwcClient = useAppStore.getState().nwcClient;
        if (!nwcClient) {
          throw new Error("NWC client not connected");
        }
        const response = await nwcClient.makeInvoice({
          amount: amount * 1000 /*FIXME: allow 0-amount invoices */,
          ...(comment ? { description: comment } : {}),
        });

        console.log("makeInvoice Response", response);

        setInvoice(response.invoice);
        setEnterCustomAmount(false);
      } catch (error) {
        console.error(error);
        errorToast(error);
      }
      setLoading(false);
    })();
  }

  function copy() {
    const text = invoice || lightningAddress;
    if (!text) {
      errorToast(new Error("Nothing to copy"));
      return;
    }
    Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
    });
  }

  // TODO: move this somewhere else to have app-wide notifications of incoming payments
  React.useEffect(() => {
    if (!nwcCapabilities || nwcCapabilities.indexOf("notifications") < 0) {
      // TODO: we do not check if the wallet supports listTransactions,
      // and could also use lookupInvoice if it's a custom invoice
      let polling = true;
      let pollCount = 0;
      let prevTransaction: Nip47Transaction | undefined;
      (async () => {
        while (polling) {
          try {
            const transactions = await useAppStore
              .getState()
              .nwcClient?.listTransactions({
                limit: 1,
                type: "incoming",
              });
            const receivedTransaction = transactions?.transactions[0];
            if (receivedTransaction) {
              if (
                polling &&
                pollCount > 0 &&
                receivedTransaction.payment_hash !==
                  prevTransaction?.payment_hash
              ) {
                if (
                  !invoiceRef.current ||
                  receivedTransaction.invoice === invoiceRef.current
                ) {
                  router.dismissAll();
                  router.navigate({
                    pathname: "/receive/success",
                    params: { invoice: receivedTransaction.invoice },
                  });
                } else {
                  console.log("Received another payment");
                }
              }
              prevTransaction = receivedTransaction;
            }
            ++pollCount;
          } catch (error) {
            console.error("Failed to list transactions", error);
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      })();
      return () => {
        polling = false;
      };
    }

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
            !invoiceRef.current ||
            notification.notification.invoice === invoiceRef.current
          ) {
            router.dismissAll();
            router.navigate({
              pathname: "/receive/success",
              params: { invoice: notification.notification.invoice },
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

  async function share() {
    const message = invoice || lightningAddress;
    try {
      if (!message) {
        throw new Error("no invoice or lightning address set");
      }
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      errorToast(error);
    }
  }

  return (
    <>
      <Screen title="Receive" animation="slide_from_left" />
      {!enterCustomAmount && !invoice && !lightningAddress && (
        <>
          <View className="flex-1 h-full flex flex-col items-center justify-center gap-5">
            <ZapIcon className="text-foreground" size={64} />
            <Text className="text-2xl max-w-64 text-center">
              Receive quickly with a Lightning Address
            </Text>
            <Link
              href={`/settings/wallets/${selectedWalletId}/lightning-address`}
              asChild
            >
              <Button variant="secondary">
                <Text>Set Lightning Address</Text>
              </Button>
            </Link>
          </View>
          <View className="p-6">
            <Button
              variant="secondary"
              onPress={() => setEnterCustomAmount(true)}
              className="flex flex-col gap-2"
            >
              <ZapIcon className="text-muted-foreground" />
              <Text>Invoice</Text>
            </Button>
          </View>
        </>
      )}
      {!enterCustomAmount && (invoice.length || lightningAddress) && (
        <>
          <View className="flex-1 justify-center items-center gap-8">
            <QRCode value={invoice || lightningAddress || ""} />
            <View className="flex flex-col items-center justify-center gap-2">
              {invoice ? (
                <View className="flex flex-row items-end">
                  <Text className="text-foreground text-3xl font-semibold2">
                    {new Intl.NumberFormat().format(+amount)}{" "}
                  </Text>
                  <Text className="text-muted-foreground text-2xl font-semibold2">
                    sats
                  </Text>
                </View>
              ) : (
                lightningAddress && (
                  <Text className="text-foreground text-xl font-medium2">
                    {lightningAddress}
                  </Text>
                )
              )}
              {invoice && getFiatAmount && (
                <Text className="text-muted-foreground text-2xl font-medium2">
                  {getFiatAmount(+amount)}
                </Text>
              )}
            </View>
            {invoice && (
              <View className="flex flex-row justify-center items-center gap-3">
                <Loading />
                <Text className="text-xl">Waiting for payment</Text>
              </View>
            )}
          </View>

          <View className="flex flex-row gap-3 p-6">
            <Button
              onPress={share}
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
            >
              <Share2 className="text-muted-foreground" />
              <Text>Share</Text>
            </Button>
            <Button
              variant="secondary"
              onPress={copy}
              className="flex-1 flex flex-col gap-2"
            >
              <Copy className="text-muted-foreground" />
              <Text>Copy</Text>
            </Button>
            {!enterCustomAmount && !invoice && (
              <Button
                variant="secondary"
                onPress={() => setEnterCustomAmount(true)}
                className="flex-1 flex flex-col gap-2"
              >
                <ZapIcon className="text-muted-foreground" />
                <Text>Invoice</Text>
              </Button>
            )}
          </View>
        </>
      )}
      {/* TODO: move to one place - this is all copied from LNURL-Pay */}
      {!invoice && enterCustomAmount && (
        <DismissableKeyboardView>
          <View className="flex-1 flex flex-col">
            <View className="flex-1 h-full flex flex-col justify-center gap-5 p-3">
              <DualCurrencyInput
                amount={amount}
                setAmount={setAmount}
                autoFocus
              />
              <View>
                <Text className="text-muted-foreground text-center mt-6">
                  Description (optional)
                </Text>
                <Input
                  className="w-full text-center border-transparent bg-transparent native:text-2xl font-semibold2"
                  placeholder="No description"
                  value={comment}
                  onChangeText={setComment}
                  returnKeyType="done"
                />
              </View>
            </View>
            <View className="m-6">
              <Button
                size="lg"
                className="flex flex-row gap-2"
                onPress={() => generateInvoice(+amount)}
                disabled={isLoading}
              >
                {isLoading && <Loading className="text-primary-foreground" />}
                <Text>Create Invoice</Text>
              </Button>
            </View>
          </View>
        </DismissableKeyboardView>
      )}
    </>
  );
}
