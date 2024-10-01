import LottieView from "lottie-react-native";

export function Tick() {
  return (
    <LottieView
      autoPlay
      loop={false}
      style={{
        width: 400,
        height: 400,
      }}
      source={require("../assets/animations/success.json")}
    />
  );
}
