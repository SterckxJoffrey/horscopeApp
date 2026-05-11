import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

import data from "../data.json";
import { generateText } from "../Horoscope";
import { getZodiacSign } from "../zodiac";

const formatBirthDate = (text) => {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
};

const isValidBirthDate = (str) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(str)) return false;
  const [d, m, y] = str.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d &&
    y >= 1900 &&
    date <= new Date()
  );
};

// 1. Importe ta fonction depuis le bon fichier (ajuste le chemin)


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

export default function HomeScreen({ onSubmit }) {
  const [answers, setAnswers] = useState({
    amour: null,
    travail: null,
    bienEtre: null,
    futur: null,
  });

  const [birthDate, setBirthDate] = useState("");

  const handleSelect = (question, value) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const dateValid = isValidBirthDate(birthDate);
  const dateError = birthDate.length === 10 && !dateValid;

  const isComplete =
    Object.values(answers).every((v) => v !== null) && dateValid;

  const handleSubmit = () => {
    const zodiacInfo = getZodiacSign(birthDate);

    // Sécurité : si on ne trouve pas le signe, on arrête
    if (!zodiacInfo) return;
      const signKey = zodiacInfo.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const text = generateText(data, answers, signKey);
    onSubmit({ text, birthDate });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>✨ Ton Horoscope Personnalisé</Text>

      {/* Date de naissance */}
      <Text style={styles.label}>Date de naissance (JJ-MM-AAAA)</Text>
      <TextInput
        placeholder="15-03-1990"
        placeholderTextColor="#64748b"
        value={birthDate}
        onChangeText={(t) => setBirthDate(formatBirthDate(t))}
        keyboardType="number-pad"
        maxLength={10}
        style={[styles.input, dateError && styles.inputError]}
      />
      {dateError && (
        <Text style={styles.errorText}>Date invalide. Format : JJ-MM-AAAA.</Text>
      )}

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
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#ef4444",
    marginBottom: 6,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 16,
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
});

