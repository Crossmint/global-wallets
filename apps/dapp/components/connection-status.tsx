interface ConnectionStatusProps {
  receivedSigner: string | null;
  isLoggedIn: boolean;
  connectionStatus: "connecting" | "received" | "sent" | "completed";
}

export function ConnectionStatus({
  receivedSigner,
  isLoggedIn,
  connectionStatus,
}: ConnectionStatusProps) {
  const steps = [
    {
      id: "portal-communication",
      title: "Portal Communication",
      description: receivedSigner
        ? "Connected and received delegated signer"
        : "Waiting for Portal...",
      completed: !!receivedSigner,
      active: !receivedSigner,
    },
    {
      id: "wallet-authentication",
      title: "Wallet Authentication",
      description: isLoggedIn
        ? "Successfully authenticated"
        : "Please log in above",
      completed: isLoggedIn,
      active: !!receivedSigner && !isLoggedIn,
    },
    {
      id: "delegated-signer-integration",
      title: "Delegated Signer Integration",
      description:
        connectionStatus === "completed"
          ? "Successfully added to wallet"
          : connectionStatus === "sent"
          ? "Processing delegated signer..."
          : connectionStatus === "received"
          ? "Ready to integrate"
          : "Waiting for previous steps",
      completed: connectionStatus === "completed",
      active: connectionStatus === "sent",
    },
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Connection Status
      </h2>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed
                  ? "bg-green-100"
                  : step.active
                  ? "bg-blue-100"
                  : "bg-gray-100"
              }`}
            >
              {step.completed ? (
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Check icon</title>
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : step.active ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{step.title}</p>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
