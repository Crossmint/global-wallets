"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { LoginButton } from "@/components/login";
import { LogoutButton } from "@/components/logout";
import { WalletDisplay } from "@/components/wallet-display";

export default function DAppPage() {
  const { wallet, status: walletStatus } = useWallet();
  const { status: authStatus } = useAuth();

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your DApp wallet...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">DApp Wallet</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your decentralized application wallet powered by Crossmint
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
            <h1 className="text-3xl font-bold text-gray-900">DApp</h1>
            <p className="text-gray-600">Decentralized Application</p>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Wallet icon</title>
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your Wallet
              </h2>
            </div>
            <WalletDisplay address={walletAddress} />
            <LogoutButton />
          </div>
        </div>

        {/* Portal Integration Info */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Integration icon</title>
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Portal Integration
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              This DApp supports Portal wallet integration via delegated
              signers. The `/connect` endpoint enables secure Portal
              connections.
            </p>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-500 mb-1">
                Integration Endpoint:
              </p>
              <code className="text-sm text-green-700 font-mono">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /connect
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
