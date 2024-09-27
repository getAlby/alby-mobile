import { hasOnboardedKey } from "lib/state/appStore";
import React from "react";
import { useEffect } from "react";
import { secureStorage } from "~/lib/secureStorage";

export function useOnboarding() {
  const [onboarded, setOnboarded] = React.useState(false);
  useEffect(() => {
    async function checkOnboardingStatus() {
      const hasOnboarded = await secureStorage.getItem(hasOnboardedKey);
      setOnboarded(!!hasOnboarded);
    }

    checkOnboardingStatus();
  });

  return onboarded;
}
