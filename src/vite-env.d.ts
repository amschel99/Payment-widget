/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request?: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}

// Declare the w3m-button custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': any;
    }
  }
}