"use client";

import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { LoginButton } from "@/components/login";
import { LogoutButton } from "@/components/logout";
import { WalletCard } from "@/components/wallet";
import { Footer } from "@/components/footer";

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
            DApp Integration
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm">
            Integrate with Portal using delegated signers
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
          <h1 className="text-2xl font-bold text-gray-900">DApp Integration</h1>
          <p className="text-gray-600 text-sm">
            Integrate with Portal using delegated signers
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
        <WalletCard title="Your wallet" walletAddress={walletAddress} />

        {/* Add Delegated Signer card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Delegated Signer
            </h2>
            <p className="text-sm text-gray-600">
              Allow third parties to sign transactions on behalf of your wallet
            </p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-8 flex justify-center">
        <LogoutButton />
      </div>

      <Footer />
    </div>
  );
}
