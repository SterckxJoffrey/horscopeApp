import React, { useState } from "react";
import {
  ImageBackground,
  View,
  StyleSheet,
  Text,
  TextInput,
  Platform,
} from "react-native";
import Home from "./pages/Home.jsx";
import HomeScreen from "./pages/HomeScreen.jsx";
import ResultScreen from "./pages/ResultScreen.jsx";
import Header from "./components/header.jsx";
import KioskGate from "./components/KioskGate.jsx";
import { LanguageProvider } from "./LanguageContext.js";

import background from "./assets/home_background.png";
import questionsBackground from "./assets/questions_background.png";

const APP_FONT = Platform.select({
  ios: "CenturyGothic",
  android: "centurygothic",
  default: "centurygothic",
});

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [{ fontFamily: APP_FONT }, Text.defaultProps.style];

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [
  { fontFamily: APP_FONT },
  TextInput.defaultProps.style,
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [submission, setSubmission] = useState(null);

  const goHome = () => {
    setSubmission(null);
    setStarted(false);
  };

  return (
    <LanguageProvider>
      <KioskGate>
        <ImageBackground
          source={started ? questionsBackground : background}
          style={styles.root}
          resizeMode="cover"
        >
          <View style={styles.overlay} pointerEvents="none" />
          <Header onHome={started ? goHome : null} />
          {!started ? (
            <Home onStart={() => setStarted(true)} />
          ) : submission === null ? (
            <HomeScreen onSubmit={setSubmission} onHome={goHome} />
          ) : (
            <ResultScreen
              answers={submission.answers}
              signKey={submission.signKey}
              picks={submission.picks}
              birthDate={submission.birthDate}
              onBack={goHome}
            />
          )}
        </ImageBackground>
      </KioskGate>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
});
