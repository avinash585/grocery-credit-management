/**
 * Product Keywords Database
 * 
 * Comprehensive multilingual product keyword database for accurate product matching.
 * Ported and enhanced from FloatingMic component.
 */

export interface ProductKeywordEntry {
  /** English canonical name */
  canonical: string;
  
  /** All possible keywords/aliases */
  keywords: string[];
  
  /** Common regional names */
  regional: {
    tamil?: string[];
    hindi?: string[];
    telugu?: string[];
    kannada?: string[];
    malayalam?: string[];
  };
  
  /** Common brand names */
  brands?: string[];
  
  /** Category */
  category: "Grains" | "Pulses" | "Oil" | "Spices" | "Dairy" | "Beverages" | "Snacks" | "Personal Care" | "Household" | "Vegetables" | "Others";
}

export const PRODUCT_KEYWORDS: ProductKeywordEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GRAINS & FLOURS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Rice",
    keywords: ["rice", "arisi", "chawal", "biyyam", "akki", "ari", "ponni", "sona masoori", "basmati", "raw rice", "boiled rice"],
    regional: {
      tamil: ["அரிசி", "பொன்னி", "சோனா மசூரி"],
      hindi: ["चावल", "धान"],
      telugu: ["బియ్యం", "అన్నం"],
      kannada: ["ಅಕ್ಕಿ"],
      malayalam: ["അരി"],
    },
    brands: ["Ponni", "Sona Masoori", "Basmati"],
    category: "Grains",
  },
  {
    canonical: "Wheat Atta",
    keywords: ["wheat", "atta", "godumai", "gehun", "flour", "wheat flour", "chapati atta", "roti atta"],
    regional: {
      tamil: ["கோதுமை", "கோதுமை மாவு"],
      hindi: ["गेहूं", "आटा"],
      telugu: ["గోధుమ", "పిండి"],
      kannada: ["ಗೋಧಿ", "ಹಿಟ್ಟು"],
      malayalam: ["ഗോതമ്പ്", "പൊടി"],
    },
    brands: ["Aashirvaad", "Annapurna", "Pillsbury"],
    category: "Grains",
  },
  {
    canonical: "Maida",
    keywords: ["maida", "refined flour", "all purpose flour", "white flour"],
    regional: {
      tamil: ["மைதா"],
      hindi: ["मैदा"],
      telugu: ["మైదా"],
      kannada: ["ಮೈದಾ"],
      malayalam: ["മൈദ"],
    },
    category: "Grains",
  },
  {
    canonical: "Rava",
    keywords: ["rava", "sooji", "suji", "semolina", "upma rava"],
    regional: {
      tamil: ["ரவா", "சூஜி"],
      hindi: ["सूजी", "रवा"],
      telugu: ["రవ్వ"],
      kannada: ["ರವೆ"],
      malayalam: ["റവ", "ഉപ്മാവ്"],
    },
    brands: ["Sujatha"],
    category: "Grains",
  },
  {
    canonical: "Besan",
    keywords: ["besan", "gram flour", "kadalai mavu", "chickpea flour"],
    regional: {
      tamil: ["கடலை மாவு"],
      hindi: ["बेसन"],
      telugu: ["బెసన్", "శనగ పిండి"],
      kannada: ["ಕಡಲೆ ಹಿಟ್ಟು"],
      malayalam: ["കടലപ്പൊടി"],
    },
    category: "Grains",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PULSES (DAL)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Toor Dal",
    keywords: ["toor dal", "toor", "arhar", "thuvaramparuppu", "kandipappu", "togari", "thuvara", "pigeon pea"],
    regional: {
      tamil: ["துவரம் பருப்பு", "துவரம்"],
      hindi: ["अरहर दाल", "तूर"],
      telugu: ["కందిపప్పు"],
      kannada: ["ತೊಗರಿ ಬೇಳೆ"],
      malayalam: ["തുവര"],
    },
    category: "Pulses",
  },
  {
    canonical: "Urad Dal",
    keywords: ["urad dal", "urad", "ulundhu", "black gram", "ulava", "minapa", "uddina", "uzhunnu"],
    regional: {
      tamil: ["உளுத்தம் பருப்பு", "உளுந்து"],
      hindi: ["उड़द दाल"],
      telugu: ["మినపప్పు"],
      kannada: ["ಉದ್ದಿನ ಬೇಳೆ"],
      malayalam: ["ഉഴുന്ന്"],
    },
    category: "Pulses",
  },
  {
    canonical: "Moong Dal",
    keywords: ["moong dal", "moong", "paasi paruppu", "green gram", "pesara", "hesaru", "cherupayar"],
    regional: {
      tamil: ["பாசி பருப்பு", "பச்சை பயறு"],
      hindi: ["मूंग दाल"],
      telugu: ["పెసర పప్పు"],
      kannada: ["ಹೆಸರು ಬೇಳೆ"],
      malayalam: ["ചെറുപയർ"],
    },
    category: "Pulses",
  },
  {
    canonical: "Chana Dal",
    keywords: ["chana dal", "kadalai paruppu", "bengal gram", "chanaga", "kadale"],
    regional: {
      tamil: ["கடலை பருப்பு"],
      hindi: ["चना दाल"],
      telugu: ["శనగ పప్పు"],
      kannada: ["ಕಡಲೆ ಬೇಳೆ"],
      malayalam: ["കടല"],
    },
    category: "Pulses",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COOKING OILS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Groundnut Oil",
    keywords: ["groundnut oil", "peanut oil", "kadala ennai", "pallelu", "shenga", "groundnut"],
    regional: {
      tamil: ["கடலை எண்ணெய்"],
      hindi: ["मूंगफली तेल"],
      telugu: ["వేరుశనగ నూనె"],
      kannada: ["ಕಡಲೆಕಾಯಿ ಎಣ್ಣೆ"],
      malayalam: ["നിലക്കടല എണ്ണ"],
    },
    brands: ["Idhayam", "Cargill"],
    category: "Oil",
  },
  {
    canonical: "Sunflower Oil",
    keywords: ["sunflower oil", "suriyakanthi", "surajmukhi", "tellagapuvvu"],
    regional: {
      tamil: ["சூரியகாந்தி எண்ணெய்"],
      hindi: ["सूरजमुखी तेल"],
      telugu: ["సూర్యకాంతి నూనె"],
      kannada: ["ಸೂರ್ಯಕಾಂತಿ ಎಣ್ಣೆ"],
      malayalam: ["സൂര്യകാന്തി എണ്ണ"],
    },
    brands: ["Fortune", "Saffola", "Sundrop"],
    category: "Oil",
  },
  {
    canonical: "Coconut Oil",
    keywords: ["coconut oil", "thengai ennai", "nariyal tel", "kobbari", "velichenna", "parachute"],
    regional: {
      tamil: ["தேங்காய் எண்ணெய்", "வெளிச்செண்ணெய்"],
      hindi: ["नारियल तेल"],
      telugu: ["కొబ్బరి నూనె"],
      kannada: ["ತೆಂಗಿನ ಎಣ್ಣೆ"],
      malayalam: ["വെളിച്ചെണ്ണ"],
    },
    brands: ["Parachute", "KLF", "Coco Soul"],
    category: "Oil",
  },
  {
    canonical: "Mustard Oil",
    keywords: ["mustard oil", "sarson ka tel", "avala nune", "kadugu ennai"],
    regional: {
      tamil: ["கடுகு எண்ணெய்"],
      hindi: ["सरसों तेल"],
      telugu: ["ఆవాల నూనె"],
      kannada: ["ಸಾಸಿವೆ ಎಣ್ಣೆ"],
      malayalam: ["കടുക് എണ്ണ"],
    },
    category: "Oil",
  },
  {
    canonical: "Gingelly Oil",
    keywords: ["gingelly oil", "sesame oil", "nallennai", "nuvvula", "yellu", "til ka tel"],
    regional: {
      tamil: ["நல்லெண்ணெய்", "எள் எண்ணெய்"],
      hindi: ["तिल का तेल"],
      telugu: ["నువ్వుల నూనె"],
      kannada: ["ಎಳ್ಳಿನ ಎಣ್ಣೆ"],
      malayalam: ["എള്ള് എണ്ണ"],
    },
    brands: ["Idhayam"],
    category: "Oil",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPICES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Sugar",
    keywords: ["sugar", "sakkarai", "chini", "cheeni", "chakkara", "sakkare", "white sugar"],
    regional: {
      tamil: ["சர்க்கரை"],
      hindi: ["चीनी", "शक्कर"],
      telugu: ["చక్కెర"],
      kannada: ["ಸಕ್ಕರೆ"],
      malayalam: ["പഞ്ചസാര"],
    },
    brands: ["Parry's"],
    category: "Spices",
  },
  {
    canonical: "Jaggery",
    keywords: ["jaggery", "vellam", "gud", "bellam", "bella", "sharkara"],
    regional: {
      tamil: ["வெல்லம்"],
      hindi: ["गुड़"],
      telugu: ["బెల్లం"],
      kannada: ["ಬೆಲ್ಲ"],
      malayalam: ["ശർക്കര", "ഗുഡം"],
    },
    category: "Spices",
  },
  {
    canonical: "Salt",
    keywords: ["salt", "uppu", "namak", "un", "uppu", "iodized salt", "tata salt"],
    regional: {
      tamil: ["உப்பு"],
      hindi: ["नमक"],
      telugu: ["ఉప్పు"],
      kannada: ["ಉಪ್ಪು"],
      malayalam: ["ഉപ്പ്"],
    },
    brands: ["Tata Salt", "Annapurna"],
    category: "Spices",
  },
  {
    canonical: "Turmeric Powder",
    keywords: ["turmeric", "manjal", "haldi", "paspu", "arishina", "manjal podi"],
    regional: {
      tamil: ["மஞ்சள்", "மஞ்சள் பொடி"],
      hindi: ["हल्दी"],
      telugu: ["పసుపు"],
      kannada: ["ಅರಿಶಿನ"],
      malayalam: ["മഞ്ഞൾ"],
    },
    brands: ["Everest", "MDH"],
    category: "Spices",
  },
  {
    canonical: "Chilli Powder",
    keywords: ["chilli powder", "milagai", "mirchi", "karam", "khara", "mulaku podi"],
    regional: {
      tamil: ["மிளகாய் பொடி"],
      hindi: ["मिर्च पाउडर"],
      telugu: ["మిర్చి పొడి"],
      kannada: ["ಖಾರ ಪುಡಿ"],
      malayalam: ["മുളക് പൊടി"],
    },
    brands: ["Everest", "MDH"],
    category: "Spices",
  },
  {
    canonical: "Coriander Powder",
    keywords: ["coriander", "malli", "dhaniya", "kothimeera", "kothambari"],
    regional: {
      tamil: ["மல்லி", "கொத்தமல்லி"],
      hindi: ["धनिया"],
      telugu: ["ధనియాలు"],
      kannada: ["ಕೊತ್ತಂಬರಿ"],
      malayalam: ["മല്ലി"],
    },
    brands: ["Everest", "MDH"],
    category: "Spices",
  },
  {
    canonical: "Cumin Seeds",
    keywords: ["cumin", "seeragam", "jeera", "jilakarra", "jirige"],
    regional: {
      tamil: ["சீரகம்"],
      hindi: ["जीरा"],
      telugu: ["జీలకర్ర"],
      kannada: ["ಜೀರಿಗೆ"],
      malayalam: ["ജീരകം"],
    },
    category: "Spices",
  },
  {
    canonical: "Mustard Seeds",
    keywords: ["mustard seeds", "kadugu", "rai", "avalu", "sasive"],
    regional: {
      tamil: ["கடுகு"],
      hindi: ["राई", "सरसों"],
      telugu: ["ఆవాలు"],
      kannada: ["ಸಾಸಿವೆ"],
      malayalam: ["കടുക്"],
    },
    category: "Spices",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DAIRY PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Milk",
    keywords: ["milk", "paal", "doodh", "paalu", "halu", "paal"],
    regional: {
      tamil: ["பால்"],
      hindi: ["दूध"],
      telugu: ["పాలు"],
      kannada: ["ಹಾಲು"],
      malayalam: ["പാൽ"],
    },
    brands: ["Aavin", "Amul", "Mother Dairy", "Nandini"],
    category: "Dairy",
  },
  {
    canonical: "Curd",
    keywords: ["curd", "yogurt", "thayir", "dahi", "perugu", "mosaru", "thairu"],
    regional: {
      tamil: ["தயிர்"],
      hindi: ["दही"],
      telugu: ["పెరుగు"],
      kannada: ["ಮೊಸರು"],
      malayalam: ["തൈര്"],
    },
    brands: ["Aavin", "Amul", "Mother Dairy"],
    category: "Dairy",
  },
  {
    canonical: "Butter",
    keywords: ["butter", "vennai", "makhan", "venna", "benne"],
    regional: {
      tamil: ["வெண்ணெய்"],
      hindi: ["मक्खन"],
      telugu: ["వెన్న"],
      kannada: ["ಬೆಣ್ಣೆ"],
      malayalam: ["വെണ്ണ"],
    },
    brands: ["Amul", "Mother Dairy"],
    category: "Dairy",
  },
  {
    canonical: "Ghee",
    keywords: ["ghee", "nei", "desi ghee", "neyyi", "tuppa", "cow ghee"],
    regional: {
      tamil: ["நெய்"],
      hindi: ["घी"],
      telugu: ["నేయి"],
      kannada: ["ತುಪ್ಪ"],
      malayalam: ["നെയ്യ്"],
    },
    brands: ["Amul", "Mother Dairy", "Nandini"],
    category: "Dairy",
  },
  {
    canonical: "Paneer",
    keywords: ["paneer", "cottage cheese", "panner"],
    regional: {
      tamil: ["பனீர்"],
      hindi: ["पनीर"],
      telugu: ["పనీర్"],
      kannada: ["ಪನೀರ್"],
      malayalam: ["പനീർ"],
    },
    brands: ["Amul", "Mother Dairy"],
    category: "Dairy",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BEVERAGES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Tea Powder",
    keywords: ["tea", "chai", "tea powder", "black tea", "red label", "tajmahal", "brooke bond"],
    regional: {
      tamil: ["தேநீர்", "தேநீர் பொடி"],
      hindi: ["चाय"],
      telugu: ["టీ పొడి"],
      kannada: ["ಟೀ ಪುಡಿ"],
      malayalam: ["ചായപ്പൊടി"],
    },
    brands: ["Red Label", "Taj Mahal", "Brooke Bond", "Tata Tea"],
    category: "Beverages",
  },
  {
    canonical: "Coffee Powder",
    keywords: ["coffee", "kaapi", "filter coffee", "bru", "nescafe", "instant coffee"],
    regional: {
      tamil: ["காபி", "காபி பொடி"],
      hindi: ["कॉफी"],
      telugu: ["కాఫీ పొడి"],
      kannada: ["ಕಾಫಿ ಪುಡಿ"],
      malayalam: ["കോഫി പൊടി"],
    },
    brands: ["Bru", "Nescafe", "Coorg Coffee"],
    category: "Beverages",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SNACKS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Biscuits",
    keywords: ["biscuit", "biscuits", "cookies", "parle g", "parle", "glucose biscuit", "marie", "cream biscuit", "biskoot"],
    regional: {
      tamil: ["பிஸ்கட்"],
      hindi: ["बिस्कुट"],
      telugu: ["బిస్కెట్"],
      kannada: ["ಬಿಸ್ಕೆಟ್"],
      malayalam: ["ബിസ്കറ്റ്"],
    },
    brands: ["Parle-G", "Marie Gold", "Britannia", "Sunfeast"],
    category: "Snacks",
  },
  {
    canonical: "Maggi Noodles",
    keywords: ["maggi", "noodles", "instant noodles", "2 minute", "magi", "maagi"],
    regional: {
      tamil: ["மேகி"],
      hindi: ["मैगी"],
      telugu: ["మాగీ"],
      kannada: ["ಮ್ಯಾಗಿ"],
      malayalam: ["മാഗി"],
    },
    brands: ["Maggi"],
    category: "Snacks",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL CARE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Soap",
    keywords: ["soap", "saabun", "sabun", "lux", "dove", "lifebuoy", "pears", "medimix"],
    regional: {
      tamil: ["சோப்பு"],
      hindi: ["साबुन"],
      telugu: ["సబ్బు"],
      kannada: ["ಸಾಬೂನು"],
      malayalam: ["സോപ്പ്"],
    },
    brands: ["Lux", "Dove", "Lifebuoy", "Pears", "Medimix"],
    category: "Personal Care",
  },
  {
    canonical: "Toothpaste",
    keywords: ["toothpaste", "paste", "colgate", "pepsodent", "closeup"],
    regional: {
      tamil: ["பல் பேஸ்ட்"],
      hindi: ["टूथपेस्ट"],
      telugu: ["టూత్ పేస్ట్"],
      kannada: ["ಟೂತ್ಪೇಸ್ಟ್"],
      malayalam: ["ടൂത്ത്പേസ്റ്റ്"],
    },
    brands: ["Colgate", "Pepsodent", "Closeup"],
    category: "Personal Care",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HOUSEHOLD
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Detergent Powder",
    keywords: ["detergent", "washing powder", "wheel", "ariel", "tide", "rin", "surf excel"],
    regional: {
      tamil: ["சலவை பொடி"],
      hindi: ["डिटर्जेंट"],
      telugu: ["డిటర్జెంట్"],
      kannada: ["ಡಿಟರ್ಜೆಂಟ್"],
      malayalam: ["ഡിറ്റർജന്റ്"],
    },
    brands: ["Wheel", "Ariel", "Tide", "Rin", "Surf Excel"],
    category: "Household",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VEGETABLES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    canonical: "Onion",
    keywords: ["onion", "vengayam", "pyaz", "ulli", "erulli"],
    regional: {
      tamil: ["வெங்காயம்"],
      hindi: ["प्याज"],
      telugu: ["ఉల్లి"],
      kannada: ["ಈರುಳ್ಳಿ"],
      malayalam: ["ഉള്ളി"],
    },
    category: "Vegetables",
  },
  {
    canonical: "Tomato",
    keywords: ["tomato", "thakkali", "tamatar"],
    regional: {
      tamil: ["தக்காளி"],
      hindi: ["टमाटर"],
      telugu: ["టొమాటో"],
      kannada: ["ಟೊಮೇಟೊ"],
      malayalam: ["തക്കാളി"],
    },
    category: "Vegetables",
  },
  {
    canonical: "Potato",
    keywords: ["potato", "aloo", "urulaikizhangu", "bangaladumpa"],
    regional: {
      tamil: ["உருளைக்கிழங்கு"],
      hindi: ["आलू"],
      telugu: ["బంగాళాదుంప"],
      kannada: ["ಆಲೂಗಡ್ಡೆ"],
      malayalam: ["ഉരുളക്കിഴങ്ങ്"],
    },
    category: "Vegetables",
  },
];

/**
 * Get all keywords for a product (flattened)
 */
export function getAllKeywords(entry: ProductKeywordEntry): string[] {
  const keywords = [...entry.keywords];
  
  // Add regional keywords
  if (entry.regional) {
    Object.values(entry.regional).forEach(regionalKeywords => {
      if (regionalKeywords) {
        keywords.push(...regionalKeywords);
      }
    });
  }
  
  // Add brand keywords
  if (entry.brands) {
    keywords.push(...entry.brands.map(b => b.toLowerCase()));
  }
  
  return keywords;
}

/**
 * Search product by keyword
 */
export function searchProductByKeyword(query: string): ProductKeywordEntry | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact match first
  for (const entry of PRODUCT_KEYWORDS) {
    const allKeywords = getAllKeywords(entry);
    if (allKeywords.some(k => k.toLowerCase() === normalizedQuery)) {
      return entry;
    }
  }
  
  // Partial match
  for (const entry of PRODUCT_KEYWORDS) {
    const allKeywords = getAllKeywords(entry);
    if (allKeywords.some(k => k.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(k.toLowerCase()))) {
      return entry;
    }
  }
  
  return null;
}
