# Rift Finance - Payment Widget

A beautiful, minimalistic payment widget by Rift Finance that displays cryptocurrency payment information with QR codes for easy cross-device sharing.

## Features

- 🎨 **Beautiful UI**: Modern, minimalistic design with Tailwind CSS
- 🔗 **Multiple Wallets**: Support for MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, Rainbow, Phantom, Argent, and imToken
- 🌍 **Multi-Chain**: Support for Polygon, Ethereum, Base, Arbitrum, and Optimism
- 💰 **Multiple Tokens**: USDC, USDT, ETH, and MATIC support
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🔐 **Secure**: Direct wallet-to-wallet transactions with deep links

## How it works

1. User is redirected to the widget with an encoded invoice in the URL
2. The widget decodes the base64 invoice containing payment details
3. User selects their preferred wallet
4. Deep link opens the wallet with pre-filled transaction details
5. User confirms the payment in their wallet

## Invoice Format

The invoice parameter should be a base64-encoded JSON string with the following structure:

```json
{
  "chain": "POLYGON",
  "token": "USDC", 
  "amount": 15.634771732332707,
  "address": "0x8daA560362b330b71E893fD1AD1B24A640d8022A"
}
```

## Usage

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
npm run preview
```

### Example URL

```
https://example.com/widget?invoice=eyJjaGFpbiI6IlBPTFlHT04iLCJ0b2tlbiI6IlVTREMiLCJhbW91bnQiOjE1LjYzNDc3MTczMjMzMjcwNywiYWRkcmVzcyI6IjB4OGRhQTU2MDM2MmIzMzBiNzFFODkzZkQxQUQxQjI0QTY0MGQ4MDIyQSJ9
```

## Supported Chains

- **Polygon** (MATIC)
- **Ethereum** (ETH)
- **Base** (ETH)
- **Arbitrum** (ETH)
- **Optimism** (ETH)

## Supported Tokens

- **USDC** - USD Coin
- **USDT** - Tether USD
- **ETH** - Ethereum (native)
- **MATIC** - Polygon (native)

## Supported Wallets

- 🦊 **MetaMask** - Most popular Ethereum wallet
- 🔗 **WalletConnect** - Universal wallet protocol
- 🔷 **Coinbase Wallet** - Coinbase's non-custodial wallet
- 🛡️ **Trust Wallet** - Binance's multi-chain wallet
- 🌈 **Rainbow** - Ethereum wallet with great UX
- 👻 **Phantom** - Popular Solana/Ethereum wallet
- 🔐 **Argent** - Smart contract wallet
- 💎 **imToken** - Multi-chain mobile wallet

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Security Considerations

- All transactions are initiated through official wallet deep links
- No private keys or sensitive data are handled by the widget
- Users maintain full control of their funds
- All transaction parameters are validated before generating deep links