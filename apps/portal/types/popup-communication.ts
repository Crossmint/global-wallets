// Message types for secure popup communication
export interface ParentToPopupMessage {
  delegatedSigner: string;
}

export interface PopupToParentMessage {
  wallet: string;
}

export interface ReadyMessage {
  type: 'ready';
}

// Validation functions for runtime type checking
export function isValidPopupMessage(data: unknown): data is PopupToParentMessage {
  return data !== null && typeof data === 'object' && 'wallet' in data && typeof (data as PopupToParentMessage).wallet === 'string';
}

export function isValidReadyMessage(data: unknown): data is ReadyMessage {
  return data !== null && typeof data === 'object' && 'type' in data && (data as ReadyMessage).type === 'ready';
} 