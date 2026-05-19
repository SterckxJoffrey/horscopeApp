import React from "react";
import { View, Image, StyleSheet, StatusBar, Platform } from "react-native";

import logo from "../assets/logo_header.png";

export default function Header() {
  return (
    <View style={styles.header}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    maxHeight : "15%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  logo: {
    height: "100%",
    width: "100%",
    transform: [{ scale: 1.6 }],
  },
});
