"use client";

import { forwardRef } from "react";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  dappUrl: string;
}

export const ConnectModal = forwardRef<HTMLIFrameElement, ConnectModalProps>(
  ({ isOpen, onClose, dappUrl }, ref) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-5xl h-5/6 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Connect to DApp
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <title>Close icon</title>
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              ref={ref}
              src={`${dappUrl}/connect`}
              className="w-full h-full border-0 rounded-b-2xl"
              title="DApp Connection"
            />
          </div>
        </div>
      </div>
    );
  }
);
