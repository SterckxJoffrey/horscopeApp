import React, { useContext } from "react";
import { View, Image, StyleSheet, StatusBar, Platform, TouchableOpacity, Text } from "react-native";

import logo from "../assets/logo_header.png";
import { LanguageContext } from "../LanguageContext.js";

export default function Header() {
  const { language, toggleLanguage } = useContext(LanguageContext);

  return (
    <View style={styles.header}>
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
        pointerEvents="none"
      />
      <TouchableOpacity
        style={styles.languageButton}
        onPress={toggleLanguage}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.languageButtonText}>
          {language === "nl" ? "FR" : "NL"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    maxHeight : "10%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  logo: {
    marginTop: "15%",
    height: "100%",
    width: "100%",
    transform: [{ scale: 3 }],
  },
  languageButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
    zIndex: 10,
    elevation: 10,
  },
  languageButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
