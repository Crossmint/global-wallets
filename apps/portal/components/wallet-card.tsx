import Image from "next/image";
import { LogoutButton } from "./logout";
import { WalletDisplay } from "./wallet-display";

interface WalletCardProps {
  walletAddress: string;
}

export function WalletCard({ walletAddress }: WalletCardProps) {
  return (
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
          <h2 className="text-xl font-semibold text-gray-900">Your Wallet</h2>
        </div>
        <WalletDisplay address={walletAddress} />
        <LogoutButton />
      </div>
    </div>
  );
}
