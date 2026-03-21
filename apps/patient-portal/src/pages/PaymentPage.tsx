import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  CheckCircle,
  ChevronLeft,
  Shield,
  AlertCircle,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCardNumber = (val: string): string =>
  val
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const isValidNewCard = (
  name: string,
  card: string,
  expiry: string,
  cvv: string
): boolean =>
  name.trim().length > 1 &&
  card.replace(/\s/g, '').length === 16 &&
  expiry.length === 5 &&
  cvv.length >= 3;

// ─── Confirmation screen ────────────────────────────────────────────────────

interface ConfirmedProps {
  amount: number;
  method: string;
  reference: string;
}

const ConfirmedScreen: React.FC<ConfirmedProps> = ({ amount, method, reference }) => (
  <div className="max-w-md mx-auto flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
      <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Successful!</h2>
    <p className="text-gray-500 mt-2 text-sm sm:text-base">
      Your payment of{' '}
      <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span> has been processed.
    </p>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mt-6 w-full text-left space-y-2.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Amount paid</span>
        <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Payment method</span>
        <span className="font-medium text-gray-900">{method}</span>
      </div>
      <div className="h-px bg-gray-100" />
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Confirmation</span>
        <span className="font-semibold text-teal-700">{reference}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Date</span>
        <span className="font-medium text-gray-900">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
    <p className="text-xs text-gray-400 mt-5">A receipt has been sent to robert.johnson@email.com</p>
    <p className="text-xs text-gray-400 mt-1">Redirecting to billing...</p>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  const [useExisting, setUseExisting] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');

  const amount = 45.0;
  const confirmationRef = 'PAY-9021';

  const canPay = useExisting || isValidNewCard(nameOnCard, cardNumber, expiry, cvv);

  const handlePay = async () => {
    if (!canPay) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);
    setConfirmed(true);
    setTimeout(() => navigate('/billing'), 4000);
  };

  if (confirmed) {
    return (
      <ConfirmedScreen
        amount={amount}
        method={useExisting ? 'Visa ••••4521' : `•••• ${cardNumber.slice(-4)}`}
        reference={confirmationRef}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto px-0 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <button
          onClick={() => navigate('/billing')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Back to billing"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Make a Payment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Secure payment powered by Stripe</p>
        </div>
      </div>

      {/* Amount due */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 sm:p-6 text-white mb-5 sm:mb-6">
        <p className="text-blue-200 text-sm">Amount Due</p>
        <p className="text-3xl sm:text-4xl font-bold mt-1">${amount.toFixed(2)}</p>
        <p className="text-blue-200 text-xs mt-1.5">For visit on Mar 10, 2026 — Diabetes Management</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-200">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Due by Apr 10, 2026
        </div>
      </div>

      {/* Payment method selection */}
      <div className="space-y-3 mb-5 sm:mb-6">
        <h2 className="text-sm font-semibold text-gray-900">Select Payment Method</h2>

        {/* Saved card */}
        <button
          onClick={() => setUseExisting(true)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
            useExisting
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Visa ••••4521</p>
            <p className="text-xs text-gray-500">Expires 09/28 · Saved card</p>
          </div>
          {useExisting && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
        </button>

        {/* New card */}
        <button
          onClick={() => setUseExisting(false)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
            !useExisting
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Add new card</p>
            <p className="text-xs text-gray-500">Enter card details below</p>
          </div>
          {!useExisting && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
        </button>
      </div>

      {/* New card form */}
      {!useExisting && (
        <div className="space-y-4 mb-5 sm:mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name on card</label>
            <input
              type="text"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              placeholder="Robert Johnson"
              autoComplete="cc-name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Card number</label>
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              autoComplete="cc-number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry date</label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
              <input
                type="text"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                autoComplete="cc-csc"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-5 sm:mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Visit balance</span>
            <span className="text-gray-900">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Processing fee</span>
            <span className="text-teal-700 font-medium">$0.00</span>
          </div>
          <div className="h-px bg-gray-200 my-1" />
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={processing || !canPay}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount.toFixed(2)} Securely
          </>
        )}
      </button>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>256-bit SSL encryption · HIPAA compliant · Powered by Stripe</span>
      </div>

      {/* Cancel link */}
      <div className="text-center mt-4">
        <button
          onClick={() => navigate('/billing')}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel and return to billing
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
