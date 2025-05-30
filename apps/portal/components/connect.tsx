interface ConnectDAppProps {
  onConnect?: () => void;
  isConnecting?: boolean;
  connectedWallet?: string;
}

export function ConnectDApp({
  onConnect,
  isConnecting = false,
  connectedWallet,
}: ConnectDAppProps) {
  // Connected state
  if (connectedWallet) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Connected DApp
          </h2>
          <div className="bg-gray-50 rounded-lg p-3 border">
            <p className="text-sm text-gray-600 mb-1">
              Successfully connected to DApp wallet:
            </p>
            <p className="text-sm font-mono text-gray-700 font-medium">
              {connectedWallet.slice(0, 8)}...{connectedWallet.slice(-6)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <title>Check icon</title>
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Connection established
          </div>
        </div>
      </div>
    );
  }

  // Connect state
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Connect to DApp</h2>
        <p className="text-sm text-gray-600">
          Connect your Portal wallet to external DApps using delegated signers
        </p>
        <button
          type="button"
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isConnecting ? "Connecting..." : "Connect to DApp"}
        </button>
      </div>
    </div>
  );
}
