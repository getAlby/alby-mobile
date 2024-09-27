import { ActivityIndicator } from "react-native";
import { cn } from "~/lib/utils";

function Loading({ className }: { className?: string }) {
  return <ActivityIndicator className={cn("text-primary", className)} />;
}

export default Loading;
