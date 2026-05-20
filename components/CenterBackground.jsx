import React from "react";
import { View, Image, StyleSheet } from "react-native";

import centerImage from "../assets/background_center.png";

export default function CenterBackground() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image
        source={centerImage}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 1200,
    height: "100%",
    opacity: 0.4,
    transform: [{ scale: 1.5 }],
  },
});
