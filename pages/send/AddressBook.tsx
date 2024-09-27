import { Link, router } from "expo-router";
import { Pressable, View } from "react-native";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function AddressBook() {
  const addressBookEntries = useAppStore((store) => store.addressBookEntries);
  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Screen title="Address Book" />
      <View className="flex-1 flex flex-col gap-4">
        {addressBookEntries.length > 0 ? (
          addressBookEntries.map((addressBookEntry, index) => (
            <Pressable
              key={index}
              onPress={() => {
                router.dismissAll();
                router.navigate({
                  pathname: "/send",
                  params: {
                    url: addressBookEntry.lightningAddress,
                  },
                });
              }}
            >
              <Card className="w-full">
                <CardHeader className="w-full">
                  <CardTitle>
                    {addressBookEntry.name || addressBookEntry.lightningAddress}
                  </CardTitle>
                  <CardDescription>
                    {addressBookEntry.lightningAddress}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Pressable>
          ))
        ) : (
          <Text className="text-lg">No entries yet.</Text>
        )}
      </View>

      <Link href="/settings/address-book/new" asChild>
        <Button size="lg">
          <Text>Create Contact</Text>
        </Button>
      </Link>
    </View>
  );
}
