"use client";
import {
  CrossmintAuthProvider,
  CrossmintProvider,
} from "@crossmint/client-sdk-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { config } from "@/lib/wagmi";
const queryClient = new QueryClient();

const crossmintApiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? "";

if (!crossmintApiKey) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_API_KEY is not set");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CrossmintProvider apiKey={crossmintApiKey}>
          <CrossmintAuthProvider
            authModalTitle="Portal Wallet"
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}
