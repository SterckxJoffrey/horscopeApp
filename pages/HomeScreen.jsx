import React, { useRef, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

import { pickIndices } from "../Horoscope";
import { getZodiacSign } from "../zodiac";
import { LanguageContext } from "../LanguageContext.js";

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

export default function HomeScreen({ onSubmit, onHome }) {
  const { t } = useContext(LanguageContext);
  const questions = t.questions;
  const [answers, setAnswers] = useState({});
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [focusedField, setFocusedField] = useState(null);
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
    const picks = pickIndices(finalAnswers, signKey);
    onSubmit({ answers: finalAnswers, signKey, picks, birthDate });
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
  const progressLabel = t.progress.replace("${step}", step + 1).replace("${total}", totalSteps);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.progress}>{progressLabel}</Text>

      {step === 0 ? (
        <View style={styles.block}>
          <View style={styles.questionCard}>
            <Text style={styles.question}>{t.dateOfBirth}</Text>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>{t.dateLabels.day}</Text>
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
              <Text style={styles.dateLabel}>{t.dateLabels.month}</Text>
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
              <Text style={styles.dateLabel}>{t.dateLabels.year}</Text>
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
              {t.dateError}
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
            <Text style={styles.buttonText}>{t.buttons.next}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onHome}>
            <Text style={styles.backButtonText}>{t.buttons.backHome}</Text>
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
                      {isLast ? t.buttons.viewHoroscope : t.buttons.confirm}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>{t.buttons.back}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={onHome}>
                <Text style={styles.backButtonText}>{t.buttons.backHome}</Text>
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
    justifyContent: "center",
    alignSelf: "center",
    width: "90%",
    rowGap: 50,
    columnGap: 40,
    paddingTop: 120,
  },
  option: {
    backgroundColor: "rgba(30, 41, 59, 0.05)",
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    width: "47%",
    minHeight: 80,
    justifyContent: "center",
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
    marginTop: 120,
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
