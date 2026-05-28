import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  NativeModules,
  View,
  StyleSheet,
} from "react-native";

import {
  KIOSK_PASSCODE,
  RELOCK_AFTER_UNLOCK_MS,
  TAP_PATTERN,
} from "../kioskConstants";
import PasscodeModal from "./PasscodeModal.jsx";

const { KioskModule } = NativeModules;

export default function KioskGate({ children }) {
  const [config, setConfig] = useState(null);
  const [locked, setLocked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const tapsRef = useRef([]);

  // While config is loading, default to locked. Once resolved, lockTaskMode=false
  // relaxes the kiosk entirely (matches the native ConfigHolder gate).
  const lockEnabled = config ? config.lockTaskMode : true;
  const pincode = (config && config.unlockPincode) || KIOSK_PASSCODE;

  // Pull the per-device config from native (single source of truth).
  useEffect(() => {
    let mounted = true;
    const result = KioskModule?.getConfig?.();
    if (result && typeof result.then === "function") {
      result.then((c) => mounted && setConfig(c)).catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (config && !config.lockTaskMode) setLocked(false);
  }, [config]);

  useEffect(() => {
    if (!lockEnabled) {
      KioskModule?.showSystemBars?.();
      return;
    }
    if (locked) {
      KioskModule?.hideSystemBars?.();
    } else {
      KioskModule?.showSystemBars?.();
    }
  }, [locked, lockEnabled]);

  // Auto re-lock after the operator's unlock window expires.
  useEffect(() => {
    if (!lockEnabled || locked) return;
    const timer = setTimeout(() => setLocked(true), RELOCK_AFTER_UNLOCK_MS);
    return () => clearTimeout(timer);
  }, [locked, lockEnabled]);

  // Re-arm the lockdown whenever the app returns to the foreground.
  useEffect(() => {
    if (!lockEnabled) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setLocked(true);
    });
    return () => sub.remove();
  }, [lockEnabled]);

  const onTapZone = () => {
    const now = Date.now();
    const recent = tapsRef.current.filter(
      (ts) => now - ts < TAP_PATTERN.maxTotalWindowMs
    );
    recent.push(now);
    tapsRef.current = recent.slice(-4);

    if (tapsRef.current.length === 4) {
      const [a, b, c, d] = tapsRef.current;
      const gap1 = b - a;
      const pause = c - b;
      const gap2 = d - c;
      const match =
        gap1 <= TAP_PATTERN.maxIntraTapGapMs &&
        pause >= TAP_PATTERN.minPauseMs &&
        pause <= TAP_PATTERN.maxPauseMs &&
        gap2 <= TAP_PATTERN.maxIntraTapGapMs;
      if (match) {
        tapsRef.current = [];
        setModalOpen(true);
      }
    }
  };

  return (
    <View style={styles.root}>
      {children}
      {lockEnabled ? (
        <View
          style={styles.tapZone}
          onStartShouldSetResponder={() => true}
          onResponderRelease={onTapZone}
          pointerEvents="box-only"
        />
      ) : null}
      <PasscodeModal
        visible={modalOpen}
        pincode={pincode}
        onUnlock={() => {
          setModalOpen(false);
          setLocked(false);
        }}
        onCancel={() => setModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tapZone: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
  },
});
