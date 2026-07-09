"use client";

import {
  Mic, MicOff, Send, RefreshCw, CheckCircle, Loader2, Volume2, X
} from "lucide-react";
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
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend:    (() => void) | null;
  onerror:  ((e: { error: string }) => void) | null;
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }
  >;
};
type ParsedCommand = {
  intent: string;
  customerName?: string;
  productAlias?: string;
  amount?: string;
  quantity?: string;
};

// ─── BCP-47 language codes ────────────────────────────────────────────────────
const langCodes: Record<Language, string> = {
  ENGLISH: "en-IN", TAMIL: "ta-IN", HINDI: "hi-IN",
  TELUGU: "te-IN",  KANNADA: "kn-IN", MALAYALAM: "ml-IN",
};

// ─── UI copy per language ─────────────────────────────────────────────────────
const ui: Record<Language, {
  tapRecord: string; tapStop: string; submit: string; retry: string;
  processing: string; done: string; review: string; placeholder: string;
  notUnderstood: string;
}> = {
  ENGLISH:   { tapRecord:"Tap to Record", tapStop:"Tap to Stop", submit:"Submit", retry:"Retry", processing:"Executing…", done:"Done!", review:"Review your command", placeholder:"Your voice command will appear here…", notUnderstood:"Could not understand. Please retry." },
  TAMIL:     { tapRecord:"பதிவு செய்ய தட்டவும்", tapStop:"நிறுத்த தட்டவும்", submit:"சமர்ப்பி", retry:"மீண்டும்", processing:"செயல்படுத்துகிறது…", done:"சரி!", review:"உங்கள் கட்டளையை சரிபாருங்கள்", placeholder:"உங்கள் குரல் கட்டளை இங்கே தோன்றும்…", notUnderstood:"புரியவில்லை. மீண்டும் முயற்சிக்கவும்." },
  HINDI:     { tapRecord:"रिकॉर्ड करने के लिए टैप करें", tapStop:"रोकने के लिए टैप करें", submit:"सबमिट", retry:"दोबारा", processing:"चल रहा है…", done:"हो गया!", review:"अपना कमांड जांचें", placeholder:"आपका वॉइस कमांड यहाँ दिखेगा…", notUnderstood:"समझ नहीं आया। फिर से कोशिश करें।" },
  TELUGU:    { tapRecord:"రికార్డ్ చేయడానికి నొక్కండి", tapStop:"ఆపడానికి నొక్కండి", submit:"సమర్పించు", retry:"మళ్ళీ", processing:"అమలు చేస్తోంది…", done:"అయింది!", review:"మీ ఆదేశాన్ని సరిచూడండి", placeholder:"మీ వాయిస్ ఆదేశం ఇక్కడ కనిపిస్తుంది…", notUnderstood:"అర్థం కాలేదు. మళ్ళీ ప్రయత్నించండి." },
  KANNADA:   { tapRecord:"ರೆಕಾರ್ಡ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ", tapStop:"ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ", submit:"ಸಲ್ಲಿಸು", retry:"ಮತ್ತೆ", processing:"ಚಾಲನೆ…", done:"ಆಯ್ತು!", review:"ನಿಮ್ಮ ಆಜ್ಞೆಯನ್ನು ಪರಿಶೀಲಿಸಿ", placeholder:"ನಿಮ್ಮ ವಾಯ್ಸ್ ಕಮಾಂಡ್ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ…", notUnderstood:"ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." },
  MALAYALAM: { tapRecord:"റെക്കോർഡ് ചെയ്യാൻ ടാപ്പ് ചെയ്യൂ", tapStop:"നിർത്താൻ ടാപ്പ് ചെയ്യൂ", submit:"സമർപ്പിക്കൂ", retry:"വീണ്ടും", processing:"നടത്തുന്നു…", done:"ശരി!", review:"നിങ്ങളുടെ കമാൻഡ് പരിശോധിക്കൂ", placeholder:"നിങ്ങളുടെ വോയ്‌സ് കമാൻഡ് ഇവിടെ കാണിക്കും…", notUnderstood:"മനസ്സിലായില്ല. വീണ്ടും ശ്രമിക്കൂ." },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🛒 PRODUCT KEYWORD DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
const productKeywords: Array<{ keys: string[]; alias: string }> = [
  { keys:["rice","arisi","அரிசி","chawal","చావల్","బియ్యం","ಅಕ್ಕಿ","അരി","ponni","sona masoori","basmati","raw rice","boiled rice"], alias:"Rice" },
  { keys:["wheat","atta","godumai","கோதுமை","gehun","గోధుమ","ಗೋಧಿ","ഗോതമ്പ്","chapati","roti atta"], alias:"Wheat Atta" },
  { keys:["maida","மைதா","మైదా","ಮೈದಾ","refined flour","all purpose flour"], alias:"Maida" },
  { keys:["rava","sooji","suji","semolina","சூஜி","ரவா","రవ్వ","ರವೆ","റവ"], alias:"Rava / Sooji" },
  { keys:["besan","kadalai mavu","gram flour","బెసన్","ಕಡಲೆ ಹಿಟ್ಟు","കടലപ്പൊടி"], alias:"Besan" },
  { keys:["sugar","sakkarai","சர்க்கரை","chini","cheeni","చక్కెర","ಸಕ್ಕರೆ","പഞ്ചസാര","white sugar"], alias:"Sugar" },
  { keys:["jaggery","vellam","வெல்லம்","gud","bellam","బెల్లం","bella","ಬೆಲ್ಲ","sharkara","ശർക്കര"], alias:"Jaggery" },
  { keys:["salt","uppu","உப்பு","namak","ఉప్పు","ಉಪ್ಪು","ഉപ്പ്","iodized","tata salt"], alias:"Iodized Salt" },
  { keys:["turmeric","manjal","மஞ்சள்","haldi","పసుపు","ಅರಿಶಿನ","മഞ്ഞൾ"], alias:"Turmeric Powder" },
  { keys:["chilli powder","milagai","மிளகாய்","mirchi","karam","కారం","ಖಾರ","mulaku"], alias:"Chilli Powder" },
  { keys:["coriander","malli","மல்லி","dhaniya","ధనియాలు","ಕೊತ್ತಂಬರಿ","മല്ലി"], alias:"Coriander Powder" },
  { keys:["cumin","seeragam","சீரகம்","jeera","జీలకర్ర","ಜೀರಿಗೆ","ജീരകം"], alias:"Cumin Seeds" },
  { keys:["mustard seeds","kadugu","கடுகு","rai","avalu","ఆవాలు","ಸಾಸಿವೆ","കടുക്"], alias:"Mustard Seeds" },
  { keys:["toor dal","toor","arhar","thuvaramparuppu","துவரம்","kandipappu","కందిపప్పు","togari","ತೊಗರಿ","thuvara"], alias:"Toor Dal" },
  { keys:["urad dal","urad","ulundhu","உளுத்தம்","ulava","మినప","uddina","ಉದ್ದಿನ","uzhunnu"], alias:"Urad Dal" },
  { keys:["moong dal","moong","paasi paruppu","பாசிப்பருப்பு","pesara","పెసర","hesaru","ಹೆಸರು","cherupayar"], alias:"Moong Dal" },
  { keys:["chana dal","kadalai paruppu","கடலைப்பருப்பு","chanaga","శనగ","kadale","ಕಡಲೆ","kadala"], alias:"Chana Dal" },
  { keys:["groundnut oil","peanut oil","kadala ennai","கடலை எண்ணெய்","pallelu","వేరుశనగ","shenga","ಕಡಲೆ ಎಣ್ಣೆ","kadala enna"], alias:"Groundnut Oil" },
  { keys:["sunflower oil","suriyakanthi","சூரியகாந்தி","surajmukhi","tellagapuvvu","ಸೂರ್ಯಕಾಂತಿ","fortune","saffola"], alias:"Sunflower Oil" },
  { keys:["coconut oil","thengai ennai","வெளிச்செண்ணெய்","nariyal tel","kobbari","కొబ్బరి","thenginaenne","ತೆಂಗಿನ","velichenna","വെളിച്ചെണ്ണ","parachute"], alias:"Coconut Oil" },
  { keys:["mustard oil","sarson","sarso","avala nune"], alias:"Mustard Oil" },
  { keys:["gingelly oil","sesame oil","nallennai","நல்லெண்ணெய்","nuvvula","నువ్వుల","yellu","ಎಳ್ಳಿನ","nallenna"], alias:"Gingelly Oil" },
  { keys:["milk","paal","பால்","doodh","paalu","పాలు","halu","ಹಾಲು","paal","പാൽ","aavin","mother dairy","amul milk"], alias:"Milk" },
  { keys:["butter","vennai","வெண்ணெய்","makhan","venna","వెన్న","benne","ಬೆಣ್ಣೆ","venna","amul butter"], alias:"Butter" },
  { keys:["ghee","nei","நெய்","desi ghee","neyyi","నేయి","tuppa","ತುಪ್ಪ","neyyv","നെയ്യ്","cow ghee"], alias:"Ghee" },
  { keys:["curd","yogurt","thayir","தயிர்","dahi","perugu","పెరుగు","mosaru","ಮೊಸರು","thairu","തൈര്"], alias:"Curd / Yogurt" },
  { keys:["paneer","panner","பனீர்","cottage cheese","పనీర్","ಪನೀರ್","പനീർ"], alias:"Paneer" },
  { keys:["milkmaid","condensed milk","milk maid","milkmade"], alias:"Milkmaid" },
  { keys:["tea","chai","tea powder","தேநீர்","tea podi","red label","tajmahal","brooke bond","चाय"], alias:"Tea Powder" },
  { keys:["coffee","kaapi","filter coffee","காபி","bru","nescafe","coorg coffee"], alias:"Coffee Powder" },
  { keys:["bournvita","bournvita powder"], alias:"Bournvita" },
  { keys:["horlicks"], alias:"Horlicks" },
  { keys:["boost"], alias:"Boost" },
  { keys:["complan"], alias:"Complan" },
  { keys:["bread","pav","paav","buns","sandwich bread","britannia bread","modern bread"], alias:"White Bread" },
  { keys:["maggi","noodles","magi","maagi","instant noodles","2 minute"], alias:"Maggi Noodles" },
  { keys:["yippee","yipee","sunfeast yippee"], alias:"Yippee Noodles" },
  { keys:["oats","quaker"], alias:"Oats" },
  { keys:["corn flakes","cornflakes","kellogg","cereal"], alias:"Corn Flakes" },
  { keys:["soap","saabun","sabun","சோப்பு","lux","dove soap","lifebuoy","pears","medimix","hamam"], alias:"Soap" },
  { keys:["shampoo","ஷாம்பூ","clinic plus","head shoulders","pantene","sunsilk"], alias:"Shampoo" },
  { keys:["toothpaste","paste","பேஸ்ட்","colgate","pepsodent","closeup"], alias:"Toothpaste" },
  { keys:["detergent","washing powder","சலவை","wheel","ariel","tide","rin","surf excel","henko"], alias:"Detergent Powder" },
  { keys:["dishwash","dish wash","vim","pril","exo","vessel cleaner"], alias:"Dishwash" },
  { keys:["onion","vengayam","வெங்காயம்","pyaz","ulli","ఉల్లి","erulli","ಈರುಳ್ಳಿ","savola"], alias:"Onion" },
  { keys:["tomato","thakkali","தக்காளி","tamatar","టొమాటో","ಟೊಮೇಟೊ","തക്കാളി"], alias:"Tomato" },
  { keys:["potato","aloo","urulaikizhangu","உருளை","బంగాళాదుంప","ಆಲೂಗಡ್ಡೆ","ഉരുളക്കിഴങ്ങ്"], alias:"Potato" },
  { keys:["garlic","poondu","பூண்டு","lahsun","velluli","వెల్లుల్లి","bellulli","ಬೆಳ್ಳುಳ್ಳಿ","veluthulli"], alias:"Garlic" },
  { keys:["ginger","inji","இஞ்சி","adrak","allamu","అల్లం","shunti","ಶುಂಠಿ","inchi","ഇഞ്ചി"], alias:"Ginger" },
  { keys:["egg","eggs","muttai","முட்டை","anda","guddu","గుడ్డు","motte","ಮೊಟ್ಟೆ","mutta","മുട്ട"], alias:"Eggs" },
  { keys:["coconut","thengai","தேங்காய்","nariyal","kobbari","కొబ్బరి","tenginakai","ತೆಂಗಿನಕಾಯಿ","thenga"], alias:"Coconut" },
  { keys:["biscuit","biscuits","cookies","parle g","parle","glucose biscuit","marie","cream biscuit"], alias:"Biscuits" },
  { keys:["chips","potato chips","lays","kurkure","murukku","முறுக்கு","chakli"], alias:"Chips / Namkeen" },
  { keys:["pickle","achar","urugai","ஊறுகாய்","avakaya","అవకాయ","uppinakayi","ಉಪ್ಪಿನಕಾಯಿ"], alias:"Pickle / Achar" },
  { keys:["papad","appalam","அப்பளம்","lijjat"], alias:"Papad / Appalam" },
  { keys:["matchbox","match box","matches","agni","homelite"], alias:"Matchbox" },
  { keys:["agarbathi","incense","agarbatty","dhoop","sambrani"], alias:"Agarbathi / Incense" },
  { keys:["mosquito coil","good knight","mortein","hit coil"], alias:"Mosquito Coil" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 SLANG INTENT KEYWORDS
// ═══════════════════════════════════════════════════════════════════════════════
const INTENTS = {
  open:    ["open","account","khata","register","திற","கணக்கு","खोल","खाता","तेरु","ఖాతా","ತೆರೆ","ಖಾತೆ","തുറ","അക്കൗണ്ട്","show","load","pull up","hisab"],
  pay:     ["paid","payment","received","pay","cash","settled","payed","கொடுத்தார்","பணம்","கட்டினார்","ரூபாய்","काசு","दिया","भुगतान","चुकाया","పైసలు","చెల్లించ","ಕೊಟ್ಟರು","ಪಾವತಿ","തന്നു","അടച്ചു"],
  add:     ["add","credit","sale","sold","give","took","purchase","bought","சேர்","கொடு","கடன்","वाங்கினார்","उधार","जोड़","అప్పు","ఇవ్వు","ಸೇರಿಸು","ಕೊಡು","ಸಾಲ","ചേർ","കടം"],
  balance: ["balance","due","outstanding","bakaya","how much","நிலுவை","எவ்வளவு","பாக்கி","बकाया","कितना","బాకీ","ఎంత","ಬಾಕಿ","ಎಷ್ಟು","ബാക്കി","എത്ര"],
  confirm: ["confirm","yes","ok","okay","sure","haan","சரி","ஆமா","हाँ","सही","సరే","అవును","ಸರಿ","ಹೌದು","ശരി","ആണ്"],
  cancel:  ["cancel","no","stop","nope","vendaam","வேண்டாம்","नहीं","रद्द","వద్దు","ఆపు","ಬೇಡ","ನಿಲ್ಲಿಸು","വേണ്ട","നിർത്ത"],
  report:  ["report","ledger","summary","daily","sales","அறிக்கை","विक्री","నివేదిక","ವರದಿ","റിപ്പോർട്ട്"],
};

const numberWords: Record<string,string> = {
  "half":"0.5","quarter":"0.25","one":"1","two":"2","three":"3","four":"4","five":"5","six":"6","seven":"7","eight":"8","nine":"9","ten":"10","dozen":"12",
  "ஒரு":"1","இரண்டு":"2","மூன்று":"3","நான்கு":"4","ஐந்து":"5","ஆறு":"6","ஏழு":"7","எட்டு":"8","பத்து":"10",
  "oray":"1","rendu":"2","moonnu":"3","naalu":"4","ainthu":"5","pathu":"10",
  "एक":"1","ek":"1","do":"2","दो":"2","teen":"3","तीन":"3","char":"4","चार":"4","paanch":"5","पाँच":"5","das":"10","दस":"10","aadha":"0.5",
  "ఒక":"1","రెండు":"2","మూడు":"3","నాలుగు":"4","అయిదు":"5",
  "ಒಂದು":"1","ondu":"1","eradu":"2","ಎರಡು":"2","muuru":"3","ಮೂರು":"3","naalku":"4","ನಾಲ್ಕು":"4",
  "ഒന്ന്":"1","onnu":"1","randu":"2","രണ്ട്":"2","moonnu_ml":"3","മൂന്ന്":"3","naalu_ml":"4","നാല്":"4",
};

function parseCommand(text: string, language: Language): ParsedCommand {
  const raw = text.toLowerCase().trim().replace(/[.,!?_\-|]/g," ").replace(/\s+/g," ");
  const has = (kws: string[]) => kws.some(k => raw.includes(k.toLowerCase()));

  let intent = "UNKNOWN";
  if      (has(INTENTS.confirm)) intent = "CONFIRM";
  else if (has(INTENTS.cancel))  intent = "CANCEL";
  else if (has(INTENTS.report))  intent = "SHOW_REPORT";
  else if (has(INTENTS.pay))     intent = "RECEIVE_PAYMENT";
  else if (has(INTENTS.balance)) intent = "ASK_BALANCE";
  else if (has(INTENTS.open))    intent = "OPEN_CUSTOMER";
  else if (has(INTENTS.add))     intent = "ADD_PURCHASE";
  if (has(INTENTS.open) && has(INTENTS.add)) intent = "ADD_PURCHASE";

  // Customer name extraction
  const namePatterns = [
    /(?:open|திற|khol|teru|tere|thura)\s+([a-z\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]+(?:\s+[a-z]+)?)\s*(?:account|khata|kannakku|khaate|a\/c)/i,
    /([a-z\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]+(?:\s+[a-z]+)?)\s+(?:account|khata|ka khata|kannakku|a\/c)/i,
    /([a-z\u0900-\u097F\u0B80-\u0BFF]+(?:\s+[a-z]+)?)'?s?\s+account/i,
    /(?:for|ke liye|ko|ku|ukku|ge|nu)\s+([a-z\u0900-\u097F\u0B80-\u0BFF]+(?:\s+[a-z]+)?)/i,
  ];
  let customerName: string|undefined;
  const skipWords = new Set(["the","a","an","on","in","of","to","and","or","add","give","open","show","get","check","rs","kg","litre","packet","one","two","three","account"]);
  for (const p of namePatterns) {
    const m = raw.match(p);
    if (m?.[1]) { const n=m[1].trim(); if(n.length>1&&!skipWords.has(n)) { customerName=n; break; } }
  }

  // Product
  let productAlias: string|undefined;
  for (const {keys,alias} of productKeywords) {
    if (keys.some(k => raw.includes(k.toLowerCase()))) { productAlias=alias; break; }
  }

  // Amount
  const amtMatch = raw.match(/(?:rs\.?|rupees?|₹|ruba|kaasu|रुपये?|ரூபாய்|రూపాయ|ರೂಪಾಯಿ|രൂപ)?\s*(\d+(?:[.,]\d+)?)/);
  const amount = amtMatch ? amtMatch[1].replace(",",".") : undefined;

  // Quantity
  const qtyMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|gram|g\b|litre?|liter?|l\b|packet|pack|piece|pcs|pc\b|ml|bottle|box|tin|dozen)/);
  let quantity: string|undefined;
  if (qtyMatch) {
    quantity = qtyMatch[1];
  } else {
    for (const [w,v] of Object.entries(numberWords)) { if(raw.includes(w.toLowerCase())){quantity=v;break;} }
    if (!quantity) { const n=raw.match(/\b(\d+)\b/); quantity=n?n[1]:"1"; }
  }

  return { intent, customerName, productAlias, amount, quantity };
}

function speak(text: string, langCode: string) {
  if (typeof window==="undefined"||!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang=langCode; u.rate=0.95; u.pitch=1.05;
  window.speechSynthesis.speak(u);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 Intent summary card
// ═══════════════════════════════════════════════════════════════════════════════
function IntentCard({ cmd, language }: { cmd: ParsedCommand; language: Language }) {
  const intentLabels: Record<string,string> = {
    OPEN_CUSTOMER:"Open Account", ADD_PURCHASE:"Credit Sale", RECEIVE_PAYMENT:"Record Payment",
    ASK_BALANCE:"Check Balance", SHOW_REPORT:"View Report", CONFIRM:"Confirm", CANCEL:"Cancel", UNKNOWN:"Unknown",
  };
  const intentColors: Record<string,string> = {
    OPEN_CUSTOMER:"bg-blue-50 border-blue-200 text-blue-800",
    ADD_PURCHASE:"bg-amber-50 border-amber-200 text-amber-800",
    RECEIVE_PAYMENT:"bg-green-50 border-green-200 text-green-800",
    ASK_BALANCE:"bg-purple-50 border-purple-200 text-purple-800",
    SHOW_REPORT:"bg-slate-50 border-slate-200 text-slate-800",
    UNKNOWN:"bg-red-50 border-red-200 text-red-700",
  };
  const color = intentColors[cmd.intent] ?? intentColors.UNKNOWN;
  return (
    <div className={`rounded-xl border p-3 text-xs font-semibold space-y-1 ${color}`}>
      <div className="flex items-center gap-2">
        <span className="font-black uppercase tracking-wide text-[11px]">
          {intentLabels[cmd.intent] ?? cmd.intent}
        </span>
      </div>
      {cmd.customerName && <div>👤 Customer: <span className="font-black">{cmd.customerName}</span></div>}
      {cmd.productAlias && <div>🛒 Product: <span className="font-black">{cmd.productAlias}</span></div>}
      {cmd.quantity     && cmd.intent==="ADD_PURCHASE" && <div>📦 Qty: <span className="font-black">{cmd.quantity}</span></div>}
      {cmd.amount       && cmd.intent==="RECEIVE_PAYMENT" && <div>💰 Amount: <span className="font-black">₹{cmd.amount}</span></div>}
      {cmd.intent==="UNKNOWN" && <div className="text-red-600">Command not recognized. Please retry.</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎙️ MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
type Phase = "idle" | "recording" | "review" | "executing" | "done" | "error";

export function FloatingMic({
  language,
  copy,
  onTranscript,
  onCommandParsed,
}: {
  language:         Language;
  copy:             ReturnType<typeof t>;
  onTranscript:     (value: string) => void;
  onCommandParsed?: (command: ParsedCommand) => void;
}) {
  const [phase, setPhase]           = useState<Phase>("idle");
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText]   = useState("");
  const [parsedCmd, setParsedCmd]   = useState<ParsedCommand | null>(null);
  const [expanded, setExpanded]     = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const lc  = langCodes[language];
  const uic = ui[language];

  // Build a fresh recognition instance each time we start
  const buildRecognition = useCallback(() => {
    const win = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) return null;
    const r = new Ctor();
    r.lang           = lc;
    r.continuous     = true;
    r.interimResults = true;

    r.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""; let final = "";
      for (let i = event.resultIndex; i < (event.results as unknown as unknown[]).length; i++) {
        const res = (event.results as unknown as Array<{ isFinal: boolean; 0: { transcript: string } }>)[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setInterimText(interim);
      if (final)   { setFinalText(prev => (prev + " " + final).trim()); setInterimText(""); }
    };

    r.onerror = (e: { error: string }) => {
      if (e.error !== "no-speech") { setPhase("error"); }
    };
    r.onend = () => { /* handled by stopRecording */ };
    return r;
  }, [lc]);

  // ── START recording ──────────────────────────────────────────────────────
  function startRecording() {
    const r = buildRecognition();
    if (!r) {
      onTranscript(copy.speechUnavailable ?? "Speech recognition not available.");
      setPhase("error");
      return;
    }
    recognitionRef.current = r;
    setFinalText("");
    setInterimText("");
    setParsedCmd(null);
    setPhase("recording");
    setExpanded(true);
    try { r.start(); } catch { /* already started */ }
  }

  // ── STOP recording → go to review ────────────────────────────────────────
  function stopRecording() {
    recognitionRef.current?.stop();
    setPhase("review");
    setInterimText("");
    // Parse what we captured
    const captured = finalText.trim();
    if (captured) {
      const cmd = parseCommand(captured, language);
      setParsedCmd(cmd);
      onTranscript(captured);
    }
  }

  // ── SUBMIT → execute ─────────────────────────────────────────────────────
  async function submitCommand() {
    if (!parsedCmd) return;
    setPhase("executing");
    if (onCommandParsed) {
      try { await (onCommandParsed(parsedCmd) as unknown as Promise<void>); }
      catch { /* parent handles errors */ }
    }
    setPhase("done");
    speak(uic.done, lc);
    setTimeout(() => { setPhase("idle"); setFinalText(""); setParsedCmd(null); }, 2000);
  }

  // ── RETRY ────────────────────────────────────────────────────────────────
  function retry() {
    setPhase("idle");
    setFinalText("");
    setInterimText("");
    setParsedCmd(null);
    // auto-restart
    setTimeout(() => startRecording(), 300);
  }

  // ── DISMISS ──────────────────────────────────────────────────────────────
  function dismiss() {
    recognitionRef.current?.abort();
    setPhase("idle");
    setFinalText("");
    setInterimText("");
    setParsedCmd(null);
    setExpanded(false);
  }

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  // ── Mic button action ────────────────────────────────────────────────────
  function handleMicClick() {
    if (phase === "idle" || phase === "done" || phase === "error") startRecording();
    else if (phase === "recording") stopRecording();
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  const isRecording  = phase === "recording";
  const isExecuting  = phase === "executing";
  const isDone       = phase === "done";
  const isReview     = phase === "review";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {expanded && (
        <div className="mb-2 w-80 rounded-2xl bg-white border border-slate-100 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between bg-leaf-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-white/80" />
              <span className="text-sm font-black text-white tracking-wide">Voice Command</span>
            </div>
            <button onClick={dismiss} className="rounded-full p-1 hover:bg-white/20 text-white/70 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">

            {/* ── IDLE ────────────────────────────────────────────────── */}
            {phase === "idle" && (
              <p className="text-sm text-ink/50 text-center py-2">{uic.tapRecord}</p>
            )}

            {/* ── RECORDING ───────────────────────────────────────────── */}
            {isRecording && (
              <>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black text-red-600 uppercase tracking-wide">Recording…</span>
                  <span className="ml-auto text-xs text-ink/40">{uic.tapStop}</span>
                </div>
                <div className="min-h-16 rounded-xl bg-slate-50 border border-slate-200 p-3">
                  {interimText ? (
                    <p className="text-sm text-ink/50 italic">{interimText}</p>
                  ) : finalText ? (
                    <p className="text-sm text-ink font-semibold">{finalText}</p>
                  ) : (
                    <p className="text-sm text-ink/30 italic">{uic.placeholder}</p>
                  )}
                </div>
              </>
            )}

            {/* ── REVIEW ──────────────────────────────────────────────── */}
            {isReview && (
              <>
                <p className="text-xs font-black uppercase tracking-wide text-ink/50">{uic.review}</p>

                {/* Editable transcript */}
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-ink resize-none focus:outline-none focus:border-leaf-400 focus:ring-1 focus:ring-leaf-200"
                  rows={3}
                  value={finalText}
                  onChange={e => {
                    setFinalText(e.target.value);
                    setParsedCmd(parseCommand(e.target.value, language));
                  }}
                />

                {/* Parsed intent summary */}
                {parsedCmd && <IntentCard cmd={parsedCmd} language={language} />}

                {/* Action buttons */}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={retry}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-black text-ink/70 hover:bg-slate-50 transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {uic.retry}
                  </button>
                  <button
                    onClick={submitCommand}
                    disabled={!parsedCmd || parsedCmd.intent === "UNKNOWN"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-leaf-600 py-2.5 text-sm font-black text-white hover:bg-leaf-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Send className="h-4 w-4" />
                    {uic.submit}
                  </button>
                </div>
              </>
            )}

            {/* ── EXECUTING ───────────────────────────────────────────── */}
            {isExecuting && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 text-leaf-600 animate-spin" />
                <p className="text-sm font-bold text-ink/60">{uic.processing}</p>
              </div>
            )}

            {/* ── DONE ────────────────────────────────────────────────── */}
            {isDone && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-sm font-black text-emerald-600">{uic.done}</p>
              </div>
            )}

            {/* ── ERROR ───────────────────────────────────────────────── */}
            {phase === "error" && (
              <div className="flex flex-col items-center gap-3 py-3">
                <p className="text-sm text-red-600 font-semibold text-center">
                  Speech recognition not available or microphone blocked.
                </p>
                <button onClick={dismiss} className="text-xs font-bold text-ink/50 underline">Dismiss</button>
              </div>
            )}

            {/* Language pill */}
            <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2">
              <div className={`h-1.5 w-1.5 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : isDone ? "bg-emerald-500" : "bg-slate-300"}`} />
              <span className="text-[10px] font-semibold text-ink/30 uppercase tracking-wider">{language} · Slang-aware NLP</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Mic Button ───────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings while recording */}
        {isRecording && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" style={{animationDuration:"1.1s"}} />
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30" style={{animationDuration:"1.7s",animationDelay:"0.3s"}} />
          </>
        )}
        <button
          type="button"
          onClick={handleMicClick}
          onDoubleClick={() => setExpanded(v => !v)}
          disabled={isExecuting || isDone}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-200 disabled:opacity-60
            ${isRecording  ? "bg-red-500 hover:bg-red-600 scale-110"
            : isExecuting  ? "bg-amber-500"
            : isDone       ? "bg-emerald-500"
            : "bg-leaf-600 hover:bg-leaf-700 hover:scale-105"}`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          title="Tap: start/stop  |  Double-tap: expand panel"
        >
          {isExecuting
            ? <Loader2    className="h-9 w-9 text-white animate-spin" />
            : isDone
              ? <CheckCircle className="h-9 w-9 text-white" />
              : isRecording
                ? <MicOff  className="h-9 w-9 text-white" />
                : <Mic     className="h-9 w-9 text-white" />
          }
        </button>
      </div>

      {/* Hint label */}
      {!expanded && (
        <button
          onClick={() => { setExpanded(true); if (phase==="idle") startRecording(); }}
          className={`text-xs font-bold transition rounded-full px-3 py-1 shadow-sm
            ${isRecording ? "bg-red-100 text-red-600 animate-pulse" : "bg-white/80 text-ink/40 hover:text-ink/70"}`}
        >
          {isRecording ? "🔴 Recording…" : "🎙️ Voice"}
        </button>
      )}
    </div>
  );
}
