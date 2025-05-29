"use client";

import {
  type EVMSmartWalletChain,
  useAuth,
  useWallet,
} from "@crossmint/client-sdk-react-ui";
import { ChildWindow } from "@crossmint/client-sdk-window";
import Image from "next/image";
import { LogoutButton } from "@/components/logout";
import { LoginButton } from "@/components/login";
import { ConnectionStatus } from "@/components/connection-status";
import { WalletDisplay } from "@/components/wallet-display";
import { useEffect, useState } from "react";
import { z } from "zod";

// Environment variables
const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

const CHAIN = process.env.NEXT_PUBLIC_CHAIN || "story-testnet";

// Event schemas
const FROM_PORTAL_EVENTS = {
  delegatedSigner: z.object({
    signer: z.string(),
  }),
};

const FROM_DAPP_EVENTS = {
  wallet: z.object({
    address: z.string(),
  }),
};

type PortalEvents = typeof FROM_PORTAL_EVENTS;
type DAppEvents = typeof FROM_DAPP_EVENTS;

export default function ConnectPage() {
  const { wallet, status: walletStatus, type: walletType } = useWallet();
  const { status: authStatus } = useAuth();
  const [receivedSigner, setReceivedSigner] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "received" | "sent" | "completed"
  >("connecting");
  const [childWindow, setChildWindow] = useState<ChildWindow<
    PortalEvents,
    DAppEvents
  > | null>(null);

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  // Initialize child window communication - always assume we're in iframe
  useEffect(() => {
    console.log("🔌 Initializing iframe communication with Portal...");

    try {
      const crossmintChild = new ChildWindow<PortalEvents, DAppEvents>(
        window.parent,
        PORTAL_URL,
        {
          incomingEvents: FROM_PORTAL_EVENTS,
          outgoingEvents: FROM_DAPP_EVENTS,
        }
      );

      setChildWindow(crossmintChild);

      crossmintChild.on("delegatedSigner", (data) => {
        console.log("✅ Received delegated signer from Portal:", data);
        setReceivedSigner(data.signer);
        setConnectionStatus("received");
      });

      console.log("🤝 Child window initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize child window:", error);
    }

    return () => {
      setChildWindow(null);
    };
  }, []);

  // Send wallet address to Portal when user logs in and we have a signer
  useEffect(() => {
    if (
      isLoggedIn &&
      receivedSigner &&
      childWindow &&
      connectionStatus === "received"
    ) {
      console.log("📤 Sending wallet address to Portal:", walletAddress);

      try {
        childWindow.send("wallet", {
          address: walletAddress,
        });
        setConnectionStatus("sent");

        // Add the received signer as a delegated signer to the wallet
        addDelegatedSigner(receivedSigner);
      } catch (error) {
        console.error("❌ Failed to send wallet address:", error);
      }
    }
  }, [
    isLoggedIn,
    receivedSigner,
    walletAddress,
    connectionStatus,
    childWindow,
  ]);

  const addDelegatedSigner = async (signerAddress: string) => {
    try {
      console.log("🔐 Adding delegated signer to wallet:", signerAddress);

      if (wallet == null || walletType !== "evm-smart-wallet") {
        throw new Error("No wallet connected");
      }

      await wallet.addDelegatedSigner({
        chain: CHAIN as EVMSmartWalletChain,
        signer: `evm-keypair:${signerAddress}`,
      });
      setConnectionStatus("completed");
    } catch (error) {
      console.error("❌ Failed to add delegated signer:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading DApp connection...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <Image
              src="/crossmint.svg"
              alt="Crossmint logo"
              priority
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              DApp Connection
            </h1>
            <p className="text-gray-600 text-sm">
              Please log in to your wallet to establish connection with Portal
            </p>
          </div>

          <div className="space-y-4">
            {receivedSigner && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>Success icon</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-green-800 font-medium">
                    Portal Connected
                  </p>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Received delegated signer: {receivedSigner.slice(0, 8)}...
                  {receivedSigner.slice(-6)}
                </p>
              </div>
            )}

            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <Image
              src="/crossmint.svg"
              alt="Crossmint logo"
              priority
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              DApp Connection
            </h1>
            <p className="text-gray-600">
              Establishing secure connection with Portal
            </p>
          </div>

          <div className="space-y-6">
            <ConnectionStatus
              receivedSigner={receivedSigner}
              isLoggedIn={isLoggedIn}
              connectionStatus={connectionStatus}
            />

            {/* Wallet Info */}
            {isLoggedIn && (
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Your Wallet
                </h3>
                <WalletDisplay address={walletAddress} />
              </div>
            )}

            {/* Received Signer Info */}
            {receivedSigner && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Delegated Signer
                </h3>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">
                    Received from Portal:
                  </p>
                  <p className="text-sm font-mono text-green-700 font-medium">
                    {receivedSigner.slice(0, 8)}...{receivedSigner.slice(-8)}
                  </p>
                </div>
                {connectionStatus === "completed" && (
                  <div className="mt-3 bg-green-100 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Successfully added as delegated signer to your wallet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Success State */}
            {connectionStatus === "completed" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>Success icon</title>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Connection Established!
                </h3>
                <p className="text-green-700 text-sm">
                  Your wallet is now connected to Portal with delegated signing
                  capabilities.
                </p>
              </div>
            )}

            {/* Logout Button */}
            {isLoggedIn && (
              <div className="pt-4 border-t border-gray-200">
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
