/**
 * GramMart Name Transliterator
 * Converts English names → regional Indian scripts when language changes.
 * Strategy: dictionary lookup first → phoneme-based fallback.
 */

import { Language } from "./i18n";

// ─── 1. Common Indian name dictionary ─────────────────────────────────────────
const NAME_DICT: Record<string, Partial<Record<Language, string>>> = {
  // ── A ──
  "avinash":    { TAMIL:"அவினாஷ்",    HINDI:"अविनाश",   TELUGU:"అవినాష్",    KANNADA:"ಅವಿನಾಶ್",   MALAYALAM:"അവിനാഷ്"   },
  "ajay":       { TAMIL:"அஜய்",       HINDI:"अजय",       TELUGU:"అజయ్",       KANNADA:"ಅಜಯ್",       MALAYALAM:"അജയ്"      },
  "arun":       { TAMIL:"அருண்",      HINDI:"अरुण",      TELUGU:"అరుణ్",      KANNADA:"ಅರುಣ್",      MALAYALAM:"അരുൺ"      },
  "anand":      { TAMIL:"ஆனந்த்",     HINDI:"आनंद",      TELUGU:"ఆనంద్",      KANNADA:"ಆನಂದ್",      MALAYALAM:"ആനന്ദ്"    },
  "anita":      { TAMIL:"அனிதா",      HINDI:"अनीता",     TELUGU:"అనిత",       KANNADA:"ಅನಿತಾ",      MALAYALAM:"അനിത"      },
  "arjun":      { TAMIL:"அர்ஜுன்",    HINDI:"अर्जुन",    TELUGU:"అర్జున్",    KANNADA:"ಅರ್ಜುನ್",    MALAYALAM:"അർജുൻ"     },
  "abdul":      { TAMIL:"அப்துல்",    HINDI:"अब्दुल",    TELUGU:"అబ్దుల్",    KANNADA:"ಅಬ್ದುಲ್",    MALAYALAM:"അബ്ദുൽ"    },
  "ammu":       { TAMIL:"அம்மு",      HINDI:"अम्मू",     TELUGU:"అమ్ము",      KANNADA:"ಅಮ್ಮು",      MALAYALAM:"അമ്മു"      },
  // ── B ──
  "balu":       { TAMIL:"பாலு",       HINDI:"बालू",      TELUGU:"బాలు",       KANNADA:"ಬಾಲು",       MALAYALAM:"ബാലു"      },
  "babu":       { TAMIL:"பாபு",       HINDI:"बाबू",      TELUGU:"బాబు",       KANNADA:"ಬಾಬು",       MALAYALAM:"ബാബു"      },
  "bhaskar":    { TAMIL:"பாஸ்கர்",    HINDI:"भास्कर",    TELUGU:"భాస్కర్",    KANNADA:"ಭಾಸ್ಕರ್",    MALAYALAM:"ഭാസ്കർ"    },
  // ── C ──
  "chandra":    { TAMIL:"சந்திரா",    HINDI:"चंद्रा",    TELUGU:"చంద్రా",     KANNADA:"ಚಂದ್ರಾ",     MALAYALAM:"ചന്ദ്ര"    },
  "charan":     { TAMIL:"சரண்",       HINDI:"चरण",       TELUGU:"చరణ్",       KANNADA:"ಚರಣ್",       MALAYALAM:"ചരൺ"       },
  // ── D ──
  "deepa":      { TAMIL:"தீபா",       HINDI:"दीपा",      TELUGU:"దీప",        KANNADA:"ದೀಪಾ",       MALAYALAM:"ദീപ"       },
  "dinesh":     { TAMIL:"தினேஷ்",     HINDI:"दिनेश",     TELUGU:"దినేష్",     KANNADA:"ದಿನೇಶ್",     MALAYALAM:"ദിനേഷ്"    },
  "devi":       { TAMIL:"தேவி",       HINDI:"देवी",      TELUGU:"దేవి",       KANNADA:"ದೇವಿ",       MALAYALAM:"ദേവി"      },
  "dileep":     { TAMIL:"திலீப்",     HINDI:"दिलीप",     TELUGU:"దిలీప్",     KANNADA:"ದಿಲೀಪ್",     MALAYALAM:"ദിലീപ്"    },
  // ── G ──
  "ganesh":     { TAMIL:"கணேஷ்",      HINDI:"गणेश",      TELUGU:"గణేష్",      KANNADA:"ಗಣೇಶ್",      MALAYALAM:"ഗണേഷ്"     },
  "geetha":     { TAMIL:"கீதா",       HINDI:"गीता",      TELUGU:"గీత",        KANNADA:"ಗೀತಾ",       MALAYALAM:"ഗീത"       },
  "gopi":       { TAMIL:"கோபி",       HINDI:"गोपी",      TELUGU:"గోపి",       KANNADA:"ಗೋಪಿ",       MALAYALAM:"ഗോപി"      },
  "gopal":      { TAMIL:"கோபால்",     HINDI:"गोपाल",     TELUGU:"గోపాల్",     KANNADA:"ಗೋಪಾಲ್",     MALAYALAM:"ഗോപാൽ"     },
  "girija":     { TAMIL:"கிரிஜா",     HINDI:"गिरिजा",    TELUGU:"గిరిజ",      KANNADA:"ಗಿರಿಜಾ",     MALAYALAM:"ഗിരിജ"     },
  // ── H ──
  "hari":       { TAMIL:"ஹரி",        HINDI:"हरि",       TELUGU:"హరి",        KANNADA:"ಹರಿ",        MALAYALAM:"ഹരി"       },
  "harish":     { TAMIL:"ஹரீஷ்",      HINDI:"हरीश",      TELUGU:"హరీష్",      KANNADA:"ಹರೀಶ್",      MALAYALAM:"ഹരീഷ്"     },
  "hussain":    { TAMIL:"ஹுசேன்",     HINDI:"हुसैन",     TELUGU:"హుసేన్",     KANNADA:"ಹುಸೇನ್",     MALAYALAM:"ഹുസൈൻ"     },
  // ── I ──
  "ibrahim":    { TAMIL:"இப்ராஹிம்",  HINDI:"इब्राहिम",  TELUGU:"ఇబ్రాహిమ్", KANNADA:"ಇಬ್ರಾಹಿಂ",   MALAYALAM:"ഇബ്രാഹിം"  },
  // ── J ──
  "john":       { TAMIL:"ஜான்",       HINDI:"जॉन",       TELUGU:"జాన్",       KANNADA:"ಜಾನ್",       MALAYALAM:"ജോൺ"       },
  "joseph":     { TAMIL:"ஜோஸப்",      HINDI:"जोसफ",      TELUGU:"జోసఫ్",      KANNADA:"ಜೋಸೆಫ್",     MALAYALAM:"ജോസഫ്"     },
  "james":      { TAMIL:"ஜேம்ஸ்",     HINDI:"जेम्स",     TELUGU:"జేమ్స్",     KANNADA:"ಜೇಮ್ಸ್",     MALAYALAM:"ജെയിംസ്"   },
  // ── K ──
  "karthik":    { TAMIL:"கார்த்திக்", HINDI:"कार्तिक",   TELUGU:"కార్తిక్",   KANNADA:"ಕಾರ್ತಿಕ್",   MALAYALAM:"കാർത്തിക്" },
  "kumar":      { TAMIL:"குமார்",     HINDI:"कुमार",     TELUGU:"కుమార్",     KANNADA:"ಕುಮಾರ್",     MALAYALAM:"കുമാർ"     },
  "kavitha":    { TAMIL:"கவிதா",      HINDI:"कविता",     TELUGU:"కవిత",       KANNADA:"ಕವಿತಾ",      MALAYALAM:"കവിത"      },
  "krishna":    { TAMIL:"கிருஷ்ணா",   HINDI:"कृष्णा",    TELUGU:"కృష్ణ",      KANNADA:"ಕೃಷ್ಣ",      MALAYALAM:"കൃഷ്ണ"     },
  "kannan":     { TAMIL:"கண்ணன்",     HINDI:"कन्नन",     TELUGU:"కన్నన్",     KANNADA:"ಕನ್ನನ್",     MALAYALAM:"കണ്ണൻ"     },
  "kiran":      { TAMIL:"கிரண்",      HINDI:"किरण",      TELUGU:"కిరణ్",      KANNADA:"ಕಿರಣ್",      MALAYALAM:"കിരൺ"      },
  // ── L ──
  "lakshmi":    { TAMIL:"லட்சுமி",    HINDI:"लक्ष्मी",   TELUGU:"లక్ష్మి",    KANNADA:"ಲಕ್ಷ್ಮಿ",    MALAYALAM:"ലക്ഷ്മി"   },
  "lalitha":    { TAMIL:"லலிதா",      HINDI:"ललिता",     TELUGU:"లలిత",       KANNADA:"ಲಲಿತಾ",      MALAYALAM:"ലലിത"      },
  "leela":      { TAMIL:"லீலா",       HINDI:"लीला",      TELUGU:"లీల",        KANNADA:"ಲೀಲಾ",       MALAYALAM:"ലീല"       },
  // ── M ──
  "mahesh":     { TAMIL:"மஹேஷ்",      HINDI:"महेश",      TELUGU:"మహేష్",      KANNADA:"ಮಹೇಶ್",      MALAYALAM:"മഹേഷ്"     },
  "mala":       { TAMIL:"மாலா",       HINDI:"माला",      TELUGU:"మాల",        KANNADA:"ಮಾಲಾ",       MALAYALAM:"മാല"       },
  "mary":       { TAMIL:"மேரி",       HINDI:"मेरी",      TELUGU:"మేరి",       KANNADA:"ಮೇರಿ",       MALAYALAM:"മേരി"      },
  "meena":      { TAMIL:"மீனா",       HINDI:"मीना",      TELUGU:"మీన",        KANNADA:"ಮೀನಾ",       MALAYALAM:"മീന"       },
  "murugan":    { TAMIL:"முருகன்",    HINDI:"मुरुगन",    TELUGU:"మురుగన్",    KANNADA:"ಮುರುಗನ್",    MALAYALAM:"മുരുകൻ"    },
  "muthu":      { TAMIL:"முத்து",     HINDI:"मुत्थू",    TELUGU:"ముత్తు",     KANNADA:"ಮುತ್ತು",     MALAYALAM:"മുത്തു"     },
  "mohan":      { TAMIL:"மோகன்",      HINDI:"मोहन",      TELUGU:"మోహన్",      KANNADA:"ಮೋಹನ್",      MALAYALAM:"മോഹൻ"      },
  "mohammed":   { TAMIL:"முஹம்மத்",  HINDI:"मोहम्मद",   TELUGU:"మొహమ్మద్",   KANNADA:"ಮೊಹಮ್ಮದ್",   MALAYALAM:"മുഹമ്മദ്"  },
  // ── N ──
  "nandha":     { TAMIL:"நந்தா",      HINDI:"नंदा",      TELUGU:"నంద",        KANNADA:"ನಂದ",        MALAYALAM:"നന്ദ"       },
  "naresh":     { TAMIL:"நரேஷ்",      HINDI:"नरेश",      TELUGU:"నరేష్",      KANNADA:"ನರೇಶ್",      MALAYALAM:"നരേഷ്"     },
  // ── P ──
  "pandi":      { TAMIL:"பாண்டி",     HINDI:"पांडी",     TELUGU:"పాండి",      KANNADA:"ಪಾಂಡಿ",      MALAYALAM:"പാണ്ടി"    },
  "priya":      { TAMIL:"பிரியா",     HINDI:"प्रिया",    TELUGU:"ప్రియ",      KANNADA:"ಪ್ರಿಯಾ",     MALAYALAM:"പ്രിയ"     },
  "prabhu":     { TAMIL:"பிரபு",      HINDI:"प्रभू",     TELUGU:"ప్రభు",      KANNADA:"ಪ್ರಭು",      MALAYALAM:"പ്രഭു"     },
  "prakash":    { TAMIL:"பிரகாஷ்",    HINDI:"प्रकाश",    TELUGU:"ప్రకాష్",    KANNADA:"ಪ್ರಕಾಶ್",    MALAYALAM:"പ്രകാശ്"   },
  // ── R ──
  "rajesh":     { TAMIL:"ராஜேஷ்",     HINDI:"राजेश",     TELUGU:"రాజేష్",     KANNADA:"ರಾಜೇಶ್",     MALAYALAM:"രാജേഷ്"    },
  "rajan":      { TAMIL:"ராஜன்",      HINDI:"राजन",      TELUGU:"రాజన్",      KANNADA:"ರಾಜನ್",      MALAYALAM:"രാജൻ"      },
  "ramesh":     { TAMIL:"ரமேஷ்",      HINDI:"रमेश",      TELUGU:"రమేష్",      KANNADA:"ರಮೇಶ್",      MALAYALAM:"രമേഷ്"     },
  "ranjith":    { TAMIL:"ரஞ்சித்",    HINDI:"रंजीत",     TELUGU:"రంజిత్",     KANNADA:"ರಂಜಿತ್",     MALAYALAM:"രഞ്ജിത്"   },
  "ravi":       { TAMIL:"ரவி",        HINDI:"रवि",       TELUGU:"రవి",        KANNADA:"ರವಿ",        MALAYALAM:"രവി"       },
  // ── S ──
  "sanjay":     { TAMIL:"சஞ்சய்",     HINDI:"संजय",      TELUGU:"సంజయ్",      KANNADA:"ಸಂಜಯ್",      MALAYALAM:"സഞ്ജയ്"    },
  "saritha":    { TAMIL:"சரிதா",      HINDI:"सरिता",     TELUGU:"సరిత",       KANNADA:"ಸರಿತಾ",      MALAYALAM:"സരിത"      },
  "satish":     { TAMIL:"சதீஷ்",      HINDI:"सतीश",      TELUGU:"సతీష్",      KANNADA:"ಸತೀಶ್",      MALAYALAM:"സതീഷ്"     },
  "savitha":    { TAMIL:"சவிதா",      HINDI:"सविता",     TELUGU:"సవిత",       KANNADA:"ಸವಿತಾ",      MALAYALAM:"സവിത"      },
  "selvam":     { TAMIL:"செல்வம்",    HINDI:"सेल्वम",    TELUGU:"సెల్వమ్",    KANNADA:"ಸೆಲ್ವಮ್",    MALAYALAM:"സെൽവം"     },
  "sundar":     { TAMIL:"சுந்தர்",    HINDI:"सुंदर",     TELUGU:"సుందర్",     KANNADA:"ಸುಂದರ್",     MALAYALAM:"സുന്ദർ"    },
  "suresh":     { TAMIL:"சுரேஷ்",     HINDI:"सुरेश",     TELUGU:"సురేష్",     KANNADA:"ಸುರೇಶ್",     MALAYALAM:"സുരേഷ്"    },
  "sivakumar":  { TAMIL:"சிவகுமார்",  HINDI:"शिवकुमार",  TELUGU:"శివకుమార్",  KANNADA:"ಶಿವಕುಮಾರ್",  MALAYALAM:"ശിവകുമാർ"  },
  "siva":       { TAMIL:"சிவா",       HINDI:"शिवा",      TELUGU:"శివ",        KANNADA:"ಶಿವ",        MALAYALAM:"ശിവ"       },
  "sumathi":    { TAMIL:"சுமதி",      HINDI:"सुमति",     TELUGU:"సుమతి",      KANNADA:"ಸುಮತಿ",      MALAYALAM:"സുമതി"     },
  // ── T ──
  "thambi":     { TAMIL:"தம்பி",      HINDI:"थम्बी",     TELUGU:"తంబి",       KANNADA:"ತಂಬಿ",       MALAYALAM:"തമ്പി"      },
  // ── U ──
  "usha":       { TAMIL:"உஷா",        HINDI:"उषा",       TELUGU:"ఉష",         KANNADA:"ಉಷಾ",        MALAYALAM:"ഉഷ"        },
  // ── V ──
  "velu":       { TAMIL:"வேலு",       HINDI:"वेलु",      TELUGU:"వేలు",       KANNADA:"ವೇಲು",       MALAYALAM:"വേലു"      },
  "vijay":      { TAMIL:"விஜய்",      HINDI:"विजय",      TELUGU:"విజయ్",      KANNADA:"ವಿಜಯ್",      MALAYALAM:"വിജയ്"     },
  "vikram":     { TAMIL:"விக்ரம்",    HINDI:"विक्रम",    TELUGU:"విక్రమ్",    KANNADA:"ವಿಕ್ರಮ್",    MALAYALAM:"വിക്രം"    },
  "vimal":      { TAMIL:"விமல்",      HINDI:"विमल",      TELUGU:"విమల్",      KANNADA:"ವಿಮಲ್",      MALAYALAM:"വിമൽ"      },
};

// ─── 2. Phoneme-based fallback maps (syllable → script) ────────────────────────
type PhonemeMap = [string, string][];

const TAMIL_PH: PhonemeMap = [
  ["sh","ஷ"],["ch","ச"],["th","த"],["ph","ப"],["kh","க"],["gh","க"],["dh","த"],["bh","ப"],
  ["aa","ா"],["ii","ீ"],["oo","ூ"],["ee","ே"],["ai","ை"],["au","ௌ"],
  ["a","அ"],["i","இ"],["u","உ"],["e","எ"],["o","ஒ"],
  ["k","க்"],["g","க்"],["c","க்"],["j","ஜ்"],
  ["t","ட்"],["d","ட்"],["n","ந்"],["p","ப்"],
  ["b","ப்"],["m","ம்"],["y","ய்"],["r","ர்"],
  ["l","ல்"],["v","வ்"],["w","வ்"],["s","ஸ்"],
  ["h","ஹ்"],["z","ஸ்"],["f","ப்"],["x","க்ஸ்"],
];
const HINDI_PH: PhonemeMap = [
  ["sh","श"],["ch","च"],["th","थ"],["ph","फ"],["kh","ख"],["gh","घ"],["dh","ध"],["bh","भ"],
  ["aa","आ"],["ii","ई"],["oo","ऊ"],["ee","ई"],["ai","ऐ"],["au","औ"],
  ["a","अ"],["i","इ"],["u","उ"],["e","ए"],["o","ओ"],
  ["k","क्"],["g","ग्"],["c","क्"],["j","ज्"],
  ["t","त्"],["d","द्"],["n","न्"],["p","प्"],
  ["b","ब्"],["m","म्"],["y","य्"],["r","र्"],
  ["l","ल्"],["v","व्"],["w","व्"],["s","स्"],
  ["h","ह्"],["z","ज़्"],["f","फ़्"],["x","क्स्"],
];
const TELUGU_PH: PhonemeMap = [
  ["sh","శ"],["ch","చ"],["th","థ"],["ph","ఫ"],["kh","ఖ"],["gh","ఘ"],["dh","ధ"],["bh","భ"],
  ["aa","ా"],["ii","ీ"],["oo","ూ"],["ee","ే"],["ai","ై"],["au","ౌ"],
  ["a","అ"],["i","ఇ"],["u","ఉ"],["e","ఎ"],["o","ఒ"],
  ["k","క్"],["g","గ్"],["c","క్"],["j","జ్"],
  ["t","ట్"],["d","డ్"],["n","న్"],["p","ప్"],
  ["b","బ్"],["m","మ్"],["y","య్"],["r","ర్"],
  ["l","ల్"],["v","వ్"],["w","వ్"],["s","స్"],
  ["h","హ్"],["z","జ్"],["f","ఫ్"],["x","క్స్"],
];
const KANNADA_PH: PhonemeMap = [
  ["sh","ಶ"],["ch","ಚ"],["th","ಥ"],["ph","ಫ"],["kh","ಖ"],["gh","ಘ"],["dh","ಧ"],["bh","ಭ"],
  ["aa","ಾ"],["ii","ೀ"],["oo","ೂ"],["ee","ೇ"],["ai","ೈ"],["au","ೌ"],
  ["a","ಅ"],["i","ಇ"],["u","ಉ"],["e","ಎ"],["o","ಒ"],
  ["k","ಕ್"],["g","ಗ್"],["c","ಕ್"],["j","ಜ್"],
  ["t","ಟ್"],["d","ಡ್"],["n","ನ್"],["p","ಪ್"],
  ["b","ಬ್"],["m","ಮ್"],["y","ಯ್"],["r","ರ್"],
  ["l","ಲ್"],["v","ವ್"],["w","ವ್"],["s","ಸ್"],
  ["h","ಹ್"],["z","ಜ್"],["f","ಫ್"],["x","ಕ್ಸ್"],
];
const MALAYALAM_PH: PhonemeMap = [
  ["sh","ശ"],["ch","ച"],["th","ഥ"],["ph","ഫ"],["kh","ഖ"],["gh","ഘ"],["dh","ധ"],["bh","ഭ"],
  ["aa","ാ"],["ii","ീ"],["oo","ൂ"],["ee","േ"],["ai","ൈ"],["au","ൌ"],
  ["a","അ"],["i","ഇ"],["u","ഉ"],["e","എ"],["o","ഒ"],
  ["k","ക്"],["g","ഗ്"],["c","ക്"],["j","ജ്"],
  ["t","ട്"],["d","ഡ്"],["n","ന്"],["p","പ്"],
  ["b","ബ്"],["m","മ്"],["y","യ്"],["r","ർ"],
  ["l","ൽ"],["v","വ്"],["w","വ്"],["s","സ്"],
  ["h","ഹ്"],["z","ജ്"],["f","ഫ്"],["x","ക്സ്"],
];

const PHONEME_MAPS: Partial<Record<Language, PhonemeMap>> = {
  TAMIL: TAMIL_PH, HINDI: HINDI_PH, TELUGU: TELUGU_PH,
  KANNADA: KANNADA_PH, MALAYALAM: MALAYALAM_PH,
};

// ─── 3. Apply phoneme map to a single word ────────────────────────────────────
function applyPhonemes(word: string, map: PhonemeMap): string {
  let input = word.toLowerCase();
  let output = "";
  let i = 0;
  while (i < input.length) {
    let matched = false;
    for (const [pattern, replacement] of map) {
      if (input.startsWith(pattern, i)) {
        output += replacement;
        i += pattern.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Keep unknown characters as-is (digits, spaces, etc.)
      output += input[i];
      i++;
    }
  }
  return output;
}

// ─── 4. Main transliteration function ────────────────────────────────────────
/**
 * Transliterate an English customer name to the target script.
 * Returns original name for ENGLISH, TANGLISH, HINGLISH or if no mapping found.
 */
export function transliterateName(name: string, language: Language): string {
  if (!name || language === "ENGLISH" || language === "TANGLISH" || language === "HINGLISH") return name;

  const map = PHONEME_MAPS[language];
  if (!map) return name;

  // Process each word (handles "First Last", "Avinash A", etc.)
  return name
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase().replace(/[^a-z]/g, "");
      // Dictionary lookup first (most accurate)
      const entry = NAME_DICT[lower];
      if (entry?.[language]) return entry[language]!;

      // Single letter (e.g., "A" in "Avinash A") — transliterate as-is
      if (word.length === 1 && /[A-Za-z]/.test(word)) {
        return applyPhonemes(word, map);
      }

      // Phoneme-based fallback
      return applyPhonemes(word, map);
    })
    .join(" ");
}

/**
 * Get display name for a customer in the current language.
 * Preserves numbers and non-Latin characters.
 */
export function getDisplayName(name: string, language: Language): string {
  // If name already has non-Latin script, return as-is
  if (/[\u0900-\u0D7F]/.test(name)) return name;
  return transliterateName(name, language);
}
