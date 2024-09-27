import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import Screen from "~/components/Screen";
import { MoveDownLeft, MoveUpRight } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { cn } from "~/lib/utils";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

export function Transaction() {
  const { transactionJSON } = useLocalSearchParams() as unknown as {
    transactionJSON: string;
  };
  const transaction: Nip47Transaction = JSON.parse(transactionJSON);
  const getFiatAmount = useGetFiatAmount();

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Screen title="Transaction" />
      <View className="flex flex-col gap-5 justify-center items-center">
        <View
          className="my-8 bg-muted rounded-full p-8"
          style={{ elevation: 2 }}
        >
          {transaction.type === "incoming" && (
            <MoveDownLeft className="text-receive" width={100} height={100} />
          )}
          {transaction.type === "outgoing" && (
            <MoveUpRight className="text-send" width={100} height={100} />
          )}
        </View>
        <Text className="text-3xl font-bold2 text-foreground">
          {transaction.type === "incoming" ? "Received" : "Sent"}
        </Text>
        <View className="flex flex-col items-center justify-center gap-2">
          <View className="flex flex-row items-end mt-5">
            <Text
              className={cn(
                "text-4xl gap-2 font-semibold2",
                transaction.type === "incoming"
                  ? "text-receive"
                  : "text-foreground",
              )}
            >
              {transaction.type === "incoming" ? "+" : "-"}{" "}
              {Math.floor(transaction.amount / 1000)}
            </Text>
            <Text className="text-2xl font-semibold2 text-muted-foreground">
              {" "}
              sats
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-2xl font-semibold2 text-muted-foreground ">
              {getFiatAmount(Math.floor(transaction.amount / 1000))}
            </Text>
          )}
        </View>
        <View className="flex flex-col gap-2 w-full mt-8">
          <TransactionDetailRow
            title="Date & Time"
            content={dayjs.unix(transaction.settled_at).fromNow()}
          />
          <TransactionDetailRow
            title="Description"
            content={transaction.description || "-"}
          />
          <TransactionDetailRow
            title="Payment Hash"
            content={transaction.payment_hash}
            copy
          />
          <TransactionDetailRow
            title="Preimage"
            content={transaction.preimage}
            copy
          />
          <TransactionDetailRow
            title="Fee"
            content={
              Math.floor(transaction.fees_paid / 1000).toString() +
              " sats (" +
              ((transaction.fees_paid / transaction.amount) * 100).toFixed(2) +
              "%)"
            }
          />
        </View>
      </View>
    </View>
  );
}

function TransactionDetailRow(props: {
  title: string;
  content: string;
  copy?: boolean;
}) {
  return (
    <View className="flex flex-row gap-3">
      <Text className="w-32 text-muted-foreground">{props.title}</Text>
      {props.copy ? (
        <TouchableOpacity
          className="flex-1"
          onPress={() => {
            Clipboard.setStringAsync(props.content);
            Toast.show({
              type: "success",
              text1: "Copied to clipboard",
            });
          }}
        >
          <Text className="text-foreground font-medium2">{props.content}</Text>
        </TouchableOpacity>
      ) : (
        <Text className="flex-1 text-foreground font-medium2">
          {props.content}
        </Text>
      )}
    </View>
  );
}
