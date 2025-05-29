interface ConnectedDAppCardProps {
  walletAddress: string;
}

export function ConnectedDAppCard({ walletAddress }: ConnectedDAppCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <title>Success icon</title>
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Connected DApp
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <p className="text-sm text-gray-600 mb-1">
            Successfully connected to DApp wallet:
          </p>
          <p className="text-sm font-mono text-purple-700 font-medium">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
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
