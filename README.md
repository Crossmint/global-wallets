<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Portal Wallets Integration Quickstart</h1>

<div align="center">
<a href="https://docs.crossmint.com/introduction/platform/wallets">Docs</a> | <a href="https://github.com/crossmint">See all quickstarts</a>
</div>

<br>
<br>
<img src="https://github.com/user-attachments/assets/c7a87267-0e07-44b6-8e85-deeb960b7600" alt="Image" width="full">

</div>

## Introduction
This quickstart demonstrates the **Portal Wallets Integration** - enabling Portal users to connect and utilize wallets from other Story ecosystem projects. This implementation shows how Portal can integrate with external DApps through delegated signers using iframe communication.

**High-level Flow:**
- User logs in to Portal → gets a non-custodial signer and smart wallet created
- User clicks "Connect to DApp" button → Portal opens popup to DApp's main page
- Portal sends its non-custodial signer as a delegated signer to the DApp via popup
- DApp user logs in and adds the delegated signer to their smart wallet
- DApp sends its wallet address back to Portal
- Portal can now use the DApp's smart wallet using Portal's signer

**What you'll learn:**
- How to implement popup communication between Portal and DApps
- Delegated signer flow for cross-application wallet usage
- Crossmint wallet integration in a monorepo structure
- Message-based communication between parent and popup windows

## Architecture
This is a **pnpm monorepo** with two Next.js applications:

- **Portal App** (`apps/portal/`) - Runs on `http://localhost:3000`
  - Main Portal platform where users log in
  - "Connect to DApp" button opens popup window to DApp
  - Sends delegated signer via postMessage
  - Receives wallet address from DApp
  
- **DApp App** (`apps/dapp/`) - Runs on `http://localhost:3001`  
  - Represents an external DApp (like Magma)
  - Main page detects if it's in popup and adapts UI accordingly
  - Receives delegated signers from Portal via postMessage
  - Sends wallet address back to Portal after adding delegated signer

## Setup
1. Clone the repository and navigate to the project folder:
```bash
git clone https://github.com/Crossmint/evm-wallet-delegation-quickstart.git && cd evm-wallet-delegation-quickstart
```

2. Install all dependencies:
```bash
pnpm install
```

3. Get a Crossmint client API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and set it in both apps. Make sure your API key has the following scopes: `users.create`, `users.read`, `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`.

Create `.env.local` files in both app directories:
```bash
# apps/portal/.env.local
NEXT_PUBLIC_CROSSMINT_API_KEY=your_api_key
NEXT_PUBLIC_CHAIN=story-testnet

# apps/dapp/.env.local  
NEXT_PUBLIC_CROSSMINT_API_KEY=your_api_key
NEXT_PUBLIC_CHAIN=story-testnet
```

4. Run both applications:

**Option A: Run both apps simultaneously**
```bash
# Terminal 1 - Portal
pnpm portal:dev

# Terminal 2 - DApp  
pnpm dapp:dev
```

**Option B: Use individual commands**
```bash
# Portal only
pnpm portal:dev

# DApp only  
pnpm dapp:dev
```

## Usage Flow

### 1. **Portal Side (localhost:3000)**
- User logs in to Portal with their wallet
- Portal creates a Crossmint smart wallet
- User clicks "Connect to DApp" button
- Portal opens popup window showing DApp (localhost:3001)
- Portal sends delegated signer to DApp via postMessage
- Portal waits for DApp wallet address response
- Shows "Connected DApp" card when successful

### 2. **DApp Side (localhost:3001)**
- When accessed directly: shows normal DApp interface
- When accessed in popup: shows "Connect DApp to Portal" interface
- User logs in to create DApp wallet
- DApp receives delegated signer from Portal
- User clicks "Add Delegated Signer" to confirm
- DApp sends its wallet address back to Portal
- Shows success message when connected

### 3. **Testing the Integration**
1. Start both apps
2. Open Portal at `http://localhost:3000`
3. Log in to Portal
4. Click "Connect to DApp" button
5. In the popup, log in to DApp
6. Click "Add Delegated Signer" when prompted
7. See success messages on both sides
8. Portal now shows "Connected DApp" card with wallet address

## Implementation Details

### Popup Communication
The implementation uses native **postMessage API** for secure cross-origin communication:

**Portal (Parent) - manages popup window:**
```javascript
// Open popup window
const popup = window.open(
  DAPP_URL,
  "dapp-connection",
  "width=500,height=600,scrollbars=yes,resizable=yes,top=100,left=100"
);

// Handle incoming messages from popup
const handleMessage = (event: MessageEvent) => {
  if (event.origin !== DAPP_ORIGIN) return;
  
  if (isValidReadyMessage(event.data)) {
    setIsPopupReady(true);
  } else if (isValidPopupMessage(event.data)) {
    setConnectedWallet(event.data.wallet);
  }
};

// Send delegated signer when popup is ready
useEffect(() => {
  if (isPopupReady && popupWindow && signerAddress) {
    const message: ParentToPopupMessage = { delegatedSigner: signerAddress };
    
    const interval = setInterval(() => {
      popupWindow.postMessage(message, DAPP_ORIGIN);
    }, 1000);
    
    return () => clearInterval(interval);
  }
}, [isPopupReady, popupWindow, signerAddress]);
```

**DApp (Popup) - communicates with parent:**
```javascript
// Send ready message to parent on mount
useEffect(() => {
  const readyMessage: ReadyMessage = { type: "ready" };
  window.opener?.postMessage(readyMessage, PORTAL_ORIGIN);
}, []);

// Handle messages from parent window
const handleMessage = (event: MessageEvent) => {
  if (event.origin !== PORTAL_ORIGIN) return;
  
  if (isValidParentMessage(event.data)) {
    setReceivedSigner(event.data.delegatedSigner);
  }
};

// Send wallet address back to parent
const response: PopupToParentMessage = { wallet: walletAddress };
window.opener?.postMessage(response, PORTAL_ORIGIN);
```

**Message Types (Type-Safe with TypeScript):**
```javascript
interface ParentToPopupMessage {
  delegatedSigner: string;
}

interface PopupToParentMessage {
  wallet: string;
}

interface ReadyMessage {
  type: 'ready';
}
```

### Popup Detection
DApp detects if it's running in a popup:
```javascript
const isInPopup = window.opener !== null;
```

### Responsive Design
- Both apps are fully responsive
- iframe modal adapts to different screen sizes
- Clean, modern UI following best practices

## Building for Production
```bash
# Build both apps
pnpm portal:build
pnpm dapp:build

# Or build individually
pnpm portal:build
pnpm dapp:build
```

## Using in production
1. Create a [production API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side).
2. Update the popup URLs in Portal to point to your production DApp URL.
3. Update the origin validation in both Portal and DApp for your production domains.
4. Deploy both applications to your preferred hosting platform.

## Key Files
- `apps/portal/app/page.tsx` - Portal home with Connect button and popup window using native postMessage
- `apps/dapp/app/page.tsx` - DApp main page with popup detection and postMessage communication  
- `pnpm-workspace.yaml` - Monorepo configuration with shared dependencies

## Production Ready
This implementation uses native **postMessage API** for secure, type-safe popup communication between Portal and external DApps. The implementation provides:

- **Type Safety**: TypeScript interfaces with runtime validation for all messages
- **Ready Protocol**: Secure connection establishment with ready handshake
- **Error Handling**: Built-in popup lifecycle monitoring and error handling
- **Cross-Origin Security**: Proper origin validation for all messages
- **Event Management**: Clean event listener management with automatic cleanup
