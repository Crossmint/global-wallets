"use client";
import {
  CrossmintAuthProvider,
  CrossmintProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

const crossmintApiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY ?? "";

export function Providers({ children }: { children: React.ReactNode }) {
  if (typeof window !== "undefined" && !crossmintApiKey) {
    throw new Error("NEXT_PUBLIC_CROSSMINT_API_KEY is not set");
  }
  return (
    <CrossmintProvider apiKey={crossmintApiKey}>
      <CrossmintAuthProvider
        authModalTitle="DApp Wallet"
        loginMethods={["web3:evm-only"]}
      >
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "story-testnet",
            signer: {
              type: "external-wallet",
            },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
