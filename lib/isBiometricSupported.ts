import * as LocalAuthentication from "expo-local-authentication";

export async function isBiometricSupported() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
  return compatible && securityLevel > 0;
}
