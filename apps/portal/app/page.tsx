"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LoginButton } from "@/components/login";
import { WalletCard } from "@/components/wallet";
import { ConnectDApp } from "@/components/connect";
import { LogoutButton } from "@/components/logout";
import { Footer } from "@/components/footer";
import { useAccount } from "wagmi";
import type {
  ParentToPopupMessage,
  PopupToParentMessage,
  ReadyMessage,
} from "@/types/popup-communication";
import {
  isValidPopupMessage,
  isValidReadyMessage,
} from "@/types/popup-communication";

// Environment variables
const DAPP_URL = process.env.NEXT_PUBLIC_DAPP_URL ?? "http://localhost:3001";
const DAPP_ORIGIN = new URL(DAPP_URL).origin;

export default function PortalPage() {
  const { wallet: smartWallet, status: walletStatus } = useWallet();
  const { address: signerAddress } = useAccount();
  const { status: authStatus } = useAuth();
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [isPopupReady, setIsPopupReady] = useState(false);

  const smartWalletAddress = smartWallet?.address;

  const isLoggedIn =
    !!smartWalletAddress && !!signerAddress && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  // Handle incoming messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== DAPP_ORIGIN) {
        console.warn("Received message from unknown origin:", event.origin);
        return;
      }

      if (isValidReadyMessage(event.data)) {
        console.log("✅ Popup is ready");
        setIsPopupReady(true);
      } else if (isValidPopupMessage(event.data)) {
        console.log("✅ Received wallet from DApp:", event.data.wallet);
        setConnectedWallet(event.data.wallet);
        setIsConnecting(false);
        setError(null);
      } else {
        console.error("Received invalid message format from popup");
        setError("Received invalid message format from popup");
        setIsConnecting(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send delegated signer when popup is ready
  useEffect(() => {
    if (isPopupReady && popupWindow && signerAddress) {
      const message: ParentToPopupMessage = { delegatedSigner: signerAddress };
      popupWindow.postMessage(message, DAPP_ORIGIN);
      console.log("🚀 Sent delegated signer to DApp:", signerAddress);
    }
  }, [isPopupReady, popupWindow, signerAddress]);

  // Monitor popup lifecycle
  useEffect(() => {
    if (popupWindow) {
      const interval = setInterval(() => {
        if (popupWindow.closed) {
          console.log("Popup was closed");
          setPopupWindow(null);
          setIsPopupReady(false);
          setIsConnecting(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [popupWindow]);

  const handleConnect = async () => {
    if (!signerAddress) return;

    setIsConnecting(true);
    setError(null);

    const popup = window.open(
      DAPP_URL,
      "dapp-connection",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    if (popup) {
      setPopupWindow(popup);
      console.log("✅ Opened popup window");
    } else {
      setError(
        "Popup was blocked by browser. Please allow popups and try again."
      );
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-6 justify-center items-center min-h-[500px] px-4">
        <div className="text-center">
          <Image
            src="/crossmint.svg"
            alt="Crossmint logo"
            priority
            width={150}
            height={150}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Portal Wallets
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm">
            Connect your wallet to external DApps
          </p>
        </div>
        <div className="w-full max-w-sm">
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
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
          <h1 className="text-2xl font-bold text-gray-900">Portal Wallets</h1>
          <p className="text-gray-600 text-sm">
            Connect your wallet to external DApps
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
        <WalletCard title="Signer" walletAddress={signerAddress} />
        <WalletCard title="Smart Wallet" walletAddress={smartWalletAddress} />

        <ConnectDApp
          onConnect={handleConnect}
          isConnecting={isConnecting}
          connectedWallet={connectedWallet || undefined}
        />
      </div>

      {/* Logout Button */}
      <div className="mt-8 flex justify-center">
        <LogoutButton />
      </div>

      <Footer />
    </div>
  );
}
