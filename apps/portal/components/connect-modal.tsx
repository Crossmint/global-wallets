import { forwardRef } from "react";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  dappUrl: string;
  onIframeLoad?: () => void;
}

export const ConnectModal = forwardRef<HTMLIFrameElement, ConnectModalProps>(
  ({ isOpen, onClose, dappUrl, onIframeLoad }, ref) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] relative shadow-2xl">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            ✕
          </button>

          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Connect to DApp
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete the connection process in the DApp
            </p>
          </div>

          {/* Iframe */}
          <div className="h-[calc(100%-120px)] p-4">
            <iframe
              ref={ref}
              src={dappUrl}
              className="w-full h-full rounded-lg border border-gray-200"
              title="DApp Connection"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={onIframeLoad}
            />
          </div>
        </div>
      </div>
    );
  }
);
