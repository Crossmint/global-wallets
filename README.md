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
- User clicks "Connect to DApp" button → Portal opens iframe to DApp's main page
- Portal sends its non-custodial signer as a delegated signer to the DApp via iframe
- DApp user logs in and adds the delegated signer to their smart wallet
- DApp sends its wallet address back to Portal
- Portal can now use the DApp's smart wallet using Portal's signer

**What you'll learn:**
- How to implement iframe communication between Portal and DApps
- Delegated signer flow for cross-application wallet usage
- Crossmint wallet integration in a monorepo structure
- Message-based communication between parent and child windows

## Architecture
This is a **pnpm monorepo** with two Next.js applications:

- **Portal App** (`apps/portal/`) - Runs on `http://localhost:3000`
  - Main Portal platform where users log in
  - "Connect to DApp" button opens iframe modal to DApp
  - Sends delegated signer via postMessage
  - Receives wallet address from DApp
  
- **DApp App** (`apps/dapp/`) - Runs on `http://localhost:3001`  
  - Represents an external DApp (like Magma)
  - Main page detects if it's in iframe and adapts UI accordingly
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
- Portal opens iframe modal showing DApp (localhost:3001)
- Portal sends delegated signer to DApp via postMessage
- Portal waits for DApp wallet address response
- Shows "Connected DApp" card when successful

### 2. **DApp Side (localhost:3001)**
- When accessed directly: shows normal DApp interface
- When accessed in iframe: shows "Connect DApp to Portal" interface
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
5. In the iframe, log in to DApp
6. Click "Add Delegated Signer" when prompted
7. See success messages on both sides
8. Portal now shows "Connected DApp" card with wallet address

## Implementation Details

### iframe Communication
The implementation uses the **`@crossmint/client-sdk-window`** package for secure cross-origin communication:

**Portal (Parent) - uses `IFrameWindow`:**
```javascript
import { IFrameWindow } from "@crossmint/client-sdk-window";

// Initialize iframe communication
const crossmintWindow = await IFrameWindow.init(iframeRef.current, {
  incomingEvents: FROM_DAPP_EVENTS,
  outgoingEvents: FROM_PORTAL_EVENTS,
  targetOrigin: "http://localhost:3001",
});

// Listen for events from DApp
crossmintWindow.on("wallet", (data) => {
  setConnectedWallet(data.address);
});

// Send events to DApp
crossmintWindow.send("delegatedSigner", {
  signer: walletAddress,
});
```

**DApp (Child) - uses `ChildWindow`:**
```javascript
import { ChildWindow } from "@crossmint/client-sdk-window";

// Initialize child window communication
const crossmintChild = new ChildWindow(window.parent, "http://localhost:3000", {
  incomingEvents: FROM_PORTAL_EVENTS,
  outgoingEvents: FROM_DAPP_EVENTS,
});

// Handshake with parent
await crossmintChild.handshakeWithParent();

// Listen for events from Portal
crossmintChild.on("delegatedSigner", (data) => {
  setReceivedSigner(data.signer);
});

// Send events to Portal
crossmintChild.send("wallet", {
  address: walletAddress,
});
```

**Event Schemas (Type-Safe with Zod):**
```javascript
const FROM_DAPP_EVENTS = {
  wallet: z.object({
    address: z.string(),
  }),
};

const FROM_PORTAL_EVENTS = {
  delegatedSigner: z.object({
    signer: z.string(),
  }),
};
```

### iframe Detection
DApp detects if it's running in an iframe:
```javascript
const isInIframe = window.self !== window.top;
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
2. Update the iframe URLs in Portal to point to your production DApp URL.
3. Update the `targetOrigin` in both IFrameWindow and ChildWindow for your production domains.
4. Deploy both applications to your preferred hosting platform.

## Key Files
- `apps/portal/app/home.tsx` - Portal home with Connect button and iframe modal using `IFrameWindow`
- `apps/dapp/app/home.tsx` - DApp main page with iframe detection and `ChildWindow` communication  
- `pnpm-workspace.yaml` - Monorepo configuration with shared dependencies

## Production Ready
This implementation uses the official `@crossmint/client-sdk-window` package for secure, type-safe iframe communication between Portal and external DApps. The package provides:

- **Type Safety**: Zod schema validation for all events
- **Handshake Protocol**: Secure connection establishment
- **Error Handling**: Built-in timeout and retry mechanisms
- **Cross-Origin Security**: Proper origin validation
- **Event Management**: Clean event listener management with automatic cleanup
