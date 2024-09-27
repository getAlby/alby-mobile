import { Link, router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native";
import { Settings2, Wallet2 } from "~/components/Icons";
import { Button } from "~/components/ui/button";

import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";
import Screen from "~/components/Screen";
import Toast from "react-native-toast-message";

export function Wallets() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <>
      <View className="flex-1 flex flex-col">
        <Screen title="Manage Wallets" />
        <View className="flex-1 px-6 py-3">
          <FlatList
            className="flex flex-col"
            data={wallets}
            renderItem={(item) => {
              const active = item.index === selectedWalletId;

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (item.index !== selectedWalletId) {
                      useAppStore.getState().setSelectedWalletId(item.index);
                      router.dismissAll();
                      router.navigate("/");
                      Toast.show({
                        type: "success",
                        text1: `Switched wallet to ${item.item.name || DEFAULT_WALLET_NAME}`,
                        position: "top",
                      });
                    }
                  }}
                  className={cn(
                    "flex flex-row items-center justify-between p-6 rounded-2xl border-2",
                    active ? "border-primary" : "border-transparent",
                  )}
                >
                  <View className="flex flex-row gap-4 items-center">
                    <Wallet2 className="text-foreground" />
                    <Text className={cn("text-xl", active && "font-semibold2")}>
                      {item.item.name || DEFAULT_WALLET_NAME}
                    </Text>
                  </View>
                  {active && (
                    <Link
                      href={`/settings/wallets/${selectedWalletId}`}
                      className="absolute right-4"
                      asChild
                    >
                      <TouchableOpacity>
                        <Settings2 className="text-foreground w-32 h-32" />
                      </TouchableOpacity>
                    </Link>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
        <View className="p-6">
          <Link href="/settings/wallets/new" asChild>
            <Button size="lg">
              <Text>Connect a Wallet</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}
