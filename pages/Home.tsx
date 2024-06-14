import {
  ScrollView,
  View,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
} from "react-native";
import React from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { WalletConnection } from "~/pages/settings/wallets/WalletConnection";
import { useTransactions } from "hooks/useTransactions";
import { Link, Stack, router, useFocusEffect } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { MoveUpRight, MoveDownLeft, Settings2 } from "~/components/Icons";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useColorScheme } from "~/lib/useColorScheme";

dayjs.extend(relativeTime);

export function Home() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const { data: balance, mutate: reloadBalance } = useBalance();
  const [page, setPage] = React.useState(1);
  const { data: transactions, mutate: reloadTransactions } =
    useTransactions(page);
  const [loadingNextPage, setLoadingNextPage] = React.useState(false);
  const [allTransactions, setAllTransactions] = React.useState<
    Nip47Transaction[]
  >([]);
  const [refreshingTransactions, setRefreshingTransactions] =
    React.useState(false);
  const getFiatAmount = useGetFiatAmount();
  const { isDarkColorScheme } = useColorScheme();

  React.useEffect(() => {
    if (
      !refreshingTransactions &&
      transactions?.transactions.length &&
      !allTransactions.some((t) =>
        transactions.transactions.some(
          (other) => t.payment_hash === other.payment_hash
        )
      )
    ) {
      setAllTransactions([...allTransactions, ...transactions.transactions]);
      setLoadingNextPage(false);
    }
  }, [allTransactions, transactions, refreshingTransactions]);

  const onRefresh = React.useCallback(() => {
    if (refreshingTransactions) {
      return;
    }
    (async () => {
      setRefreshingTransactions(true);
      setPage(1);
      await Promise.all([reloadTransactions(), reloadBalance()]);
      setAllTransactions([]);
      setRefreshingTransactions(false);
    })();
  }, []);

  useFocusEffect(onRefresh);

  if (!nwcClient) {
    return <WalletConnection />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Home",
          headerTitle: () => (
            <Image
              className="w-12 h-12"
              source={require("../assets/adaptive-icon.png")}
            />
          ),
          headerRight: () => (
            <Link href="/settings">
              <View className="flex justify-center items-center">
                <Settings2 className="text-primary-foreground" />
              </View>
            </Link>
          ),
        }}
      />
      <View className="w-full pt-12 flex flex-row justify-center items-center gap-2">
        <Text className="text-4xl text-muted-foreground">₿</Text>
        {balance ? (
          <Text className="text-4xl font-bold text-primary-foreground">
            {new Intl.NumberFormat().format(Math.floor(balance.balance / 1000))}{" "}
            sats
          </Text>
        ) : (
          <Skeleton className="w-48 h-8" />
        )}
      </View>
      <View className="w-full pt-2 pb-8 flex justify-center items-center">
        {getFiatAmount && balance ? (
          <Text className="text-center text-xl text-muted-foreground">
            {getFiatAmount(Math.floor(balance.balance / 1000))}
          </Text>
        ) : (
          <Skeleton className="w-32 h-6" />
        )}
      </View>
      <View className="flex flex-row w-full gap-x-4 p-3 mb-3">
        <Link href="/receive" className="flex-1" asChild>
          <Button size="lg">
            <View className="flex flex-row justify-center items-center gap-2">
              <MoveDownLeft className="text-white" />
              <Text className="">Receive</Text>
            </View>
          </Button>
        </Link>
        <Link href="/send" className="flex-1" asChild>
          <Button size="lg">
            <View className="flex flex-row justify-center items-center gap-2">
              <MoveUpRight className="text-white" />
              <Text>Send</Text>
            </View>
          </Button>
        </Link>
      </View>

      <>
        {allTransactions.length ? (
          <FlatList
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
            onEndReachedThreshold={0.9}
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
                <View className="flex flex-row items-center gap-x-6 px-4 mb-5">
                  <View className="w-10 h-10 bg-muted rounded-full flex flex-col items-center justify-center">
                    {transaction.type === "incoming" && (
                      <>
                        <MoveDownLeft
                          className="text-receive"
                          width={20}
                          height={20}
                        />
                      </>
                    )}
                    {transaction.type === "outgoing" && (
                      <>
                        <MoveUpRight
                          className="text-send"
                          width={20}
                          height={20}
                        />
                      </>
                    )}
                  </View>
                  <View className="flex flex-col flex-1">
                    <Text numberOfLines={1} className="text-primary-foreground">
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
                        "text-right",
                        transaction.type === "incoming"
                          ? "text-receive"
                          : "text-send"
                      )}
                    >
                      {Math.floor(transaction.amount / 1000)}
                      <Text className="text-muted-foreground"> sats</Text>
                    </Text>
                    <Text className="text-right text-sm text-muted-foreground">
                      {getFiatAmount &&
                        getFiatAmount(Math.floor(transaction.amount / 1000))}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        ) : (
          <ScrollView>
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
        )}
      </>
    </>
  );
}
