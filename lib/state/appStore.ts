import { create } from "zustand";
import { NWCClient, Nip47Capability } from "@getalby/sdk/dist/NWCClient";
import { nwc } from "@getalby/sdk";
import { secureStorage } from "lib/secureStorage";

interface AppState {
  readonly nwcClient: NWCClient | undefined;
  readonly fiatCurrency: string;
  readonly selectedWalletId: number;
  readonly wallets: Wallet[];
  readonly addressBookEntries: AddressBookEntry[];
  setNWCClient: (nwcClient: NWCClient | undefined) => void;
  setNostrWalletConnectUrl(nostrWalletConnectUrl: string): void;
  removeNostrWalletConnectUrl(): void;
  updateCurrentWallet(wallet: Partial<Wallet>): void;
  removeCurrentWallet(): void;
  setFiatCurrency(fiatCurrency: string): void;
  setSelectedWalletId(walletId: number): void;
  addWallet(wallet: Wallet): void;
  addAddressBookEntry(entry: AddressBookEntry): void;
  reset(): void;
  showOnboarding(): void;
}

const walletKeyPrefix = "wallet";
const addressBookEntryKeyPrefix = "addressBookEntry";
const selectedWalletIdKey = "selectedWalletId";
const fiatCurrencyKey = "fiatCurrency";
export const hasOnboardedKey = "hasOnboarded";

type Wallet = {
  name?: string;
  nostrWalletConnectUrl?: string;
  lightningAddress?: string;
  nwcCapabilities?: Nip47Capability[];
};

type AddressBookEntry = {
  name?: string;
  lightningAddress?: string;
};

const getWalletKey = (walletId: number) => {
  return walletKeyPrefix + walletId;
};

const getAddressBookEntryKey = (addressBookEntryId: number) => {
  return addressBookEntryKeyPrefix + addressBookEntryId;
};

function loadWallets(): Wallet[] {
  const wallets: Wallet[] = [];
  for (let i = 0; ; i++) {
    const walletJSON = secureStorage.getItem(getWalletKey(i));
    if (!walletJSON) {
      break;
    }
    wallets.push(JSON.parse(walletJSON));
  }
  if (!wallets.length) {
    wallets.push({});
  }
  return wallets;
}

function loadAddressBookEntries(): AddressBookEntry[] {
  const addressBookEntries: AddressBookEntry[] = [];
  for (let i = 0; ; i++) {
    const addressBookEntryJSON = secureStorage.getItem(
      getAddressBookEntryKey(i),
    );
    if (!addressBookEntryJSON) {
      break;
    }
    addressBookEntries.push(JSON.parse(addressBookEntryJSON));
  }
  return addressBookEntries;
}

export const useAppStore = create<AppState>()((set, get) => {
  const updateCurrentWallet = (walletUpdate: Partial<Wallet>) => {
    const selectedWalletId = get().selectedWalletId;
    const wallets = [...get().wallets];

    const wallet: Wallet = {
      ...(wallets[selectedWalletId] || {}),
      ...walletUpdate,
    };
    secureStorage.setItem(
      getWalletKey(selectedWalletId),
      JSON.stringify(wallet),
    );
    wallets[selectedWalletId] = wallet;
    set({
      wallets,
    });
  };

  const removeCurrentWallet = () => {
    const wallets = [...get().wallets];
    if (wallets.length <= 1) {
      // cannot delete last wallet
      return;
    }
    const selectedWalletId = get().selectedWalletId;

    // move existing wallets down one
    for (let i = selectedWalletId; i < wallets.length - 1; i++) {
      const nextWallet = secureStorage.getItem(getWalletKey(i + 1));
      if (!nextWallet) {
        throw new Error("Next wallet not found");
      }
      secureStorage.setItem(getWalletKey(i), nextWallet);
    }

    secureStorage.removeItem(getWalletKey(wallets.length - 1));

    get().setSelectedWalletId(0);
    set({
      wallets: wallets.filter((_, i) => i !== selectedWalletId),
    });
  };

  const initialSelectedWalletId = +(
    secureStorage.getItem(selectedWalletIdKey) || "0"
  );
  const initialWallets = loadWallets();
  return {
    addressBookEntries: loadAddressBookEntries(),
    wallets: initialWallets,
    nwcClient: getNWCClient(initialSelectedWalletId),
    fiatCurrency: secureStorage.getItem(fiatCurrencyKey) || "",
    selectedWalletId: initialSelectedWalletId,
    updateCurrentWallet,
    removeCurrentWallet,
    setNWCClient: (nwcClient) => set({ nwcClient }),
    removeNostrWalletConnectUrl: () => {
      updateCurrentWallet({
        nostrWalletConnectUrl: undefined,
      });

      set({ nwcClient: undefined });
    },
    setNostrWalletConnectUrl: (nostrWalletConnectUrl) => {
      updateCurrentWallet({
        nostrWalletConnectUrl,
      });
    },
    setFiatCurrency: (fiatCurrency) => {
      secureStorage.setItem(fiatCurrencyKey, fiatCurrency);
      set({ fiatCurrency });
    },
    setSelectedWalletId: (selectedWalletId) => {
      set({
        selectedWalletId,
        nwcClient: getNWCClient(selectedWalletId),
      });
      secureStorage.setItem(selectedWalletIdKey, selectedWalletId.toString());
    },
    addWallet: (wallet: Wallet) => {
      const currentWallets = get().wallets;
      const newWalletId = currentWallets.length;
      secureStorage.setItem(getWalletKey(newWalletId), JSON.stringify(wallet));
      set({
        wallets: [...currentWallets, wallet],
        selectedWalletId: newWalletId,
        nwcClient: undefined,
      });
    },
    addAddressBookEntry: (addressBookEntry: AddressBookEntry) => {
      const currentAddressBookEntries = get().addressBookEntries;
      const newAddressBookEntryId = currentAddressBookEntries.length;
      secureStorage.setItem(
        getAddressBookEntryKey(newAddressBookEntryId),
        JSON.stringify(addressBookEntry),
      );
      set({
        addressBookEntries: [...currentAddressBookEntries, addressBookEntry],
      });
    },
    showOnboarding() {
      // clear onboarding status
      secureStorage.removeItem(hasOnboardedKey);
    },
    reset() {
      // clear wallets
      for (let i = 0; i < get().wallets.length; i++) {
        secureStorage.removeItem(getWalletKey(i));
      }
      // clear address book
      for (let i = 0; i < get().addressBookEntries.length; i++) {
        secureStorage.removeItem(getAddressBookEntryKey(i));
      }
      // clear selected wallet ID
      secureStorage.removeItem(selectedWalletIdKey);

      // clear onboarding status
      secureStorage.removeItem(hasOnboardedKey);

      set({
        nwcClient: undefined,
        fiatCurrency: undefined,
        selectedWalletId: undefined,
        wallets: [],
        addressBookEntries: [],
      });
    },
  };
});

function getNWCClient(walletId: number): nwc.NWCClient | undefined {
  const walletJSON = secureStorage.getItem(getWalletKey(walletId));
  if (!walletJSON) {
    console.info("No wallet set", walletId);
    return undefined;
  }
  const wallet: Wallet = JSON.parse(walletJSON);
  if (!wallet.nostrWalletConnectUrl) {
    console.info("No wallet NWC URL set");
    return undefined;
  }

  return new nwc.NWCClient({
    nostrWalletConnectUrl: wallet.nostrWalletConnectUrl,
  });
}
