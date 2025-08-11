import { InvoiceData } from '../types';

export function decodeInvoice(encodedInvoice: string): InvoiceData | null {
  try {
    // Decode the base64 string
    const decodedString = atob(encodedInvoice);
    
    // Parse the JSON
    const invoiceData: InvoiceData = JSON.parse(decodedString);
    
    // Validate the required fields
    if (!invoiceData.chain || !invoiceData.token || !invoiceData.amount || !invoiceData.address) {
      throw new Error('Invalid invoice data: missing required fields');
    }
    
    // Validate address format (basic hex check)
    if (!invoiceData.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid address format');
    }
    
    // Validate amount is positive
    if (invoiceData.amount <= 0) {
      throw new Error('Invalid amount: must be positive');
    }
    
    return invoiceData;
  } catch (error) {
    console.error('Failed to decode invoice:', error);
    return null;
  }
}

export function getInvoiceFromUrl(): InvoiceData | null {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedInvoice = urlParams.get('invoice');
  
  if (!encodedInvoice) {
    console.error('No invoice parameter found in URL');
    return null;
  }
  
  return decodeInvoice(encodedInvoice);
}

export function formatAmount(amount: number, decimals: number = 6): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}