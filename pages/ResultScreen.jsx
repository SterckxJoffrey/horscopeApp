import React, { useRef, useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import RNFS from "react-native-fs";

import { getZodiacSign } from "../zodiac";
import { composeText } from "../Horoscope";
import logoHeader from "../assets/logo_header.png";
import cardBackground from "../assets/home_background.png";
import { LanguageContext } from "../LanguageContext.js";

import Aries from "../assets/signs/aries.svg";
import Taurus from "../assets/signs/taurus.svg";
import Gemini from "../assets/signs/gemini.svg";
import CancerSvg from "../assets/signs/cancer.svg";
import Leo from "../assets/signs/leo.svg";
import Virgo from "../assets/signs/virgo.svg";
import Libra from "../assets/signs/libra.svg";
import Scorpio from "../assets/signs/scorpio.svg";
import Sagittarius from "../assets/signs/sagittarius.svg";
import Capricorn from "../assets/signs/capricorn.svg";
import Aquarius from "../assets/signs/aquarius.svg";
import Pisces from "../assets/signs/pisces.svg";

import AriesStars from "../assets/signs_stars/aries_stars.svg";
import TaurusStars from "../assets/signs_stars/taurus_stars.svg";
import GeminiStars from "../assets/signs_stars/gemini_stars.svg";
import CancerStars from "../assets/signs_stars/cancer_stars.svg";
import LeoStars from "../assets/signs_stars/leo_stars.svg";
import VirgoStars from "../assets/signs_stars/virgo_stars.svg";
import LibraStars from "../assets/signs_stars/libra_svg.svg";
import ScorpioStars from "../assets/signs_stars/scorpio_stars.svg";
import SagittariusStars from "../assets/signs_stars/sagitrarius_stars.svg";
import CapricornStars from "../assets/signs_stars/capricorn_stars.svg";
import AquariusStars from "../assets/signs_stars/aquarius_stars.svg";
import PiscesStars from "../assets/signs_stars/pisces_stars.svg";

const SIGN_SVG = {
  "Bélier": Aries,
  Taureau: Taurus,
  "Gémeaux": Gemini,
  Cancer: CancerSvg,
  Lion: Leo,
  Vierge: Virgo,
  Balance: Libra,
  Scorpion: Scorpio,
  Sagittaire: Sagittarius,
  Capricorne: Capricorn,
  Verseau: Aquarius,
  Poissons: Pisces,
};

const SIGN_STARS_SVG = {
  "Bélier": AriesStars,
  Taureau: TaurusStars,
  "Gémeaux": GeminiStars,
  Cancer: CancerStars,
  Lion: LeoStars,
  Vierge: VirgoStars,
  Balance: LibraStars,
  Scorpion: ScorpioStars,
  Sagittaire: SagittariusStars,
  Capricorne: CapricornStars,
  Verseau: AquariusStars,
  Poissons: PiscesStars,
};

const PRINT_DIR = `${RNFS.PicturesDirectoryPath}/ToPrint`;

async function ensureWritePermission() {
  if (Platform.OS !== "android" || Platform.Version >= 29) return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function ResultScreen({ answers, signKey, picks, birthDate, onBack }) {
  const { t, language } = useContext(LanguageContext);
  const sign = getZodiacSign(birthDate);
  const result = useMemo(
    () => composeText(answers, signKey, picks, language),
    [answers, signKey, picks, language]
  );
  const { width, height } = useWindowDimensions();
  const cardRef = useRef(null);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const ok = await ensureWritePermission();
      if (!ok) {
        Alert.alert(t.alerts.permissionDenied, t.alerts.cannotWriteFile);
        return;
      }

      const tmpUri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const dirExists = await RNFS.exists(PRINT_DIR);
      if (!dirExists) await RNFS.mkdir(PRINT_DIR);

      const destPath = `${PRINT_DIR}/horoscope_${Date.now()}.png`;
      await RNFS.moveFile(tmpUri, destPath);

      Alert.alert(t.alerts.printSent, t.alerts.fileSaved);
    } catch (e) {
      Alert.alert(t.alerts.printError, String(e?.message || e));
    } finally {
      setPrinting(false);
    }
  };

  const cardSize = {
    width: width * 0.675,
    height: height * 0.5625,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.homeButtonText}>{t.buttons.home}</Text>
      </TouchableOpacity>

      <ImageBackground
        ref={cardRef}
        source={cardBackground}
        style={[styles.card, cardSize]}
        imageStyle={styles.cardImage}
        resizeMode="cover"
      >
        <View style={styles.cardContent}>
          <Image
            source={logoHeader}
            style={styles.cardLogo}
            resizeMode="contain"
          />
          <View style={styles.signStarsWrap}>
            {sign && SIGN_STARS_SVG[sign.name] ? (
              (() => {
                const SignStarsSvg = SIGN_STARS_SVG[sign.name];
                return (
                  <SignStarsSvg
                    width={620}
                    height={520}
                    preserveAspectRatio="xMidYMid meet"
                  />
                );
              })()
            ) : null}
          </View>
          <View style={styles.cardTextBottom}>
            {sign && SIGN_SVG[sign.name] ? (
              (() => {
                const SignSvg = SIGN_SVG[sign.name];
                return (
                  <SignSvg
                    width={120}
                    height={40}
                    style={styles.signSvg}
                  />
                );
              })()
            ) : null}
            <Text style={styles.result}>{result.trim()}</Text>
          </View>
        </View>
      </ImageBackground>

      <TouchableOpacity
        style={[styles.printButton, printing && styles.printButtonDisabled]}
        onPress={handlePrint}
        disabled={printing}
      >
        <Text style={styles.printButtonText}>
          {printing ? t.buttons.sending : t.buttons.print}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const whiteGlow = [
  { offsetX: 0, offsetY: 0, blurRadius: 28, color: "rgba(255, 255, 255, 0.3)" },
  { offsetX: 0, offsetY: 0, blurRadius: 48, color: "rgba(255, 255, 255, 0.2)" },
  { offsetX: 0, offsetY: 0, blurRadius: 28, color: "rgba(255, 255, 255, 0.45)", inset: true },
  { offsetX: 0, offsetY: 0, blurRadius: 48, color: "rgba(255, 255, 255, 0.2)", inset: true },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  homeButton: {
    position: "absolute",
    bottom: "5%",
    alignSelf: "center",
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    boxShadow: whiteGlow,
    zIndex: 10,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: "8%",
    backgroundColor: "transparent",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
    justifyContent: "center",
    boxShadow: whiteGlow,
  },
  cardImage: {
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLogo: {
    height: "20%",
    width: "100%",
    transform: [{ scale: 3 }],
  },
  cardTextBottom: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 30,
  },
  signStarsWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  signSvg: {
    marginBottom: 20,
  },
  result: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 28,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  printButton: {
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 999,
    alignItems: "center",
    boxShadow: whiteGlow,
  },
  printButtonDisabled: {
    opacity: 0.4,
    boxShadow: [],
  },
  printButtonText: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
