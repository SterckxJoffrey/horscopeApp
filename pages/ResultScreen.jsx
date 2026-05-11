import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import RNFS from "react-native-fs";

import { getZodiacSign } from "../zodiac";

const PRINT_DIR = `${RNFS.PicturesDirectoryPath}/ToPrint`;

async function ensureWritePermission() {
  if (Platform.OS !== "android" || Platform.Version >= 29) return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function ResultScreen({ result, birthDate, onBack }) {
  const sign = getZodiacSign(birthDate);
  const { width, height } = useWindowDimensions();
  const cardRef = useRef(null);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const ok = await ensureWritePermission();
      if (!ok) {
        Alert.alert("Permission refusée", "Impossible d'écrire le fichier.");
        return;
      }

      const tmpUri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const dirExists = await RNFS.exists(PRINT_DIR);
      if (!dirExists) await RNFS.mkdir(PRINT_DIR);

      const destPath = `${PRINT_DIR}/horoscope_${Date.now()}.png`;
      await RNFS.moveFile(tmpUri, destPath);

      Alert.alert("Impression envoyée", "Le fichier a été déposé.");
    } catch (e) {
      Alert.alert("Erreur d'impression", String(e?.message || e));
    } finally {
      setPrinting(false);
    }
  };

  const cardSize = {
    width: width * 0.9,
    height: height * 0.75,
  };

  const Content = (
    <>
      {sign && <Text style={styles.signName}>{sign.name}</Text>}
      <Text style={styles.result}>{result.trim()}</Text>
    </>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.homeButtonText}>⌂</Text>
      </TouchableOpacity>

      {sign?.image ? (
        <ImageBackground
          ref={cardRef}
          source={sign.image}
          style={[styles.card, cardSize]}
          imageStyle={styles.cardImage}
          resizeMode="cover"
        >
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>{Content}</View>
        </ImageBackground>
      ) : (
        <View ref={cardRef} style={[styles.card, cardSize]}>
          {sign && (
            <Text style={styles.bgSymbol} pointerEvents="none">
              {sign.symbol}
            </Text>
          )}
          <View style={styles.cardContent}>{Content}</View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.printButton, printing && styles.printButtonDisabled]}
        onPress={handlePrint}
        disabled={printing}
      >
        <Text style={styles.printButtonText}>
          {printing ? "Envoi…" : "🖨  Imprimer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  homeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(124, 58, 237, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7c3aed",
    overflow: "hidden",
    justifyContent: "center",
  },
  cardImage: {
    borderRadius: 16,
    opacity: 0.45,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  bgSymbol: {
    ...StyleSheet.absoluteFillObject,
    fontSize: 320,
    color: "#7c3aed",
    opacity: 0.25,
    textAlign: "center",
    textAlignVertical: "center",
  },
  cardContent: {
    flex: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  signName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  result: {
    color: "#f1f5f9",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  printButton: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: "center",
  },
  printButtonDisabled: {
    opacity: 0.6,
  },
  printButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
