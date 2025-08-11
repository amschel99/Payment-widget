import { useState, useEffect } from 'react';
import { InvoiceData } from '../types';
import { getInvoiceFromUrl, formatAmount, formatAddress } from '../utils/invoice';
import { Copy, Check, AlertCircle, QrCode, Wallet } from 'lucide-react';
import QRCode from 'qrcode';

export default function PaymentWidget() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const invoice = getInvoiceFromUrl();
    if (invoice) {
      setInvoiceData(invoice);
      generateQRCode(invoice);
    } else {
      setError('Invalid or missing invoice data');
    }
  }, []);

  const generateQRCode = async (invoice: InvoiceData) => {
    try {
      // Create human-readable payment info for QR code
      const paymentText = `PAYMENT REQUEST
Amount: ${formatAmount(invoice.amount)} ${invoice.token}
Network: ${invoice.chain}
Send to: ${invoice.address}

⚠️ Send EXACTLY ${formatAmount(invoice.amount)} ${invoice.token} or payment will be invalid.

Powered by Rift Finance`;
      
      const qrUrl = await QRCode.toDataURL(paymentText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleCopyAddress = async () => {
    if (!invoiceData) return;
    
    try {
      await navigator.clipboard.writeText(invoiceData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-pulse-subtle">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment</h2>
          <p className="text-gray-600">Preparing your payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-8 text-white text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-4 right-4 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/20 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Payment Request</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-lg font-semibold tracking-wide">RIFT FINANCE</span>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <p className="text-purple-100">Please send the exact amount</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-6">
          {/* Amount Display */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatAmount(invoiceData.amount)} {invoiceData.token}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              on {invoiceData.chain} network
            </div>
            
            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-amber-800 text-sm font-medium">
                ⚠️ Please pay the exact amount or your payment will be considered invalid
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Network:</span>
                <span className="font-mono text-gray-900">{invoiceData.chain}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Token:</span>
                <span className="font-mono text-gray-900">{invoiceData.token}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="font-mono text-gray-900">{formatAmount(invoiceData.amount)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Send to:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-900 text-sm">
                      {formatAddress(invoiceData.address)}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy full address"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 font-mono break-all">
                  {invoiceData.address}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">QR Code</span>
              </div>
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="rounded-lg shadow-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Scan with another device
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Payment Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Open your crypto wallet</li>
              <li>2. Select {invoiceData.token} on {invoiceData.chain} network</li>
              <li>3. Send exactly {formatAmount(invoiceData.amount)} {invoiceData.token}</li>
              <li>4. To the address shown above</li>
            </ol>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-semibold text-purple-600 tracking-wide">POWERED BY RIFT FINANCE</span>
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500">
              Secure payment powered by blockchain technology
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Transaction fees may apply from your wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}