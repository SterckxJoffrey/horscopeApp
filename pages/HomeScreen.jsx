import React, { useRef, useState } from "react";
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

const onlyDigits = (text, max) => text.replace(/\D/g, "").slice(0, max);

const buildBirthDate = (day, month, year) => {
  if (day.length === 0 || month.length === 0 || year.length !== 4) return "";
  return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
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

// 🔹 Questions (ordre = ordre d'affichage)
const questions = [
  {
    key: "amour",
    question: "Que recherches-tu dans une relation ?",
    options: {
      A: "De la passion et de l’aventure",
      B: "De la sécurité et du soutien",
      C: "De la croissance et de la profondeur",
      D: "De la liberté et de l’indépendance",
    },
  },
  {
    key: "travail",
    question: "Quelle est ta principale priorité en ce moment ?",
    options: {
      A: "Faire carrière",
      B: "Trouver un équilibre",
      C: "Découvrir de nouvelles opportunités",
      D: "Prendre du repos",
    },
  },
  {
    key: "bienEtre",
    question: "Comment prends-tu soin de toi ?",
    options: {
      A: "Je prends consciemment du temps pour moi",
      B: "Parfois, mais pas assez",
      C: "À peine",
      D: "Je ne sais pas trop comment faire",
    },
  },
  {
    key: "futur",
    question: "Comment envisages-tu l’avenir ?",
    options: {
      A: "Avec espoir",
      B: "Prudemment optimiste",
      C: "Incertain",
      D: "Anxieux",
    },
  },
];

export default function HomeScreen({ onSubmit, onHome }) {
  const [answers, setAnswers] = useState({});
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  // step 0 = date, step 1..N = questions
  const [step, setStep] = useState(0);

  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const birthDate = buildBirthDate(day, month, year);
  const dateValid = isValidBirthDate(birthDate);
  const dateError = year.length === 4 && !dateValid;

  const submit = (finalAnswers) => {
    const zodiacInfo = getZodiacSign(birthDate);
    if (!zodiacInfo) return;
    const signKey = zodiacInfo.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    const text = generateText(data, finalAnswers, signKey);
    onSubmit({ text, birthDate });
  };

  const handleSelect = (questionKey, value) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const handleConfirm = () => {
    const questionIndex = step - 1;
    if (questionIndex < questions.length - 1) {
      setStep(step + 1);
    } else {
      submit(answers);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const totalSteps = questions.length + 1;
  const progressLabel = `Étape ${step + 1} / ${totalSteps}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.progress}>{progressLabel}</Text>

      {step === 0 ? (
        <View style={styles.block}>
          <View style={styles.questionCard}>
            <Text style={styles.question}>ENTER YOUR DATE OF BIRTH</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Jour</Text>
              <TextInput
                placeholder="JJ"
                placeholderTextColor="#64748b"
                value={day}
                onChangeText={(t) => {
                  const v = onlyDigits(t, 2);
                  setDay(v);
                  if (v.length === 2) monthRef.current?.focus();
                }}
                onFocus={() => setFocusedField("day")}
                onBlur={() => setFocusedField((f) => (f === "day" ? null : f))}
                keyboardType="number-pad"
                maxLength={2}
                style={[
                  styles.dateInput,
                  focusedField === "day" && styles.dateInputFocused,
                  dateError && styles.inputError,
                ]}
                textAlign="center"
              />
            </View>

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Mois</Text>
              <TextInput
                ref={monthRef}
                placeholder="MM"
                placeholderTextColor="#64748b"
                value={month}
                onChangeText={(t) => {
                  const v = onlyDigits(t, 2);
                  setMonth(v);
                  if (v.length === 2) yearRef.current?.focus();
                }}
                onFocus={() => setFocusedField("month")}
                onBlur={() => setFocusedField((f) => (f === "month" ? null : f))}
                keyboardType="number-pad"
                maxLength={2}
                style={[
                  styles.dateInput,
                  focusedField === "month" && styles.dateInputFocused,
                  dateError && styles.inputError,
                ]}
                textAlign="center"
              />
            </View>

            <View style={[styles.dateField, styles.dateFieldYear]}>
              <Text style={styles.dateLabel}>Année</Text>
              <TextInput
                ref={yearRef}
                placeholder="AAAA"
                placeholderTextColor="#64748b"
                value={year}
                onChangeText={(t) => setYear(onlyDigits(t, 4))}
                onFocus={() => setFocusedField("year")}
                onBlur={() => setFocusedField((f) => (f === "year" ? null : f))}
                keyboardType="number-pad"
                maxLength={4}
                style={[
                  styles.dateInput,
                  focusedField === "year" && styles.dateInputFocused,
                  dateError && styles.inputError,
                ]}
                textAlign="center"
              />
            </View>
          </View>

          {dateError && (
            <Text style={styles.errorText}>
              Date invalide. Format : JJ-MM-AAAA.
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              dateValid ? styles.buttonActive : styles.buttonDisabled,
            ]}
            onPress={() => dateValid && setStep(1)}
            disabled={!dateValid}
          >
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onHome}>
            <Text style={styles.backButtonText}>← Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      ) : (
        (() => {
          const q = questions[step - 1];
          return (
            <View style={styles.block}>
              <View style={styles.questionCard}>
                <Text style={styles.question}>{q.question}</Text>
              </View>

              <View style={styles.optionsGrid}>
                {Object.entries(q.options).map(([letter, label]) => {
                  const selected = answers[q.key] === letter;
                  return (
                    <TouchableOpacity
                      key={letter}
                      onPress={() => handleSelect(q.key, letter)}
                      style={[styles.option, selected && styles.optionSelected]}
                    >
                      <Text
                        style={selected ? styles.textSelected : styles.text}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {(() => {
                const hasAnswer = answers[q.key] != null;
                const isLast = step - 1 === questions.length - 1;
                return (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      hasAnswer ? styles.buttonActive : styles.buttonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!hasAnswer}
                  >
                    <Text style={styles.buttonText}>
                      {isLast ? "Voir mon horoscope" : "Confirmer"}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>← Retour</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={onHome}>
                <Text style={styles.backButtonText}>← Retour à l'accueil</Text>
              </TouchableOpacity>
            </View>
          );
        })()
      )}
    </ScrollView>
  );
}

// 🎨 Styles
const whiteGlow = [
  { offsetX: 0, offsetY: 0, blurRadius: 28, color: "rgba(255, 255, 255, 0.3)" },
  { offsetX: 0, offsetY: 0, blurRadius: 48, color: "rgba(255, 255, 255, 0.2)" },
  { offsetX: 0, offsetY: 0, blurRadius: 28, color: "rgba(255, 255, 255, 0.45)", inset: true },
  { offsetX: 0, offsetY: 0, blurRadius: 48, color: "rgba(255, 255, 255, 0.2)", inset: true },
];

const weakGlow = [
  { offsetX: 0, offsetY: 0, blurRadius: 20, color: "rgba(255, 255, 255, 0.22)" },
  { offsetX: 0, offsetY: 0, blurRadius: 34, color: "rgba(255, 255, 255, 0.14)" },
  { offsetX: 0, offsetY: 0, blurRadius: 20, color: "rgba(255, 255, 255, 0.32)", inset: true },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 180,
    paddingBottom: 20,
    justifyContent: "center",
  },
  progress: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
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
  dateRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    width: "70%",
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateFieldYear: {
    flex: 1.6,
  },
  dateLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: "rgba(30, 41, 59, 0.05)",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    boxShadow: weakGlow,
  },
  dateInputFocused: {
    boxShadow: whiteGlow,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 16,
  },
  block: {
    marginBottom: 25,
  },
  questionCard: {
    width: "80%",
    height: "50%",
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.05)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 24,
    boxShadow: whiteGlow,
  },
  question: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    justifyContent: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "90%",
  },
  option: {
    backgroundColor: "rgba(30, 41, 59, 0.05)",
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    width: "48%",
    minHeight: 80,
    justifyContent: "center",
    marginBottom: 12,
    boxShadow: weakGlow,
  },
  optionSelected: {
    backgroundColor: "transparent",
    boxShadow: whiteGlow,
  },
  text: {
    color: "#ccc",
    fontSize: 27,
    fontWeight: "400",
    textAlign: "center",
  },
  textSelected: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "400",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 999,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 16,
  },
  buttonActive: {
    boxShadow: whiteGlow,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: 16,
    padding: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
});
