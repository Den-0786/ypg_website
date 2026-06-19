"use client";

import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";

export default function PinGuard({ isOpen, onClose, onConfirm, action, theme }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const storedPin = localStorage.getItem("ypg_admin_pin");
    if (storedPin && pin !== storedPin) {
      setError("Incorrect PIN");
      return;
    }
    onConfirm();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleConfirm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Confirm Action</h3>
              <p className="text-sm text-blue-100">
                Enter your PIN to continue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors text-blue-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg border border-gold-500/20 bg-gold-500/10">
          <p className="text-sm text-blue-50">
            <span className="font-semibold text-gold-300">Action:</span> {action}
          </p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKeyDown}
          placeholder="Enter 4-6 digit PIN"
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-center text-lg tracking-[0.5em] font-semibold text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-gold-500 mb-3"
        />

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-blue-100 font-semibold transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-white font-semibold transition-colors shadow-lg shadow-gold-500/20"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
