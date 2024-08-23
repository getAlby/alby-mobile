import { View, Image, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { WalletConnection } from "~/pages/settings/wallets/WalletConnection";
import { Link, Stack, useFocusEffect } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Text } from "~/components/ui/text";
import { Settings2, ChevronUp } from "~/components/Icons";

import { Skeleton } from "~/components/ui/skeleton";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { LinearGradient } from "expo-linear-gradient";
import LargeArrowUp from "~/components/icons/LargeArrowUp";
import LargeArrowDown from "~/components/icons/LargeArrowDown";
import { SvgProps } from "react-native-svg";
import { Button } from "~/components/ui/button";

dayjs.extend(relativeTime);

enum BalanceState {
  SATS = 1,
  FIAT = 2,
  HIDDEN = 3
}

export function Home() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const { data: balance, mutate: reloadBalance } = useBalance();
  const getFiatAmount = useGetFiatAmount();
  const [balanceState, setBalanceState] = useState<BalanceState>(BalanceState.SATS);
  const [pressed, setPressed] = React.useState(false);

  useFocusEffect(() => {
    reloadBalance();
  });

  if (!nwcClient) {
    return <WalletConnection />;
  }

  function switchBalanceState(): void {
    if (balanceState == BalanceState.SATS) {
      setBalanceState(BalanceState.FIAT);
    }
    else if (balanceState == BalanceState.FIAT) {
      setBalanceState(BalanceState.HIDDEN);
    }
    else {
      setBalanceState(BalanceState.SATS);
    }
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
            <Link href="/settings" asChild>
              <Button variant="link">
                <Settings2 className="text-foreground" />
              </Button>
            </Link>
          ),
        }}
      />
      <View className="h-full flex">
        <View className="grow flex flex-col items-center justify-center gap-4">
          <Pressable
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={{
              ...(pressed
                ? {
                  transform: "scale(0.98)",
                } : [])
            }}
            onPress={switchBalanceState} className="w-full flex flex-col items-center justify-center gap-4" >
            <View className="w-full flex flex-row justify-center items-center gap-2">
              {balance ? (
                <>
                  <Text className="text-foreground text-5xl font-bold2">
                    {balanceState == BalanceState.SATS && new Intl.NumberFormat().format(
                      Math.floor(balance.balance / 1000),
                    )}
                    {balanceState == BalanceState.FIAT &&
                      getFiatAmount && getFiatAmount(Math.floor(balance.balance / 1000))}
                    {balanceState == BalanceState.HIDDEN && "****"}
                  </Text>
                  <Text className="text-muted-foreground text-3xl font-bold2">
                    {balanceState == BalanceState.SATS && "sats"}
                  </Text>
                </>
              ) : (
                <Skeleton className="w-48 h-12" />
              )}
            </View>
            <View className="flex justify-center items-center">
              {balance ? (
                <Text className="text-center text-3xl text-muted-foreground font-semibold2">
                  {balanceState == BalanceState.SATS &&
                    getFiatAmount && getFiatAmount(Math.floor(balance.balance / 1000))}
                  {balanceState == BalanceState.FIAT && new Intl.NumberFormat().format(
                    Math.floor(balance.balance / 1000),
                  ) + " sats"}
                </Text>
              ) : <Skeleton className="w-32 h-10" />}
            </View>
          </Pressable>
        </View >
        <View className="flex items-center justify-center my-5">
          <Link href="/transactions" asChild>
            <Button variant="ghost" className="p-10 rounded-full aspect-square">
              <ChevronUp className="text-foreground" size={32} />
            </Button>
          </Link>
        </View>
        <View>
          <View className="flex flex-row gap-6 p-6 pt-2">
            <MainButton title="Receive" href="/onboarding" Icon={LargeArrowDown} />
            <MainButton title="Send" href="/send" Icon={LargeArrowUp} />
          </View>
        </View>
      </View >
    </>
  );
}

function MainButton({
  title,
  href,
  Icon,
}: {
  title: string;
  href: string;
  Icon: (props: SvgProps) => React.JSX.Element;
}): JSX.Element {
  const [pressed, setPressed] = React.useState(false);
  return (
    <>
      <Link href={href} className="flex flex-1" asChild>
        <Pressable
          className="flex-1 aspect-square rounded-xl flex"
          style={shadows.large}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
        >
          <LinearGradient
            className="flex-1 p-6"
            colors={["#FFE951", "#FFC453"]}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              flex: 1,
              padding: 6,
              borderRadius: 15,
              elevation: 2,
              justifyContent: "center",
              alignItems: "center",
              ...(pressed
                ? {
                  transform: "scale(0.98)",
                }
                : {}),
            }}
          >
            <View className="flex flex-col justify-center items-center gap-4">
              <Icon />
              <Text className="font-bold2 text-3xl text-primary-foreground">
                {title}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Link>
    </>
  );
}

// NOTE: only applies on iOS
const shadows = StyleSheet.create({
  large: {
    // TODO: check dark mode
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowRadius: 4,
  },
});
