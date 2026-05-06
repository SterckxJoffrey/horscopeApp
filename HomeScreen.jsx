import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

import data from "./data.json";
import { generateText } from "./Horoscope";

// 🔹 Questions
const questions = {
  amour: {
    question: "Que recherches-tu dans une relation ?",
    options: {
      A: "De la passion et de l’aventure",
      B: "De la sécurité et du soutien",
      C: "De la croissance et de la profondeur",
      D: "De la liberté et de l’indépendance",
    },
  },
  travail: {
    question: "Quelle est ta principale priorité en ce moment ?",
    options: {
      A: "Faire carrière",
      B: "Trouver un équilibre",
      C: "Découvrir de nouvelles opportunités",
      D: "Prendre du repos",
    },
  },
  bienEtre: {
    question: "Comment prends-tu soin de toi ?",
    options: {
      A: "Je prends consciemment du temps pour moi",
      B: "Parfois, mais pas assez",
      C: "À peine",
      D: "Je ne sais pas trop comment faire",
    },
  },
  futur: {
    question: "Comment envisages-tu l’avenir ?",
    options: {
      A: "Avec espoir",
      B: "Prudemment optimiste",
      C: "Incertain",
      D: "Anxieux",
    },
  },
};

export default function HomeScreen() {
  const [answers, setAnswers] = useState({
    amour: null,
    travail: null,
    bienEtre: null,
    futur: null,
  });

  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState("");

  const handleSelect = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const isComplete =
    Object.values(answers).every((v) => v !== null) && birthDate.length > 0;

  const handleSubmit = () => {
    const text = generateText(data, answers);
    setResult(text);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>✨ Ton Horoscope Personnalisé</Text>

      {/* Date de naissance */}
      <Text style={styles.label}>Date de naissance</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
      />

      {/* Questions */}
      {Object.entries(questions).map(([key, q]) => (
        <View key={key} style={styles.block}>
          <Text style={styles.question}>{q.question}</Text>

          {Object.entries(q.options).map(([letter, label]) => {
            const selected = answers[key] === letter;

            return (
              <TouchableOpacity
                key={letter}
                onPress={() => handleSelect(key, letter)}
                style={[
                  styles.option,
                  selected && styles.optionSelected,
                ]}
              >
                <Text style={selected ? styles.textSelected : styles.text}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Bouton */}
      <TouchableOpacity
        style={[styles.button, !isComplete && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isComplete}
      >
        <Text style={styles.buttonText}>Voir mon horoscope</Text>
      </TouchableOpacity>

      {/* Résultat */}
      {result ? <Text style={styles.result}>{result}</Text> : null}
    </ScrollView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    color: "#ccc",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  block: {
    marginBottom: 25,
  },
  question: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 10,
  },
  option: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#7c3aed",
  },
  text: {
    color: "#ccc",
  },
  textSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  result: {
    marginTop: 20,
    color: "#e2e8f0",
    lineHeight: 22,
  },
});

