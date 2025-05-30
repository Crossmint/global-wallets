"use client";

import Image from "next/image";

interface WalletDisplayProps {
  address?: string;
  text?: string;
  type?: string;
  className?: string;
}

export function WalletDisplay({
  address,
  text,
  type,
  className = "",
}: WalletDisplayProps) {
  const displayText = address
    ? `${address.slice(0, 7)}...${address.slice(-5)}`
    : text;
  const displayValue = address || text || "";

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const image = button.querySelector("img");

    await navigator.clipboard.writeText(displayValue);

    button.disabled = true;
    button.style.color = "var(--accent)";
    if (image) {
      image.src = "/check.svg";
      image.alt = "Copied";
    }

    setTimeout(() => {
      button.disabled = false;
      button.style.color = "";
      if (image) {
        image.src = "/copy.svg";
        image.alt = "Copy";
      }
    }, 2000);
  };

  if (!displayText) {
    return (
      <div className={`bg-gray-50 rounded-lg p-3 border ${className}`}>
        <p className="text-sm text-gray-400">Not connected</p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between bg-gray-50 rounded-lg p-3 border ${className}`}
    >
      <div className="flex flex-col">
        {type && <span className="text-xs text-gray-500 mb-1">{type}</span>}
        <p className="text-sm font-mono text-gray-700">{displayText}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Image src="/copy.svg" alt="Copy" width={16} height={16} />
      </button>
    </div>
  );
}

interface WalletCardProps {
  title: string;
  walletAddress?: string;
  type?: string;
}

export function WalletCard({ walletAddress, title, type }: WalletCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <WalletDisplay address={walletAddress} />
      </div>
    </div>
  );
}
