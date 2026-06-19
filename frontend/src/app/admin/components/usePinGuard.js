"use client";

import { useState, useCallback } from "react";
import PinGuard from "./PinGuard";

export function usePinGuard(theme) {
  const [guard, setGuard] = useState({
    isOpen: false,
    action: "",
    onConfirm: null,
  });

  const requestPin = useCallback((action, onConfirm) => {
    setGuard({ isOpen: true, action, onConfirm });
  }, []);

  const closeGuard = useCallback(() => {
    setGuard((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    guard.onConfirm?.();
    closeGuard();
  }, [guard, closeGuard]);

  const PinGuardComponent = (
    <PinGuard
      isOpen={guard.isOpen}
      onClose={closeGuard}
      onConfirm={handleConfirm}
      action={guard.action}
      theme={theme}
    />
  );

  return { requestPin, PinGuardComponent };
}
