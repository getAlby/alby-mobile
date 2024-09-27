import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import dayjs from "dayjs";
import { Link, router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import Screen from "~/components/Screen";
import { MoveDownLeft, MoveUpRight, X } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useTransactions } from "~/hooks/useTransactions";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";
import { cn } from "~/lib/utils";

export function Transactions() {
  const [page, setPage] = React.useState(1);
  const { data: transactions, mutate: reloadTransactions } =
    useTransactions(page);
  const [loadingNextPage, setLoadingNextPage] = React.useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = React.useState(false);
  const [allTransactions, setAllTransactions] = React.useState<
    Nip47Transaction[]
  >([]);
  const [refreshingTransactions, setRefreshingTransactions] =
    React.useState(false);
  const getFiatAmount = useGetFiatAmount();

  React.useEffect(() => {
    if (
      !refreshingTransactions &&
      transactions?.transactions.length &&
      !allTransactions.some((t) =>
        transactions.transactions.some(
          (other) => t.payment_hash === other.payment_hash,
        ),
      )
    ) {
      setAllTransactions([...allTransactions, ...transactions.transactions]);
      setLoadingNextPage(false);
    }

    if (transactions) {
      setTransactionsLoaded(true);
    }
  }, [allTransactions, transactions, refreshingTransactions]);

  const onRefresh = React.useCallback(() => {
    if (refreshingTransactions) {
      return;
    }
    (async () => {
      setRefreshingTransactions(true);
      setPage(1);
      await Promise.all([reloadTransactions()]);
      setAllTransactions([]);
      setRefreshingTransactions(false);
    })();
  }, []);

  return (
    <View className="flex-1 flex flex-col gap-3">
      <Screen
        title="Transactions"
        animation="slide_from_bottom"
        right={() => (
          <Pressable
            onPress={() => {
              router.back();
            }}
          >
            <X className="text-foreground" />
          </Pressable>
        )}
      />
      {allTransactions && allTransactions.length ? (
        <FlatList
          className="mt-3"
          refreshControl={
            <RefreshControl
              refreshing={refreshingTransactions}
              onRefresh={onRefresh}
            />
          }
          ListFooterComponent={
            loadingNextPage ? (
              <Text className="text-center mb-5 animate-pulse">
                Loading more transactions...
              </Text>
            ) : undefined
          }
          data={allTransactions}
          onEndReachedThreshold={0.8}
          onEndReached={() => {
            if (
              !refreshingTransactions &&
              allTransactions.length / TRANSACTIONS_PAGE_SIZE === page
            ) {
              setLoadingNextPage(true);
              setPage(page + 1);
            }
          }}
          renderItem={({ item: transaction }) => (
            <Pressable
              key={transaction.payment_hash}
              onPress={() =>
                router.navigate({
                  pathname: "/transaction",
                  params: { transactionJSON: JSON.stringify(transaction) },
                })
              }
            >
              <View className="flex flex-row items-center gap-3 px-4 py-3">
                <View className="w-10 h-10 bg-muted rounded-full flex flex-col items-center justify-center">
                  {transaction.type === "incoming" && (
                    <MoveDownLeft className="text-receive" size={20} />
                  )}
                  {transaction.type === "outgoing" && (
                    <MoveUpRight className="text-send" size={20} />
                  )}
                </View>
                <View className="flex flex-col flex-1">
                  <Text numberOfLines={1} className="font-medium2">
                    {transaction.description
                      ? transaction.description
                      : transaction.type === "incoming"
                        ? "Received"
                        : "Sent"}
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    {dayjs.unix(transaction.settled_at).fromNow()}
                  </Text>
                </View>
                <View>
                  <Text
                    className={cn(
                      "text-right font-medium2",
                      transaction.type === "incoming"
                        ? "text-receive"
                        : "text-foreground",
                    )}
                  >
                    {transaction.type === "incoming" ? "+" : "-"}{" "}
                    {Math.floor(transaction.amount / 1000)}
                    <Text className="text-muted-foreground"> sats</Text>
                  </Text>
                  <Text className="text-right text-sm text-muted-foreground font-medium2">
                    {getFiatAmount &&
                      getFiatAmount(Math.floor(transaction.amount / 1000))}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      ) : !transactionsLoaded ? (
        <ScrollView className="mt-3">
          {[...Array(20)].map((e, i) => (
            <View
              key={i}
              className="flex flex-row items-center text-sm gap-x-6 px-4 mb-4"
            >
              <Skeleton className="rounded-full w-10 h-10" />
              <View className="flex flex-col flex-1 gap-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-16 h-4" />
              </View>
              <View className="flex items-center">
                <Skeleton className="w-8 h-4" />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="p-6 flex-1 items-center justify-center gap-5">
          <View className="flex flex-col items-center">
            <Text className="text-2xl font-semibold2">No transactions yet</Text>
            <Text className="text-muted-foreground text-xl text-center">
              Top up your wallet to get started
            </Text>
          </View>
          <Link href="/receive" asChild>
            <Button size="lg">
              <Text>Receive</Text>
            </Button>
          </Link>
        </View>
      )}
    </View>
  );
}
