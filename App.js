import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import HomeScreen from "./HomeScreen.jsx";

export default function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <HomeScreen />
    </>
  );
}