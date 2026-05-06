import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { getZodiacSign } from "./zodiac";

export default function ResultScreen({ result, birthDate, onBack }) {
  const sign = getZodiacSign(birthDate);
  const { width, height } = useWindowDimensions();

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
          source={sign.image}
          style={[styles.card, cardSize]}
          imageStyle={styles.cardImage}
          resizeMode="cover"
        >
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>{Content}</View>
        </ImageBackground>
      ) : (
        <View style={[styles.card, cardSize]}>
          {sign && (
            <Text style={styles.bgSymbol} pointerEvents="none">
              {sign.symbol}
            </Text>
          )}
          <View style={styles.cardContent}>{Content}</View>
        </View>
      )}

      <TouchableOpacity
        style={styles.printButton}
        onPress={() => {
          // TODO: implémenter la fonctionnalité d'impression
        }}
      >
        <Text style={styles.printButtonText}>🖨  Imprimer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
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
  printButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
