"use client";

import Image from "next/image";

interface WalletDisplayProps {
  address: string;
  className?: string;
}

export function WalletDisplay({ address, className = "" }: WalletDisplayProps) {
  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const image = button.querySelector("img");

    await navigator.clipboard.writeText(address);

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

  return (
    <div
      className={`flex items-center justify-between bg-white rounded-lg p-3 border ${className}`}
    >
      <p className="text-sm font-mono text-gray-600">
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </p>
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
