"use client";

import { Mic, MicOff, X, CheckCircle, Loader2, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Language, t } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
type SpeechRecognitionInstance = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
};
type ParsedCommand = {
  intent: string;
  customerName?: string;
  productAlias?: string;
  amount?: string;
  quantity?: string;
};

// ─── Language → BCP-47 code ───────────────────────────────────────────────────
const langCodes: Record<Language, string> = {
  ENGLISH:   "en-IN",
  TAMIL:     "ta-IN",
  HINDI:     "hi-IN",
  TELUGU:    "te-IN",
  KANNADA:   "kn-IN",
  MALAYALAM: "ml-IN",
};

// ─── TTS phrases per language ─────────────────────────────────────────────────
const ttsMessages: Record<Language, {
  listening: string; notUnderstood: string; done: string;
  customerOpened: (n: string) => string;
  itemAdded: (qty: string, item: string, cust: string) => string;
  paymentRecorded: (amt: string, cust: string) => string;
  balanceIs: (cust: string, bal: string) => string;
  sayAgain: string;
}> = {
  ENGLISH: {
    listening: "Listening…",
    notUnderstood: "Sorry, I did not understand. Please try again.",
    done: "Done!",
    customerOpened: (n) => `Opened account for ${n}.`,
    itemAdded: (q, i, c) => `Added ${q} ${i} to ${c}'s account.`,
    paymentRecorded: (a, c) => `Payment of rupees ${a} recorded for ${c}.`,
    balanceIs: (c, b) => `${c}'s balance is rupees ${b}.`,
    sayAgain: "Please say the command again.",
  },
  TAMIL: {
    listening: "கேட்கிறேன்…",
    notUnderstood: "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லுங்கள்.",
    done: "சரி!",
    customerOpened: (n) => `${n} கணக்கு திறக்கப்பட்டது.`,
    itemAdded: (q, i, c) => `${c} கணக்கில் ${q} ${i} சேர்க்கப்பட்டது.`,
    paymentRecorded: (a, c) => `${c} இடமிருந்து ${a} ரூபாய் பெறப்பட்டது.`,
    balanceIs: (c, b) => `${c} இன் நிலுவை ${b} ரூபாய்.`,
    sayAgain: "மீண்டும் சொல்லுங்கள்.",
  },
  HINDI: {
    listening: "सुन रहा हूँ…",
    notUnderstood: "माफ़ कीजिए, समझ नहीं आया। फिर से बोलें।",
    done: "हो गया!",
    customerOpened: (n) => `${n} का खाता खोला गया।`,
    itemAdded: (q, i, c) => `${c} के खाते में ${q} ${i} जोड़ा गया।`,
    paymentRecorded: (a, c) => `${c} से ${a} रुपये का भुगतान दर्ज किया गया।`,
    balanceIs: (c, b) => `${c} का बकाया ${b} रुपये है।`,
    sayAgain: "कृपया फिर से बोलें।",
  },
  TELUGU: {
    listening: "వింటున్నాను…",
    notUnderstood: "క్షమించండి, అర్థం కాలేదు. మళ్ళీ చెప్పండి.",
    done: "అయింది!",
    customerOpened: (n) => `${n} ఖాతా తెరవబడింది.`,
    itemAdded: (q, i, c) => `${c} ఖాతాలో ${q} ${i} జోడించబడింది.`,
    paymentRecorded: (a, c) => `${c} నుండి ${a} రూపాయలు నమోదు చేయబడ్డాయి.`,
    balanceIs: (c, b) => `${c} బాకీ ${b} రూపాయలు.`,
    sayAgain: "దయచేసి మళ్ళీ చెప్పండి.",
  },
  KANNADA: {
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ…",
    notUnderstood: "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಹೇಳಿ.",
    done: "ಆಯ್ತು!",
    customerOpened: (n) => `${n} ಖಾತೆ ತೆರೆಯಲಾಗಿದೆ.`,
    itemAdded: (q, i, c) => `${c} ಖಾತೆಗೆ ${q} ${i} ಸೇರಿಸಲಾಗಿದೆ.`,
    paymentRecorded: (a, c) => `${c} ಇಂದ ${a} ರೂಪಾಯಿ ಪಾವತಿ ದಾಖಲಾಗಿದೆ.`,
    balanceIs: (c, b) => `${c} ಬಾಕಿ ${b} ರೂಪಾಯಿ.`,
    sayAgain: "ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.",
  },
  MALAYALAM: {
    listening: "കേൾക്കുന്നു…",
    notUnderstood: "മനസ്സിലായില്ല. വീണ്ടും പറയൂ.",
    done: "ശരി!",
    customerOpened: (n) => `${n} അക്കൗണ്ട് തുറന്നു.`,
    itemAdded: (q, i, c) => `${c} അക്കൗണ്ടിൽ ${q} ${i} ചേർത്തു.`,
    paymentRecorded: (a, c) => `${c} യിൽ നിന്ന് ${a} രൂപ ലഭിച്ചു.`,
    balanceIs: (c, b) => `${c} ബാക്കി ${b} രൂപ.`,
    sayAgain: "ദയവായി വീണ്ടും പറയൂ.",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 SLANG & DIALECT TRAINING DATABASE
// Covers: standard words + regional slangs + phonetic variants + colloquial speech
// ═══════════════════════════════════════════════════════════════════════════════

const SLANG_DB = {
  // ──────────────────────────────────────────────────────────────────────────
  // INTENT KEYWORDS — per language with full slang coverage
  // ──────────────────────────────────────────────────────────────────────────
  open: [
    // English
    "open","account","khata","register","start","show","load","pull up","bring up","launch",
    // Tamil (Standard + Madurai + Chennai + Coimbatore + Tirunelveli slangs)
    "திற","கணக்கு","கணக்கு திற","திறக்கணும்","திறந்து","கணக்கு பாரு","பாரு","எடு",
    "acount","kannakku","kannaku thirakanum","thirakanum",
    // Hindi (Standard + UP + Bihar + Rajasthan + Mumbai slangs)
    "खोल","खाता","खोलो","खोलना","दिखा","देखो","निकालो","चालू","शुरू","हिसाब",
    "khol","khata","khato","hisab","ledger","udhar khata","kholna","nikalo",
    "dikhao","dikh","account kholo","register karo",
    // Telugu (Standard + Hyderabadi + Rayalaseema slangs)
    "తెరు","ఖాతా","తెరువు","చూపించు","ఇవ్వు","చూడు","తీయి",
    "teru","khata","chupinchu","chuda","account teru","hisabu",
    // Kannada (Standard + Bangalore + North Karnataka slangs)
    "ತೆರೆ","ಖಾತೆ","ತೋರಿಸು","ತೆರೆಯಿರಿ","ನೋಡು","ತೆಗಿ","ಹಿಸಾಬು",
    "tere","khate","toriisu","nodu","tegi","hisaabu",
    // Malayalam (Standard + Thrissur + Kozhikode + Thiruvananthapuram slangs)
    "തുറ","അക്കൗണ്ട്","കണക്ക്","തുറക്കൂ","കാണിക്കൂ","എടുക്കൂ","നോക്കൂ",
    "thura","account","kanakku","thurakku","kanikku","edukku","nokku",
  ],

  pay: [
    // English
    "paid","payment","received","pay","collect","cash","money","rupees","paise","settled",
    "cleared","dues paid","paid up","payement","paayment","payed","recieved",
    // Tamil slangs (Chennai paisa, Madurai kaasu, Coimbatore style)
    "கொடுத்தார்","பணம்","கட்டினார்","ரூபாய்","காசு","செட்டில்","அடைச்சார்",
    "பத்து","நூறு","ஆயிரம்","பணம் வந்தது","பணம் தந்தார்",
    "koduthar","panam","kattinar","ruba","kaasu","settle","adaicchar",
    "panam vanthuchu","panam thanthar","vanthuchu",
    // Hindi slangs (UP: paise, Bihar: rupiya, Rajasthan: dena, Mumbai: diya)
    "दिया","दे दिया","भुगतान","चुकाया","पैसे","रुपये","पैसा","जमा","लिया","मिला",
    "रकम","भर दिया","खाता साफ","हिसाब चुकाया","पेमेंट","पेमेण्ट",
    "diya","de diya","bhugtan","chukaya","paise","rupiya","paisa","jama","liya","mila",
    "raqam","bhar diya","hisaab chukaaya","payment aaya","paisa aaya",
    // Telugu slangs (Hyderabadi: ichadu, Andhra: istunnadu)
    "చెల్లించారు","ఇచ్చారు","పైసలు","రూపాయలు","కట్టారు","జమ","వచ్చింది",
    "chellinchaaru","icchaaru","paisalu","rupayalu","kattaaru","jama","vachindi",
    "paisa ichadu","paisa vachchindi","settle chesadu",
    // Kannada slangs (Bangalore: kotru, North Karnataka: kottru)
    "ಕೊಟ್ಟರು","ಹಣ","ರೂಪಾಯಿ","ಕಟ್ಟಿದರು","ಪಾವತಿ","ಜಮ","ಬಂತು",
    "kottru","hana","rupayi","kattidru","paavati","jama","bantu",
    "paisa kottru","settle madidru",
    // Malayalam slangs (Thrissur: tharunu, Malabar: kodukkunnu)
    "തന്നു","പണം","രൂപ","കൊടുത്തു","കൊടുക്കുന്നു","ക്ലിയർ","അടച്ചു",
    "thannu","panam","rupa","koduthu","kodukkunnu","clear","adachu",
    "paisa thannu","settle ayi",
  ],

  add: [
    // English
    "add","credit","sale","sold","give","gave","took","purchase","bought","take",
    "credit sale","on account","on credit","udhar","on tab","put on account",
    // Tamil slangs (Madurai: pottu, Chennai: seri, Coimbatore: vechu)
    "சேர்","கொடு","கடன்","வாங்கினார்","எடுத்தார்","போட்டு","வெச்சு","பில் போடு",
    "உதவி","கடன் தா","கட்டிங்","சேர்க்கணும்",
    "ser","kodu","kadan","vaanginar","eduthaar","pottu","vechu","bill podu",
    "kadan tha","cutting","serakanum","vangikittaar",
    // Hindi slangs (UP: udhar, Bihar: dharo, Rajasthan: udharo, Delhi: daalo)
    "उधार","जोड़","दे दो","जोड़ो","लिखो","लिख दो","चढ़ाओ","चढ़ा दो","डालो","बना दो",
    "खाते में डालो","हिसाब में लिखो","उधारी","बाकी","credit karo",
    "udhar","jod","de do","jodo","likho","likh do","chadhaao","daalo","bana do",
    "khaate mein daalo","hisaab mein likho","udhaaree","credit daalo",
    // Telugu slangs (Hyderabadi: reyi, Andhra: vettu)
    "జోడించు","ఇవ్వు","అప్పు","వేయి","రాయి","రాయండి","చేర్చు","వేయండి",
    "joddinchu","ivvu","appu","veyyi","raayi","raayandi","cerchu","veyyandi",
    "account lo veyyi","appu ivvu","credit raayi",
    // Kannada slangs (Bangalore: haki, North Karnataka: haaku)
    "ಸೇರಿಸು","ಕೊಡು","ಸಾಲ","ಹಾಕು","ಬರಿ","ಬರಿಯಿರಿ","ಹಿಡಿ","ಚೇರ್ಚು",
    "serisu","kodu","saala","haaku","bari","bariyiri","hidi","cherchu",
    "account ge haaku","saala kodu","credit haaku",
    // Malayalam slangs (Thrissur: idu, Malabar: idem, Kochi: vayil)
    "ചേർ","കൊടുക്ക","കടം","ഇടൂ","എഴുതൂ","വയ്ക്കൂ","ക്രെഡിറ്റ്","കണക്കിൽ",
    "cher","kodukka","kadam","idu","ezhuthu","vayykku","credit","kannakkil",
    "account il idu","kadam kodukku",
  ],

  balance: [
    // English
    "balance","due","outstanding","dues","how much","owe","pending","remaining","bakaya",
    "total","what is owed","check balance","account balance",
    // Tamil
    "நிலுவை","எவ்வளவு","பாக்கி","கடன் எவ்வளவு","தொகை","கணக்கு பாரு",
    "niluval","evvalavu","baaki","kadan evvalavu","thokai","kannakku paaru",
    // Hindi
    "बकाया","कितना","बचा","उधार कितना","हिसाब","बैलेंस","बाकी है","देना है",
    "bakaya","kitna","bacha","udhar kitna","hisaab","balance","baaki hai","dena hai",
    // Telugu
    "బాకీ","ఎంత","నిల్వ","అప్పు ఎంత","లెక్క","balance చెప్పు",
    "baaki","enta","nilva","appu enta","lekka","balance cheppu",
    // Kannada
    "ಬಾಕಿ","ಎಷ್ಟು","ನಿಲ್ವ","ಸಾಲ ಎಷ್ಟು","ಲೆಕ್ಕ","balance ಹೇಳು",
    "baaki","estu","nilva","saala estu","lekka","balance helu",
    // Malayalam
    "ബാക്കി","എത്ര","കടം","കണക്ക്","balance പറ","കുടിശ്ശിക",
    "baakki","ethra","kadam","kanakku","balance para","kudissika",
  ],

  confirm: [
    "confirm","yes","ok","okay","sure","proceed","done","save","correct","right","go ahead",
    "haan","ha","sahi","theek hai","bilkul","yes boss","ya","yep","yup",
    // Tamil
    "சரி","ஆமா","ஆமாம்","போடு","செய்","ஓகே","கரெக்ட்",
    "sari","aama","aaamaam","podu","sei","okay","correct",
    // Hindi
    "हाँ","सही","ठीक है","बिल्कुल","करो","हो जाए","चलो",
    "haan","sahi","theek hai","bilkul","karo","ho jaae","chalo",
    // Telugu
    "సరే","అవును","చేయి","ఓకే","కరెక్ట్","అలాగే",
    "sare","avunu","cheyi","okay","correct","alaage",
    // Kannada
    "ಸರಿ","ಹೌದು","ಮಾಡು","ಓಕೆ","ಕರೆಕ್ಟ್","ಆಗಲಿ",
    "sari","houdu","maadu","okay","correct","aagali",
    // Malayalam
    "ശരി","ആണ്","ചെയ്യൂ","ഓകേ","കറക്ട്","മതി",
    "shari","aan","cheyyuu","okay","correct","mathi",
  ],

  cancel: [
    "cancel","no","stop","nope","nah","skip","abort","back","undo","reset","close",
    // Tamil
    "வேண்டாம்","நிறுத்து","போதும்","இல்ல","ஒழி","தேவையில்ல",
    "vendaam","niruthu","potum","illa","ozhi","thevayilla",
    // Hindi
    "नहीं","रद्द","बंद","रहने दो","मत करो","छोड़ो","नही चाहिए",
    "nahi","radd","band","rahne do","mat karo","chodo","nahi chahiye",
    // Telugu
    "వద్దు","ఆపు","వేండ్డ","లేదు","క్యాన్సిల్",
    "vaddu","aapu","venddu","ledu","cancel",
    // Kannada
    "ಬೇಡ","ನಿಲ್ಲಿಸು","ಬೇಡವಾಗಿದೆ","ಇಲ್ಲ","ಕ್ಯಾನ್ಸಲ್",
    "beda","nilllisu","bedavaagide","illa","cancel",
    // Malayalam
    "വേണ്ട","നിർത്ത","വേണ്ടിരിക്കുന്നു","ഇല്ല","ക്യൻസൽ",
    "venda","nirtha","vendirikkunu","illa","cancel",
  ],

  report: [
    "report","ledger","summary","daily","sales","accounts","statement","today","analytics",
    // Tamil
    "அறிக்கை","விற்பனை","இன்றைய","கணக்கு பட்டியல்","தினசரி",
    "arikkai","vitpanai","indraiya","kannakku pattial","thinasari",
    // Hindi
    "रिपोर्ट","बिक्री","आज का","हिसाब किताब","विवरण","लेजर",
    "report","bikri","aaj ka","hisaab kitaab","vivaran","ledger",
    // Telugu
    "నివేదిక","అమ్మకాలు","నేటి","లెక్కలు","స్టేట్‌మెంట్",
    "nivedhika","ammakalu","naeti","lekkalu","statement",
    // Kannada
    "ವರದಿ","ಮಾರಾಟ","ಇಂದಿನ","ಲೆಕ್ಕ","ಸಾರಾಂಶ",
    "varadi","maaraata","indhina","lekka","saaraansha",
    // Malayalam
    "റിപ്പോർട്ട്","വിൽപ്പന","ഇന്നത്തെ","കണക്ക്","സംഗ്രഹം",
    "report","vilppana","innatte","kanakku","samgraham",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🛒 PRODUCT KEYWORD DATABASE — standard + slangs + phonetic variants
// ═══════════════════════════════════════════════════════════════════════════════
const productKeywords: Array<{ keys: string[]; alias: string }> = [
  // ── GRAINS & FLOUR ────────────────────────────────────────────────────────
  { keys: ["rice","arisi","அரிசி","chawal","चावल","బియ్యం","biyyam","ಅಕ್ಕಿ","akki","അരി","ari","nanjanagud rice","ponni rice","raw rice","boiled rice","idli rice","ukda","sona masoori","sonamasuri","samba"], alias: "Rice" },
  { keys: ["basmati","bhasmati","basmathi","bas mati","long grain"], alias: "Premium Basmati Rice" },
  { keys: ["sona masoori","sonamasoori","sonamasuri","sona masuri","ponni","ponni rice"], alias: "Sona Masoori Rice" },
  { keys: ["wheat","godumai","கோதுமை","gehu","gehun","गेहूं","godhumai","గోధుమ","goduma","ಗೋಧಿ","godhi","ഗോതമ്പ്","gothambu","atta","wheat flour","chapati atta","roti atta","aata"], alias: "Wheat Atta" },
  { keys: ["maida","மைதா","maitha","मैदा","మైదా","maida pindi","ಮೈದಾ","all purpose flour","refined flour"], alias: "Maida" },
  { keys: ["rava","sooji","suji","semolina","சூஜி","ரவா","chiroti rava","रवा","सूजी","రవ్వ","ravva","ರವೆ","rave","റവ","upma rava","idli rava","bombay rava"], alias: "Rava / Sooji" },
  { keys: ["besan","gram flour","kadalai mavu","kadalamavu","கடலை மாவு","बेसन","chana flour","శనగ పిండి","shanaga pindi","ಕಡಲೆ ಹಿಟ್ಟು","kadlehittu","കടലപ്പൊടി","kadalaapodi"], alias: "Besan" },
  { keys: ["idli mavu","dosa batter","idly batter","dosa maavu","இட்லி மாவு","idli mix","dosa mix"], alias: "Idli Dosa Batter Mix" },
  { keys: ["poha","aval","அவல்","beaten rice","flattened rice","chura","pohe","avval","poha rice"], alias: "Poha / Aval" },

  // ── SUGAR & SWEETENERS ────────────────────────────────────────────────────
  { keys: ["sugar","sakkarai","sarkara","sarkarai","சர்க்கரை","chini","cheeni","चीनी","sakkar","shakkar","शक्कर","chakkera","చక్కెర","sakkare","ಸಕ್ಕರೆ","panchasara","പഞ്ചസാര","white sugar","crystal sugar"], alias: "Sugar" },
  { keys: ["jaggery","vellam","வெல்லம்","gur","gud","gudd","गुड़","bellam","బెల్లం","bella","ಬೆಲ್ಲ","sharkara","ശർക്കര","palm jaggery","karupatti","khandsari"], alias: "Jaggery" },
  { keys: ["honey","thean","தேன்","shahad","शहद","tene","తేనె","jenu","ಜೇನು","then","തേൻ","natural honey","madhu"], alias: "Honey" },

  // ── SALT & SPICES ─────────────────────────────────────────────────────────
  { keys: ["salt","uppu","உப்பு","namak","नमक","uppudu","ఉప్పు","uppu kannada","ಉಪ್ಪು","uppu ml","ഉപ്പ്","rock salt","sea salt","iodized salt","tata salt","captain salt"], alias: "Iodized Salt" },
  { keys: ["turmeric","manjal","மஞ்சள்","haldi","halad","हल्दी","pasupu","పసుపు","arshine","ಅರಿಶಿನ","manjal podi","മഞ്ഞൾ","turmeric powder","yellow powder"], alias: "Turmeric Powder" },
  { keys: ["chilli powder","milagai podi","milagai","மிளகாய் பொடி","lal mirch","mirchi","लाल मिर्च","karam podi","కారం పొడి","menasina pudi","ಮೆಣಸಿನ ಪುಡಿ","mulaku podi","മുളക് പൊടി","red chilli","chilly powder","chillie"], alias: "Chilli Powder" },
  { keys: ["coriander powder","malli podi","mallipodi","மல்லி பொடி","dhaniya","धनिया","kotthamalli podi","ధనియాల పొడి","kothambari bele","ಕೊತ್ತಂಬರಿ","malli","മല്ലി","dhania powder"], alias: "Coriander Powder" },
  { keys: ["cumin","seeragam","சீரகம்","jeera","jeeragam","jeere","जीरा","jilakara","జీలకర్ర","jeerige","ಜೀರಿಗೆ","jirakam","ജീരകം","zeera","cumin seeds"], alias: "Cumin Seeds" },
  { keys: ["mustard seeds","kadugu","கடுகு","rai","sarson","राई","avalu","ఆవాలు","sasive","ಸಾಸಿವೆ","kadum","കടുക്","black mustard","yellow mustard","sarso"], alias: "Mustard Seeds" },
  { keys: ["pepper","milagu","மிளகு","kali mirch","काली मिर्च","miryalu","మిర్యాలు","menasina","ಮೆಣಸಿನ","kurumulaku","കുരുമുളക്","black pepper","white pepper"], alias: "Black Pepper" },
  { keys: ["garam masala","sambar powder","rasam powder","curry powder","biryani masala","chicken masala","masala","மசாலா","masale","ಮಸಾಲೆ"], alias: "Garam Masala" },
  { keys: ["asafoetida","hing","perungayam","பெருங்காயம்","kaya","ಕಾಯ","kayam","കായം"], alias: "Asafoetida / Hing" },
  { keys: ["tamarind","puli","புளி","imli","इमली","chinta pandu","చింతపండు","hunase","ಹುಣಸೆ","puli paste","valanpuli"], alias: "Tamarind" },

  // ── DALS & PULSES ─────────────────────────────────────────────────────────
  { keys: ["toor dal","toor","arhar","thuvaramparuppu","துவரம் பருப்பு","arhar dal","अरहर","kandipappu","కందిపప్పు","togari bele","ತೊಗರಿ ಬೇಳೆ","thuvara parippu","തുവര പരിപ്പ്","pigeon pea","red gram"], alias: "Toor Dal" },
  { keys: ["urad dal","urad","ulundhu paruppu","ulunthu","உளுத்தம் பருப்பு","urad whole","उड़द","ulava pappu","మినప పప్పు","uddina bele","ಉದ್ದಿನ ಬೇಳೆ","uzhunnu","ഉഴുന്ന്","black gram","white gram"], alias: "Urad Dal" },
  { keys: ["moong dal","moong","payathamparuppu","paasi paruppu","பாசிப் பருப்பு","mung","मूंग","pesara pappu","పెసర పప్పు","hesaru bele","ಹೆಸರು ಬೇಳೆ","cherupayar","ചെറുപയർ","green gram","yellow moong"], alias: "Moong Dal" },
  { keys: ["chana dal","chana","kadalai paruppu","கடலைப் பருப்பு","bengal gram","चना","chanaga pappu","శనగ పప్పు","kadale bele","ಕಡಲೆ ಬೇಳೆ","kadala parippu","കടല പരിപ്പ്","chickpea dal"], alias: "Chana Dal" },
  { keys: ["masoor dal","masur","mysore dal","red lentil","lal masoor","لال مسور","orange dal","பருப்பு"], alias: "Masoor Dal" },
  { keys: ["rajma","red kidney beans","rajmah","राजमा","kidney beans"], alias: "Rajma" },
  { keys: ["chola","chickpeas","kabuli chana","kondai kadalai","கொண்டைக் கடலை","garbanzo"], alias: "White Chickpeas" },

  // ── OILS ─────────────────────────────────────────────────────────────────
  { keys: ["groundnut oil","peanut oil","kadala ennai","கடலை எண்ணெய்","moongphali tel","मूंगफली","pallelu nune","వేరుశనగ నూనె","shenga tel","verushanaga noone","verushenga noone","ಕಡಲೆ ಎಣ್ಣೆ","kadala enna","കടല എണ്ണ","groundnut"], alias: "Groundnut Oil" },
  { keys: ["sunflower oil","suriyakanthi ennai","சூரியகாந்தி","surajmukhi","surajmukhi tel","सूरजमुखी","tellagapuvvu nune","సూర్యకాంతి నూనె","suryakanthi enne","ಸೂರ್ಯಕಾಂತಿ","sunflower","fortune oil","saffola"], alias: "Sunflower Oil" },
  { keys: ["coconut oil","thengai ennai","velichennai","vellai ennai","தேங்காய் எண்ணெய்","nariyal tel","नारियल तेल","kobbari nune","కొబ్బరి నూనె","thenginaenne","ತೆಂಗಿನ ಎಣ್ಣೆ","velichenna","വെളിച്ചെണ്ണ","parachute oil"], alias: "Coconut Oil" },
  { keys: ["mustard oil","sarson tel","sarso","कड़वा","sarson ka tel","avala nune","ఆవ నూనె","maneyu","ಮಾನೆ ಎಣ್ಣೆ","kaduku enna","kaduku ennai","ആവ് എണ്ണ"], alias: "Mustard Oil" },
  { keys: ["gingelly oil","sesame oil","nallennai","nalla ennai","நல்லெண்ணெய்","til ka tel","तिल","nuvvula nune","నువ్వుల నూనె","yellu enne","ಎಳ್ಳಿನ ಎಣ್ಣೆ","nallenna","നല്ലെണ്ണ"], alias: "Gingelly Oil" },
  { keys: ["palm oil","palmolein","refined oil","vegetable oil","dalda","vanaspati","vanaspathi"], alias: "Refined Oil" },

  // ── DAIRY ─────────────────────────────────────────────────────────────────
  { keys: ["milk","paal","பால்","doodh","dudh","दूध","paalu","పాలు","halu","ಹಾಲು","paal ml","പാൽ","full cream milk","toned milk","double toned","aavin milk","mother dairy","amul milk"], alias: "Milk" },
  { keys: ["butter","vennai","வெண்ணெய்","makhan","मक्खन","venna","వెన్న","benne","ಬೆಣ್ಣೆ","venna ml","വെണ്ണ","amul butter","salted butter","unsalted butter"], alias: "Butter" },
  { keys: ["ghee","nei","neiy","நெய்","desi ghee","ghi","घी","neyyi","నేయి","tuppa","ತುಪ್ಪ","neyy","നെയ്യ്","amul ghee","cow ghee","buffalo ghee","pure ghee"], alias: "Ghee" },
  { keys: ["curd","yogurt","thayir","தயிர்","dahi","doi","दही","perugu","పెరుగు","mosaru","ಮೊಸರು","thayiru ml","thairu","തൈര്","set curd","fresh curd","aavin curd"], alias: "Curd / Yogurt" },
  { keys: ["paneer","panner","panir","பனீர்","cottage cheese","पनीर","paaneer","పనీర్","paniir","ಪನೀರ್","paaniir","പനീർ","fresh paneer","malai paneer"], alias: "Paneer" },
  { keys: ["milkmaid","condensed milk","milk maid","milkmaid tin","milkmaid can","sweetened condensed","milkmade","மில்க்மெய்ட்"], alias: "Milkmaid" },
  { keys: ["cheese","cheese slice","processed cheese","amul cheese","britannia cheese"], alias: "Cheese Slices" },
  { keys: ["cream","malai","fresh cream","whipping cream","cooking cream","amul cream"], alias: "Fresh Cream" },

  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  { keys: ["tea","chai","teh","tea powder","தேநீர்","tea podi","red label","tajmahal tea","brooke bond","चाय","chaay","tea leaves","kadak chai","elaichi chai","टी","tea dust"], alias: "Tea Powder" },
  { keys: ["coffee","kaapi","filter coffee","காபி","bru","nescafe","coorg coffee","कॉफी","coffee powder","instant coffee","chicory coffee","caapi","kerala coffee"], alias: "Coffee Powder" },
  { keys: ["bournvita","bournvita powder","cadbury bournvita","brown powder drink"], alias: "Bournvita" },
  { keys: ["horlicks","horlicks powder","gsk horlicks","white horlicks"], alias: "Horlicks" },
  { keys: ["boost","boost powder","chocolate malt"], alias: "Boost" },
  { keys: ["complan","complan powder","health drink"], alias: "Complan" },
  { keys: ["milo","nestle milo"], alias: "Milo" },
  { keys: ["ovaltine"], alias: "Ovaltine" },
  { keys: ["water","mineral water","drinking water","bisleri","kinley","aquafina","pani","தண்ணீர்","panneer"], alias: "Packaged Water" },
  { keys: ["coconut water","nariyal paani","tender coconut","ilam thengai","elaneer","thennangkai"], alias: "Coconut Water" },

  // ── BREAD & BAKERY ────────────────────────────────────────────────────────
  { keys: ["bread","pav","paav","buns","white bread","ब्रेड","sandwich bread","sliced bread","britannia bread","modern bread","harvest gold"], alias: "White Bread" },
  { keys: ["biscuit","biscuits","cookies","parle g","parle","glucose biscuit","marie biscuit","cream biscuit","biskut","பிஸ்கட்","biscit"], alias: "Biscuits" },
  { keys: ["rusk","toasted bread","rusk biscuit","milk rusk","britannia rusk"], alias: "Rusk" },

  // ── NOODLES & INSTANT ─────────────────────────────────────────────────────
  { keys: ["maggi","noodles","magi","maagi","instant noodles","maggi masala","maggi 2 minutes","மேகி","मैगी","2 minute noodles"], alias: "Maggi Noodles" },
  { keys: ["yippee","yipee","sunfeast yippee","masala noodles"], alias: "Yippee Noodles" },
  { keys: ["top ramen","ramen noodles","nissin"], alias: "Top Ramen Noodles" },

  // ── BREAKFAST ─────────────────────────────────────────────────────────────
  { keys: ["oats","quaker oats","instant oats","rolled oats","oatmeal"], alias: "Oats" },
  { keys: ["corn flakes","cornflakes","kellogg","kellog","kellogs","breakfast cereal","cereal"], alias: "Corn Flakes" },
  { keys: ["muesli","granola","mixed cereal"], alias: "Muesli" },

  // ── PERSONAL CARE ─────────────────────────────────────────────────────────
  { keys: ["soap","bath soap","saabun","sabun","soapu","சோப்பு","साबुन","sabbu","సబ్బు","sabu","ಸಾಬೂನು","saboobu","sabanu","സോപ്പ്","lux","dove soap","lifebuoy","pears","mysore sandal","medimix","hamam"], alias: "Soap" },
  { keys: ["shampoo","hair shampoo","shampoo bottle","ஷாம்பூ","shampoo sachet","शैम्पू","clinic plus","head shoulders","pantene","sunsilk","dove shampoo"], alias: "Shampoo" },
  { keys: ["toothpaste","paste","tooth paste","brushing paste","பேஸ்ட்","टूथपेस्ट","colgate","pepsodent","closeup","sensodyne","vicco","meswak","meri","dental cream"], alias: "Toothpaste" },
  { keys: ["toothbrush","brush","tooth brush","dental brush","colgate brush","pepsodent brush","oral b"], alias: "Toothbrush" },
  { keys: ["hair oil","naalikeyra enne","jasmine oil","coconut hair oil","parachute hair oil","navratna","bajaj almond","vatika"], alias: "Hair Oil" },
  { keys: ["fairness cream","face cream","cold cream","moisturizer","pond's","fair lovely","fair glow","boroline","lacto calamine"], alias: "Face Cream" },
  { keys: ["deodorant","deo","body spray","axe deo","nivea deo","rexona","wildstone"], alias: "Deodorant" },

  // ── HOUSEHOLD & CLEANING ──────────────────────────────────────────────────
  { keys: ["detergent","washing powder","wash powder","சலவை","डिटर्जेंट","wheel","ariel","tide","rin","surf excel","henko","ghari detergent","sabun powder","dhobhi","laundry"], alias: "Detergent Powder" },
  { keys: ["dishwash","dish wash","vim","pril","exo","vessel cleaner","utensil cleaner","barthan saaf","bartan"],  alias: "Dishwash" },
  { keys: ["floor cleaner","phenyl","colin","harpic","lizol","domex","toilet cleaner","bathroom cleaner"], alias: "Floor Cleaner" },
  { keys: ["mosquito coil","good knight coil","hit coil","mortein coil","agarbathi mosquito"], alias: "Mosquito Coil" },
  { keys: ["mosquito mat","good knight mat","mortein mat","mosquito liquid"], alias: "Mosquito Repellent Mat" },
  { keys: ["incense","agarbathi","agarbatty","agarbathi sticks","dhoop","sambrani"], alias: "Agarbathi / Incense" },
  { keys: ["matchbox","match box","matches","matches box","agni","homelite matchbox"], alias: "Matchbox" },
  { keys: ["candle","wax candle","emergency candle","birthday candle"], alias: "Candles" },

  // ── VEGETABLES & FRESH PRODUCE ────────────────────────────────────────────
  { keys: ["onion","vengayam","வெங்காயம்","pyaz","pyaaj","प्याज","ulli paaya","ఉల్లిపాయ","erulli","ಈರುಳ್ಳಿ","ulli","ഉള്ളി","savola","big onion","small onion","shallot","sambar onion"], alias: "Onion" },
  { keys: ["tomato","thakkali","தக்காளி","tamatar","टमाटर","tomato telugu","టొమాటో","tomato kannada","ಟೊಮೇಟೊ","thakkali ml","തക്കാളി","red tomato","ripe tomato"], alias: "Tomato" },
  { keys: ["potato","aloo","aaloo","urulaikizhangu","உருளைக்கிழங்கு","aloo telugu","బంగాళాదుంప","batata","ಆಲೂಗಡ್ಡೆ","urulakkizhangu","ഉരുളക്കിഴങ്ങ്","big potato"], alias: "Potato" },
  { keys: ["garlic","poondu","பூண்டு","lahsun","lasun","lahsan","lassan","लहसुन","velluli","వెల్లుల్లి","bellulli","ಬೆಳ್ಳುಳ್ಳಿ","veluthulli","വെളുത്തുള്ളി","garlic clove"], alias: "Garlic" },
  { keys: ["ginger","inji","இஞ்சி","adrak","अदरक","allamu","అల్లం","shunti","ಶುಂಠಿ","inchi","ഇഞ്ചി","dry ginger","fresh ginger"], alias: "Ginger" },
  { keys: ["lemon","elumichai","எலுமிச்சை","nimbu","नींबू","nimmakaya","నిమ్మకాయ","nimbekai","ನಿಂಬೆ","cherunaranga","ചെറുനാരക","lime","green lemon"], alias: "Lemon" },
  { keys: ["green chilli","pachai milagai","பச்சை மிளகாய்","hari mirchi","हरी मिर्च","pachchi mirapakaya","పచ్చి మిరపకాయ","hasiru menasina","ಹಸಿರು ಮೆಣಸಿನ","pachha mulaku","പച്ചമുളക്"], alias: "Green Chilli" },
  { keys: ["curry leaves","karuvepilai","கருவேப்பிலை","kadi patta","कड़ी पत्ता","karivepaku","కరివేపాకు","karibevu","ಕರಿಬೇವು","karivepila","കറിവേപ്പില"], alias: "Curry Leaves" },
  { keys: ["coconut","thengai","தேங்காய்","nariyal","नारियल","kobbari","కొబ్బరి","tenginakai","ತೆಂಗಿನಕಾಯಿ","thenga","തേങ്ങ","fresh coconut","dry coconut"], alias: "Coconut" },

  // ── SNACKS & NAMKEENS ─────────────────────────────────────────────────────
  { keys: ["chips","potato chips","lays","kurkure","uncle chips","parle chips","bingo chips","murukku","முறுக்கு","chakli"], alias: "Chips / Namkeen" },
  { keys: ["namkeen","mixture","chivda","chanachur","chevda","sev","bhujia","haldiram"], alias: "Namkeen Mix" },
  { keys: ["papad","appalam","அப்பளம்","pappad","poppadom","lijjat papad"], alias: "Papad / Appalam" },
  { keys: ["pickle","achar","urugai","ஊறுகாய்","avakaya","అవకాయ","uppinakayi","ಉಪ್ಪಿನಕಾಯಿ","uppilittathu","ഉപ്പിലിട്ടത്","mango pickle","lime pickle"], alias: "Pickle / Achar" },

  // ── CONDIMENTS & SAUCES ───────────────────────────────────────────────────
  { keys: ["tomato sauce","ketchup","tomato ketchup","maggi sauce","heinz","kissan sauce"], alias: "Tomato Ketchup" },
  { keys: ["soy sauce","schezwan sauce","chilli sauce","vinegar","worcestershire"], alias: "Sauces" },

  // ── BABY & HEALTH ─────────────────────────────────────────────────────────
  { keys: ["cerelac","nestum","baby food","baby cereal","infant food"], alias: "Cerelac / Baby Food" },
  { keys: ["glucose","glucon d","glucose powder","energy drink powder"], alias: "Glucose Powder" },
  { keys: ["dettol","antiseptic","savlon","boro plus","neosporin","first aid"], alias: "Antiseptic" },
  { keys: ["parachute oil","dabur","patanjali","amla hair","coconut hair"], alias: "Hair Oil" },

  // ── EGGS ─────────────────────────────────────────────────────────────────
  { keys: ["egg","eggs","muttai","முட்டை","anda","अंडा","guddu","గుడ్డు","motte","ಮೊಟ್ಟೆ","mutta","മുട்ട","farm eggs","country eggs","desi anda","tray"], alias: "Eggs" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🔢 NUMBER WORDS — multilingual + slangs
// ═══════════════════════════════════════════════════════════════════════════════
const numberWords: Record<string, string> = {
  // English
  "half":"0.5","quarter":"0.25","one":"1","two":"2","three":"3","four":"4","five":"5",
  "six":"6","seven":"7","eight":"8","nine":"9","ten":"10","dozen":"12",
  // Tamil (standard + slang: oray, rendu, moonnu)
  "ஒரு":"1","ஒன்று":"1","oray":"1","orai":"1","rendu":"2","இரண்டு":"2","moonnu":"3","மூன்று":"3",
  "naalu":"4","நான்கு":"4","ainthu":"5","ஐந்து":"5","aaru":"6","ஆறு":"6",
  "ezhu":"7","ஏழு":"7","ettu":"8","எட்டு":"8","onbadhu":"9","ஒன்பது":"9","pathu":"10","பத்து":"10",
  // Hindi (standard + UP/Bihar slang: ek, do, teen)
  "एक":"1","ek":"1","do":"2","दो":"2","teen":"3","तीन":"3","char":"4","चार":"4",
  "paanch":"5","पाँच":"5","chhah":"6","छह":"6","saat":"7","सात":"7",
  "aath":"8","आठ":"8","nau":"9","नौ":"9","das":"10","दस":"10","aadha":"0.5","सवा":"1.25",
  // Telugu (standard + Hyderabadi: okati, rendu)
  "ఒక":"1","okati":"1","rendu te":"2","రెండు":"2","mudu":"3","మూడు":"3",
  "naalu te":"4","నాలుగు":"4","aidu":"5","అయిదు":"5",
  // Kannada
  "ಒಂದು":"1","ondu":"1","eradu":"2","ಎರಡು":"2","muuru":"3","ಮೂರು":"3",
  "naalku":"4","ನಾಲ್ಕು":"4","aidu kn":"5","ಐದು":"5",
  // Malayalam
  "ഒന്ന്":"1","onnu":"1","randu":"2","രണ്ട്":"2","moonnu ml":"3","മൂന്ന്":"3",
  "naalu ml":"4","നാല്":"4","anjhu":"5","അഞ്ച്":"5",
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ENHANCED NLP PARSER
// ═══════════════════════════════════════════════════════════════════════════════
function parseCommandLocally(text: string, language: Language): ParsedCommand {
  // Normalize: lowercase, remove punctuation
  const raw = text.toLowerCase().trim()
    .replace(/[.,!?_\-|]/g, " ")
    .replace(/\s+/g, " ");

  const has = (words: string[]) => words.some(k => raw.includes(k.toLowerCase()));

  // ── Intent detection (priority order) ──────────────────────────────────
  let intent = "UNKNOWN";
  if (has(SLANG_DB.confirm))  intent = "CONFIRM";
  else if (has(SLANG_DB.cancel))  intent = "CANCEL";
  else if (has(SLANG_DB.report))  intent = "SHOW_REPORT";
  else if (has(SLANG_DB.pay))     intent = "RECEIVE_PAYMENT";
  else if (has(SLANG_DB.balance)) intent = "ASK_BALANCE";
  else if (has(SLANG_DB.open))    intent = "OPEN_CUSTOMER";
  else if (has(SLANG_DB.add))     intent = "ADD_PURCHASE";

  // Compound command: "open X account AND add item" → ADD_PURCHASE
  if (has(SLANG_DB.open) && has(SLANG_DB.add)) intent = "ADD_PURCHASE";

  // ── Extract customer name ───────────────────────────────────────────────
  const customerName = extractCustomerName(raw);

  // ── Extract product ─────────────────────────────────────────────────────
  const productAlias = extractProduct(raw, language);

  // ── Extract amount ──────────────────────────────────────────────────────
  // Handles: rs 500, 500 rupees, ₹500, 500 रुपये, 500 ரூபாய், etc.
  const amtMatch = raw.match(
    /(?:rs\.?|rupees?|₹|paisa|ruba|kaasu|रुपये?|रु\.?|ரூபாய்|రూపాయ|ರೂಪಾಯಿ|രൂപ|panam|paise)?\s*(\d+(?:[.,]\d+)?)/
  );
  const amount = amtMatch ? amtMatch[1].replace(",", ".") : undefined;

  // ── Extract quantity ────────────────────────────────────────────────────
  // Handles: 2 kg, 500g, 1 litre, ek kilo, ondu kilo, etc.
  const qtyUnitMatch = raw.match(
    /(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|gram|g\b|litre?|liter?|l\b|packet|pack|piece|pcs|pc\b|ml|bottle|box|tin|can|pair|dozen)/
  );
  let quantity: string | undefined;

  if (qtyUnitMatch) {
    quantity = qtyUnitMatch[1];
  } else {
    // Try number words
    for (const [w, v] of Object.entries(numberWords)) {
      if (raw.includes(w.toLowerCase())) { quantity = v; break; }
    }
    // Try bare digit
    if (!quantity) {
      const bareNum = raw.match(/\b(\d+)\b/);
      quantity = bareNum ? bareNum[1] : "1";
    }
  }

  return { intent, customerName, productAlias, amount, quantity };
}

function extractCustomerName(text: string): string | undefined {
  // Patterns to extract name from voice command
  const patterns = [
    // "open Avinash account", "open Avinash A account"
    /(?:open|tihr|திற|khol|kholna|teru|tere|thura)\s+([a-z\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]+(?:\s+[a-z]+)?)\s*(?:account|khata|ka khata|kannakku|khaate|a\/c)/i,
    // "Avinash A account", "Avinash ka khata"
    /([a-z\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]+(?:\s+[a-z]+)?)\s+(?:account|khata|ka khata|kannakku|a\/c|khaate)/i,
    // "Avinash's account"
    /([a-z\u0900-\u097F\u0B80-\u0BFF]+(?:\s+[a-z]+)?)'?s?\s+account/i,
    // "for Avinash", "Avinash ko", "Avinash ke liye"
    /(?:for|ke liye|ko|ke|ku|ukku|ge|ige|nu)\s+([a-z\u0900-\u097F\u0B80-\u0BFF]+(?:\s+[a-z]+)?)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const name = m[1].trim();
      // Filter out common words that are not names
      const notName = ["the","a","an","on","in","of","to","and","or","add","give","open","show","get","check","this","that","with","from","by","at","rs","kg","litre","packet","one","two","three"];
      if (name.length > 1 && !notName.includes(name.toLowerCase())) return name;
    }
  }
  return undefined;
}

function extractProduct(text: string, _language: Language): string | undefined {
  for (const { keys, alias } of productKeywords) {
    if (keys.some(k => text.includes(k.toLowerCase()))) return alias;
  }
  return undefined;
}

// ─── Text-to-speech helper ────────────────────────────────────────────────────
function speak(text: string, langCode: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = langCode;
  utt.rate = 0.95;
  utt.pitch = 1.05;
  window.speechSynthesis.speak(utt);
}

// ─── FloatingMic Component ────────────────────────────────────────────────────
export function FloatingMic({
  language,
  copy,
  onTranscript,
  onCommandParsed,
}: {
  language: Language;
  copy: ReturnType<typeof t>;
  onTranscript: (value: string) => void;
  onCommandParsed?: (command: ParsedCommand) => void;
}) {
  const [listening, setListening]     = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText]     = useState("");
  const [phase, setPhase]             = useState<"idle"|"listening"|"processing"|"done"|"error">("idle");
  const [expanded, setExpanded]       = useState(false);
  const recognitionRef                = useRef<SpeechRecognitionInstance | null>(null);
  const restartTimerRef               = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listeningRef                  = useRef(false);

  const msgs = ttsMessages[language];
  const lc   = langCodes[language];

  const buildRecognition = useCallback(() => {
    const win = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) return null;
    const r = new Ctor();
    r.lang = lc;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final   = "";
      for (let i = event.resultIndex; i < (event.results as unknown as ArrayLike<unknown>).length; i++) {
        const res = (event.results as unknown as Array<{ isFinal: boolean; 0: { transcript: string } }>)[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setInterimText(interim);
      if (final) {
        setFinalText(final);
        setInterimText("");
        setPhase("processing");
        onTranscript(final);
        processCommand(final);
      }
    };
    r.onerror = (e: { error: string }) => {
      if (e.error === "no-speech") {
        if (listeningRef.current) startListening(r);
      } else {
        setPhase("error");
        setListening(false);
        listeningRef.current = false;
      }
    };
    r.onend = () => {
      if (listeningRef.current) {
        restartTimerRef.current = setTimeout(() => startListening(r), 300);
      } else {
        setListening(false);
      }
    };
    return r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lc]);

  function startListening(r: SpeechRecognitionInstance) {
    try { r.lang = lc; r.start(); } catch { /* already running */ }
  }

  function processCommand(text: string) {
    const cmd = parseCommandLocally(text, language);
    setPhase("done");
    let feedback = msgs.done;
    if (cmd.intent === "OPEN_CUSTOMER" && cmd.customerName) feedback = msgs.customerOpened(cmd.customerName);
    else if (cmd.intent === "ADD_PURCHASE") feedback = msgs.itemAdded(cmd.quantity ?? "1", cmd.productAlias ?? "item", cmd.customerName ?? "customer");
    else if (cmd.intent === "RECEIVE_PAYMENT" && cmd.amount) feedback = msgs.paymentRecorded(cmd.amount, cmd.customerName ?? "customer");
    else if (cmd.intent === "ASK_BALANCE" && cmd.customerName) feedback = msgs.balanceIs(cmd.customerName, "…");
    else if (cmd.intent === "UNKNOWN") feedback = msgs.notUnderstood;
    speak(feedback, lc);
    if (cmd.intent !== "UNKNOWN" && onCommandParsed) onCommandParsed(cmd);
    setTimeout(() => {
      if (listeningRef.current) setPhase("listening");
      setFinalText("");
    }, 2000);
  }

  function toggle() {
    if (listening) {
      listeningRef.current = false;
      setListening(false);
      setPhase("idle");
      setInterimText("");
      setFinalText("");
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    } else {
      const r = buildRecognition();
      if (!r) {
        onTranscript(copy.speechUnavailable ?? "Speech recognition not available.");
        setPhase("error");
        return;
      }
      recognitionRef.current = r;
      listeningRef.current = true;
      setListening(true);
      setPhase("listening");
      setExpanded(true);
      speak(msgs.listening, lc);
      startListening(r);
    }
  }

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  const phaseLabel: Record<typeof phase, string> = {
    idle: "Tap mic to start voice commands",
    listening: msgs.listening,
    processing: "Processing…",
    done: msgs.done,
    error: "Error. Tap to retry.",
  };
  const phaseColor: Record<typeof phase, string> = {
    idle: "text-ink/60", listening: "text-leaf-700 font-bold",
    processing: "text-amber-600 font-bold", done: "text-emerald-600 font-bold", error: "text-red-600 font-bold",
  };

  const exampleCmds: Record<Language, string[]> = {
    ENGLISH:   ["Open Avinash account, add 1 kg sugar","Rajesh paid 500 rupees","Check Meena balance","Add 2 packets Maggi for Kumar"],
    TAMIL:     ["அவினாஷ் கணக்கு திற, ஒரு கிலோ சர்க்கரை சேர்","ராஜேஷ் 500 ரூபாய் கொடுத்தார்","மீனா நிலுவை எவ்வளவு","குமார் கணக்குல 2 மேகி போடு"],
    HINDI:     ["अविनाश का खाता खोलो, एक किलो चीनी जोड़ो","राजेश ने 500 रुपये दिए","मीना का बकाया कितना","कुमार के लिए 2 मैगी उधार"],
    TELUGU:    ["అవినాష్ ఖాతా తెరు, ఒక కిలో చక్కెర జోడించు","రాజేష్ 500 రూపాయలు ఇచ్చారు","మీనా బాకీ ఎంత","కుమార్ కి 2 మేగీ అప్పు వేయి"],
    KANNADA:   ["ಅವಿನಾಶ್ ಖಾತೆ ತೆರೆ, ಒಂದು ಕೆಜಿ ಸಕ್ಕರೆ ಸೇರಿಸು","ರಾಜೇಶ್ 500 ರೂಪಾಯಿ ಕೊಟ್ಟರು","ಮೀನಾ ಬಾಕಿ ಎಷ್ಟು","ಕುಮಾರ್ ಗೆ 2 ಮ್ಯಾಗಿ ಸಾಲ"],
    MALAYALAM: ["അവിനാഷ് അക്കൗണ്ട് തുറ, ഒരു കിലോ പഞ്ചസാര ചേർ","രാജേഷ് 500 രൂപ തന്നു","മീന ബാക്കി എത്ര","കുമാർ ക്ക് 2 മേഗി കടം"],
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {expanded && (
        <div className="mb-2 w-80 rounded-2xl bg-white/97 backdrop-blur border border-leaf-100 shadow-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-leaf-600" />
              <span className="text-xs font-black uppercase tracking-wide text-leaf-700">Voice Command</span>
            </div>
            <button onClick={() => setExpanded(false)} className="rounded-full p-1 hover:bg-leaf-50 text-ink/40 hover:text-ink transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className={`text-sm ${phaseColor[phase]} transition-all`}>{phaseLabel[phase]}</p>

          {(interimText || finalText) && (
            <div className="rounded-xl bg-leaf-50 border border-leaf-100 p-3 min-h-12">
              {finalText ? (
                <p className="text-sm font-semibold text-ink leading-snug">
                  {finalText}
                  {phase === "done" && <CheckCircle className="inline ml-2 h-4 w-4 text-emerald-500" />}
                  {phase === "processing" && <Loader2 className="inline ml-2 h-4 w-4 text-amber-500 animate-spin" />}
                </p>
              ) : (
                <p className="text-sm text-ink/50 italic leading-snug">{interimText}</p>
              )}
            </div>
          )}

          {phase === "listening" && !interimText && !finalText && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-ink/40 uppercase tracking-wide">Try saying:</p>
              {exampleCmds[language].slice(0,2).map((ex, i) => (
                <p key={i} className="text-xs text-leaf-700 bg-leaf-50 rounded-lg px-2 py-1 font-medium">💬 {ex}</p>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-leaf-100 pt-2">
            <div className={`h-2 w-2 rounded-full ${
              phase === "listening"  ? "bg-leaf-500 animate-pulse" :
              phase === "processing" ? "bg-amber-400 animate-pulse" :
              phase === "done"       ? "bg-emerald-500" :
              phase === "error"      ? "bg-red-500" : "bg-ink/20"
            }`} />
            <span className="text-xs text-ink/50 font-semibold">{language} · {lc} · Slang-aware</span>
            {listening && <span className="ml-auto text-xs font-black text-leaf-600 animate-pulse">🎙️ LIVE</span>}
          </div>
        </div>
      )}

      <div className="relative flex items-center justify-center">
        {listening && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-400 opacity-60" style={{ animationDuration: "1.2s" }} />
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-400 opacity-40" style={{ animationDuration: "1.8s", animationDelay: "0.4s" }} />
          </>
        )}
        <button
          type="button"
          onClick={toggle}
          onDoubleClick={() => setExpanded(v => !v)}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-200 ${
            listening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-leaf-600 hover:bg-leaf-700 hover:scale-105"
          }`}
          aria-label={listening ? "Stop listening" : "Start voice command"}
          title="Tap: start/stop  |  Double-tap: expand panel"
        >
          {phase === "processing"
            ? <Loader2 className="h-9 w-9 text-white animate-spin" />
            : listening
              ? <MicOff className="h-9 w-9 text-white" />
              : <Mic className="h-9 w-9 text-white" />
          }
        </button>
      </div>

      {!expanded && (
        <button onClick={() => setExpanded(true)} className="text-xs font-bold text-ink/40 hover:text-ink/70 transition bg-white/80 rounded-full px-3 py-1 shadow-sm">
          {listening ? "🟢 Listening" : "🎙️ Voice"}
        </button>
      )}
    </div>
  );
}
