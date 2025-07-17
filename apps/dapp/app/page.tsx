"use client";

import {
  type DelegatedSigner,
  useAuth,
  useWallet,
} from "@crossmint/client-sdk-react-ui";
import { useState, useEffect } from "react";
import { LoginButton } from "@/components/login";
import { LogoutButton } from "@/components/logout";
import { WalletDisplay } from "@/components/wallet";
import type { PopupToParentMessage, ReadyMessage } from "@/types/popup";
import { isValidParentMessage } from "@/types/popup";

// Environment variables
const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";
const PORTAL_ORIGIN = new URL(PORTAL_URL).origin;

export default function DAppPage() {
  const { wallet, status: walletStatus } = useWallet();
  const { status: authStatus } = useAuth();
  const [receivedSigner, setReceivedSigner] = useState<string | null>(null);
  const [delegatedSigners, setDelegatedSigners] = useState<DelegatedSigner[]>(
    []
  );
  const [isDelegatedSignerLoading, setIsDelegatedSignerLoading] =
    useState<boolean>(false);

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";
  const isWalletLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  // Fetch delegated signers
  useEffect(() => {
    const fetchDelegatedSigners = async () => {
      if (!wallet) return;
      const signers = await wallet.delegatedSigners();
      setDelegatedSigners(signers);
    };
    fetchDelegatedSigners();
  }, [wallet]);

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
        // Check if this is a delegatedSigner message
        if ("delegatedSigner" in event.data) {
          console.log(
            "📨 Received delegated signer from Portal:",
            event.data.delegatedSigner
          );
          setReceivedSigner(event.data.delegatedSigner);
        }

        // Check if this is a signature message
        if ("signature" in event.data) {
          console.log(
            "📨 Received signature from Portal:",
            event.data.signature
          );
          // Handle signature if needed
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleAddDelegatedSigner = async () => {
    if (!receivedSigner || !isLoggedIn || !walletAddress) {
      console.error("Missing required data for connection");
      return;
    }

    try {
      if (!wallet) {
        throw new Error("No EVM smart wallet connected");
      }

      setIsDelegatedSignerLoading(true);

      console.log("🔗 Adding delegated signer to wallet...");
      // check if the signer is already added
      const isSignerAdded = delegatedSigners.some(
        (signer) => signer.signer === `external-wallet:${receivedSigner}`
      );
      if (!isSignerAdded) {
        await wallet.addDelegatedSigner({
          signer: `external-wallet:${receivedSigner}`,
        });

        console.log("✅ Delegated signer added successfully");
      } else {
        console.log("🔗 Signer already added");
      }

      console.log("📤 Sending wallet address back to Portal:", walletAddress);

      const response: PopupToParentMessage = { wallet: walletAddress };
      window.opener?.postMessage(response, PORTAL_ORIGIN);

      console.log("🎉 Connection process completed successfully");

      window.close();
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
        <h1 className="text-2xl font-bold text-gray-900">DApp Integration</h1>
        <p className="text-gray-600 text-sm">
          Integrate with Portal using delegated signers
        </p>
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
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                onClick={handleAddDelegatedSigner}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
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
    </div>
  );
}
