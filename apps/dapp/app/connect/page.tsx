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
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";

const CHAIN = process.env.NEXT_PUBLIC_CHAIN ?? "story-testnet";

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
    "connecting" | "received" | "processing" | "completed"
  >("connecting");
  const [isConnecting, setIsConnecting] = useState(false);
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

  const handleConnectToPortal = async () => {
    if (!receivedSigner || !isLoggedIn || !childWindow || !walletAddress) {
      console.error("❌ Missing required data for connection");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("processing");

    try {
      console.log("🔐 Adding delegated signer to wallet:", receivedSigner);

      // 1. Check if signer was received from events
      if (!receivedSigner) {
        throw new Error("No delegated signer received from Portal");
      }

      // 2. Add delegated signer to wallet
      if (wallet == null || walletType !== "evm-smart-wallet") {
        throw new Error("No EVM smart wallet connected");
      }

      await wallet.addDelegatedSigner({
        chain: CHAIN as EVMSmartWalletChain,
        signer: `evm-keypair:${receivedSigner}`,
      });

      console.log("✅ Delegated signer added successfully");

      // 3. Send event back to parent
      childWindow.send("wallet", {
        address: walletAddress,
      });

      console.log("📤 Sent wallet address to Portal:", walletAddress);
      setConnectionStatus("completed");
    } catch (error) {
      console.error("❌ Failed to connect to Portal:", error);
      setConnectionStatus("received"); // Reset to allow retry
    } finally {
      setIsConnecting(false);
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

            {/* Received Signer Info & Connect Button */}
            {receivedSigner && (
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Portal Delegated Signer
                </h3>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Portal wants to add this signer to your wallet:
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-mono text-gray-800 font-medium">
                      {receivedSigner.slice(0, 12)}...
                      {receivedSigner.slice(-12)}
                    </p>
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <title>Verified icon</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {connectionStatus === "received" && (
                  <button
                    type="button"
                    onClick={handleConnectToPortal}
                    disabled={!receivedSigner || !isLoggedIn || isConnecting}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting to Portal...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <title>Connect icon</title>
                          <path
                            fillRule="evenodd"
                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Connect to Portal
                      </>
                    )}
                  </button>
                )}

                {connectionStatus === "completed" && (
                  <div className="bg-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
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
                        ✅ Successfully connected to Portal!
                      </p>
                    </div>
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
