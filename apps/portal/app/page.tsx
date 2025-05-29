"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { IFrameWindow } from "@crossmint/client-sdk-window";
import Image from "next/image";
import { useState, useRef } from "react";
import { z } from "zod";
import { LoginButton } from "@/components/login";
import { WalletCard } from "@/components/wallet-card";
import { ConnectDAppCard } from "@/components/connect-dapp-card";
import { ConnectedDAppCard } from "@/components/connected-dapp-card";
import { ConnectionModal } from "@/components/connection-modal";

// Environment variables
const DAPP_URL = process.env.NEXT_PUBLIC_DAPP_URL ?? "http://localhost:3001";

// Event schemas
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
  const { wallet, status: walletStatus } = useWallet();
  const { status: authStatus } = useAuth();
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  const handleConnect = async () => {
    if (!walletAddress) return;

    setIsConnecting(true);
    setShowModal(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (!iframeRef.current) {
        throw new Error("Iframe not found");
      }

      const crossmintWindow = await IFrameWindow.init<DAppEvents, PortalEvents>(
        iframeRef.current,
        {
          incomingEvents: FROM_DAPP_EVENTS,
          outgoingEvents: FROM_PORTAL_EVENTS,
          targetOrigin: DAPP_URL,
        }
      );

      crossmintWindow.on("wallet", (data) => {
        console.log("✅ Received wallet from DApp:", data);
        setConnectedWallet(data.address);
        setIsConnecting(false);
        setShowModal(false);
      });

      crossmintWindow.send("delegatedSigner", {
        signer: walletAddress,
      });

      console.log("🚀 Sent delegated signer to DApp:", walletAddress);
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
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your Portal wallet...</p>
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
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Portal Wallets Integration
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Connect your Portal wallet to external DApps using delegated signers
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
      <div className="flex flex-col mb-12">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/crossmint.svg"
            alt="Crossmint logo"
            priority
            width={80}
            height={80}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portal</h1>
            <p className="text-gray-600">Main Portal Hub</p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WalletCard walletAddress={walletAddress} />
        <ConnectDAppCard
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />
        {connectedWallet && (
          <ConnectedDAppCard walletAddress={connectedWallet} />
        )}
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        ref={iframeRef}
        isOpen={showModal}
        onClose={handleCloseModal}
        dappUrl={DAPP_URL}
      />
    </div>
  );
}
