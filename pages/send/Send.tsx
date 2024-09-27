import Screen from "~/components/Screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { lnurl } from "lib/lnurl";
import { Button } from "~/components/ui/button";
import {
  BookUser,
  ClipboardPaste,
  Keyboard as KeyboardIcon,
} from "~/components/Icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { errorToast } from "~/lib/errorToast";
import { Invoice } from "@getalby/lightning-tools";
import QRCodeScanner from "~/components/QRCodeScanner";
import Loading from "~/components/Loading";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";

export function Send() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [isLoading, setLoading] = React.useState(false);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [keyboardText, setKeyboardText] = React.useState("");

  useEffect(() => {
    if (url) {
      loadPayment(url);
    }
  }, [url]);

  async function paste() {
    let clipboardText;
    try {
      clipboardText = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    loadPayment(clipboardText);
  }

  function openKeyboard() {
    setKeyboardOpen(true);
  }

  const handleScanned = (data: string) => {
    return loadPayment(data);
  };

  function submitKeyboardText() {
    loadPayment(keyboardText);
  }

  async function loadPayment(text: string) {
    if (!text) {
      errorToast(new Error("Your clipboard is empty."));
      return;
    }
    console.log("loading payment", text);
    const originalText = text;
    setLoading(true);
    try {
      if (text.startsWith("bitcoin:")) {
        const universalUrl = text.replace("bitcoin:", "http://");
        const url = new URL(universalUrl);
        const lightningParam = url.searchParams.get("lightning");
        if (!lightningParam) {
          throw new Error("No lightning param found in bitcoin payment link");
        }
        text = lightningParam;
      }
      if (text.startsWith("lightning:")) {
        text = text.substring("lightning:".length);
      }
      const lnurlValue = lnurl.findLnurl(text);
      console.log("Checked lnurl value", text, lnurlValue);
      if (lnurlValue) {
        const lnurlDetails = await lnurl.getDetails(lnurlValue);

        if (lnurlDetails.tag !== "payRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        // Handle fixed amount LNURLs
        if (
          lnurlDetails.minSendable === lnurlDetails.maxSendable &&
          !lnurlDetails.commentAllowed
        ) {
          try {
            const callback = new URL(lnurlDetails.callback);
            callback.searchParams.append(
              "amount",
              lnurlDetails.minSendable.toString(),
            );
            const lnurlPayInfo = await lnurl.getPayRequest(callback.toString());
            router.push({
              pathname: "/send/confirm",
              params: { invoice: lnurlPayInfo.pr, originalText },
            });
          } catch (error) {
            console.error(error);
            errorToast(error);
          }
        } else {
          router.replace({
            pathname: "/send/lnurl-pay",
            params: {
              lnurlDetailsJSON: JSON.stringify(lnurlDetails),
              originalText,
            },
          });
        }
      } else {
        // Check if this is a valid invoice
        new Invoice({
          pr: text,
        });

        router.replace({
          pathname: "/send/confirm",
          params: { invoice: text, originalText },
        });
      }
    } catch (error) {
      console.error("failed to load payment", originalText, error);
      errorToast(error);
      setLoading(false);
    }
  }

  return (
    <>
      <Screen title="Send" />
      {isLoading && (
        <View className="flex-1 flex flex-col items-center justify-center">
          <Loading className="text-primary-foreground" />
        </View>
      )}
      {!isLoading && (
        <>
          {!keyboardOpen && (
            <>
              <QRCodeScanner onScanned={handleScanned} />
              <View className="flex flex-row items-stretch justify-center gap-4 p-6">
                <Button
                  onPress={openKeyboard}
                  variant="secondary"
                  className="flex flex-col gap-2 flex-1"
                >
                  <KeyboardIcon className="text-secondary-foreground" />
                  <Text numberOfLines={1}>Manual</Text>
                </Button>
                <Button
                  variant="secondary"
                  className="flex flex-col gap-2 flex-1"
                  onPress={() => {
                    router.push("/send/address-book");
                  }}
                >
                  <BookUser className="text-secondary-foreground" />
                  <Text numberOfLines={1}>Contacts</Text>
                </Button>
                <Button
                  onPress={paste}
                  variant="secondary"
                  className="flex flex-col gap-2 flex-1"
                >
                  <ClipboardPaste className="text-secondary-foreground" />
                  <Text numberOfLines={1}>Paste</Text>
                </Button>
              </View>
            </>
          )}
          {keyboardOpen && (
            <DismissableKeyboardView>
              <View className="flex-1 h-full flex flex-col gap-5 p-6">
                <View className="flex-1 flex items-center justify-center">
                  <Text className="text-muted-foreground text-center">
                    Type or paste a Lightning Address, lightning invoice or
                    LNURL.
                  </Text>
                  <Input
                    className="w-full text-center mt-6 border-transparent bg-transparent native:text-2xl font-semibold2"
                    placeholder="hello@getalby.com"
                    value={keyboardText}
                    onChangeText={setKeyboardText}
                    inputMode="email"
                    autoFocus
                    returnKeyType="done"
                    // aria-errormessage="inputError"
                  />
                </View>
                <Button onPress={submitKeyboardText} size="lg">
                  <Text>Next</Text>
                </Button>
              </View>
            </DismissableKeyboardView>
          )}
        </>
      )}
    </>
  );
}
