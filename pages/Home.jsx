import React, { useContext } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  StyleSheet,
} from "react-native";

import centerImage from "../assets/background_center.png";
import { LanguageContext } from "../LanguageContext.js";

export default function Home({ onStart }) {
  const { t } = useContext(LanguageContext);

  return (
    <View style={styles.container}>
      <View style={styles.centerImageWrap} pointerEvents="none">
        <Image
          source={centerImage}
          style={styles.centerImage}
          resizeMode="contain"
        />
        <View style={styles.centerOverlayStack}>
          <Text style={styles.centerOverlayText}>{t.home.title}</Text>
          <Text style={styles.centerOverlaySubtext}>{t.home.subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.startButton}
        onPress={onStart}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>{t.home.startButton}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  centerImageWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centerImage: {
    width: 1200,
    height: "100%",
    opacity : 0.8
  },
  centerOverlayStack: {
    position: "absolute",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  centerOverlayText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    marginBottom: 16,
  },
  centerOverlaySubtext: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "200",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  startButton: {
    backgroundColor: "rgba(15, 23, 42, 0.13)",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 64,
    boxShadow: [
      { offsetX: 0, offsetY: 0, blurRadius: 28, color: "rgba(255, 255, 255, 0.3)" },
      { offsetX: 0, offsetY: 0, blurRadius: 48, color: "rgba(255, 255, 255, 0.2)" },
      { offsetX: 0, offsetY: 0, blurRadius: 28, color: "rgba(255, 255, 255, 0.45)", inset: true },
      { offsetX: 0, offsetY: 0, blurRadius: 48, color: "rgba(255, 255, 255, 0.2)", inset: true },
    ],
  },
  startButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 4,
    textAlign: "center",
    textShadowColor: "rgba(96, 165, 250, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
