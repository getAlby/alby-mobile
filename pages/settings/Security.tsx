import React from "react";
import { Text, View } from "react-native";
import { TriangleAlert } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { isBiometricSupported } from "~/lib/isBiometricSupported";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Security() {
  const [isSupported, setIsSupported] = React.useState<boolean | null>(null);
  const isEnabled = useAppStore((store) => store.isSecurityEnabled);

  React.useEffect(() => {
    async function checkBiometricSupport() {
      const supported = await isBiometricSupported();
      setIsSupported(supported);
    }
    checkBiometricSupport();
  }, []);

  return (
    <View className="flex-1 p-6">
      <Screen title="Security" />
      {isSupported === null ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      ) : (
        <>
          {!isSupported && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex flex-row gap-3 items-center">
                  <TriangleAlert size={16} className="text-foreground" />
                  <Text> Setup Device Security</Text>
                </CardTitle>
                <CardDescription>
                  To protect your wallet, please set up a phone lock in your
                  device settings first.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-2">
              <Label
                className={cn(
                  "text-2xl",
                  !isSupported && "text-muted-foreground",
                )}
                nativeID="security"
                disabled={isSupported}
              >
                <Text className="text-lg">Require phone lock to access</Text>
              </Label>
              <Switch
                checked={isEnabled}
                disabled={!isSupported}
                onCheckedChange={() => {
                  useAppStore.getState().setSecurityEnabled(!isEnabled);
                }}
                nativeID="security"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
