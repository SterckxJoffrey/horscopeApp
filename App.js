import React, { useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import HomeScreen from "./HomeScreen.jsx";
import ResultScreen from "./ResultScreen.jsx";

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  const [submission, setSubmission] = useState(null);

  return (
    <>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {submission === null ? (
        <HomeScreen onSubmit={setSubmission} />
      ) : (
        <ResultScreen
          result={submission.text}
          birthDate={submission.birthDate}
          onBack={() => setSubmission(null)}
        />
      )}
    </>
  );
}
