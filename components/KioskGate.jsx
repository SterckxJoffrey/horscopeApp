import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  NativeModules,
  View,
  StyleSheet,
} from "react-native";

import { RELOCK_AFTER_UNLOCK_MS, TAP_PATTERN } from "../kioskConstants";
import PasscodeModal from "./PasscodeModal.jsx";

const { KioskModule } = NativeModules;

export default function KioskGate({ children }) {
  const [locked, setLocked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const tapsRef = useRef([]);

  useEffect(() => {
    if (locked) {
      KioskModule?.hideSystemBars?.();
    } else {
      KioskModule?.showSystemBars?.();
    }
  }, [locked]);

  useEffect(() => {
    if (locked) return;
    const timer = setTimeout(() => setLocked(true), RELOCK_AFTER_UNLOCK_MS);
    return () => clearTimeout(timer);
  }, [locked]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setLocked(true);
    });
    return () => sub.remove();
  }, []);

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
      <View
        style={styles.tapZone}
        onStartShouldSetResponder={() => true}
        onResponderRelease={onTapZone}
        pointerEvents="box-only"
      />
      <PasscodeModal
        visible={modalOpen}
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
