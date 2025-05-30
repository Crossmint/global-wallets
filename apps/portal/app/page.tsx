"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { IFrameWindow } from "@crossmint/client-sdk-window";
import Image from "next/image";
import { useState, useRef } from "react";
import { z } from "zod";
import { LoginButton } from "@/components/login";
import { WalletCard } from "@/components/wallet";
import { ConnectDApp } from "@/components/connect";
import { LogoutButton } from "@/components/logout";
import { Footer } from "@/components/footer";
import { ConnectModal } from "@/components/connect-modal";
import { useAccount } from "wagmi";

// Environment variables
const DAPP_URL = process.env.NEXT_PUBLIC_DAPP_URL ?? "http://localhost:3001";

// Message schemas
const FROM_DAPP_EVENTS = {
  wallet: z.object({
    address: z.string(),
  }),
};

const FROM_PORTAL_EVENTS = {
  delegatedSigner: z.object({
    signer: z.string(),
  }),
};

type DAppEvents = typeof FROM_DAPP_EVENTS;
type PortalEvents = typeof FROM_PORTAL_EVENTS;

export default function PortalPage() {
  const { wallet: smartWallet, status: walletStatus } = useWallet();
  const { address: signerAddress } = useAccount();
  const { status: authStatus } = useAuth();
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const smartWalletAddress = smartWallet?.address;
  const isLoggedIn =
    !!smartWalletAddress && !!signerAddress && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  const handleConnect = async () => {
    if (!signerAddress) return;

    setIsConnecting(true);
    setShowModal(true);
  };

  const handleIframeLoad = async () => {
    if (!iframeRef.current || !signerAddress) {
      return;
    }

    try {
      const appWindow = IFrameWindow.initExistingIFrame<
        DAppEvents,
        PortalEvents
      >(iframeRef.current, {
        incomingEvents: FROM_DAPP_EVENTS,
        outgoingEvents: FROM_PORTAL_EVENTS,
      });

      // Listen for wallet response
      appWindow.on("wallet", (data) => {
        console.log("✅ Received wallet from DApp:", data);
        setConnectedWallet(data.address);
        setIsConnecting(false);
        setShowModal(false);
      });

      // Send delegated signer with interval hack
      setInterval(() => {
        appWindow.send("delegatedSigner", {
          signer: signerAddress,
        });
      }, 1000);

      console.log(
        "🚀 Started sending delegated signer to DApp:",
        signerAddress
      );
    } catch (error) {
      console.error("❌ Failed to initialize iframe communication:", error);
      setIsConnecting(false);
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsConnecting(false);
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

      {/* Connect Modal */}
      <ConnectModal
        ref={iframeRef}
        isOpen={showModal}
        onClose={handleCloseModal}
        dappUrl={`${DAPP_URL}/connect`}
        onIframeLoad={handleIframeLoad}
      />

      {/* Logout Button */}
      <div className="mt-8 flex justify-center">
        <LogoutButton />
      </div>

      <Footer />
    </div>
  );
}
