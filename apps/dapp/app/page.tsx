"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import type {
  EVMSmartWalletChain,
  EVMSmartWallet,
} from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LoginButton } from "@/components/login";
import { LogoutButton } from "@/components/logout";
import { WalletDisplay } from "@/components/wallet";
import { Footer } from "@/components/footer";
import type {
  PopupToParentMessage,
  ReadyMessage,
} from "@/types/popup-communication";
import { isValidParentMessage } from "@/types/popup-communication";

// Environment variables
const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";
const CHAIN = process.env.NEXT_PUBLIC_CHAIN ?? "story-testnet";
const PORTAL_ORIGIN = new URL(PORTAL_URL).origin;

export default function DAppPage() {
  const { wallet, status: walletStatus } = useWallet();
  const { status: authStatus } = useAuth();
  const [receivedSigner, setReceivedSigner] = useState<string | null>(null);
  const [isDelegatedSignerLoading, setIsDelegatedSignerLoading] =
    useState<boolean>(false);

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";
  const isWalletLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  // Send ready message to parent on mount
  useEffect(() => {
    const readyMessage: ReadyMessage = { type: "ready" };
    window.opener?.postMessage(readyMessage, PORTAL_ORIGIN);
    console.log("📤 Sent ready message to parent");
  }, []);

  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== PORTAL_ORIGIN) {
        console.warn("Received message from unknown origin:", event.origin);
        return;
      }

      if (isValidParentMessage(event.data)) {
        console.log(
          "📨 Received delegated signer from Portal:",
          event.data.delegatedSigner
        );
        setReceivedSigner(event.data.delegatedSigner);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = async () => {
    if (!receivedSigner || !isLoggedIn || !walletAddress) {
      console.error("Missing required data for connection");
      return;
    }

    try {
      if (wallet == null || !("addDelegatedSigner" in wallet)) {
        throw new Error("No EVM smart wallet connected");
      }

      setIsDelegatedSignerLoading(true);

      console.log("🔗 Adding delegated signer to wallet...");
      await (wallet as EVMSmartWallet).addDelegatedSigner({
        chain: CHAIN as EVMSmartWalletChain,
        signer: `evm-keypair:${receivedSigner}`,
      });

      console.log("✅ Delegated signer added successfully");
      console.log("📤 Sending wallet address back to Portal:", walletAddress);

      const response: PopupToParentMessage = { wallet: walletAddress };
      window.opener?.postMessage(response, PORTAL_ORIGIN);

      console.log("🎉 Connection process completed successfully");
    } catch (error) {
      console.error("Failed to connect to Portal:", error);
    } finally {
      setIsDelegatedSignerLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <Image
          src="/crossmint.svg"
          alt="Crossmint logo"
          priority
          width={150}
          height={150}
          className="mb-6"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DApp Integration</h1>
          <p className="text-gray-600 text-sm">
            Integrate with Portal using delegated signers
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
        {/* Your Wallet */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Wallet</h2>
            {!isLoggedIn ? (
              <LoginButton />
            ) : isWalletLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 text-sm ml-3">Loading wallet...</p>
              </div>
            ) : (
              <WalletDisplay address={walletAddress} />
            )}
          </div>
        </div>

        {/* Delegated Signer */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Delegated Signer
            </h2>
            <WalletDisplay
              text="Fetching signer..."
              address={receivedSigner || undefined}
            />
            {receivedSigner && isLoggedIn && (
              <button
                disabled={isDelegatedSignerLoading}
                type="button"
                onClick={handleConnect}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isDelegatedSignerLoading ? "Adding Signer..." : "Add Signer"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      {isLoggedIn && (
        <div className="mt-8 flex justify-center">
          <LogoutButton />
        </div>
      )}

      <Footer />
    </div>
  );
}
