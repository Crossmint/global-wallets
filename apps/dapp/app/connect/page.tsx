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
import { WalletDisplay } from "@/components/wallet";
import { Footer } from "@/components/footer";
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
  const [childWindow, setChildWindow] = useState<ChildWindow<
    PortalEvents,
    DAppEvents
  > | null>(null);

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";

  // Initialize child window communication
  useEffect(() => {
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
        setReceivedSigner(data.signer);
      });
    } catch (error) {
      console.error("Failed to initialize child window:", error);
    }

    return () => {
      setChildWindow(null);
    };
  }, []);

  const handleConnect = async () => {
    if (!receivedSigner || !isLoggedIn || !childWindow || !walletAddress) {
      return;
    }

    try {
      if (wallet == null || walletType !== "evm-smart-wallet") {
        throw new Error("No EVM smart wallet connected");
      }

      await wallet.addDelegatedSigner({
        chain: CHAIN as EVMSmartWalletChain,
        signer: `evm-keypair:${receivedSigner}`,
      });

      childWindow.send("wallet", {
        address: walletAddress,
      });
    } catch (error) {
      console.error("Failed to connect to Portal:", error);
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
            {isLoggedIn ? (
              <WalletDisplay address={walletAddress} />
            ) : (
              <LoginButton />
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
              text={receivedSigner || undefined}
              type="Portal Signer"
            />
            {receivedSigner && isLoggedIn && (
              <button
                type="button"
                onClick={handleConnect}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Signer
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
