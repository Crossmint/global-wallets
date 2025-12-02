"use client";

import {
  type DelegatedSigner,
  EVMWallet,
  useAuth,
  useWallet,
} from "@crossmint/client-sdk-react-ui";
import { useState, useEffect, useCallback } from "react";
import { LoginButton } from "@/components/login";
import { LogoutButton } from "@/components/logout";
import { WalletDisplay } from "@/components/wallet";
import type { PopupToParentMessage, ReadyMessage } from "@/types/popup";
import { isValidParentMessage } from "@/types/popup";

// Environment variables
const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";
const PORTAL_ORIGIN = new URL(PORTAL_URL).origin;

export default function DAppPage() {
  const { wallet, status: walletStatus } = useWallet();

  const { status: authStatus } = useAuth();
  const [receivedSigner, setReceivedSigner] = useState<string | null>(null);
  const [delegatedSigners, setDelegatedSigners] = useState<DelegatedSigner[]>(
    []
  );
  const [isDelegatedSignerLoading, setIsDelegatedSignerLoading] =
    useState<boolean>(false);
  const [isPreparingTransactionLoading, setIsPreparingTransactionLoading] =
    useState<boolean>(false);
  const [isApprovingTransactionLoading, setIsApprovingTransactionLoading] =
    useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const walletAddress = wallet?.address;
  const isLoggedIn = !!walletAddress && authStatus === "logged-in";
  const isWalletLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  const handleAddDelegatedSigner = async () => {
    if (!receivedSigner || !isLoggedIn || !walletAddress) {
      console.error("Missing required data for connection");
      return;
    }

    try {
      if (!wallet) {
        throw new Error("No EVM smart wallet connected");
      }

      setIsDelegatedSignerLoading(true);

      console.log("🔗 Adding delegated signer to wallet...");
      // check if the signer is already added
      const isSignerAdded = delegatedSigners.some(
        (signer) => signer.signer === `external-wallet:${receivedSigner}`
      );
      if (!isSignerAdded) {
        await wallet.addDelegatedSigner({
          signer: `external-wallet:${receivedSigner}`,
        });

        console.log("✅ Delegated signer added successfully");
      } else {
        console.log("🔗 Signer already added");
      }

      console.log("📤 Sending wallet address back to Portal:", walletAddress);

      const response: PopupToParentMessage = { wallet: walletAddress };
      window.opener?.postMessage(response, PORTAL_ORIGIN);

      console.log("🎉 Connection process completed successfully");
    } catch (error) {
      console.error("Failed to connect to Portal:", error);
    } finally {
      setIsDelegatedSignerLoading(false);
    }
  };

  const handlePrepareTransaction = async () => {
    if (!wallet || !isLoggedIn) {
      console.error("Wallet not connected");
      return;
    }

    try {
      setIsPreparingTransactionLoading(true);

      console.log("📤 Sending transaction...");

      // Example transaction - sending a small amount to Portal signer
      const evmWallet = EVMWallet.from(wallet);
      const txResult = await evmWallet.sendTransaction({
        options: {
          experimental_prepareOnly: true, // Tx will be signed afterwards
          experimental_signer: `external-wallet:${receivedSigner}`, // Signer will be delegated signer (Portal)
        },
        to: receivedSigner as `0x${string}`,
        value: 1000000000000000n, // 0.001 ETH (IP)
      });

      const tx = await evmWallet.experimental_transaction(
        txResult.transactionId
      );

      const message = tx.approvals?.pending?.[0]?.message ?? "";

      setTransactionId(txResult.transactionId);

      // send message to parent
      const response: PopupToParentMessage = { messageToSign: message };
      window.opener?.postMessage(response, PORTAL_ORIGIN);

      console.log("✅ Message sent successfully:", message);
    } catch (error) {
      console.error("Failed to send transaction:", error);
    } finally {
      setIsPreparingTransactionLoading(false);
    }
  };

  const handleApproveTransaction = useCallback(
    async (signature: string) => {
      if (!wallet || !isLoggedIn || !receivedSigner) {
        console.error("Wallet not connected");
        return;
      }

      if (!transactionId) {
        console.error("Transaction ID not found");
        return;
      }

      try {
        setIsApprovingTransactionLoading(true);

        const txResult = await wallet.approve({
          transactionId,
          options: {
            experimental_approval: {
              signer: `external-wallet:${receivedSigner}`,
              signature,
            },
          },
        });

        setTransactionHash(txResult.hash);
        console.log("✅ Transaction approved successfully:", txResult);
      } catch (error) {
        console.error("Failed to approve transaction:", error);
      } finally {
        setIsApprovingTransactionLoading(false);
      }
    },
    [wallet, isLoggedIn, transactionId, receivedSigner]
  );

  // Fetch delegated signers
  useEffect(() => {
    const fetchDelegatedSigners = async () => {
      if (!wallet) return;
      const signers = await wallet.delegatedSigners();
      setDelegatedSigners(signers);
    };
    fetchDelegatedSigners();
  }, [wallet]);

  // Send ready message to parent on mount
  useEffect(() => {
    const readyMessage: ReadyMessage = { type: "ready" };
    window.opener?.postMessage(readyMessage, PORTAL_ORIGIN);
    console.log("📤 Sent ready message to parent");
  }, []);

  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== PORTAL_ORIGIN) {
        console.warn("Received message from unknown origin:", event.origin);
        return;
      }

      if (isValidParentMessage(event.data)) {
        // Check if this is a delegatedSigner message
        if ("delegatedSigner" in event.data) {
          console.log(
            "📨 Received delegated signer from Portal:",
            event.data.delegatedSigner
          );
          setReceivedSigner(event.data.delegatedSigner);
        }

        // Check if this is a signature message
        if ("signature" in event.data) {
          console.log(
            "📨 Received signature from Portal:",
            event.data.signature
          );

          if (!transactionHash && !isApprovingTransactionLoading) {
            console.log(
              "🚀 Approving transaction with signature:",
              event.data.signature
            );
            handleApproveTransaction(event.data.signature);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    handleApproveTransaction,
    transactionHash,
    isApprovingTransactionLoading,
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl font-bold text-gray-900">DApp Integration</h1>
        <p className="text-gray-600 text-sm">
          Integrate with Portal using delegated signers
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
        {/* Your Wallet */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Wallet</h2>
            {!isLoggedIn ? (
              <LoginButton />
            ) : isWalletLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 text-sm ml-3">Loading wallet...</p>
              </div>
            ) : (
              <WalletDisplay address={walletAddress} />
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
              text="Fetching signer..."
              address={receivedSigner || undefined}
            />
            {receivedSigner && isLoggedIn && (
              <button
                disabled={isDelegatedSignerLoading}
                type="button"
                onClick={handleAddDelegatedSigner}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isDelegatedSignerLoading ? "Adding Signer..." : "Add Signer"}
              </button>
            )}
          </div>
        </div>

        {/* Send Transaction */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Send Transaction
            </h2>
            <WalletDisplay
              text={
                isPreparingTransactionLoading || isApprovingTransactionLoading
                  ? "Sending transaction..."
                  : "Send Transaction"
              }
              address={transactionHash || undefined}
            />
            {isLoggedIn && (
              <button
                disabled={
                  isPreparingTransactionLoading || isApprovingTransactionLoading
                }
                type="button"
                onClick={handlePrepareTransaction}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isPreparingTransactionLoading
                  ? "Sending..."
                  : "Send Transaction"}
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
    </div>
  );
}
