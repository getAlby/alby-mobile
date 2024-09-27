import { Stack } from "expo-router";
import { StackAnimationTypes } from "react-native-screens";
import { HeaderButtonProps } from "@react-navigation/native-stack/src/types";

type ScreenProps = {
  title: string;
  right?: (props: HeaderButtonProps) => React.ReactNode;
  animation?: StackAnimationTypes;
};

function Screen({ title, animation, right }: ScreenProps) {
  return (
    <Stack.Screen
      options={{
        title,
        animation,
        headerRight: right ? right : undefined,
        headerShadowVisible: false,
      }}
    />
  );
}

export default Screen;
