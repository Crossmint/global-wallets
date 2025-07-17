// Message types for secure popup communication
export type ParentToPopupMessage =
  | { delegatedSigner: string }
  | { signature: string };

export type PopupToParentMessage =
  | { wallet: string }
  | { messageToSign: string };

export interface ReadyMessage {
  type: "ready";
}

// Validation functions for runtime type checking
export function isValidParentMessage(
  data: unknown
): data is ParentToPopupMessage {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.delegatedSigner === "string" || typeof obj.signature === "string"
  );
}

export function isValidPopupMessage(
  data: unknown
): data is PopupToParentMessage {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.wallet === "string" || typeof obj.messageToSign === "string"
  );
}

export function isValidReadyMessage(data: unknown): data is ReadyMessage {
  return (
    data !== null &&
    typeof data === "object" &&
    "type" in data &&
    (data as ReadyMessage).type === "ready"
  );
}
