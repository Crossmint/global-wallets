"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  isValidEVMChain,
} from "@crossmint/client-sdk-react-ui";

if (!process.env.NEXT_PUBLIC_CROSSMINT_API_KEY) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_API_KEY is not set");
}

if (!process.env.NEXT_PUBLIC_CHAIN) {
  throw new Error("NEXT_PUBLIC_CHAIN is not set");
}

if (!isValidEVMChain(process.env.NEXT_PUBLIC_CHAIN)) {
  throw new Error("NEXT_PUBLIC_CHAIN is not a valid EVM chain");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || ""}>
      <CrossmintAuthProvider
        authModalTitle="EVM Wallets Quickstart"
        embeddedWallets={{
          createOnLogin: "all-users",
          type: "evm-smart-wallet",
          showPasskeyHelpers: true,
        }}
        loginMethods={["web3:evm-only"]}
      >
        {children}
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
