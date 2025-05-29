interface ConnectDAppCardProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function ConnectDAppCard({
  onConnect,
  isConnecting,
}: ConnectDAppCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <title>Connect icon</title>
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Connect to DApp
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Connect your Portal wallet to external DApps using delegated signers
        </p>
        <button
          type="button"
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <title>Plus icon</title>
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Connect to DApp
            </>
          )}
        </button>
      </div>
    </div>
  );
}
