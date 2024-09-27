import { PermissionStatus } from "expo-modules-core/src/PermissionsInterface";
import { View } from "react-native";
import { FocusableCamera } from "./FocusableCamera";
import React, { useEffect } from "react";
import Loading from "./Loading";
import { Camera } from "expo-camera";
import { Text } from "~/components/ui/text";
import { CameraOff } from "./Icons";

type QRCodeScannerProps = {
  onScanned: (data: string) => void;
};

function QRCodeScanner({ onScanned }: QRCodeScannerProps) {
  const [isScanning, setScanning] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [permissionStatus, setPermissionStatus] = React.useState(
    PermissionStatus.UNDETERMINED,
  );

  useEffect(() => {
    // Add some timeout to allow the screen transition to finish before
    // starting the camera to avoid stutters
    setLoading(true);
    window.setTimeout(async () => {
      await scan();
      setLoading(false);
    }, 200);
  }, []);

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermissionStatus(status);
    setScanning(status === "granted");
  }

  const handleScanned = (data: string) => {
    setScanning((current) => {
      if (current === true) {
        console.log(`Bar code with data ${data} has been scanned!`);
        onScanned(data);
        return true;
      }
      return false;
    });
  };

  return (
    <>
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      )}
      {!isLoading && (
        <>
          {!isScanning && permissionStatus === PermissionStatus.DENIED && (
            <View className="flex-1 h-full flex flex-col items-center justify-center gap-2 p-6">
              <CameraOff className="text-foreground" size={64} />
              <Text className="text-2xl text-foreground text-center">
                Camera Permission Denied
              </Text>
              <Text className="text-muted-foreground text-xl text-center">
                It seems you denied permissions to use your camera. You might
                need to go to your device settings to allow access to your
                camera again.
              </Text>
            </View>
          )}
          {isScanning && (
            <>
              <FocusableCamera onScanned={handleScanned} />
            </>
          )}
        </>
      )}
    </>
  );
}

export default QRCodeScanner;
