import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { KIOSK_PASSCODE } from "../kioskConstants";

export default function PasscodeModal({ visible, onUnlock, onCancel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCode("");
      setError(false);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const submit = () => {
    if (code === KIOSK_PASSCODE) {
      onUnlock();
    } else {
      setError(true);
      setCode("");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>Passcode</Text>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(t) => {
              setError(false);
              setCode(t.replace(/\D/g, "").slice(0, 6));
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            onSubmitEditing={submit}
            style={[styles.input, error && styles.inputError]}
            textAlign="center"
            autoFocus
          />
          {error ? <Text style={styles.errorText}>Incorrect</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.ok]} onPress={submit}>
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  box: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    padding: 24,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 6,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancel: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
  },
  ok: {
    backgroundColor: "#fff",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  okText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
});
