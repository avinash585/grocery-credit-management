"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CircleCheck,
  Coins,
  CreditCard,
  IndianRupee,
  Languages,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Mic,
  PackageSearch,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Volume2,
  type LucideIcon,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  WifiOff
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FloatingMic } from "@/components/floating-mic";
import {
  Customer,
  Product,
  chatWithAi,
  createCreditBill,
  createCustomer,
  getToken,
  login,
  receivePayment,
  registerShop,
  searchCustomers,
  searchProducts,
  parseVoiceCommand,
  learnVoiceAlias,
  saveProductUpdate,
  toggleProductStatus,
  createProduct
} from "@/lib/api";
import { Language, t } from "@/lib/i18n";
import { readQueue, useNetworkStatus, syncOfflineQueue } from "@/lib/offline";

const queryClient = new QueryClient();
type Task = "credit" | "payment" | "products" | "ai";
type View = "admin" | "customers" | "billing" | "products" | "ai";

const starterCustomers: Customer[] = [
  { id: "demo-avina", name: "Avinash A", phone: "9876543210", preferredLanguage: "ENGLISH", outstandingBalance: "0.00" },
  { id: "demo-kumar", name: "Kumar Stores", phone: "9000011111", preferredLanguage: "ENGLISH", outstandingBalance: "0.00" },
  { id: "demo-lakshmi", name: "Lakshmi", phone: "9000022222", preferredLanguage: "TAMIL", outstandingBalance: "0.00" }
];

const starterProducts: Product[] = [
  {"id": "demo-rice-1", "sku": "RICE-001", "name": "Rice 1 kg", "sellingPrice": "45.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அரிசி 1 கிலோ", "nameHi": "चावल 1 கிலோ", "nameTe": "బియ్యం 1 కేజీ", "nameKn": "ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "അരി 1 കിലോഗ്രാം"},
  {"id": "demo-rice-2", "sku": "RICE-002", "name": "Premium Basmati Rice", "sellingPrice": "140.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாசுமதி அரிசி 1 கிலோ", "nameHi": "बासमती चावल 1 किलो", "nameTe": "బాస్మతి బియ్యం 1 కేజీ", "nameKn": "ಬಾಸ್ಮತಿ ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "ബാസ്മതി അരി 1 കിലോഗ്രാം"},
  {"id": "demo-rice-3", "sku": "RICE-003", "name": "Sona Masoori Rice", "sellingPrice": "70.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோனா மசூரி அரிசி 1 கிலோ", "nameHi": "सोना मसूरी चावल 1 किलो", "nameTe": "సోనా మసూరి బియ్యం 1 కేజీ", "nameKn": "ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "സോന മസൂരി അരി 1 കിലോഗ്രാം"},
  {"id": "demo-rice-4", "sku": "RICE-004", "name": "Ponni Rice", "sellingPrice": "62.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பொன்னி அரிசி 1 கிலோ", "nameHi": "पोन्नी चावल 1 किलो", "nameTe": "పొన్ని బియ్యం 1 కేజీ", "nameKn": "పೊನ್ನಿ ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "പൊന്നി അരി 1 കിലോഗ്രാം"},
  {"id": "demo-rice-5", "sku": "RICE-005", "name": "Boiled Rice", "sellingPrice": "48.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "புழுங்கல் அரிசி 1 கிலோ", "nameHi": "उबला हुआ चावल 1 किलो", "nameTe": "ఉడికించిన బియ్యం 1 కేజీ", "nameKn": "ಬೇಯಿಸಿದ ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "പുഴുങ്ങലരി 1 കിലോഗ്രാം"},
  {"id": "demo-rice-6", "sku": "RICE-006", "name": "Broken Rice", "sellingPrice": "33.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "குருணை அரிசி 1 கிலோ", "nameHi": "टूटा हुआ चावल 1 किलो", "nameTe": "నూకలు 1 కేజీ", "nameKn": "ನುಚ್ಚು ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "നുറുക്കരി 1 കിലോഗ്രാം"},
  {"id": "demo-rice-7", "sku": "RICE-007", "name": "Brown Rice", "sellingPrice": "95.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கைக்குத்தல் அரிசி 1 கிலோ", "nameHi": "भूरा चावल 1 किलो", "nameTe": "దంపుడు బియ్యం 1 కేజీ", "nameKn": "ಕಂದು ಅಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "തവിടുള്ള അരി 1 കിലോഗ്രാം"},
  {"id": "demo-wheat-1", "sku": "WHT-001", "name": "Wheat Grains 1 kg", "sellingPrice": "32.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கோதுமை 1 கிலோ", "nameHi": "गेहूं 1 किलो", "nameTe": "గోధుమలు 1 కేజీ", "nameKn": "ಗೋಧಿ 1 ಕೆಜಿ", "nameMl": "ഗോതമ്പ് 1 கിലോഗ്രാം"},
  {"id": "demo-wheat-2", "sku": "WHT-002", "name": "Wheat Atta 1 kg", "sellingPrice": "37.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கோதுமை மாவு 1 கிலோ", "nameHi": "गेहूं का आटा 1 किलो", "nameTe": "గోధుమ పిండి 1 కేజీ", "nameKn": "ಗೋಧಿ ಹಿಟ್ಟು 1 ಕೆಜಿ", "nameMl": "ഗോതമ്പ് പൊടി 1 കിലോഗ്രാം"},
  {"id": "demo-grains-1", "sku": "GRN-001", "name": "Maida 1 kg", "sellingPrice": "42.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மைதா மாவு 1 கிலோ", "nameHi": "मैदा 1 किलो", "nameTe": "మైదా పిండి 1 కేజీ", "nameKn": "ಮೈದಾ ಹಿಟ್ಟು 1 ಕೆಜಿ", "nameMl": "മൈദ 1 കിലോഗ്രാം"},
  {"id": "demo-grains-2", "sku": "GRN-002", "name": "Rava / Sooji 1 kg", "sellingPrice": "47.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "ரவா 1 கிலோ", "nameHi": "सूजी 1 किलो", "nameTe": "రవ్వ 1 కేజీ", "nameKn": "ರವೆ 1 ಕೆಜಿ", "nameMl": "റവ 1 കിലോഗ്രാം"},
  {"id": "demo-grains-3", "sku": "GRN-003", "name": "Besan 1 kg", "sellingPrice": "96.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடலை மாவு 1 கிலோ", "nameHi": "बेसन 1 किलो", "nameTe": "శనగ పిండి 1 కేజీ", "nameKn": "ಕಡಲೆ ಹಿಟ್ಟು 1 ಕೆಜಿ", "nameMl": "കടലപ്പೊടി 1 കിലോഗ്രാം"},
  {"id": "demo-grains-4", "sku": "GRN-004", "name": "Corn Flour 500 g", "sellingPrice": "45.00", "category": "Staples", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோள மாவு 500 கிராம்", "nameHi": "मक्के का आटा 500 ग्राम", "nameTe": "మొక్కజొన్న పిండి 500 గ్రా", "nameKn": "ಮೆಕ್ಕೆಜೋಳದ ಹಿಟ್ಟು 500 ಗ್ರಾಂ", "nameMl": "ചോളം പൊടി 500 ഗ്രാം"},
  {"id": "demo-grains-5", "sku": "GRN-005", "name": "Rice Flour 1 kg", "sellingPrice": "55.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அரிசி மாவு 1 கிலோ", "nameHi": "चावल का आटा 1 किलो", "nameTe": "వరి పిండి 1 కేజీ", "nameKn": "ಅಕ್ಕಿ ಹಿಟ್ಟು 1 ಕೆಜಿ", "nameMl": "അരിപ്പொടി 1 കിലോഗ്രാം"},
  {"id": "demo-grains-6", "sku": "GRN-006", "name": "Bajra 1 kg", "sellingPrice": "40.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கம்பு 1 கிலோ", "nameHi": "बाजरा 1 किलो", "nameTe": "సజ్జలు 1 కేజీ", "nameKn": "ಸಜ್ಜೆ 1 ಕೆಜಿ", "nameMl": "കമ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-grains-7", "sku": "GRN-007", "name": "Jowar 1 kg", "sellingPrice": "45.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோளம் 1 கிலோ", "nameHi": "ज्वार 1 किलो", "nameTe": "జొన్నలు 1 కేజీ", "nameKn": "ಜೋಳ 1 ಕೆಜಿ", "nameMl": "ചോളം 1 കിലോഗ്രാം"},
  {"id": "demo-grains-8", "sku": "GRN-008", "name": "Ragi Flour 1 kg", "sellingPrice": "60.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கேழ்வரகு மாவு 1 கிலோ", "nameHi": "रागी का आटा 1 किलो", "nameTe": "రాగి పిండి 1 కేజీ", "nameKn": "ರಾಗಿ ಹಿಟ್ಟು 1 ಕೆಜಿ", "nameMl": "രാഗി പൊടി 1 കിലോഗ്രാം"},
  {"id": "demo-grains-9", "sku": "GRN-009", "name": "Poha 1 kg", "sellingPrice": "60.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அவல் 1 கிலோ", "nameHi": "पोहा 1 किलो", "nameTe": "అటుకులు 1 కేజీ", "nameKn": "ಅವಲಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "അവൽ 1 കിലോഗ്രാം"},
  {"id": "demo-grains-10", "sku": "GRN-010", "name": "Aval 1 kg", "sellingPrice": "60.00", "category": "Staples", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அவல் 1 கிலோ", "nameHi": "चिड़वा 1 किलो", "nameTe": "అటుకులు 1 కేజీ", "nameKn": "ಅವಲಕ್ಕಿ 1 ಕೆಜಿ", "nameMl": "അവൽ 1 കിലോഗ्रാം"},
  {"id": "demo-grains-11", "sku": "GRN-011", "name": "Vermicelli 500 g", "sellingPrice": "35.00", "category": "Staples", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சேமியா 500 கிராம்", "nameHi": "सेवई 500 ग्राम", "nameTe": "సేమ్యా 500 గ్రా", "nameKn": "ಶಾವಿಗೆ 500 ಗ್ರಾಂ", "nameMl": "സേമിയ 500 ഗ്രാം"},
  {"id": "demo-dal-1", "sku": "DAL-001", "name": "Toor Dal 1 kg", "sellingPrice": "123.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "துவரம் பருப்பு 1 கிலோ", "nameHi": "अरहर दाल 1 किलो", "nameTe": "కందిపప్పు 1 కేజీ", "nameKn": "ತೊಗரி ಬೇಳೆ 1 ಕೆಜಿ", "nameMl": "തുവര പരിപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-dal-2", "sku": "DAL-002", "name": "Urad Dal 1 kg", "sellingPrice": "120.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உளுத்தம் பருப்பு 1 கிலோ", "nameHi": "உड़द दाल 1 किलो", "nameTe": "మినపప్పు 1 కేజీ", "nameKn": "ಉದ್ದಿನ ಬೇಳೆ 1 ಕೆಜಿ", "nameMl": "ഉഴുന്ന് പരിപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-dal-3", "sku": "DAL-003", "name": "Moong Dal 1 kg", "sellingPrice": "112.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாசிப்பருப்பு 1 கிலோ", "nameHi": "मूंग दाल 1 किलो", "nameTe": "పెసరపప్పు 1 కేజీ", "nameKn": "ಹೆಸರು ಬೇಳೆ 1 ಕೆಜಿ", "nameMl": "ചെറുപയർ പരിപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-dal-4", "sku": "DAL-004", "name": "Masoor Dal 1 kg", "sellingPrice": "90.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மைசூர் பருப்பு 1 கிலோ", "nameHi": "मसूर दाल 1 किलो", "nameTe": "మసూర్ పప్పు 1 కేజీ", "nameKn": "ಮಸೂರ್ ಬೇಳೆ 1 ಕೆಜಿ", "nameMl": "മസൂർ പരിപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-dal-5", "sku": "DAL-005", "name": "Chana Dal 1 kg", "sellingPrice": "86.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடலைப்பருப்பு 1 கிலோ", "nameHi": "चना दाल 1 किलो", "nameTe": "శనగపప్పు 1 కేజీ", "nameKn": "ಕಡಲೆ ಬೇಳೆ 1 ಕೆಜಿ", "nameMl": "കടല പരിപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-dal-6", "sku": "DAL-006", "name": "Green Gram 1 kg", "sellingPrice": "110.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பச்சைப்பயறு 1 கிலோ", "nameHi": "साबुत मूंग 1 किलो", "nameTe": "పెసలు 1 కేజీ", "nameKn": "ಹೆಸರು ಕಾಳು 1 ಕೆಜಿ", "nameMl": "ചെറുപയർ 1 കിലോഗ്രാം"},
  {"id": "demo-dal-7", "sku": "DAL-007", "name": "Black Gram 1 kg", "sellingPrice": "120.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உளுந்து 1 கிலோ", "nameHi": "साबुत उड़द 1 किलो", "nameTe": "మినుములు 1 కేజీ", "nameKn": "ಉದ್ದಿನ ಕಾಳು 1 ಕೆಜಿ", "nameMl": "ഉഴുന്ന് 1 കിലോഗ്രാം"},
  {"id": "demo-dal-8", "sku": "DAL-008", "name": "Kabuli Chana 1 kg", "sellingPrice": "130.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொண்டைக்கடலை 1 கிலோ", "nameHi": "काबुली चना 1 किलो", "nameTe": "కాబూలీ శనగలు 1 కేజీ", "nameKn": "ಕಬುಲಿ ಕಡಲೆ 1 ಕೆಜಿ", "nameMl": "വെള്ളക്കടല 1 കിലോഗ്രാം"},
  {"id": "demo-dal-9", "sku": "DAL-009", "name": "White Peas 1 kg", "sellingPrice": "90.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெள்ளை பட்டாணி 1 கிலோ", "nameHi": "सफेद मटर 1 किलो", "nameTe": "తెల్ల బఠానీలు 1 కేజీ", "nameKn": "ಬಿಳಿ ಬಟಾಣಿ 1 ಕೆಜಿ", "nameMl": "വെള്ള പയർ 1 കിലോഗ്രാം"},
  {"id": "demo-dal-10", "sku": "DAL-010", "name": "Horse Gram 1 kg", "sellingPrice": "95.00", "category": "Dal & Pulses", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொள்ளு 1 கிலோ", "nameHi": "कुलथी 1 किलो", "nameTe": "ఉలవలు 1 కేజీ", "nameKn": "ಹುరుಳಿ ಕಾಳು 1 ಕೆಜಿ", "nameMl": "മുതിര 1 കിലോഗ്രാം"},
  {"id": "demo-oil-1", "sku": "OIL-001", "name": "Groundnut Oil 1 L", "sellingPrice": "205.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடலை எண்ணெய் 1 லிட்டர்", "nameHi": "मूंगफली तेल 1 लीटर", "nameTe": "వేరుశనగ నూనె 1 లీటర్", "nameKn": "ಕಡಲೆಕಾಯಿ ಎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "കടല എണ്ണ 1 ലിറ്റർ"},
  {"id": "demo-oil-2", "sku": "OIL-002", "name": "Sunflower Oil 1 L", "sellingPrice": "189.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "சூரியகாந்தி எண்ணெய் 1 லிட்டர்", "nameHi": "सूरजमुखी तेल 1 लीटर", "nameTe": "సన్‍ఫ్లవర్ ఆయిల్ 1 లీటర్", "nameKn": "ಸूरियाகாந்தி ಎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "സൺഫ്ലവർ ഓയിൽ 1 ലിറ്റർ"},
  {"id": "demo-oil-3", "sku": "OIL-003", "name": "Mustard Oil 1 L", "sellingPrice": "194.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடுகு எண்ணெய் 1 லிட்டர்", "nameHi": "सरसों का तेल 1 लीटर", "nameTe": "ఆవ నూనె 1 లీటర్", "nameKn": "ಸಾಸಿವೆ ಎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "കടുക് എണ്ണ 1 ലിറ്റർ"},
  {"id": "demo-oil-4", "sku": "OIL-004", "name": "Coconut Oil 1 L", "sellingPrice": "260.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "தேங்காய் எண்ணெய் 1 லிட்டர்", "nameHi": "नारियल तेल 1 लीटर", "nameTe": "కొబ్బరి నూనె 1 లీటర్", "nameKn": "ತೆಂಗಿನ ಎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "വെളിച്ചെണ്ണ 1 ലിറ്റർ"},
  {"id": "demo-oil-5", "sku": "OIL-005", "name": "Palm Oil 1 L", "sellingPrice": "148.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாமாயில் 1 லிட்டர்", "nameHi": "पाम तेल 1 लीटर", "nameTe": "పామ్ ఆయిల్ 1 లీటర్", "nameKn": "ಪಾಮ್ ಎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "പാമോയിൽ 1 ലിറ്റർ"},
  {"id": "demo-oil-6", "sku": "OIL-006", "name": "Soya Oil 1 L", "sellingPrice": "164.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோயா எண்ணெய் 1 லிட்டர்", "nameHi": "소याबीन तेल 1 लीटर", "nameTe": "సోయాబీన్ నూనె 1 లీటర్", "nameKn": "ಸೋಯಾಬೀನ್ ಎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "സോയാബീൻ എണ്ണ 1 ലിറ്റർ"},
  {"id": "demo-oil-7", "sku": "OIL-007", "name": "Gingelly Oil 1 L", "sellingPrice": "310.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "நல்லெண்ணெய் 1 லிட்டர்", "nameHi": "तिल का तेल 1 लीटर", "nameTe": "నువ్వుల నూనె 1 లీటర్", "nameKn": "ಎಳ್ಳೆಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "നല്ലെണ്ണെ 1 ലിറ്റർ"},
  {"id": "demo-oil-8", "sku": "OIL-008", "name": "Olive Oil 1 L", "sellingPrice": "650.00", "category": "Cooking Oil", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஆலிவ் எண்ணெய் 1 லிட்டர்", "nameHi": "जैतून का तेल 1 लीटर", "nameTe": "ఆలివ్ నూనె 1 లీటర్", "nameKn": "ఆలివ్ ఎಣ್ಣೆ 1 ಲೀಟರ್", "nameMl": "ഒലിവ് എണ്ണ 1 ലിറ്റർ"},
  {"id": "demo-spice-1", "sku": "SPC-001", "name": "Turmeric Powder 100 g", "sellingPrice": "35.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மஞ்சள் தூள் 100 கிராம்", "nameHi": "हल्दी पाउडर 100 ग्राम", "nameTe": "పసుపు పొడి 100 గ్రా", "nameKn": "ಅರಿಶಿನ ಪುಡಿ 100 ಗ್ರಾಂ", "nameMl": "മഞ്ഞൾ പൊടി 100 ഗ്രാം"},
  {"id": "demo-spice-2", "sku": "SPC-002", "name": "Chilli Powder 100 g", "sellingPrice": "45.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மிளகாய் தூள் 100 கிராம்", "nameHi": "लाल मिर्च पाउडर 100 ग्राम", "nameTe": "కారం పొడి 100 గ్రా", "nameKn": "ಖಾರದ ಪುಡಿ 100 ಗ್ರಾಂ", "nameMl": "മുളക് പൊടി 100 ഗ്രാം"},
  {"id": "demo-spice-3", "sku": "SPC-003", "name": "Coriander Powder 100 g", "sellingPrice": "30.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மல்லித் தூள் 100 கிராம்", "nameHi": "धनिया पाउडर 100 ग्राम", "nameTe": "ధనియాల పొడి 100 గ్రా", "nameKn": "ಕೊತ್ತಂಬರಿ ಪುಡಿ 100 ಗ್ರಾಂ", "nameMl": "മല്ലിപ്പൊടി 100 ഗ്രാം"},
  {"id": "demo-spice-4", "sku": "SPC-004", "name": "Cumin Seeds 100 g", "sellingPrice": "42.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சீரகம் 100 கிராம்", "nameHi": "जीरा 100 ग्राम", "nameTe": "జీలకర్ర 100 గ్రా", "nameKn": "ಜೀರಿಗೆ 100 ಗ್ರಾಂ", "nameMl": "ജീരകം 100 ഗ്രാം"},
  {"id": "demo-spice-5", "sku": "SPC-005", "name": "Black Pepper 100 g", "sellingPrice": "90.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மிளகு 100 கிராம்", "nameHi": "काली मिर्च 100 ग्राम", "nameTe": "మిరియాలు 100 గ్రా", "nameKn": "ಮೆಣಸು 100 ಗ್ರಾಂ", "nameMl": "കുരുமுളക് 100 ഗ്രാം"},
  {"id": "demo-spice-6", "sku": "SPC-006", "name": "Mustard Seeds 100 g", "sellingPrice": "25.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடுகு 100 கிராம்", "nameHi": "राई / सरसों 100 ग्राम", "nameTe": "ఆవాలు 100 గ్రా", "nameKn": "ಸಾಸಿವೆ 100 ಗ್ರಾಂ", "nameMl": "കടുക് 100 ഗ്രാം"},
  {"id": "demo-spice-7", "sku": "SPC-007", "name": "Fenugreek 100 g", "sellingPrice": "20.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெந்தயம் 100 கிராம்", "nameHi": "मेथी 100 ग्राम", "nameTe": "మెంతులు 100 గ్రా", "nameKn": "ಮೆಂತೆ 100 ಗ್ರಾಂ", "nameMl": "ഉലുവ 100 ഗ്രാം"},
  {"id": "demo-spice-8", "sku": "SPC-008", "name": "Fennel 100 g", "sellingPrice": "35.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோம்பு 100 கிராம்", "nameHi": "सौंफ 100 ग्राम", "nameTe": "సోంపు 100 గ్రా", "nameKn": "ಸೋಂಪು 100 ಗ್ರಾಂ", "nameMl": "പെരുംജീരകം 100 ഗ്രാം"},
  {"id": "demo-spice-9", "sku": "SPC-009", "name": "Cardamom 50 g", "sellingPrice": "180.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஏலக்காய் 50 கிராம்", "nameHi": "इलायची 50 ग्राम", "nameTe": "యాలకులు 50 గ్రా", "nameKn": "ಏಲಕ್ಕಿ 50 ಗ್ರಾಂ", "nameMl": "ஏலக்காய் 50 ഗ്രാം"},
  {"id": "demo-spice-10", "sku": "SPC-010", "name": "Cloves 50 g", "sellingPrice": "90.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கிராம்பு 50 கிராம்", "nameHi": "लौंग 50 ग्राम", "nameTe": "లవంగాలు 50 గ్రా", "nameKn": "ಲವಂಗ 50 ಗ್ರಾಂ", "nameMl": "ഗ്രാമ്പൂ 50 ഗ്രാം"},
  {"id": "demo-spice-11", "sku": "SPC-011", "name": "Cinnamon 50 g", "sellingPrice": "60.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பட்டை 50 கிராம்", "nameHi": "दालचीनी 50 ग्राम", "nameTe": "దాల్చిన చెక్క 50 గ్రా", "nameKn": "ದಾಲ್ಚಿನ್ನಿ 50 ಗ್ರಾಂ", "nameMl": "കറുവപ്പട്ട 50 ഗ്രാം"},
  {"id": "demo-spice-12", "sku": "SPC-012", "name": "Bay Leaf 25 g", "sellingPrice": "25.00", "category": "Spices", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பிரிஞ்சி இலை 25 கிராம்", "nameHi": "तेजपत्ता 25 ग्राम", "nameTe": "బిర్యానీ ఆకు 25 గ్రా", "nameKn": "ಬಿರಿಯಾನಿ ಎಲೆ 25 ಗ್ರಾಂ", "nameMl": "വഴനയില 25 ഗ്രാം"},
  {"id": "demo-sug-1", "sku": "SUG-001", "name": "Sugar 1 kg", "sellingPrice": "47.00", "category": "Sugar & Salt", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சர்க்கரை 1 கிலோ", "nameHi": "चीनी 1 किलो", "nameTe": "చక్కెర 1 కేజీ", "nameKn": "ಸಕ್ಕರೆ 1 ಕೆಜಿ", "nameMl": "പഞ്ചസാര 1 കിലോഗ്രാം"},
  {"id": "demo-sug-2", "sku": "SUG-002", "name": "Brown Sugar 1 kg", "sellingPrice": "70.00", "category": "Sugar & Salt", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "நாட்டுச் சர்க்கரை 1 கிலோ", "nameHi": "ब्राउन शुगर 1 किलो", "nameTe": "బ్రౌన్ షుగర్ 1 కేజీ", "nameKn": "ಬ್ರೌನ್ ಸಕ್ಕರೆ 1 ಕೆಜಿ", "nameMl": "ബ്രൗൺ ഷുഗർ 1 കിലോഗ്രാം"},
  {"id": "demo-sug-3", "sku": "SUG-003", "name": "Rock Salt 1 kg", "sellingPrice": "35.00", "category": "Sugar & Salt", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "இந்துப்பு 1 கிலோ", "nameHi": "सेंधा नमक 1 किलो", "nameTe": "రాతి ఉప్పు 1 కేజీ", "nameKn": "ಕಲ್ಲು ಉಪ್ಪು 1 ಕೆಜಿ", "nameMl": "കല്ലുപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-sug-4", "sku": "SUG-004", "name": "Iodized Salt 1 kg", "sellingPrice": "22.00", "category": "Sugar & Salt", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உப்பு 1 கிலோ", "nameHi": "नमक 1 किलो", "nameTe": "అయోడైజ్డ్ ఉప్పు 1 కేజీ", "nameKn": "ಉಪ್ಪು 1 ಕೆಜಿ", "nameMl": "ഉപ്പ് 1 കിലോഗ്രാം"},
  {"id": "demo-sug-5", "sku": "SUG-005", "name": "Jaggery 1 kg", "sellingPrice": "60.00", "category": "Sugar & Salt", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெல்லம் 1 கிலோ", "nameHi": "गुड़ 1 किलो", "nameTe": "బెల్లం 1 కేజీ", "nameKn": "ಬೆಲ್ಲ 1 ಕೆಜಿ", "nameMl": "ശർക്കര 1 കിലോഗ്രാം"},
  {"id": "demo-sug-6", "sku": "SUG-006", "name": "Palm Jaggery 500 g", "sellingPrice": "90.00", "category": "Sugar & Salt", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கருப்பட்டி 500 கிராம்", "nameHi": "ताड़ का गुड़ 500 ग्राम", "nameTe": "తాటి బెల్లం 500 గ్రా", "nameKn": "ತಾಟಿ ಬೆಲ್ಲ 500 ಗ್ರಾಂ", "nameMl": "കരിപ്പെട്ടി 500 ഗ്രാം"},
  {"id": "demo-bev-1", "sku": "BEV-001", "name": "Tea Powder 250 g", "sellingPrice": "90.00", "category": "Tea & Coffee", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "தேயிலை தூள் 250 கிராம்", "nameHi": "चाय पत्ती 250 ग्राम", "nameTe": "టీ పొడి 250 గ్రా", "nameKn": "ಚಹಾ ಪುಡಿ 250 ಗ್ರಾಂ", "nameMl": "ചായപ്പൊടി 250 ഗ്രാം"},
  {"id": "demo-bev-2", "sku": "BEV-002", "name": "Premium Tea 500 g", "sellingPrice": "220.00", "category": "Tea & Coffee", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பிரீமியம் தேநீர் தூள் 500 கிராம்", "nameHi": "प्रीमियम चाय 500 ग्राम", "nameTe": "ప్రీమియం టీ 500 గ్రా", "nameKn": "ಪ್ರೀಮಿಯಂ ಟೀ 500 ಗ್ರಾಂ", "nameMl": "പ്രീമിയം ചായപ്പൊടി 500 ഗ്രാം"},
  {"id": "demo-bev-3", "sku": "BEV-003", "name": "Instant Coffee 100 g", "sellingPrice": "180.00", "category": "Tea & Coffee", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "உடனடி காபி தூள் 100 கிராம்", "nameHi": "इंस्टेंट कॉफी 100 ग्राम", "nameTe": "ఇన్‌స్టంట్ కాఫీ 100 గ్రా", "nameKn": "ಇನ್‌స్టంట్ ಕಾಫಿ 100 ಗ್ರಾಂ", "nameMl": "ഇൻസ്റ്റന്റ് കാപ്പിപ്പൊടി 100 ഗ്രാം"},
  {"id": "demo-bev-4", "sku": "BEV-004", "name": "Filter Coffee 200 g", "sellingPrice": "250.00", "category": "Tea & Coffee", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பில்டர் காபி தூள் 200 கிராம்", "nameHi": "फिल्टर कॉफी 200 ग्राम", "nameTe": "ఫిల్టర్ కాఫీ 200 గ్రా", "nameKn": "ಫಿಲ್ಟರ್ ಕಾಫಿ 200 ಗ್ರಾಂ", "nameMl": "ഫിൽട്ടർ കാപ്പിപ്പൊടി 200 ഗ്രാം"},
  {"id": "demo-bev-5", "sku": "BEV-005", "name": "Green Tea 100 g", "sellingPrice": "150.00", "category": "Tea & Coffee", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பச்சை தேநீர் 100 கிராம்", "nameHi": "ग्रीन टी 100 ग्राम", "nameTe": "గ్రీన్ టీ 100 గ్రా", "nameKn": "ಗ್ರೀನ್ ಟೀ 100 ಗ್ರಾಂ", "nameMl": "ഗ്രീൻ ടീ 100 ഗ്രാം"},
  {"id": "demo-dry-1", "sku": "DRY-001", "name": "Milk 1 L", "sellingPrice": "61.00", "category": "Dairy & Frozen", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பால் 1 லிட்டர்", "nameHi": "दूध 1 लीटर", "nameTe": "పాలు 1 లీటర్", "nameKn": "ಹಾಲು 1 ಲೀಟರ್", "nameMl": "പാൽ 1 ലിറ്റർ"},
  {"id": "demo-dry-2", "sku": "DRY-002", "name": "Curd 500 g", "sellingPrice": "40.00", "category": "Dairy & Frozen", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "தயிர் 500 கிராம்", "nameHi": "दही 500 ग्राम", "nameTe": "పెరుగు 500 గ్రా", "nameKn": "ಮೊಸರು 500 ಗ್ರಾಂ", "nameMl": "തൈര് 500 ഗ്രാം"},
  {"id": "demo-dry-3", "sku": "DRY-003", "name": "Butter 100 g", "sellingPrice": "60.00", "category": "Dairy & Frozen", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெண்ணெய் 100 கிராம்", "nameHi": "मक्खन 100 gram", "nameTe": "వెన్న 100 గ్రా", "nameKn": "ಬೆಣ್ಣೆ 100 ಗ್ರಾಂ", "nameMl": "വെണ്ണ 100 ഗ്രാം"},
  {"id": "demo-dry-4", "sku": "DRY-004", "name": "Ghee 1 L", "sellingPrice": "690.00", "category": "Dairy & Frozen", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "நெய் 1 லிட்டர்", "nameHi": "घी 1 लीटर", "nameTe": "నెయ్యి 1 లీటర్", "nameKn": "ತುಪ್ಪ 1 ಲೀಟರ್", "nameMl": "നെയ്യ് 1 ലിറ്റർ"},
  {"id": "demo-dry-5", "sku": "DRY-005", "name": "Paneer 200 g", "sellingPrice": "90.00", "category": "Dairy & Frozen", "unit": "g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பனீர் 200 கிராம்", "nameHi": "पनीर 200 ग्राम", "nameTe": "పనీర్ 200 గ్రా", "nameKn": "ಪನೀರ್ 200 ಗ್ರಾಂ", "nameMl": "പനീർ 200 ഗ്രാം"},
  {"id": "demo-dry-6", "sku": "DRY-006", "name": "Cheese Slices", "sellingPrice": "120.00", "category": "Dairy & Frozen", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "சீஸ் துண்டுகள்", "nameHi": "चीज़ स्लाइस", "nameTe": "చీజ్ స్లైసెస్", "nameKn": "ಚೀಸ್ ಸ್ಲೈಸ್", "nameMl": "ചീസ് സ്ലൈസ്"},
  {"id": "demo-dry-7", "sku": "DRY-007", "name": "Cream 200 ml", "sellingPrice": "75.00", "category": "Dairy & Frozen", "unit": "ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "கிரீம் 200 மி.லி", "nameHi": "मलाई 200 मिली", "nameTe": "ఫ్రెష్ క్రీమ్ 200 ఎంఎల్", "nameKn": "ಫ್ರೆಶ್ ಕ್ರೀಮ್ 200 ಎಂಎಲ್", "nameMl": "ഫ്രഷ് ക്രീം 200 എംഎൽ"},
  {"id": "demo-dry-8", "sku": "DRY-008", "name": "Buttermilk", "sellingPrice": "20.00", "category": "Dairy & Frozen", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மோர்", "nameHi": "छाछ", "nameTe": "మజ్జిగ", "nameKn": "ಮಜ್ಜಿಗೆ", "nameMl": "മോര്"},
  {"id": "demo-bak-1", "sku": "BAK-001", "name": "White Bread", "sellingPrice": "40.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெள்ளை ரொட்டி", "nameHi": "सफेद ब्रेड", "nameTe": "వైట్ బ్రెడ్", "nameKn": "ಬಿಳಿ ಬ್ರೆಡ್", "nameMl": "വെള്ള ബ്രെഡ്"},
  {"id": "demo-bak-2", "sku": "BAK-002", "name": "Brown Bread", "sellingPrice": "50.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பழுப்பு ரொட்டி", "nameHi": "ब्राउन ब्रेड", "nameTe": "బ్రౌన్ బ్రెడ్", "nameKn": "ಬ್ರೌನ್ ಬ್ರೆಡ್", "nameMl": "ബ്രൗൺ ബ്രെഡ്"},
  {"id": "demo-bak-3", "sku": "BAK-003", "name": "Burger Bun", "sellingPrice": "35.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பர்கர் பன்", "nameHi": "बर्गर बन", "nameTe": "బర్గర్ బన్", "nameKn": "ಬರ್ಗರ್ ಬನ್", "nameMl": "ബർഗർ ബൺ"},
  {"id": "demo-bak-4", "sku": "BAK-004", "name": "Pav Bun", "sellingPrice": "35.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாவ் பன்", "nameHi": "पाव बन", "nameTe": "పావ్ బన్", "nameKn": "ಪಾವ್ ಬನ್", "nameMl": "പാവ് ബൺ"},
  {"id": "demo-bak-5", "sku": "BAK-005", "name": "Rusk", "sellingPrice": "45.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ரஸ்க்", "nameHi": "रस्क", "nameTe": "రస్క్", "nameKn": "ರಸ್ಕ್", "nameMl": "റസ്ക്"},
  {"id": "demo-bak-6", "sku": "BAK-006", "name": "Cake Rusk", "sellingPrice": "60.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "கேக் ரஸ்க்", "nameHi": "केक रस्क", "nameTe": "కేక్ రస్క్", "nameKn": "ಕೇಕ್ ರಸ್ಕ್", "nameMl": "കേക്ക് റസ്ക്"},
  {"id": "demo-bis-1", "sku": "BIS-001", "name": "Parle-G", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பார்லே-ஜி", "nameHi": "पारले-जी", "nameTe": "పార్లే-జి", "nameKn": "ಪาร์ಲೆ-ಜಿ", "nameMl": "പാർലെ-ജി"},
  {"id": "demo-bis-2", "sku": "BIS-002", "name": "Marie Gold", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மேரி கோல்ட்", "nameHi": "मैरी गोल्ड", "nameTe": "మేరీ గోల్డ్", "nameKn": "ಮೇరి ಗೋಲ್ಡ್", "nameMl": "മേരി ഗോൾഡ്"},
  {"id": "demo-bis-3", "sku": "BIS-003", "name": "Good Day", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "குட் டே", "nameHi": "गुड डे", "nameTe": "గుడ్ డే", "nameKn": "ಗುಡ್ ಡೇ", "nameMl": "ഗുഡ് ഡേ"},
  {"id": "demo-bis-4", "sku": "BIS-004", "name": "Bourbon", "sellingPrice": "35.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "போர்பன்", "nameHi": "बोर्बोन", "nameTe": "బోర్బన్", "nameKn": "ಬೋರ್ಬನ್", "nameMl": "ബോർബൺ"},
  {"id": "demo-bis-5", "sku": "BIS-005", "name": "Oreo", "sellingPrice": "30.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஓரியோ", "nameHi": "ओरियो", "nameTe": "ఓరియో", "nameKn": "ಓರಿಯೊ", "nameMl": "ഓറിയോ"},
  {"id": "demo-bis-6", "sku": "BIS-006", "name": "50-50", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "50-50", "nameHi": "50-50", "nameTe": "50-50", "nameKn": "50-50", "nameMl": "50-50"},
  {"id": "demo-bis-7", "sku": "BIS-007", "name": "Monaco", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மொனாக்கோ", "nameHi": "मोनाको", "nameTe": "మోనాకో", "nameKn": "ಮೊನಾಕೊ", "nameMl": "മൊണാക്കോ"},
  {"id": "demo-bis-8", "sku": "BIS-008", "name": "Hide & Seek", "sellingPrice": "35.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஹைட் & சீக்", "nameHi": "हाइड एंड सीक", "nameTe": "హైడ్ అండ్ సీక్", "nameKn": "ಹೈಡ್ ಆಂಡ್ ಸೀಕ್", "nameMl": "ഹൈഡ് ആൻഡ് സീക്ക്"},
  {"id": "demo-cho-1", "sku": "CHO-001", "name": "Dairy Milk", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "டைரி மில்க்", "nameHi": "डेयरी मिल्क", "nameTe": "డైరీ మిల్క్", "nameKn": "ಡೈರಿ ಮಿಲ್ಕ್", "nameMl": "ഡയറി മിൽക്ക്"},
  {"id": "demo-cho-2", "sku": "CHO-002", "name": "KitKat", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "கிட்காட்", "nameHi": "किटकेट", "nameTe": "కిట్‌క్యాట్", "nameKn": "ಕಿಟ್‌ಕ್ಯಾಟ್", "nameMl": "കിറ്റ്കാറ്റ്"},
  {"id": "demo-cho-3", "sku": "CHO-003", "name": "Five Star", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "பைவ் ஸ்டார்", "nameHi": "फाइव स्टार", "nameTe": "ఫైవ్ స్టార్", "nameKn": "ಫೈವ್ ಸ್ಟಾರ್", "nameMl": "ഫൈവ് സ്റ്റാർ"},
  {"id": "demo-cho-4", "sku": "CHO-004", "name": "Munch", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "மஞ்ச்", "nameHi": "मंच", "nameTe": "మంచ్", "nameKn": "ಮंಚ್", "nameMl": "മഞ്ച്"},
  {"id": "demo-cho-5", "sku": "CHO-005", "name": "Perk", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "பெர்க்", "nameHi": "पर्क", "nameTe": "పార్క్", "nameKn": "ಪರ್ಕ್", "nameMl": "പെർക്ക്"},
  {"id": "demo-cho-6", "sku": "CHO-006", "name": "Gems", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஜெம்ஸ்", "nameHi": "जेम्स", "nameTe": "జెమ్స్", "nameKn": "ಜೆಮ್ಸ್", "nameMl": "ஜெംസ്"},
  {"id": "demo-cho-7", "sku": "CHO-007", "name": "Snickers", "sellingPrice": "40.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஸ்னிக்கர்ஸ்", "nameHi": "स्निकर्स", "nameTe": "స్నికర్స్", "nameKn": "ಸ್ನಿಕರ್ಸ್", "nameMl": "സ്നിക്കേഴ്സ്"},
  {"id": "demo-ins-1", "sku": "INS-001", "name": "Maggi", "sellingPrice": "15.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மேகி", "nameHi": "मैगी", "nameTe": "మ్యాగీ", "nameKn": "ಮ್ಯಾಗಿ", "nameMl": "മാഗി"},
  {"id": "demo-ins-2", "sku": "INS-002", "name": "Yippee Noodles", "sellingPrice": "15.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "இப்பி நூடுல்ஸ்", "nameHi": "यिप्पी नूडल्स", "nameTe": "యిప్పీ నూడుల్స్", "nameKn": "ಯಿಪ್ಪಿ ನೂಡಲ್ಸ್", "nameMl": "ഇപ്പി നൂഡിൽസ്"},
  {"id": "demo-ins-3", "sku": "INS-003", "name": "Pasta", "sellingPrice": "40.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாஸ்தா", "nameHi": "पास्ता", "nameTe": "పాస్తా", "nameKn": "ಪಾಸ್ತಾ", "nameMl": "പാസ്ത"},
  {"id": "demo-ins-4", "sku": "INS-004", "name": "Oats", "sellingPrice": "180.00", "category": "Snacks & Biscuits", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஓட்ஸ்", "nameHi": "ओट्स", "nameTe": "ఓట్స్", "nameKn": "ಓಟ್ಸ್", "nameMl": "ഓട്സ്"},
  {"id": "demo-ins-5", "sku": "INS-005", "name": "Corn Flakes", "sellingPrice": "180.00", "category: ": "Snacks & Biscuits", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோளக் கஞ்சிக் கூழ்", "nameHi": "कॉर्न फ्लेक्स", "nameTe": "కార్న్ ఫ్లేక్స్", "nameKn": "ಕಾರ್ನ್ ಫ್ಲೇಕ್ಸ್", "nameMl": "കോൺ ഫ്ലേക്സ്"},
  {"id": "demo-ins-6", "sku": "INS-006", "name": "Instant Upma Mix", "sellingPrice": "65.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "உப்புமா மிக்ஸ்", "nameHi": "इंस्टेंट उपमा मिक्स", "nameTe": "ఇన్‌స్టంట్ ఉప్మా మిక్స్", "nameKn": "ಇನ್‌స్టంట్ ಉಪ್ಮಾ ಮಿಕ್ಸ್", "nameMl": "ഉപ്പുമാ മിക്സ്"},
  {"id": "demo-bev-6", "sku": "BEV-006", "name": "Mineral Water 1 L", "sellingPrice": "20.00", "category": "Beverages", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "குடிநீர் பாட்டில் 1 லிட்டர்", "nameHi": "मिनरल वाटर 1 लीटर", "nameTe": "మినరల్ వాటర్ 1 లీటర్", "nameKn": "ಮಿನರಲ್ ವಾಟರ್ 1 ಲೀಟರ್", "nameMl": "മിനറൽ വാട്ടർ 1 ലിറ്റർ"},
  {"id": "demo-bev-7", "sku": "BEV-007", "name": "Soft Drink 750 ml", "sellingPrice": "40.00", "category": "Beverages", "unit": "ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "குளிர்பானம் 750 மி.லி", "nameHi": "कोल्ड ड्रिंक 750 मिली", "nameTe": "సాఫ్ట్ డ్రింక్ 750 ఎంఎల్", "nameKn": "ಸಾಫ್ಟ್ ಡ್ರಿಂಕ್ 750 ಎಂಎᆯ", "nameMl": "സോഫ്റ്റ് ഡ്രിങ്ക് 750 എംഎൽ"},
  {"id": "demo-bev-8", "sku": "BEV-008", "name": "Soft Drink 2 L", "sellingPrice": "95.00", "category": "Beverages", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "குளிர்பானம் 2 லிட்டர்", "nameHi": "कोल्ड ड्रिंक 2 लीटर", "nameTe": "సాఫ్ట్ డ్రింక్ 2 లీటర్లు", "nameKn": "ಸಾಫ್ಟ್ ಡ್ರಿಂಕ್ 2 ಲೀಟರ್", "nameMl": "സോഫ്റ്റ് ഡ్రిങ്ക് 2 ലിറ്റർ"},
  {"id": "demo-bev-9", "sku": "BEV-009", "name": "Fruit Juice 1 L", "sellingPrice": "120.00", "category": "Beverages", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பழச்சாறு 1 லிட்டர்", "nameHi": "फलों का रस 1 लीटर", "nameTe": "ఫ్రూట్ జ్యూస్ 1 లీటర్", "nameKn": "ఫ్రూట్ జ్యూస్ 1 లీటర్", "nameMl": "ഫ്രൂട്ട് ജ്യൂസ് 1 ലിറ്റർ"},
  {"id": "demo-bev-10", "sku": "BEV-010", "name": "Tender Coconut Water", "sellingPrice": "40.00", "category": "Beverages", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "இளநீர்", "nameHi": "नारियल पानी", "nameTe": "కొబ్బరి నీళ్లు", "nameKn": "ಎಳನೀరు", "nameMl": "കരിക്കിൻ വെള്ളം"},
  {"id": "demo-veg-1", "sku": "VEG-001", "name": "Potato", "sellingPrice": "25.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உருளைக்கிழங்கு", "nameHi": "आलू", "nameTe": "బంగాళదుంప", "nameKn": "ಆಲೂಗಡ್ಡೆ", "nameMl": "ഉരുളക്കിഴങ്ങ്"},
  {"id": "demo-veg-2", "sku": "VEG-002", "name": "Onion", "sellingPrice": "35.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெங்காயம்", "nameHi": "प्याज़", "nameTe": "ఉల్లిపాయ", "nameKn": "ಈರುಳ್ಳಿ", "nameMl": "സവാള"},
  {"id": "demo-veg-3", "sku": "VEG-003", "name": "Tomato", "sellingPrice": "45.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "தக்காளி", "nameHi": "टमाटर", "nameTe": "టమోటా", "nameKn": "ಟೊಮೆಟೊ", "nameMl": "തക്കാളി"},
  {"id": "demo-veg-4", "sku": "VEG-004", "name": "Garlic", "sellingPrice": "120.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பூண்டு", "nameHi": "लहसुन", "nameTe": "వెల్లుల్లి", "nameKn": "ಬೆಳ್ಳುಳ್ಳಿ", "nameMl": "വെളുത്തുള്ളി"},
  {"id": "demo-veg-5", "sku": "VEG-005", "name": "Ginger", "sellingPrice": "80.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "இஞ்சி", "nameHi": "அदरक", "nameTe": "అల్లం", "nameKn": "ಶುंಠಿ", "nameMl": "ഇഞ്ചി"},
  {"id": "demo-veg-6", "sku": "VEG-006", "name": "Brinjal", "sellingPrice": "40.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கத்தரிக்காய்", "nameHi": "बैंगन", "nameTe": "వంకాయ", "nameKn": "ಬದನೆಕಾಯಿ", "nameMl": "വഴുതനങ്ങ"},
  {"id": "demo-veg-7", "sku": "VEG-007", "name": "Lady's Finger", "sellingPrice": "50.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெண்டைக்காய்", "nameHi": "भिंडी", "nameTe": "బెండకాయ", "nameKn": "ಬೆಂಡೆಕಾಯಿ", "nameMl": "വെണ്ടയ്ക്ക"},
  {"id": "demo-veg-8", "sku": "VEG-008", "name": "Beans", "sellingPrice": "80.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பீன்ஸ்", "nameHi": "बीन्स", "nameTe": "బీన్స్", "nameKn": "ಬೀನ್ಸ್", "nameMl": "ബീൻസ്"},
  {"id": "demo-veg-9", "sku": "VEG-009", "name": "Cabbage", "sellingPrice": "30.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "முட்டைக்கோஸ்", "nameHi": "बंदगोभी", "nameTe": "క్యాబేజీ", "nameKn": "ಎಲೆಕೋಸು", "nameMl": "കാബേജ്"},
  {"id": "demo-veg-10", "sku": "VEG-010", "name": "Cauliflower", "sellingPrice": "40.00", "category": "Vegetables", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "காலிஃபிளவர்", "nameHi": "फूलगोभी", "nameTe": "కాలిఫ్లవర్", "nameKn": "ಹೂಕೋಸು", "nameMl": "കോളിഫ്ലവർ"},
  {"id": "demo-veg-11", "sku": "VEG-011", "name": "Carrot", "sellingPrice": "60.00", "category": "Vegetables", "unit": "kg", "enabled: ": true, "stockQuantity": "100.00", "nameTa": "கேரட்", "nameHi": "गाजर", "nameTe": "క్యారెట్", "nameKn": "ಕ್ಯಾರೆಟ್", "nameMl": "കാരറ്റ്"},
  {"id": "demo-veg-12", "sku": "VEG-012", "name": "Beetroot", "sellingPrice": "45.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பீட்ரூட்", "nameHi": "चुकंदर", "nameTe": "బీట్రూట్", "nameKn": "ಬೀಟ್ರೂಟ್", "nameMl": "ബീറ്റ്‌റൂട്ട്"},
  {"id": "demo-veg-13", "sku": "VEG-013", "name": "Drumstick", "sellingPrice": "80.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "முருங்கைக்காய்", "nameHi": "सहजन", "nameTe": "మునగకాయ", "nameKn": "ನುಗ್ಗೆಕಾಯಿ", "nameMl": "മുരിങ്ങക്കായ"},
  {"id": "demo-veg-14", "sku": "VEG-014", "name": "Green Chilli", "sellingPrice": "90.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பச்சை மிளகாய்", "nameHi": "हरी मिर्च", "nameTe": "పచ్చి మిర్చి", "nameKn": "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ", "nameMl": "പച്ചമുളക്"},
  {"id": "demo-veg-15", "sku": "VEG-015", "name": "Curry Leaves", "sellingPrice": "10.00", "category": "Vegetables", "unit": "bunch", "enabled": true, "stockQuantity": "100.00", "nameTa": "கருவேப்பிலை", "nameHi": "करी पत्ता", "nameTe": "కరివేపాకు", "nameKn": "ಕರಿಬೇವು", "nameMl": "കറിവേപ്പില"},
  {"id": "demo-veg-16", "sku": "VEG-016", "name": "Coriander Leaves", "sellingPrice": "10.00", "category": "Vegetables", "unit": "bunch", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொத்தமல்லி தழை", "nameHi": "धनिया पत्ती", "nameTe": "కొత్తిమీర", "nameKn": "ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು", "nameMl": "മല്ലിയില"},
  {"id": "demo-veg-17", "sku": "VEG-017", "name": "Mint Leaves", "sellingPrice": "10.00", "category: ": "Vegetables", "unit": "bunch", "enabled": true, "stockQuantity": "100.00", "nameTa": "புதினா", "nameHi": "पुदीना", "nameTe": "పుదీనా", "nameKn": "ಪುದೀನಾ", "nameMl": "പുതിന"},
  {"id": "demo-fru-1", "sku": "FRU-001", "name": "Banana", "sellingPrice": "50.00", "category": "Vegetables", "unit": "dozen", "enabled": true, "stockQuantity": "100.00", "nameTa": "வாழைப்பழம்", "nameHi": "केला", "nameTe": "అరటిపండు", "nameKn": "ಬಾಳೆಹಣ್ಣು", "nameMl": "ವಾഴപ്പഴം"},
  {"id": "demo-fru-2", "sku": "FRU-002", "name": "Apple", "sellingPrice": "180.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஆப்பிள்", "nameHi": "सेब", "nameTe": "ఆపిల్", "nameKn": "ಆಪಲ್", "nameMl": "ആപ്പിൾ"},
  {"id": "demo-fru-3", "sku": "FRU-003", "name": "Orange", "sellingPrice": "100.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஆரஞ்சு", "nameHi": "संतरा", "nameTe: ": "నారింజ", "nameKn": "ಕಿತ್ತಳೆ", "nameMl": "ഓറഞ്ച്"},
  {"id": "demo-fru-4", "sku": "FRU-004", "name": "Mango", "sellingPrice": "120.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மாம்பழம்", "nameHi": "आम", "nameTe": "మామిడిపండు", "nameKn": "ಮಾವಿನಹಣ್ಣು", "nameMl": "മാമ്പഴം"},
  {"id": "demo-fru-5", "sku": "FRU-005", "name": "Grapes", "sellingPrice": "90.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "திராட்சை", "nameHi": "अंगूर", "nameTe": "ద్రాక్ష", "nameKn": "ದ್ರಾಕ್ಷಿ", "nameMl": "മുന്തിരി"},
  {"id": "demo-fru-6", "sku": "FRU-006", "name": "Guava", "sellingPrice": "60.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொய்யாப்பழம்", "nameHi": "அமர்ूद", "nameTe": "జామపండు", "nameKn": "ಸೀಬೆಹಣ್ಣು", "nameMl": "പേരയ്ക്ക"},
  {"id": "demo-fru-7", "sku": "FRU-007", "name": "Pomegranate", "sellingPrice": "180.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மாதுளம்பழம்", "nameHi": "अनार", "nameTe": "దానిమ్మపండు", "nameKn": "ದಾಳಿಂಬೆ", "nameMl": "മാതളനാരങ്ങ"},
  {"id": "demo-fru-8", "sku": "FRU-008", "name": "Watermelon", "sellingPrice": "35.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "தர்பூசணி", "nameHi": "तरबूज", "nameTe": "పుచ్చకాయ", "nameKn": "ಕಲ್ಲಂಗಡಿ", "nameMl": "തണ്ണിമത്തൻ"},
  {"id": "demo-fru-9", "sku": "FRU-009", "name": "Papaya", "sellingPrice": "40.00", "category": "Vegetables", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பப்பாளி", "nameHi": "पपीता", "nameTe": "బొప్పాయి", "nameKn": "ಪಪ್ಪಾಯಿ", "nameMl": "പപ്പായ"},
  {"id": "demo-cos-1", "sku": "COS-001", "name": "Bath Soap", "sellingPrice": "40.00", "category": "Personal Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "குளியல் சோப்பு", "nameHi": "साबुन", "nameTe": "సబ్బు", "nameKn": "ಸೋಪು", "nameMl": "സോപ്പ്"},
  {"id": "demo-cos-2", "sku": "COS-002", "name": "Shampoo Sachet", "sellingPrice": "2.00", "category": "Personal Care", "unit": "Sachet", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஷாம்பு பாக்கெட்", "nameHi": "शैम्पू पाउच", "nameTe": "షాంపు", "nameKn": "ಶ್ಯಾಂಪೂ", "nameMl": "ഷാംപൂ"},
  {"id": "demo-cos-3", "sku": "COS-003", "name": "Shampoo Bottle", "sellingPrice": "180.00", "category": "Personal Care", "unit": "Bottle", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஷாம்பு பாட்டில்", "nameHi": "शैम्पू बोतल", "nameTe": "షాంపు బాటిల్", "nameKn": "ಶ್ಯಾಂಪೂ ಬಾಟಲ್", "nameMl": "ഷാംപൂ ബോട്ടിൽ"},
  {"id": "demo-cos-4", "sku": "COS-004", "name": "Toothpaste", "sellingPrice": "75.00", "category: ": "Personal Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பற்பசை", "nameHi": "टूथपेस्ट", "nameTe": "టూత్‌పేస్ట్", "nameKn": "ಟೂತ್‌ಪೇสต์", "nameMl": "ടൂത്ത് പേസ്റ്റ്"},
  {"id": "demo-cos-5", "sku": "COS-005", "name": "Toothbrush", "sellingPrice": "30.00", "category": "Personal Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பல் துலக்கி", "nameHi": "टूथब्रश", "nameTe": "టూత్‌బ్రష్", "nameKn": "ಟೂತ್‌ಬ್ರಷ್", "nameMl": "ടൂത്ത് ബ്രഷ്"},
  {"id": "demo-cos-6", "sku": "COS-006", "name": "Hair Oil", "sellingPrice": "120.00", "category": "Personal Care", "unit": "Bottle", "enabled": true, "stockQuantity": "100.00", "nameTa": "தலைமுடி எண்ணெய்", "nameHi": "बालों का तेल", "nameTe": "హెయిర్ ఆయిల్", "nameKn": "ಹೇರ್ ಆಯಿಲ್", "nameMl": "വെളിച്ചെണ്ണ"},
  {"id": "demo-cos-7", "sku": "COS-007", "name": "Face Wash", "sellingPrice": "150.00", "category": "Personal Care", "unit": "Tube", "enabled": true, "stockQuantity": "100.00", "nameTa": "முக சுத்திகரிப்பு திரவம்", "nameHi": "फेस वॉश", "nameTe: ": "ఫేస్ వాష్", "nameKn": "ಫೇಸ್ ವಾಶ್", "nameMl": "ఫേസ് వాഷ്"},
  {"id": "demo-cos-8", "sku": "COS-008", "name": "Talcum Powder", "sellingPrice": "120.00", "category": "Personal Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பவுடர்", "nameHi": "टैल्कम पाउडर", "nameTe": "టాల్కమ్ పౌడర్", "nameKn": "ಟಾಲ್ಕಮ್ ಪೌಡರ್", "nameMl": "ടാൽക്കം പൗഡർ"},
  {"id": "demo-hou-1", "sku": "HOU-001", "name": "Detergent Powder 1 kg", "sellingPrice": "120.00", "category": "Household Care", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சலவை தூள் 1 கிலோ", "nameHi": "कपड़े धोने का पाउडर 1 கிலோ", "nameTe": "సర్ఫ్ పొడి 1 కేజీ", "nameKn": "ಡಿಟರ್ಜೆಂಟ್ ಪುಡಿ 1 ಕೆಜಿ", "nameMl": "ഡിറ്റർജന്റ് പൗഡർ 1 കിലോഗ്രാം"},
  {"id": "demo-hou-2", "sku": "HOU-002", "name": "Detergent Cake", "sellingPrice": "25.00", "category": "Household Care", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "சலவை சோப்பு", "nameHi": "कपड़े धोने का साबुन", "nameTe": "సర్ఫ్ సబ్బు", "nameKn": "ಬಟ್ಟೆ ಸೋಪು", "nameMl": "അലക്ക് സോപ്പ്"},
  {"id": "demo-hou-3", "sku": "HOU-003", "name": "Dishwash Bar", "sellingPrice": "25.00", "category": "Household Care", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாத்திரம் கழுவும் சோப்பு", "nameHi": "बर्तन धोने का साबुन", "nameTe": "విమ్ బార్", "nameKn": "ವಿಮ್ ಬಾರ್", "nameMl": "വിം ബാർ"},
  {"id": "demo-hou-4", "sku": "HOU-004", "name": "Dishwash Liquid", "sellingPrice": "90.00", "category: ": "Household Care", "unit": "Bottle", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாத்திரம் கழுவும் திரவம்", "nameHi": "बर्तन धोने का लिक्विड", "nameTe": "విమ్ లిక్విడ్", "nameKn": "ವಿಮ್ లిక్విడ్", "nameMl": "വിം ലിക്വിഡ്"},
  {"id": "demo-hou-5", "sku": "HOU-005", "name": "Floor Cleaner 1 L", "sellingPrice": "180.00", "category": "Household Care", "unit": "L", "enabled": true, "stockQuantity": "100.00", "nameTa": "தரை சுத்திகரிப்பு திரவம் 1 லிட்டர்", "nameHi": "फर्श साफ करने का लिक्विड 1 लीटर", "nameTe": "ఫ్లోర్ క్లీనర్ 1 లీటర్", "nameKn": "ಫ್ಲೋರ್ ಕ್ಲೀನರ್ 1 ಲೀಟರ್", "nameMl": "ഫ്ലോർ ಕ್ലീനർ 1 ലിറ്റർ"},
  {"id": "demo-hou-6", "sku": "HOU-006", "name": "Toilet Cleaner", "sellingPrice": "110.00", "category": "Household Care", "unit": "Bottle", "enabled": true, "stockQuantity": "100.00", "nameTa": "கழிவறை சுத்திகரிப்பு திரவம்", "nameHi": "टॉयलेट क्लीनर", "nameTe": "టాయిలెట్ క్లీనర్", "nameKn": "ಟಾಯ್ಲೆಟ್ ಕ್ಲೀನರ್", "nameMl": "ടോയ്‌ലറ്റ് ക്ലീനർ"},
  {"id": "demo-hou-7", "sku: ": "HOU-007", "name": "Garbage Bags", "sellingPrice": "80.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "குப்பை பைகள்", "nameHi": "कचरे की थैली", "nameTe": "చెత్త సంచులు", "nameKn": "ಕಸದ ಚೀಲ", "nameMl": "വേസ്റ്റ് ബാഗ്"},
  {"id": "demo-hou-8", "sku": "HOU-008", "name": "Scrub Pad", "sellingPrice": "20.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "நார்", "nameHi": "स्क्रब पैड", "nameTe": "స్క్రబ్ ప్యాడ్", "nameKn": "ಸ್ಕ್ರಬ್ ಪ್ಯಾಡ್", "nameMl": "സ്ക്രബ് പാഡ്"},
  {"id": "demo-ess-1", "sku": "ESS-001", "name": "Match Box", "sellingPrice": "2.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "தீப்பெட்டி", "nameHi": "माचिस की डिब्बी", "nameTe": "అగ్గిపెట్టె", "nameKn": "ಅಗ್ಗಿப்பெಟ್ಟಿಗೆ", "nameMl": "தீപ്പെട്ടി"},
  {"id": "demo-ess-2", "sku": "ESS-002", "name": "Candle", "sellingPrice": "20.00", "category: ": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மெழுகுவர்த்தி", "nameHi": "मोमबत्ती", "nameTe": "మెழுகுவர்த்தி", "nameKn": "ಮೇಣದಬತ್ತಿ", "nameMl": "മെഴുകുതിരി"},
  {"id": "demo-ess-3", "sku": "ESS-003", "name": "Agarbathi", "sellingPrice": "35.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஊதுபத்தி", "nameHi": "अगरबत्ती", "nameTe": "అగరుబత్తీలు", "nameKn": "ಅಗರಬತ್ತಿ", "nameMl": "അഗർബത്തി"},
  {"id": "demo-ess-4", "sku": "ESS-004", "name": "Camphor", "sellingPrice": "30.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "சூடம்", "nameHi": "कपूर", "nameTe": "కర్పూరం", "nameKn": "ಕರ್ಪೂರ", "nameMl": "കർപ്പൂരം"},
  {"id": "demo-ess-5", "sku": "ESS-005", "name": "Cotton Wick", "sellingPrice": "20.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "திரி", "nameHi": "पूजा की रुई की बत्ती", "nameTe": "పూజ ఒత్తులు", "nameKn": "ಹತ್ತಿ ಬತ್ತಿ", "nameMl": "തിരി"},
  {"id": "demo-ess-6", "sku": "ESS-006", "name": "Battery AA (Pair)", "sellingPrice": "50.00", "category: ": "Household Care", "unit": "Pair", "enabled": true, "stockQuantity": "100.00", "nameTa": "பேட்டரி AA", "nameHi": "AA बैटरी", "nameTe": "AA బ్యాటరీ", "nameKn": "AA ಬ್ಯಾಟರಿ", "nameMl": "AA ബാറ്ററി"},
  {"id": "demo-ess-7", "sku": "ESS-007", "name": "Aluminium Foil", "sellingPrice": "90.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "அலுமினியம் தாள்", "nameHi": "एल्युमिनियम फॉयल", "nameTe": "అల్యూమినియం ఫాయిల్", "nameKn": "ಅಲ್ಯೂಮಿನಿಯಂ ಫಾಯಿಲ್", "nameMl": "അലുമिനിയം ഫോയിൽ"},
  {"id": "demo-ess-8", "sku": "ESS-008", "name": "Cling Wrap", "sellingPrice": "70.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "உணவு சுற்றும் பிளாஸ்டிக்", "nameHi": "क्लिंग रैप", "nameTe": "క్లింగ్ ర్యాప్", "nameKn": "ಕ್ಲಿಂಗ್ ರ್ಯಾಪ್", "nameMl": "ക്ലിംഗ് റാപ്പ്"},
  {"id": "demo-oth-1", "sku": "OTH-001", "name": "Eggs (12)", "sellingPrice": "84.00", "category": "Others", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "முட்டை (12)", "nameHi": "अंडे (12)", "nameTe: ": "గుడ్లు (12)", "nameKn": "ಮೊಟ್ಟೆ (12)", "nameMl": "മുട്ട (12)"},
  {"id": "demo-oth-2", "sku": "OTH-002", "name": "Chicken (1 kg)", "sellingPrice": "260.00", "category": "Others", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கோழி இறைச்சி 1 கிலோ", "nameHi": "चिकन 1 किलो", "nameTe": "చికెన్ 1 కేజీ", "nameKn": "ಕೋಳಿ ಮಾಂಸ 1 ಕೆಜಿ", "nameMl": "കോഴി ഇറച്ചി 1 കിലോ"},
  {"id": "demo-oth-3", "sku": "OTH-003", "name": "Fish (1 kg)", "sellingPrice": "280.00", "category": "Others", "unit": "kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மீன் 1 கிலோ", "nameHi": "मछली 1 किलो", "nameTe": "చేపలు 1 కేజీ", "nameKn": "ಮೀನು 1 ಕೆಜಿ", "nameMl": "മീൻ 1 കിലോ"},
  {"id": "demo-oth-4", "sku": "OTH-004", "name": "Frozen Peas", "sellingPrice": "120.00", "category: ": "Others", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "உறைந்த பச்சை பட்டாணி", "nameHi": "फ्रोजन मटर", "nameTe": "ఫ్రోజెన్ బఠానీలు", "nameKn": "ಫ್ರೋಜನ್ ಬಟಾಣಿ", "nameMl": "ഫ്രോസൺ പീസ്"},
  {"id": "demo-oth-5", "sku": "OTH-005", "name": "Ice Cream Cup", "sellingPrice": "30.00", "category": "Others", "unit": "Cup", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஐஸ்கிரீம்", "nameHi": "आइसक्रीम कप", "nameTe": "ఐస్ క్రీమ్ కప్పు", "nameKn": "ಐಸ್ ಕ್ರೀಮ್", "nameMl": "ಐസ് ക്രീം"},
];

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <RuralRetailOS />
    </QueryClientProvider>
  );
}

function RuralRetailOS() {
  const [language, setLanguage] = useState<Language>("ENGLISH");
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
  const [demoMode, setDemoMode] = useState(() => !Boolean(getToken()));
  const [view, setView] = useState<View>("admin");
  const [customers, setCustomers] = useState<Customer[]>(starterCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>(starterProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTask, setActiveTask] = useState<Task>("credit");
  const [voiceQuantity, setVoiceQuantity] = useState("1");
  const [voiceAmount, setVoiceAmount] = useState("");
  const [todaySalesVal, setTodaySalesVal] = useState(0);
  const [todayCreditVal, setTodayCreditVal] = useState(0);
  const [todayPaymentsVal, setTodayPaymentsVal] = useState(0);
  const [pendingVoiceCommand, setPendingVoiceCommand] = useState<{
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  } | null>(null);
  const [aiQueryOverride, setAiQueryOverride] = useState("");
  const [learningWord, setLearningWord] = useState("");
  const [cart, setCart] = useState<Array<{ product: Product; quantity: string }>>([]);

  function addToCart(product: Product, quantity: string = "1") {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.max(1, Number(existing.quantity) + Number(quantity));
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: String(nextQty) } 
          : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setStatus(`Added to cart: ${getProductName(product, language)}.`);
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    setStatus("Removed item from cart.");
  }

  function clearCart() {
    setCart([]);
    setStatus("Cart cleared.");
  }

  async function editProductPriceAndStock(productId: string, sellingPrice: string, stockQuantity: string, purchasePrice?: string, mrp?: string) {
    setBusy(true);
    setStatus("Updating product catalog...");
    const payload: Partial<Product> = {
      sellingPrice,
      stockQuantity: String(Math.max(0, Number(stockQuantity || 0)))
    };
    if (purchasePrice) payload.purchasePrice = purchasePrice;
    if (mrp) payload.mrp = mrp;

    if (demoMode) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...payload } : p));
      starterProducts.forEach((p, idx) => {
        if (p.id === productId) {
          starterProducts[idx] = { ...p, ...payload } as any;
        }
      });
      setBusy(false);
      setStatus("Demo product catalog updated successfully.");
      return;
    }
    try {
      const updated = await saveProductUpdate(productId, payload);
      setProducts(prev => prev.map(p => p.id === productId ? (updated ?? p) : p));
      setStatus("Product catalog updated successfully.");
    } catch (e) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...payload } : p));
      setStatus("Demo fallback: Product catalog updated locally.");
      setDemoMode(true);
    } finally {
      setBusy(false);
    }
  }

  async function toggleProductActive(productId: string, enabled: boolean) {
    setBusy(true);
    setStatus("Toggling product status...");
    if (demoMode) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, enabled } : p));
      starterProducts.forEach((p, idx) => {
        if (p.id === productId) {
          starterProducts[idx] = { ...p, enabled } as any;
        }
      });
      setBusy(false);
      setStatus(`Product status changed to: ${enabled ? "Enabled" : "Disabled"}.`);
      return;
    }
    try {
      const updated = await toggleProductStatus(productId, enabled);
      setProducts(prev => prev.map(p => p.id === productId ? (updated ?? p) : p));
      setStatus(`Product status changed to: ${enabled ? "Enabled" : "Disabled"}.`);
    } catch (e) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, enabled } : p));
      setStatus(`Demo fallback: Product status changed to ${enabled ? "Enabled" : "Disabled"}.`);
      setDemoMode(true);
    } finally {
      setBusy(false);
    }
  }

  async function addCustomProductToStore(name: string, price: number, extra?: { purchasePrice?: string; mrp?: string; category?: string; unit?: string; barcode?: string; brand?: string }) {
    setBusy(true);
    setStatus("Creating product...");
    const fullPayload: Partial<Product> = {
      name,
      sellingPrice: price.toFixed(2),
      purchasePrice: extra?.purchasePrice || (price * 0.8).toFixed(2),
      mrp: extra?.mrp || (price * 1.15).toFixed(2),
      category: extra?.category || "Staples",
      unit: extra?.unit || "kg",
      brand: extra?.brand || "Generic",
      barcode: extra?.barcode || "",
      enabled: true,
      stockQuantity: "0.00"
    };

    if (demoMode) {
      const newProduct: Product = {
        id: `custom-${Date.now()}`,
        sku: `CUSTOM-${Date.now().toString().slice(-6)}`,
        ...fullPayload
      } as any;
      setProducts(prev => [newProduct, ...prev]);
      starterProducts.unshift(newProduct);
      addToCart(newProduct, "1");
      setView("billing");
      setActiveTask("credit");
      setBusy(false);
      setStatus(`Created product "${name}" and added to cart.`);
      return;
    }
    try {
      const created = await createProduct(fullPayload);
      if (created) {
        setProducts(prev => [created, ...prev]);
        addToCart(created, "1");
        setView("billing");
        setActiveTask("credit");
        setStatus(`Created product "${name}" and added to cart.`);
      } else {
        throw new Error("Failed to create product");
      }
    } catch (e) {
      const newProduct: Product = {
        id: `custom-${Date.now()}`,
        sku: `CUSTOM-${Date.now().toString().slice(-6)}`,
        ...fullPayload
      } as any;
      setProducts(prev => [newProduct, ...prev]);
      starterProducts.unshift(newProduct);
      addToCart(newProduct, "1");
      setView("billing");
      setActiveTask("credit");
      setDemoMode(true);
      setStatus(`Created product "${name}" and added to cart (local).`);
    } finally {
      setBusy(false);
    }
  }

  async function learnAlias(category: "CUSTOMER" | "PRODUCT", canonicalId: string, aliasValue: string) {
    try {
      setBusy(true);
      await learnVoiceAlias(category, canonicalId, aliasValue);
      setStatus(`Taught alias: "${aliasValue}" represents ${canonicalId}`);
      setLearningWord("");
    } catch (e) {
      setStatus("Failed to save alias. Try again.");
    } finally {
      setBusy(false);
    }
  }
  const [merchantUpiId, setMerchantUpiId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("grammart:merchant-upi-id") ?? "grammart@ybl";
    }
    return "grammart@ybl";
  });

  const handleUpdateUpiId = (id: string) => {
    setMerchantUpiId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("grammart:merchant-upi-id", id);
    }
  };
  const online = useNetworkStatus();
  const copy = useMemo(() => t(language), [language]);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      readQueue()
        .then(q => setQueueSize(q.length))
        .catch(() => setQueueSize(0));
    };
    if (typeof window !== "undefined") {
      window.addEventListener("offline-queue-changed", updateCount);
    }
    updateCount();
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("offline-queue-changed", updateCount);
      }
    };
  }, []);

  useEffect(() => {
    if (online) {
      syncOfflineQueue()
        .then((results) => {
          if (results && results.length > 0) {
            setStatus(`Offline queue synced successfully: ${results.length} action(s) uploaded.`);
            if (!demoMode && getToken()) {
              searchCustomers("")
                .then((res) => {
                  if (res) setCustomers(res);
                })
                .catch((e) => console.error("Refresh directory failed:", e));
            }
          }
        })
        .catch((err) => {
          setStatus(`Failed to upload offline queue: ${err.message}`);
        });
    }
  }, [online, demoMode]);

  function requireSession() {
    if (!getToken() && !demoMode) {
      setHasToken(false);
      setStatus("Connect your shop first, or use demo admin mode from the Admin panel.");
      return false;
    }
    return true;
  }

  function requireCustomer() {
    if (!selectedCustomer) {
      setStatus("Open or create a customer account first.");
      return false;
    }
    return true;
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Connecting shop...");
    try {
      const data = new FormData(event.currentTarget);
      const phone = String(data.get("phone") ?? "").trim();
      const password = String(data.get("password") ?? "");
      const shopName = String(data.get("shopName") ?? "").trim();
      if (shopName) {
        await registerShop({
          shopName,
          ownerName: String(data.get("ownerName") ?? "Owner").trim() || "Owner",
          phone,
          password,
          preferredLanguage: language
        });
        setStatus("Shop connected. You can open a customer account now.");
      } else {
        await login(phone, password);
        setStatus("Logged in. Customer accounts are ready.");
      }
      setHasToken(true);
      setDemoMode(false);
      setView("customers");
    } catch (error) {
      setDemoMode(true);
      setHasToken(true);
      setView("admin");
      setStatus(error instanceof Error ? `${error.message} Demo admin workspace is open now.` : "Demo admin workspace is open now.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCustomerSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSession()) return;
    setBusy(true);
    setStatus("Finding customers...");
    const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase();
    if (demoMode) {
      const result = starterCustomers.filter((customer) => `${customer.name} ${customer.phone ?? ""}`.toLowerCase().includes(query));
      setCustomers(result.length ? result : starterCustomers);
      setStatus(result.length ? `${result.length} demo customer account(s) found.` : "Showing all demo customer accounts.");
      setBusy(false);
      return;
    }
    try {
      const result = (await searchCustomers(query)) ?? [];
      setCustomers(result);
      setStatus(result.length ? `${result.length} customer account(s) found` : "No customer found. Create one below.");
    } catch (error) {
      const result = starterCustomers.filter((customer) => `${customer.name} ${customer.phone ?? ""}`.toLowerCase().includes(query));
      setCustomers(result.length ? result : starterCustomers);
      setDemoMode(true);
      setStatus(error instanceof Error ? `${error.message} Showing demo customer directory.` : "Showing demo customer directory.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSession()) return;
    setBusy(true);
    setStatus("Creating customer account...");
    const data = new FormData(event.currentTarget);
    if (demoMode) {
      const customer: Customer = {
        id: `local-${Date.now()}`,
        name: String(data.get("name") ?? "Walk-in customer").trim() || "Walk-in customer",
        phone: String(data.get("phone") ?? "").trim(),
        preferredLanguage: language,
        outstandingBalance: "0.00"
      };
      setSelectedCustomer(customer);
      setCustomers((existing) => [customer, ...existing]);
      setView("billing");
      setStatus(`${customer.name}'s account is open in demo workspace.`);
      setBusy(false);
      return;
    }
    try {
      const customer = await createCustomer({
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        preferredLanguage: language
      });
      if (customer) {
        setSelectedCustomer(customer);
        setCustomers((existing) => [customer, ...existing.filter((item) => item.id !== customer.id)]);
        setStatus(`${customer.name}'s account is open.`);
        setView("billing");
      }
    } catch (error) {
      const data = new FormData(event.currentTarget);
      const customer: Customer = {
        id: `local-${Date.now()}`,
        name: String(data.get("name") ?? "Walk-in customer").trim() || "Walk-in customer",
        phone: String(data.get("phone") ?? "").trim(),
        preferredLanguage: language,
        outstandingBalance: "0.00"
      };
      setDemoMode(true);
      setSelectedCustomer(customer);
      setCustomers((existing) => [customer, ...existing]);
      setView("billing");
      setStatus(error instanceof Error ? `${error.message} Customer opened in demo workspace.` : "Customer opened in demo workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function submitProductSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requireSession()) return;
    setBusy(true);
    setStatus("Searching catalog...");
    const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase();
    if (demoMode) {
      const result = starterProducts.filter((product) =>
        `${product.name} ${product.nameTa || ""} ${product.nameHi || ""} ${product.nameTe || ""} ${product.nameKn || ""} ${product.nameMl || ""} ${product.sku}`.toLowerCase().includes(query)
      );
      setProducts(result.length ? result : starterProducts);
      setActiveTask("products");
      setStatus(result.length ? `${result.length} demo product(s) found.` : "Showing all demo products.");
      setBusy(false);
      return;
    }
    try {
      const result = (await searchProducts(query)) ?? [];
      setProducts(result);
      setActiveTask("credit");
      setStatus(result.length ? "Tap a product to add it to this account." : "No product found.");
    } catch (error) {
      const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase();
      const result = starterProducts.filter((product) =>
        `${product.name} ${product.nameTa || ""} ${product.nameHi || ""} ${product.nameTe || ""} ${product.nameKn || ""} ${product.nameMl || ""} ${product.sku}`.toLowerCase().includes(query)
      );
      setProducts(result.length ? result : starterProducts);
      setDemoMode(true);
      setActiveTask("products");
      setStatus(error instanceof Error ? `${error.message} Showing demo product catalog.` : "Showing demo product catalog.");
    } finally {
      setBusy(false);
    }
  }

  async function executeSaveCredit(product: Product | null, quantity: string) {
    if (!requireSession() || !requireCustomer()) return;
    if (cart.length === 0 && !product) {
      setStatus("Cart is empty. Search and add products first.");
      return;
    }

    const itemsToSave = cart.length > 0
      ? cart
      : [{ product: product!, quantity }];

    setBusy(true);
    setStatus("Saving credit sale...");

    let total = 0;
    itemsToSave.forEach(item => {
      total += Number(item.product.sellingPrice) * Number(item.quantity);
    });

    if (demoMode) {
      updateCustomerBalance(total);
      setTodayCreditVal(prev => prev + total);
      setTodaySalesVal(prev => prev + total);
      clearCart();
      setSelectedProduct(null);
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
      setStatus(`Demo credit sale saved: Rs.${total.toFixed(2)}.`);
      setBusy(false);
      return;
    }
    try {
      const bill = await createCreditBill({
        customerId: selectedCustomer!.id,
        creditBill: true,
        items: itemsToSave.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });
      const billTotal = Number(bill?.totalAmount ?? "0");
      updateCustomerBalance(billTotal);
      setStatus(`Credit sale saved: Rs.${billTotal}`);
      setTodayCreditVal(prev => prev + billTotal);
      setTodaySalesVal(prev => prev + billTotal);
      clearCart();
      setSelectedProduct(null);
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
    } catch (error) {
      updateCustomerBalance(total);
      setTodayCreditVal(prev => prev + total);
      setTodaySalesVal(prev => prev + total);
      clearCart();
      setSelectedProduct(null);
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
      setDemoMode(true);
      setStatus(error instanceof Error ? `${error.message} Demo credit sale saved: Rs.${total.toFixed(2)}.` : `Demo credit sale saved: Rs.${total.toFixed(2)}.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitCreditBill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await executeSaveCredit(null, "1");
  }

  async function executeSavePayment(amount: number) {
    if (!requireSession() || !requireCustomer()) return;
    setBusy(true);
    setStatus("Recording payment...");
    if (demoMode) {
      updateCustomerBalance(-Math.max(0, amount));
      setTodayPaymentsVal(prev => prev + amount);
      setVoiceAmount("");
      setPendingVoiceCommand(null);
      setStatus(`Demo payment recorded: Rs.${amount.toFixed(2)}.`);
      setBusy(false);
      return;
    }
    try {
      const payment = await receivePayment({ customerId: selectedCustomer!.id, amount: String(amount), note: "Counter payment" });
      if (payment) {
        setSelectedCustomer((current) => {
          if (!current || current.id !== payment.customerId) return current;
          const updated = { ...current, outstandingBalance: payment.outstandingBalance };
          setCustomers((existing) => existing.map((c) => c.id === updated.id ? updated : c));
          return updated;
        });
        setStatus(`Payment saved. Balance: Rs.${payment.outstandingBalance}`);
      } else {
        updateCustomerBalance(-Math.max(0, amount));
        setStatus(`Payment saved and queued. Dues reduced by: Rs.${amount.toFixed(2)}.`);
      }
      setTodayPaymentsVal(prev => prev + amount);
      setVoiceAmount("");
      setPendingVoiceCommand(null);
    } catch (error) {
      updateCustomerBalance(-Math.max(0, amount));
      setTodayPaymentsVal(prev => prev + amount);
      setVoiceAmount("");
      setPendingVoiceCommand(null);
      setDemoMode(true);
      setStatus(error instanceof Error ? `${error.message} Demo payment recorded: Rs.${amount.toFixed(2)}.` : `Demo payment recorded: Rs.${amount.toFixed(2)}.`);
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(String(new FormData(event.currentTarget).get("amount") ?? "0"));
    await executeSavePayment(amount);
  }

  function openCustomer(customer: Customer) {
    setSelectedCustomer(customer);
    setView("billing");
    setStatus(`${customer.name}'s account is open. Use Credit sale, Payment, Products, or AI.`);
  }

  function updateCustomerBalance(delta: number) {
    setSelectedCustomer((current) => {
      if (!current) {
        return current;
      }
      const nextBalance = Math.max(0, Number(current.outstandingBalance ?? "0") + delta).toFixed(2);
      const updated = { ...current, outstandingBalance: nextBalance };
      setCustomers((existing) => existing.map((customer) => customer.id === updated.id ? updated : customer));
      return updated;
    });
  }

  function parseLocalCommand(text: string, lang: Language) {
    const normalized = text.toLowerCase().trim().replace(/[.,!?_\-]/g, " ");
    let intent = "UNKNOWN";
    if (normalized.includes("open") || normalized.includes("account") || normalized.includes("khata") || normalized.includes("खोल") || normalized.includes("திற") || normalized.includes("கணக்கு")) {
      intent = "OPEN_CUSTOMER";
    }
    if (normalized.includes("paid") || normalized.includes("received") || normalized.includes("payment") || normalized.includes("ரூபாய்") || normalized.includes("பணம்") || normalized.includes("பற்று")) {
      intent = "RECEIVE_PAYMENT";
    }
    if (normalized.includes("add") || normalized.includes("sugar") || normalized.includes("rice") || normalized.includes("oil") || normalized.includes("dal") || normalized.includes("கடன்") || normalized.includes("சேர்")) {
      if (!normalized.includes("paid") && !normalized.includes("received")) {
        intent = "ADD_PURCHASE";
      }
    }
    if (normalized.includes("report") || normalized.includes("ledger") || normalized.includes("விற்பனை") || normalized.includes("அறிக்கை")) {
      intent = "SHOW_REPORT";
    }
    if (normalized.includes("confirm") || normalized.includes("சரி") || normalized.includes("சேமி")) {
      intent = "CONFIRM";
    }
    if (normalized.includes("cancel") || normalized.includes("வேண்டாம்")) {
      intent = "CANCEL";
    }

    let customerName: string | undefined = undefined;
    for (const c of customers) {
      if (normalized.includes(c.name.toLowerCase())) {
        customerName = c.name;
        break;
      }
    }

    let productAlias: string | undefined = undefined;
    for (const p of products) {
      const pName = getProductName(p, lang).toLowerCase();
      if (normalized.includes(pName) || normalized.includes(p.name.toLowerCase())) {
        productAlias = p.name;
        break;
      }
    }
    if (!productAlias) {
      if (normalized.includes("sugar") || normalized.includes("சர்க்கரை") || normalized.includes("चीनी")) productAlias = "Sugar 1 kg";
      else if (normalized.includes("rice") || normalized.includes("அரிசி") || normalized.includes("चावल")) productAlias = "Sona Masoori Rice";
      else if (normalized.includes("oil") || normalized.includes("எண்ணெய்") || normalized.includes("तेल")) productAlias = "Sunflower Oil 1 L";
      else if (normalized.includes("dal") || normalized.includes("பருப்பு") || normalized.includes("दाल")) productAlias = "Toor Dal 1 kg";
    }

    let amount: string | undefined = undefined;
    const amtMatch = normalized.match(/(?:rs|rupees|₹)?\s*(\d+(?:\.\d+)?)/);
    if (amtMatch) {
      amount = amtMatch[1];
    }

    let quantity: string | undefined = undefined;
    const qtyMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|packet|liter|litre|l)/);
    if (qtyMatch) {
      quantity = qtyMatch[1];
    } else {
      if (normalized.includes("one") || normalized.includes("ஒரு") || normalized.includes("एक") || normalized.includes("1")) quantity = "1";
      else if (normalized.includes("two") || normalized.includes("இரண்டு") || normalized.includes("दो") || normalized.includes("2")) quantity = "2";
      else if (normalized.includes("three") || normalized.includes("மூன்று") || normalized.includes("तीन") || normalized.includes("3")) quantity = "3";
    }

    return {
      intent,
      customerName,
      productAlias,
      amount,
      quantity,
      slots: {
        confidence: 0.98,
        detectedLanguage: lang,
        normalizedText: normalized,
        raw: text
      }
    };
  }

  async function executeDirectCommand(cmd: {
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }) {
    if (!cmd || !cmd.intent) return;
    const intent = cmd.intent.toUpperCase();
    if (intent === "OPEN_CUSTOMER" || intent === "ASK_BALANCE" || intent === "SEND_REMINDER") {
      if (cmd.customerName) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)));
        if (matched) {
          openCustomer(matched);
          if (intent === "ASK_BALANCE") {
            setActiveTask("ai");
            setStatus(`${matched.name}'s balance is Rs.${matched.outstandingBalance}.`);
          } else if (intent === "SEND_REMINDER") {
            setStatus(`SMS reminder prepared for ${matched.name}.`);
          } else {
            setStatus(`Opened customer account for ${matched.name}.`);
          }
        }
      }
    } else if (intent === "ADD_PURCHASE") {
      let currentCust = selectedCustomer;
      if (cmd.customerName) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query));
        if (matched) {
          openCustomer(matched);
          currentCust = matched;
        }
      }
      if (!currentCust) return;
      
      let matchedProd = selectedProduct;
      if (cmd.productAlias) {
        const alias = cmd.productAlias.toLowerCase().trim();
        const matchedProduct = products.find(p => p.name.toLowerCase().includes(alias) || p.sku.toLowerCase().includes(alias));
        if (matchedProduct) {
          setSelectedProduct(matchedProduct);
          matchedProd = matchedProduct;
        }
      }
      if (!matchedProd) return;
      
      let qty = "1";
      if (cmd.quantity) {
        const match = cmd.quantity.match(/\d+(\.\d+)?/);
        qty = match ? match[0] : "1";
      }
      
      setView("billing");
      setActiveTask("credit");
      setBusy(true);
      setStatus(`Directly executing: credit sale of ${qty} ${matchedProd.name} for ${currentCust.name}...`);
      try {
        await executeSaveCredit(matchedProd, qty);
        setStatus(`Successfully added ${qty} ${matchedProd.name} to ${currentCust.name}'s account.`);
      } catch (e) {
        setStatus("Direct save credit failed.");
      } finally {
        setBusy(false);
      }
    } else if (intent === "RECEIVE_PAYMENT") {
      let currentCust = selectedCustomer;
      if (cmd.customerName) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query));
        if (matched) {
          openCustomer(matched);
          currentCust = matched;
        }
      }
      if (!currentCust) return;
      
      let amt = 0;
      if (cmd.amount) {
        amt = Number(cmd.amount);
      }
      if (amt <= 0) return;
      
      setView("billing");
      setActiveTask("payment");
      setBusy(true);
      setStatus(`Directly executing: receiving payment of Rs.${amt} from ${currentCust.name}...`);
      try {
        await executeSavePayment(amt);
        setStatus(`Successfully received payment of Rs.${amt} from ${currentCust.name}.`);
      } catch (e) {
        setStatus("Direct save payment failed.");
      } finally {
        setBusy(false);
      }
    }
  }

  function handleVoiceCommand(cmd: {
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }) {
    if (!cmd || !cmd.intent) return;
    const intent = cmd.intent.toUpperCase();

    if (intent === "OPEN_CUSTOMER" || intent === "ASK_BALANCE" || intent === "SEND_REMINDER") {
      if (cmd.customerName) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)));
        if (matched) {
          openCustomer(matched);
          if (intent === "ASK_BALANCE") {
            setActiveTask("ai");
            setStatus(`${matched.name}'s balance is Rs.${matched.outstandingBalance}.`);
          } else if (intent === "SEND_REMINDER") {
            setStatus(`SMS reminder prepared for ${matched.name}.`);
          }
        } else {
          setStatus(`No customer found matching "${cmd.customerName}".`);
        }
      } else if (selectedCustomer) {
        if (intent === "ASK_BALANCE") {
          setActiveTask("ai");
          setStatus(`${selectedCustomer.name}'s balance is Rs.${selectedCustomer.outstandingBalance}.`);
        } else if (intent === "SEND_REMINDER") {
          setStatus(`SMS reminder prepared for ${selectedCustomer.name}.`);
        }
      } else {
        setStatus("Which customer account should I open?");
        setView("customers");
      }
    } else if (intent === "ADD_PURCHASE") {
      let currentCust = selectedCustomer;
      if (cmd.customerName && (!selectedCustomer || selectedCustomer.name.toLowerCase() !== cmd.customerName.toLowerCase())) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query));
        if (matched) {
          openCustomer(matched);
          currentCust = matched;
        }
      }
      if (!currentCust) {
        setStatus("Open or search a customer account first to record a credit sale.");
        setView("customers");
        return;
      }
      setView("billing");
      setActiveTask("credit");
      
      let matchedProd = selectedProduct;
      if (cmd.productAlias) {
        const alias = cmd.productAlias.toLowerCase().trim();
        const matchedProduct = products.find(p => p.name.toLowerCase().includes(alias) || p.sku.toLowerCase().includes(alias));
        if (matchedProduct) {
          setSelectedProduct(matchedProduct);
          matchedProd = matchedProduct;
        }
      }
      
      let qty = "1";
      if (cmd.quantity) {
        const match = cmd.quantity.match(/\d+(\.\d+)?/);
        qty = match ? match[0] : "1";
        setVoiceQuantity(qty);
      } else {
        setVoiceQuantity("1");
      }
      
      setPendingVoiceCommand({
        intent: "ADD_PURCHASE",
        customerName: currentCust.name,
        productAlias: matchedProd ? matchedProd.name : (cmd.productAlias || "Product"),
        quantity: qty
      });
      setStatus(`Confirm voice action: credit sale of ${matchedProd ? matchedProd.name : "product"} for ${currentCust.name}?`);
      
    } else if (intent === "RECEIVE_PAYMENT") {
      let currentCust = selectedCustomer;
      if (cmd.customerName && (!selectedCustomer || selectedCustomer.name.toLowerCase() !== cmd.customerName.toLowerCase())) {
        const query = cmd.customerName.toLowerCase().trim();
        const matched = customers.find(c => c.name.toLowerCase().includes(query));
        if (matched) {
          openCustomer(matched);
          currentCust = matched;
        }
      }
      if (!currentCust) {
        setStatus("Open or search a customer account first to record a payment.");
        setView("customers");
        return;
      }
      setView("billing");
      setActiveTask("payment");
      
      let amt = "0";
      if (cmd.amount) {
        amt = String(cmd.amount);
        setVoiceAmount(amt);
      } else {
        setVoiceAmount("");
      }
      
      setPendingVoiceCommand({
        intent: "RECEIVE_PAYMENT",
        customerName: currentCust.name,
        amount: amt
      });
      setStatus(`Confirm voice action: record payment of Rs.${amt} from ${currentCust.name}?`);
      
    } else if (intent === "SHOW_REPORT") {
      setView("ai");
      setActiveTask("ai");
      setStatus("Opening reports and AI insights.");
    } else if (intent === "CONFIRM") {
      if (pendingVoiceCommand) {
        if (pendingVoiceCommand.intent === "ADD_PURCHASE") {
          if (selectedProduct) {
            executeSaveCredit(selectedProduct, voiceQuantity);
          } else {
            setStatus("No product selected to save.");
          }
        } else if (pendingVoiceCommand.intent === "RECEIVE_PAYMENT") {
          executeSavePayment(Number(voiceAmount || 0));
        }
      } else {
        const activeForm = document.querySelector("form");
        if (activeForm) {
          setStatus("Confirming action...");
          activeForm.requestSubmit();
        } else {
          setStatus("No active transaction form to confirm.");
        }
      }
    } else if (intent === "CANCEL") {
      setSelectedProduct(null);
      setVoiceAmount("");
      setVoiceQuantity("1");
      setPendingVoiceCommand(null);
      setStatus("Action cancelled.");
    } else if (intent === "UNDO") {
      setStatus("Undo action not supported in this version.");
    }
  }

  function handleConfirmVoice() {
    if (pendingVoiceCommand) {
      if (pendingVoiceCommand.intent === "ADD_PURCHASE") {
        let prod = selectedProduct;
        if (!prod && pendingVoiceCommand.productAlias) {
          const alias = pendingVoiceCommand.productAlias.toLowerCase().trim();
          prod = products.find(p => p.name.toLowerCase().includes(alias) || p.sku.toLowerCase().includes(alias)) || null;
        }
        if (prod) {
          executeSaveCredit(prod, voiceQuantity);
        } else {
          setStatus("No product selected or found to save.");
        }
      } else if (pendingVoiceCommand.intent === "RECEIVE_PAYMENT") {
        executeSavePayment(Number(voiceAmount || 0));
      }
      setPendingVoiceCommand(null);
    }
  }

  function handleCancelVoice() {
    setPendingVoiceCommand(null);
    setSelectedProduct(null);
    setVoiceAmount("");
    setVoiceQuantity("1");
    setStatus("Voice action cancelled.");
  }


  return (
    <main className="min-h-screen bg-[#f4f7f1] pb-28 text-ink">
      <section className="border-b border-leaf-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-13 w-13 items-center justify-center rounded-md bg-leaf-600 text-white shadow-soft">
              <Store className="h-7 w-7" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-leaf-700">{copy.appName}</p>
              <h1 className="text-2xl font-black sm:text-3xl">{copy.productName}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-h-11 items-center gap-2 rounded-md border border-leaf-100 bg-leaf-50 px-3 text-sm font-bold text-leaf-900">
              <Languages className="h-4 w-4" aria-hidden />
              <select className="bg-transparent outline-none" value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Language">
                <option value="ENGLISH">English</option>
                <option value="TAMIL">தமிழ்</option>
                <option value="HINDI">हिन्दी</option>
                <option value="TELUGU">తెలుగు</option>
                <option value="KANNADA">ಕನ್ನಡ</option>
                <option value="MALAYALAM">മലയാളം</option>
              </select>
            </label>
            <StatusPill icon={online ? ShieldCheck : WifiOff} label={online ? copy.online : copy.offline} />
            <StatusPill icon={MessageCircle} label={`${queueSize} ${copy.offlineQueue}`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-5">
        <div className="grid gap-2 rounded-md bg-white p-2 shadow-sm sm:grid-cols-5">
          <NavButton icon={LayoutDashboard} label={copy.admin} active={view === "admin"} onClick={() => setView("admin")} />
          <NavButton icon={UsersRound} label={copy.customers} active={view === "customers"} onClick={() => setView("customers")} />
          <NavButton icon={ReceiptText} label={copy.billing} active={view === "billing"} onClick={() => setView("billing")} />
          <NavButton icon={PackageSearch} label={copy.products} active={view === "products"} onClick={() => { setView("products"); setActiveTask("products"); }} />
          <NavButton icon={Bot} label={copy.ai} active={view === "ai"} onClick={() => { setView("ai"); setActiveTask("ai"); }} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-4">
        <SummaryTile icon={IndianRupee} label={copy.todaySales} value={`Rs.${todaySalesVal.toLocaleString()}`} tone="bg-leaf-600 text-white" />
        <SummaryTile icon={CreditCard} label={copy.todayCredit} value={`Rs.${todayCreditVal.toLocaleString()}`} tone="bg-[#fff3c7] text-[#644b00]" />
        <SummaryTile icon={WalletCards} label={copy.todayPayments} value={`Rs.${todayPaymentsVal.toLocaleString()}`} tone="bg-[#e8f1ff] text-[#1f5f9f]" />
        <SummaryTile icon={UsersRound} label={copy.pendingBalance} value={`Rs.${customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} tone="bg-[#ffe9e3] text-chilli" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 lg:grid-cols-[0.9fr_1.4fr_0.8fr]">
        <aside className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-md bg-white p-4 shadow-soft">
            <h2 className="text-xl font-black">{copy.connectShop}</h2>
            <p className="mt-1 text-sm font-semibold text-ink/60">{copy.connectShopHint}</p>
            <form onSubmit={submitAuth} className="mt-3 space-y-3">
              <Input name="phone" label={copy.phone} />
              <Input name="password" label={copy.password} type="password" />
              <Input name="shopName" label={copy.shopName} required={false} />
              <Input name="ownerName" label={copy.ownerName} required={false} />
              <button disabled={busy} className="min-h-12 w-full rounded-md bg-ink px-4 font-black text-white disabled:opacity-60">{hasToken ? copy.connected : copy.loginRegister}</button>
              <button type="button" onClick={() => { setDemoMode(true); setHasToken(true); setView("admin"); setStatus("Demo admin access enabled. All portal buttons are available for testing."); }} className="min-h-12 w-full rounded-md bg-leaf-50 px-4 font-black text-leaf-700">
                {copy.openAdminDemo}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-md bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{copy.customers}</h2>
              <UserRoundCheck className="h-6 w-6 text-leaf-700" aria-hidden />
            </div>
            <form onSubmit={submitCustomerSearch} className="mt-3 flex min-h-12 items-center rounded-md border border-leaf-100 bg-leaf-50 px-3">
              <Search className="h-5 w-5 text-leaf-700" aria-hidden />
              <input name="query" className="ml-2 w-full bg-transparent text-base font-semibold outline-none" placeholder={copy.searchCustomer} />
            </form>
            <form onSubmit={submitCreateCustomer} className="mt-3 grid gap-2">
              <Input name="name" label={copy.newCustomerName} />
              <Input name="phone" label={copy.phone} required={false} />
              <button disabled={busy} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 font-black text-white disabled:opacity-60">
                <Plus className="h-5 w-5" aria-hidden /> {copy.createAndOpen}
              </button>
            </form>
          </motion.div>
        </aside>

        <section className="space-y-4">
          <CustomerWorkspace
            busy={busy}
            view={view}
            demoMode={demoMode}
            hasToken={hasToken}
            customer={selectedCustomer}
            customers={customers}
            activeTask={activeTask}
            products={products}
            selectedProduct={selectedProduct}
            status={status}
            transcript={transcript}
            onOpenCustomer={openCustomer}
            onTask={setActiveTask}
            onView={setView}
            onProductSearch={submitProductSearch}
            onProductSelect={(product) => {
              addToCart(product, "1");
              setActiveTask("credit");
              if (selectedCustomer) {
                setView("billing");
              }
            }}
            onCreditSubmit={submitCreditBill}
            onPaymentSubmit={submitPayment}
            copy={copy}
            voiceQuantity={voiceQuantity}
            setVoiceQuantity={setVoiceQuantity}
            voiceAmount={voiceAmount}
            setVoiceAmount={setVoiceAmount}
            pendingVoiceCommand={pendingVoiceCommand}
            onConfirmVoice={handleConfirmVoice}
            onCancelVoice={handleCancelVoice}
            merchantUpiId={merchantUpiId}
            onChangeUpiId={handleUpdateUpiId}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onAddCustomProduct={addCustomProductToStore}
            onEditProduct={editProductPriceAndStock}
            onToggleProduct={toggleProductActive}
            language={language}
          />
        </section>

        <aside className="space-y-4">
          <AIAssistant
            status={status}
            setStatus={setStatus}
            copy={copy}
            language={language}
            customer={selectedCustomer}
            transcript={transcript}
            customers={customers}
            products={products}
            aiQueryOverride={aiQueryOverride}
            setAiQueryOverride={setAiQueryOverride}
            onRunCommand={handleVoiceCommand}
          />
          <VoiceCard
            transcript={transcript}
            onChangeTranscript={setTranscript}
            copy={copy}
            onSendToAi={() => {
              if (transcript.trim()) {
                setAiQueryOverride(transcript.trim());
                setView("ai");
                setActiveTask("ai");
                setStatus(`Sending question to AI: "${transcript.trim()}"`);
              }
            }}
            onRunCommand={async () => {
              if (transcript.trim()) {
                setBusy(true);
                setStatus("Parsing transaction command...");
                try {
                  let cmd = null;
                  if (!demoMode && navigator.onLine) {
                    try {
                      cmd = await parseVoiceCommand(transcript.trim(), language);
                    } catch (e) {
                      console.log("Online parsing unavailable, using local parser.");
                    }
                  }
                  if (!cmd) {
                    cmd = parseLocalCommand(transcript.trim(), language);
                  }

                  if (cmd) {
                    const confidence = cmd.slots?.confidence ?? 0.85;
                    if (confidence >= 0.95) {
                      await executeDirectCommand(cmd);
                    } else if (confidence >= 0.80) {
                      handleVoiceCommand(cmd);
                    } else {
                      setStatus("Confidence too low. Please repeat your query clearly.");
                      setLearningWord(transcript.trim());
                    }
                  } else {
                    setStatus("Could not parse command. Try using format like: 'Kumar Stores payment 500 rupees'.");
                  }
                } catch (error) {
                  setStatus("Failed to parse command.");
                } finally {
                  setBusy(false);
                }
              }
            }}
          />
          {learningWord && (
            <div className="mt-3 rounded-md border border-leaf-200 bg-leaf-50 p-4 shadow-sm">
              <p className="text-sm font-semibold text-leaf-800">
                I encountered an unknown word/phrase: <span className="font-black text-leaf-900">"{learningWord}"</span>.
              </p>
              <p className="text-xs text-ink/75 font-semibold mt-1">Teach GramMart AI: is this an alias for one of these?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => learnAlias("PRODUCT", p.id, learningWord)}
                    className="rounded bg-white px-2 py-1 text-xs font-black text-leaf-700 border border-leaf-100 hover:border-leaf-600 transition"
                  >
                    Alias for {p.name}
                  </button>
                ))}
                {customers.slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    onClick={() => learnAlias("CUSTOMER", c.name, learningWord)}
                    className="rounded bg-white px-2 py-1 text-xs font-black text-leaf-700 border border-leaf-100 hover:border-leaf-600 transition"
                  >
                    Alias for {c.name}
                  </button>
                ))}
                <button
                  onClick={() => setLearningWord("")}
                  className="rounded bg-leaf-200 px-2 py-1 text-xs font-black text-leaf-700 hover:bg-leaf-300 transition"
                >
                  Ignore
                </button>
              </div>
            </div>
          )}
          {pendingVoiceCommand && (
            <div className="mt-3 rounded-md border border-leaf-200 bg-white p-4 shadow-md">
              <p className="text-xs font-black uppercase tracking-wide text-leaf-700 mb-2">Pending Voice Command</p>
              <VoiceCommandVerificationCard
                command={pendingVoiceCommand}
                onConfirm={handleConfirmVoice}
                onCancel={handleCancelVoice}
                copy={copy}
              />
            </div>
          )}
        </aside>
      </section>

      <FloatingMic language={language} copy={copy} onTranscript={(value) => {
        setTranscript(value);
        if (value) {
          setStatus(value);
        }
      }} onCommandParsed={handleVoiceCommand} />
    </main>
  );
}

function CustomerWorkspace(props: {
  busy: boolean;
  view: View;
  demoMode: boolean;
  hasToken: boolean;
  customer: Customer | null;
  customers: Customer[];
  activeTask: Task;
  products: Product[];
  selectedProduct: Product | null;
  status: string;
  transcript: string;
  onOpenCustomer: (customer: Customer) => void;
  onTask: (task: Task) => void;
  onView: (view: View) => void;
  onProductSearch: (event: FormEvent<HTMLFormElement>) => void;
  onProductSelect: (product: Product) => void;
  onCreditSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPaymentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  copy: ReturnType<typeof t>;
  voiceQuantity: string;
  setVoiceQuantity: (val: string) => void;
  voiceAmount: string;
  setVoiceAmount: (val: string) => void;
  pendingVoiceCommand: { intent: string; customerName?: string; productAlias?: string; amount?: string; quantity?: string } | null;
  onConfirmVoice: () => void;
  onCancelVoice: () => void;
  merchantUpiId: string;
  onChangeUpiId: (id: string) => void;
  language: Language;
  cart: Array<{ product: Product; quantity: string }>;
  onAddToCart: (product: Product, quantity: string) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onAddCustomProduct: (name: string, price: number) => void;
  onEditProduct: (productId: string, sellingPrice: string, stockQuantity: string, purchasePrice?: string, mrp?: string) => void;
  onToggleProduct: (productId: string, enabled: boolean) => void;
}) {
  const { customer, customers, activeTask, onTask, view } = props;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-h-[640px] rounded-md bg-white p-4 shadow-soft">
      {view === "admin" ? (
        <AdminPanel customers={customers} status={props.status} demoMode={props.demoMode} hasToken={props.hasToken} onView={props.onView} copy={props.copy} merchantUpiId={props.merchantUpiId} onChangeUpiId={props.onChangeUpiId} />
      ) : view === "customers" ? (
        <CustomerDirectory customers={customers} onOpenCustomer={props.onOpenCustomer} copy={props.copy} />
      ) : view === "products" ? (
        <ProductSearchPanel products={props.products} onSearch={props.onProductSearch} onSelect={props.onProductSelect} busy={props.busy} copy={props.copy} language={props.language} onAddCustomProduct={props.onAddCustomProduct} onEditProduct={props.onEditProduct} onToggleProduct={props.onToggleProduct} />
      ) : view === "ai" && !customer ? (
        <AdminInsights customers={customers} products={props.products} language={props.language} transcript={props.transcript} copy={props.copy} />
      ) : !customer ? (
        <div className="flex min-h-[560px] flex-col justify-between rounded-md bg-leaf-50 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{props.copy.customerAccountFirst}</p>
            <h2 className="mt-2 text-3xl font-black">{props.copy.openCustomerToStart}</h2>
            <p className="mt-3 max-w-xl text-lg font-semibold text-ink/65">{props.copy.openCustomerHint}</p>
          </div>
          <div className="grid gap-3">
            {customers.slice(0, 5).map((item) => <CustomerCard key={item.id} customer={item} onClick={() => props.onOpenCustomer(item)} />)}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-ink p-5 text-white">
            <p className="text-sm font-black uppercase tracking-wide text-white/65">{props.copy.customerAccount}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-4xl font-black">{customer.name}</h2>
                <p className="mt-1 text-lg text-white/75">{customer.phone || props.copy.noPhone}</p>
              </div>
              <div className="rounded-md bg-white/10 p-3 text-right">
                <p className="text-sm font-bold text-white/65">{props.copy.outstanding}</p>
                <p className="text-3xl font-black">Rs.{customer.outstandingBalance ?? "0"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <ActionButton icon={CreditCard} label={props.copy.addPurchase} active={activeTask === "credit"} onClick={() => onTask("credit")} />
            <ActionButton icon={IndianRupee} label={props.copy.receivePayment} active={activeTask === "payment"} onClick={() => onTask("payment")} />
            <ActionButton icon={PackageSearch} label={props.copy.products} active={activeTask === "products"} onClick={() => onTask("products")} />
            <ActionButton icon={Bot} label={props.copy.askAssistant} active={activeTask === "ai"} onClick={() => onTask("ai")} />
          </div>

          {props.pendingVoiceCommand && (
            <VoiceCommandVerificationCard
              command={props.pendingVoiceCommand}
              onConfirm={props.onConfirmVoice}
              onCancel={props.onCancelVoice}
              copy={props.copy}
            />
          )}

          <div className="rounded-md border border-leaf-100 bg-[#fbfcf8] p-4">
            {activeTask === "products" && <ProductSearchPanel products={props.products} onSearch={props.onProductSearch} onSelect={props.onProductSelect} busy={props.busy} copy={props.copy} language={props.language} onAddCustomProduct={props.onAddCustomProduct} onEditProduct={props.onEditProduct} onToggleProduct={props.onToggleProduct} />}
            {activeTask === "credit" && (
              <CreditPanel
                product={props.selectedProduct}
                onSubmit={props.onCreditSubmit}
                onFindProduct={() => { props.onView("products"); onTask("products"); }}
                busy={props.busy}
                copy={props.copy}
                value={props.voiceQuantity}
                onChange={props.setVoiceQuantity}
                language={props.language}
                cart={props.cart}
                onAddToCart={props.onAddToCart}
                onRemoveFromCart={props.onRemoveFromCart}
                onClearCart={props.onClearCart}
              />
            )}
            {activeTask === "payment" && (
              <PaymentPanel
                onSubmit={props.onPaymentSubmit}
                busy={props.busy}
                copy={props.copy}
                value={props.voiceAmount}
                onChange={props.setVoiceAmount}
                customerName={customer.name}
                outstandingBalance={customer.outstandingBalance ?? "0"}
                merchantUpiId={props.merchantUpiId}
              />
            )}
            {(view === "ai" || activeTask === "ai") && <InlineAI customer={customer} transcript={props.transcript} copy={props.copy} />}
          </div>

          <div className="rounded-md bg-leaf-50 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{props.copy.liveStatus}</p>
            <p className="mt-1 text-lg font-bold" role="status">{props.busy ? props.copy.listening : props.status === "Ready" ? props.copy.ready : props.status}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function AdminPanel({
  customers,
  status,
  demoMode,
  hasToken,
  onView,
  copy,
  merchantUpiId,
  onChangeUpiId
}: {
  customers: Customer[];
  status: string;
  demoMode: boolean;
  hasToken: boolean;
  onView: (view: View) => void;
  copy: ReturnType<typeof t>;
  merchantUpiId: string;
  onChangeUpiId: (id: string) => void;
}) {
  const pending = customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0);
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-ink p-5 text-white">
        <p className="text-sm font-black uppercase tracking-wide text-white/60">{copy.adminAccess}</p>
        <h2 className="mt-2 text-4xl font-black">{copy.shopControlCenter}</h2>
        <p className="mt-2 text-lg font-semibold text-white/70">{demoMode ? copy.demoAdminActive : hasToken ? copy.backendSessionActive : copy.connectOrDemo}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminMetric label={copy.customerCount} value={String(customers.length)} />
        <AdminMetric label={copy.pendingCredit} value={`Rs.${pending.toFixed(0)}`} />
        <AdminMetric label={copy.system} value={demoMode ? copy.demo : hasToken ? copy.connected : copy.locked} />
      </div>

      <div className="rounded-md border border-leaf-100 bg-[#fbfcf8] p-4">
        <h3 className="text-lg font-black text-leaf-900">{copy.upiSettings}</h3>
        <p className="text-sm text-ink/75 font-semibold mt-1">{copy.upiSettingsHint}</p>
        <div className="mt-3">
          <label className="block text-xs font-black uppercase tracking-wider text-ink/65">{copy.merchantUpiIdLabel}</label>
          <input
            type="text"
            value={merchantUpiId}
            onChange={(e) => onChangeUpiId(e.target.value)}
            placeholder="e.g. shopname@upi"
            className="mt-1 min-h-11 w-full rounded-md border border-leaf-100 bg-white px-3 font-bold text-ink outline-none focus:border-leaf-600"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AdminAction icon={UsersRound} title={copy.viewCustomerDetails} text={copy.viewCustomerDetailsHint} onClick={() => onView("customers")} />
        <AdminAction icon={ReceiptText} title={copy.startBilling} text={copy.startBillingHint} onClick={() => onView("billing")} />
        <AdminAction icon={PackageSearch} title={copy.productCatalog} text={copy.productCatalogHint} onClick={() => onView("products")} />
        <AdminAction icon={BarChart3} title={copy.reports} text={status} onClick={() => onView("ai")} />
      </div>
    </div>
  );
}

function CustomerDirectory({ customers, onOpenCustomer, copy }: { customers: Customer[]; onOpenCustomer: (customer: Customer) => void; copy: ReturnType<typeof t> }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-md bg-leaf-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{copy.customerDetails}</p>
          <h2 className="text-3xl font-black">{copy.customerDirectory}</h2>
        </div>
        <p className="rounded-md bg-white px-3 py-2 font-black text-leaf-700">{customers.length} {copy.accounts}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {customers.map((customer) => <CustomerCard key={customer.id} customer={customer} onClick={() => onOpenCustomer(customer)} />)}
      </div>
    </div>
  );
}

function AdminInsights({
  customers,
  products,
  language,
  transcript,
  copy
}: {
  customers: Customer[];
  products: Product[];
  language: Language;
  transcript: string;
  copy: ReturnType<typeof t>;
}) {
  const totalPending = customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0);
  const topCustomer = [...customers].sort((a, b) => Number(b.outstandingBalance ?? "0") - Number(a.outstandingBalance ?? "0"))[0];

  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAlerts() {
      try {
        const response = await chatWithAi({
          message: "Analyze the current product catalog and customer listings. Suggest exactly 3 brief, predictive inventory restocking alerts or sales tips for the shopkeeper. Keep each point under 12 words. Make them specific (e.g., 'Stock up on Sunflower Oil, weddings are starting' or 'Restock Sugar, credit sales are high').",
          language,
          customers,
          products: products.map(p => ({
            ...p,
            name: getProductName(p, language)
          }))
        });
        if (active && response?.answer) {
          const points = response.answer
            .split(/\n+/)
            .map(p => p.replace(/^[-*•\d.\s]+/, "").trim())
            .filter(Boolean)
            .slice(0, 3);
          setAlerts(points.length > 0 ? points : [
            "Restock Sugar: credit requests are rising",
            "Order Sunflower Oil: wedding season demand expected",
            "Detergent stock is low: check Lakshmi account dues"
          ]);
        }
      } catch {
        if (active) {
          setAlerts([
            "Restock Sugar: credit requests are rising",
            "Order Sunflower Oil: wedding season demand expected",
            "Detergent stock is low: check Lakshmi account dues"
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAlerts();
    return () => { active = false; };
  }, [customers, products, language]);

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-ink p-5 text-white">
        <p className="text-sm font-black uppercase tracking-wide text-white/60">{copy.aiInsights}</p>
        <h2 className="mt-2 text-4xl font-black">{copy.shopAssistant}</h2>
        <p className="mt-2 text-lg font-semibold text-white/70">{copy.aiInsightsHint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-leaf-50 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{copy.totalOutstandingCredit}</p>
          <p className="mt-1 text-3xl font-black">Rs.{totalPending.toFixed(2)}</p>
        </div>
        <div className="rounded-md bg-leaf-50 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{copy.highestPendingBalance}</p>
          {topCustomer && Number(topCustomer.outstandingBalance) > 0 ? (
            <div>
              <p className="mt-1 text-xl font-black leading-none">{topCustomer.name}</p>
              <p className="mt-1 text-base font-bold text-ink/70">Rs.{topCustomer.outstandingBalance}</p>
            </div>
          ) : (
            <p className="mt-1 text-lg font-bold text-ink/65">{copy.noCustomerBalances}</p>
          )}
        </div>
      </div>
      <div className="rounded-md border-2 border-leaf-600 bg-[#f7fbf2] p-5 shadow-soft">
        <h3 className="flex items-center gap-2 text-xl font-black text-leaf-900">
          <Sparkles className="h-5 w-5 text-leaf-600 animate-pulse" aria-hidden />
          {copy.aiReplenishmentAlerts}
        </h3>

        {loading ? (
          <div className="mt-3 space-y-2 animate-pulse">
            <div className="h-4 w-11/12 rounded bg-leaf-100"></div>
            <div className="h-4 w-10/12 rounded bg-leaf-100"></div>
            <div className="h-4 w-9/12 rounded bg-leaf-100"></div>
          </div>
        ) : (
          <ul className="mt-3 space-y-2 text-base font-bold text-ink/80 list-inside list-disc">
            {alerts.map((alert, idx) => (
              <li key={idx} className="leading-snug">
                {alert}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md bg-leaf-50 p-4">
        <p className="text-sm font-black uppercase tracking-wide text-leaf-700">Live Status</p>
        <p className="mt-1 text-lg font-bold">{transcript ? `Voice: ${transcript}` : copy.waitingForVoice}</p>
      </div>
    </div>
  );
}

function ProductSearchPanel({
  products,
  onSearch,
  onSelect,
  busy,
  copy,
  language,
  onAddCustomProduct,
  onEditProduct,
  onToggleProduct
}: {
  products: Product[];
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onSelect: (product: Product) => void;
  busy: boolean;
  copy: ReturnType<typeof t>;
  language: Language;
  onAddCustomProduct: (name: string, price: number, extra?: any) => void;
  onEditProduct: (productId: string, sellingPrice: string, stockQuantity: string, purchasePrice?: string, mrp?: string) => void;
  onToggleProduct: (productId: string, enabled: boolean) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [editSellingPrice, setEditSellingPrice] = useState("");
  const [editStockQuantity, setEditStockQuantity] = useState("");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editMrp, setEditMrp] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("30.00");
  const [customCategory, setCustomCategory] = useState("Staples");
  const [customBrand, setCustomBrand] = useState("Generic");
  const [customUnit, setCustomUnit] = useState("kg");
  const [customBarcode, setCustomBarcode] = useState("");

  const categoriesList = ["All", "Staples", "Dairy", "Spices", "Snacks", "Beverages", "Personal Care", "Household Care", "Vegetables"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Staples": return "🌾";
      case "Dairy": return "🥛";
      case "Spices": return "🌶️";
      case "Snacks": return "🍪";
      case "Beverages": return "☕";
      case "Personal Care": return "🧼";
      case "Household Care": return "🧹";
      case "Vegetables": return "🥦";
      default: return "📦";
    }
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div>
      <h3 className="text-2xl font-black">{copy.productSearch}</h3>
      
      <form onSubmit={onSearch} className="mt-3 flex min-h-14 items-center rounded-md border border-leaf-100 bg-white px-3">
        <Search className="h-5 w-5 text-leaf-700" aria-hidden />
        <input name="query" className="ml-2 w-full bg-transparent text-lg font-bold outline-none text-ink" placeholder={copy.productSearchPlaceholder} />
        <button disabled={busy} className="rounded-md bg-leaf-600 px-4 py-2 font-black text-white disabled:opacity-60">{copy.search}</button>
      </form>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoriesList.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition whitespace-nowrap ${
              selectedCategory === cat 
                ? "bg-leaf-600 text-white" 
                : "bg-leaf-50 text-leaf-700 hover:bg-leaf-100"
            }`}
          >
            <span>{getCategoryIcon(cat)}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-4 p-4 rounded-md border border-dashed border-leaf-200 bg-white text-center">
          <p className="text-sm font-bold text-ink/60">No products found matching selection.</p>
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-3 rounded-md bg-leaf-600 px-4 py-2 font-black text-white hover:bg-leaf-700 transition text-sm"
            >
              + Add Custom Product
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customName) {
                  onAddCustomProduct(customName, Number(customPrice || 0), {
                    category: customCategory,
                    brand: customBrand,
                    unit: customUnit,
                    barcode: customBarcode
                  });
                  setShowAddForm(false);
                  setCustomName("");
                }
              }}
              className="mt-3 grid gap-3 text-left max-w-md mx-auto bg-leaf-50/50 p-4 rounded-md border border-leaf-100"
            >
              <h4 className="font-black text-leaf-800">Add New Grocery Product</h4>
              <div>
                <label className="text-xs font-bold text-ink/75">Product Name</label>
                <input
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded border border-leaf-200 bg-white p-2 text-sm font-bold outline-none text-ink mt-1"
                  placeholder="e.g. Milk 1 Packet"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-ink/75">Selling Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full rounded border border-leaf-200 bg-white p-2 text-sm font-bold outline-none text-ink mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink/75">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full rounded border border-leaf-200 bg-white p-2 text-sm font-bold outline-none text-ink mt-1"
                  >
                    {categoriesList.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-ink/75">Brand Name</label>
                  <input
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full rounded border border-leaf-200 bg-white p-2 text-sm font-bold outline-none text-ink mt-1"
                    placeholder="Generic"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink/75">Unit</label>
                  <input
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full rounded border border-leaf-200 bg-white p-2 text-sm font-bold outline-none text-ink mt-1"
                    placeholder="kg, packet, L, etc."
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-ink/75">Barcode (Optional)</label>
                <input
                  value={customBarcode}
                  onChange={(e) => setCustomBarcode(e.target.value)}
                  className="w-full rounded border border-leaf-200 bg-white p-2 text-sm font-bold outline-none text-ink mt-1"
                  placeholder="Barcode"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button className="rounded bg-leaf-600 px-4 py-2 text-xs font-black text-white hover:bg-leaf-700 transition">
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded bg-leaf-100 px-4 py-2 text-xs font-black text-leaf-700 hover:bg-leaf-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {filteredProducts.map((p) => {
            const isEditing = editingProductId === p.id;
            const isEnabled = p.enabled !== false;
            
            return (
              <div 
                key={p.id} 
                className={`rounded-md border p-3 flex flex-col justify-between transition bg-white shadow-soft ${
                  isEnabled ? "border-leaf-100 hover:border-leaf-300" : "border-gray-200 opacity-60 bg-gray-50/30"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xl" title={p.category}>{getCategoryIcon(p.category ?? "")}</span>
                    <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[10px] font-black text-leaf-800 uppercase">
                      {p.brand || "Generic"}
                    </span>
                  </div>
                  <h4 className="mt-1 font-black text-ink text-sm sm:text-base leading-tight">
                    {getProductName(p, language)}
                  </h4>
                  <p className="text-xs font-bold text-ink/50 mt-0.5">
                    SKU: {p.sku} | Unit: {p.unit}
                  </p>
                  
                  <div className="mt-2 grid grid-cols-2 gap-1 bg-leaf-50/30 p-2 rounded text-xs border border-leaf-50">
                    <div>
                      <span className="text-ink/60 font-semibold">Sell Price:</span>{" "}
                      <span className="font-black text-leaf-800">Rs.{p.sellingPrice}</span>
                    </div>
                    <div>
                      <span className="text-ink/60 font-semibold">Stock:</span>{" "}
                      <span className="font-black text-ink">{p.stockQuantity || "0.00"} {p.unit}</span>
                    </div>
                    {p.mrp && (
                      <div>
                        <span className="text-ink/60 font-semibold">MRP:</span>{" "}
                        <span className="font-bold line-through text-red-700">Rs.{p.mrp}</span>
                      </div>
                    )}
                    {p.purchasePrice && (
                      <div>
                        <span className="text-ink/60 font-semibold">Cost:</span>{" "}
                        <span className="font-bold text-ink/80">Rs.{p.purchasePrice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      onEditProduct(p.id, editSellingPrice, editStockQuantity, editPurchasePrice, editMrp);
                      setEditingProductId(null);
                    }}
                    className="mt-3 pt-3 border-t border-leaf-100 space-y-2 text-left"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Selling Price</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editSellingPrice}
                          onChange={(e) => setEditSellingPrice(e.target.value)}
                          className="w-full rounded border border-leaf-200 bg-white p-1 text-xs font-bold outline-none text-ink mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Stock ({p.unit})</label>
                        <input
                          type="number"
                          step="0.001"
                          required
                          value={editStockQuantity}
                          onChange={(e) => setEditStockQuantity(e.target.value)}
                          className="w-full rounded border border-leaf-200 bg-white p-1 text-xs font-bold outline-none text-ink mt-0.5"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Purchase Cost</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editPurchasePrice}
                          onChange={(e) => setEditPurchasePrice(e.target.value)}
                          className="w-full rounded border border-leaf-200 bg-white p-1 text-xs font-bold outline-none text-ink mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">MRP Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editMrp}
                          onChange={(e) => setEditMrp(e.target.value)}
                          className="w-full rounded border border-leaf-200 bg-white p-1 text-xs font-bold outline-none text-ink mt-0.5"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button className="rounded bg-leaf-600 px-3 py-1.5 text-xs font-black text-white hover:bg-leaf-700 transition flex-1">
                        Save
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingProductId(null)}
                        className="rounded bg-leaf-100 px-3 py-1.5 text-xs font-black text-leaf-700 hover:bg-leaf-200 transition flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-3 flex gap-2 pt-3 border-t border-leaf-50">
                    <button
                      type="button"
                      onClick={() => onSelect(p)}
                      disabled={!isEnabled}
                      className="flex-1 rounded-md bg-leaf-600 px-3 py-1.5 text-xs font-black text-white hover:bg-leaf-700 transition disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(p.id);
                        setEditSellingPrice(p.sellingPrice);
                        setEditStockQuantity(p.stockQuantity || "0.00");
                        setEditPurchasePrice(p.purchasePrice || "0.00");
                        setEditMrp(p.mrp || "0.00");
                      }}
                      className="rounded-md border border-leaf-200 bg-white px-2 py-1.5 text-xs font-bold text-leaf-700 hover:bg-leaf-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleProduct(p.id, !isEnabled)}
                      className={`rounded-md px-2 py-1.5 text-xs font-black transition ${
                        isEnabled 
                          ? "bg-red-50 text-red-700 hover:bg-red-100" 
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {isEnabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreditPanel({
  product,
  onSubmit,
  onFindProduct,
  busy,
  copy,
  value,
  onChange,
  language,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart
}: {
  product: Product | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFindProduct: () => void;
  busy: boolean;
  copy: ReturnType<typeof t>;
  value: string;
  onChange: (val: string) => void;
  language: Language;
  cart: Array<{ product: Product; quantity: string }>;
  onAddToCart: (product: Product, quantity: string) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
}) {
  const totalBill = cart.reduce((sum, item) => sum + Number(item.product.sellingPrice) * Number(item.quantity), 0);

  return (
    <div>
      <h3 className="text-2xl font-black">{copy.addPurchase}</h3>
      
      {/* Search & Add Products */}
      <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-md border border-leaf-100">
        <span className="font-bold text-ink/70">Need more items?</span>
        <button type="button" onClick={onFindProduct} className="rounded bg-leaf-600 px-3 py-1.5 font-bold text-white hover:bg-leaf-700 transition">
          {copy.findProduct}
        </button>
      </div>

      {/* Cart Items List */}
      <div className="mt-3 space-y-2">
        <p className="text-sm font-bold uppercase tracking-wider text-leaf-700">Shopping Cart ({cart.length} items)</p>
        
        {cart.length === 0 ? (
          <div className="rounded-md border border-dashed border-leaf-200 bg-white p-6 text-center text-ink/50 font-medium">
            No items in cart. Add products to get started.
          </div>
        ) : (
          <div className="rounded-md bg-white border border-leaf-100 overflow-hidden">
            {cart.map((item) => {
              const itemTotal = Number(item.product.sellingPrice) * Number(item.quantity);
              return (
                <div key={item.product.id} className="flex items-center justify-between border-b border-leaf-50 p-3 last:border-b-0 hover:bg-leaf-50/30 transition">
                  <div className="flex-1">
                    <p className="font-black text-sm text-ink">{getProductName(item.product, language)}</p>
                    <p className="text-xs font-bold text-ink/50">Rs.{item.product.sellingPrice} each</p>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAddToCart(item.product, "-1")}
                      disabled={Number(item.quantity) <= 1}
                      className="h-6 w-6 rounded border border-leaf-200 bg-white font-bold text-ink hover:bg-leaf-50 disabled:opacity-50 transition flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onAddToCart(item.product, "1")}
                      className="h-6 w-6 rounded border border-leaf-200 bg-white font-bold text-ink hover:bg-leaf-50 transition flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-20 text-right font-black text-sm text-ink ml-3">
                    Rs.{itemTotal.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.product.id)}
                    className="ml-3 text-red-600 hover:text-red-800 transition font-black text-lg"
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              );
            })}
            
            <div className="bg-leaf-50/50 p-3 flex justify-between items-center border-t border-leaf-100">
              <button type="button" onClick={onClearCart} className="text-xs font-black text-red-600 hover:text-red-800 transition">
                Clear Cart
              </button>
              <div className="text-right">
                <span className="text-xs font-bold text-ink/60 mr-2">Total Due:</span>
                <span className="text-lg font-black text-leaf-800">Rs.{totalBill.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4">
        <button
          disabled={busy || cart.length === 0}
          className="min-h-14 w-full rounded-md bg-leaf-600 px-5 font-black text-white hover:bg-leaf-700 transition disabled:opacity-60 text-lg shadow-soft"
        >
          {copy.saveCredit} {cart.length > 0 ? `(Rs.${totalBill.toFixed(2)})` : ""}
        </button>
      </form>
    </div>
  );
}

function PaymentPanel({
  onSubmit,
  busy,
  copy,
  value,
  onChange,
  customerName,
  outstandingBalance,
  merchantUpiId
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  copy: ReturnType<typeof t>;
  value: string;
  onChange: (val: string) => void;
  customerName: string;
  outstandingBalance: string;
  merchantUpiId: string;
}) {
  const [showQr, setShowQr] = useState(false);
  const payAmount = value || outstandingBalance || "0";

  const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent("GramMart Merchant")}&am=${encodeURIComponent(payAmount)}&cu=INR&tn=${encodeURIComponent("Credit payoff for " + customerName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h3 className="text-2xl font-black">{copy.receivePayment}</h3>
        {Number(outstandingBalance) > 0 && (
          <button
            type="button"
            onClick={() => onChange(outstandingBalance)}
            className="text-sm font-black text-leaf-700 hover:text-leaf-800 underline text-left animate-pulse"
          >
            Fill Full Dues (Rs.{outstandingBalance})
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Input name="amount" label={copy.amountReceived} value={value} onChange={(e) => onChange(e.target.value)} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="min-h-14 rounded-md border-2 border-leaf-600 bg-white px-4 font-black text-leaf-700 hover:bg-leaf-50 transition"
          >
            {showQr ? "Hide QR" : "Show UPI QR"}
          </button>
          <button disabled={busy} className="min-h-14 flex-1 rounded-md bg-leaf-600 px-5 font-black text-white disabled:opacity-60">
            {copy.savePayment}
          </button>
        </div>
      </form>

      {showQr && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-col items-center gap-3 rounded-md border-2 border-leaf-100 bg-[#f7fbf2] p-5 text-center"
        >
          <div className="rounded-md bg-white p-3 shadow-sm border border-leaf-200">
            <img src={qrCodeUrl} alt="UPI QR Code" className="h-44 w-44 object-contain" />
          </div>
          <div>
            <p className="text-base font-black text-leaf-900">Scan to Pay: Rs.{payAmount}</p>
            <p className="text-xs font-bold text-ink/60 mt-1">UPI ID: {merchantUpiId}</p>
            <p className="text-xs font-bold text-ink/50 mt-1 max-w-sm">
              Use GPay, PhonePe, Paytm, or any banking app to scan this QR code. Once payment succeeds, click "{copy.savePayment}" to register.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InlineAI({ customer, transcript, copy }: { customer: Customer; transcript: string; copy: ReturnType<typeof t> }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-2xl font-black"><Sparkles className="h-6 w-6 text-leaf-700" aria-hidden /> {copy.aiHelp}</h3>
      <div className="mt-3 grid gap-2">
        <AssistantBubble text={`${customer.name} currently has Rs.${customer.outstandingBalance ?? "0"} pending.`} />
        <AssistantBubble text={transcript ? `Voice: ${transcript}` : copy.askCustomerOwes} />
        <AssistantBubble text={copy.reminderSuggestion} />
      </div>
    </div>
  );
}

const speechLangCodes: Record<Language, string> = {
  ENGLISH: "en-IN",
  TAMIL: "ta-IN",
  HINDI: "hi-IN",
  TELUGU: "te-IN",
  KANNADA: "kn-IN",
  MALAYALAM: "ml-IN"
};

function AIAssistant({
  status,
  setStatus,
  copy,
  language,
  customer,
  transcript,
  customers,
  products,
  aiQueryOverride,
  setAiQueryOverride,
  onRunCommand
}: {
  status: string;
  setStatus: (value: string) => void;
  copy: ReturnType<typeof t>;
  language: Language;
  customer: Customer | null;
  transcript: string;
  customers: Customer[];
  products: Product[];
  aiQueryOverride: string;
  setAiQueryOverride: (val: string) => void;
  onRunCommand: (cmd: {
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }) => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(status === "Ready" ? copy.ready : status);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (aiQueryOverride) {
      setQuestion("");
      void askQuestion(aiQueryOverride);
      setAiQueryOverride("");
    }
  }, [aiQueryOverride]);

  async function askQuestion(text: string) {
    setThinking(true);
    setAnswer(copy.listening);
    try {
      const response = await chatWithAi({
        message: text,
        language,
        customerName: customer?.name,
        outstandingBalance: customer?.outstandingBalance,
        transcript,
        customers,
        products: products.map(p => ({
          ...p,
          name: getProductName(p, language)
        }))
      });
      let nextAnswer = response?.answer ?? localAiAnswer(copy, customer);
      
      // Look for embedded structured command block
      const match = nextAnswer.match(/```action\s*([\s\S]*?)\s*```/);
      if (match) {
        try {
          const actionCmd = JSON.parse(match[1]);
          nextAnswer = nextAnswer.replace(/```action[\s\S]*?```/, "").trim();
          onRunCommand(actionCmd);
        } catch (e) {
          console.error("Failed to parse action from AI response:", e);
        }
      }

      setAnswer(nextAnswer);
      setStatus(nextAnswer);
    } catch {
      const nextAnswer = localAiAnswer(copy, customer);
      setAnswer(nextAnswer);
      setStatus(nextAnswer);
    } finally {
      setThinking(false);
    }
  }

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = question.trim() || transcript || copy.whoOwesMost;
    await askQuestion(message);
    setQuestion("");
  }

  return (
    <div className="rounded-md bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white"><Bot className="h-6 w-6" aria-hidden /></div>
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{copy.aiAssistant}</p>
          <h2 className="text-xl font-black">{copy.askSimpleWords}</h2>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <AssistantBubble text={copy.whoOwesMost} />
        <AssistantBubble text={copy.restockToday} />
        <AssistantBubble text={thinking ? copy.listening : answer === "Ready" ? copy.ready : answer || (status === "Ready" ? copy.ready : status)} speakable={true} language={language} />
      </div>

      {transcript && transcript !== "Listening..." && transcript !== "Speech recognition is not available in this browser." && (
        <button
          type="button"
          onClick={() => askQuestion(transcript)}
          className="mt-3 flex items-center gap-2 rounded-md bg-leaf-50 p-2 text-left text-sm font-bold text-leaf-700 hover:bg-leaf-100 transition w-full"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-leaf-600 animate-pulse" aria-hidden />
          <span>Ask AI about: <span className="italic">"{transcript}"</span></span>
        </button>
      )}

      <form onSubmit={ask} className="mt-3 space-y-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-11 w-full rounded-md border border-leaf-100 bg-leaf-50 px-3 font-bold outline-none focus:border-leaf-600" placeholder={copy.askSimpleWords} />
        <button disabled={thinking} className="min-h-11 w-full rounded-md bg-leaf-50 font-black text-leaf-700 disabled:opacity-60">{copy.askAssistant}</button>
      </form>
    </div>
  );
}

function localAiAnswer(copy: ReturnType<typeof t>, customer: Customer | null) {
  if (customer) {
    return `${customer.name}: Rs.${customer.outstandingBalance ?? "0"} pending. ${copy.suggestedNextStep}`;
  }
  return copy.suggestedNextStep;
}

function getProductName(product: Product, language: Language): string {
  if (language === "TAMIL" && product.nameTa) return product.nameTa;
  if (language === "HINDI" && product.nameHi) return product.nameHi;
  if (language === "TELUGU" && product.nameTe) return product.nameTe;
  if (language === "KANNADA" && product.nameKn) return product.nameKn;
  if (language === "MALAYALAM" && product.nameMl) return product.nameMl;
  return product.name;
}

function VoiceCard({
  transcript,
  onChangeTranscript,
  copy,
  onSendToAi,
  onRunCommand
}: {
  transcript: string;
  onChangeTranscript: (val: string) => void;
  copy: ReturnType<typeof t>;
  onSendToAi: () => void;
  onRunCommand: () => void;
}) {
  return (
    <div id="voice-panel" className="rounded-md bg-ink p-4 text-white shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-ink"><Mic className="h-6 w-6" aria-hidden /></div>
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-white/50">{copy.voiceFirst}</p>
          <h2 className="text-xl font-black">{copy.voiceAssistant}</h2>
        </div>
      </div>
      <p className="mt-3 text-white/70">{copy.voicePrompt}</p>
      
      <textarea
        value={transcript}
        onChange={(e) => onChangeTranscript(e.target.value)}
        placeholder={copy.waitingForVoice}
        className="mt-3 min-h-24 w-full rounded-md bg-white/10 p-3 text-lg font-bold text-white outline-none border border-white/10 focus:border-leaf-600 focus:bg-white/15 transition resize-none"
      />

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={onRunCommand}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-leaf-600 px-4 font-black text-white hover:bg-leaf-700 transition text-base disabled:opacity-40"
          disabled={!transcript || !transcript.trim() || transcript === "Listening..."}
        >
          <CircleCheck className="h-4 w-4" aria-hidden />
          Submit Voice Response
        </button>
        
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onSendToAi}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-4 font-bold text-white hover:bg-white/20 transition text-sm border border-white/5 disabled:opacity-40"
            disabled={!transcript || !transcript.trim() || transcript === "Listening..."}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Ask AI Assistant
          </button>
          <button
            type="button"
            onClick={() => onChangeTranscript("")}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white/10 px-4 font-bold text-white hover:bg-white/20 hover:text-chilli transition text-sm border border-white/5 disabled:opacity-40"
            disabled={!transcript || !transcript.trim()}
          >
            Clear Text
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerCard({ customer, onClick }: { customer: Customer; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md bg-white p-3 text-left shadow-sm hover:shadow-soft">
      <p className="text-lg font-black">{customer.name}</p>
      <p className="text-sm font-bold text-ink/60">{customer.phone || "No phone"}</p>
      <p className="mt-1 text-sm font-black text-leaf-700">Balance Rs.{customer.outstandingBalance ?? "0"}</p>
    </button>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }: { icon: typeof CreditCard; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-24 rounded-md p-3 text-left font-black shadow-sm transition ${active ? "bg-leaf-600 text-white" : "bg-leaf-50 text-ink hover:bg-leaf-100"}`}>
      <Icon className="h-7 w-7" aria-hidden />
      <span className="mt-3 block">{label}</span>
    </button>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-14 items-center justify-center gap-2 rounded-md px-3 font-black transition ${active ? "bg-ink text-white" : "bg-leaf-50 text-ink hover:bg-leaf-100"}`}>
      <Icon className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border border-leaf-100 bg-leaf-50 p-4">
      <p className="text-sm font-black uppercase tracking-wide text-leaf-700">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}

function AdminAction({ icon: Icon, title, text, onClick }: { icon: LucideIcon; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-32 rounded-md border border-leaf-100 bg-white p-4 text-left shadow-sm transition hover:border-leaf-600 hover:shadow-soft">
      <Icon className="h-7 w-7 text-leaf-700" aria-hidden />
      <p className="mt-3 text-xl font-black">{title}</p>
      <p className="mt-1 text-sm font-bold text-ink/60">{text}</p>
    </button>
  );
}

function SummaryTile({ icon: Icon, label, value, tone }: { icon: typeof IndianRupee; label: string; value: string; tone: string }) {
  return (
    <article className={`rounded-md p-4 shadow-soft ${tone}`}>
      <Icon className="h-7 w-7" aria-hidden />
      <p className="mt-4 text-sm font-black uppercase opacity-75">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </article>
  );
}

function StatusPill({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return <span className="flex min-h-11 items-center gap-2 rounded-md bg-white px-3 text-sm font-black shadow-sm"><Icon className="h-4 w-4 text-leaf-700" aria-hidden /> {label}</span>;
}

function AssistantBubble({ text, speakable, language }: { text: string; speakable?: boolean; language?: Language }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function handleSpeak() {
    if (speaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(false);
      return;
    }

    setSpeaking(true);

    try {
      const response = await fetch("http://localhost:5002/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          lang: language ? speechLangCodes[language]?.substring(0, 2) : "en"
        })
      });
      if (response.ok) {
        setTimeout(() => setSpeaking(false), text.length * 80);
        return;
      }
    } catch (e) {
      console.log("Local Python TTS service not active, falling back to Web Speech Synthesis API.");
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language ? speechLangCodes[language] : "en-IN";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="relative rounded-md bg-leaf-50 p-3 pr-10 text-sm font-bold text-ink/75">
      <p>{text}</p>
      {speakable && text && text !== "Ready" && text !== "Listening..." && text !== "Speech recognition is not available in this browser." && (
        <button
          type="button"
          onClick={handleSpeak}
          className={`absolute right-2 top-2 p-1 rounded-full transition hover:bg-leaf-100 ${speaking ? "text-leaf-600 bg-leaf-100" : "text-ink/50"}`}
          title="Speak aloud"
          aria-label="Speak aloud"
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function Input({ name, label, type = "text", required = true, defaultValue, value, onChange }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block flex-1 text-sm font-black text-ink/70">
      {label}
      <input name={name} type={type} required={required} defaultValue={defaultValue} value={value} onChange={onChange} className="mt-1 min-h-12 w-full rounded-md border border-leaf-100 bg-white px-3 text-lg font-bold text-ink outline-none focus:border-leaf-600" />
    </label>
  );
}

function VoiceCommandVerificationCard({
  command,
  onConfirm,
  onCancel,
  copy
}: {
  command: { intent: string; customerName?: string; productAlias?: string; amount?: string; quantity?: string };
  onConfirm: () => void;
  onCancel: () => void;
  copy: any;
}) {
  const isPurchase = command.intent.toUpperCase() === "ADD_PURCHASE";

  return (
    <div className="rounded-md border-2 border-leaf-600 bg-[#f7fbf2] p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-600 text-white animate-pulse">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h4 className="text-lg font-black text-leaf-900">Confirm Voice Action</h4>
          <p className="text-base font-bold text-ink/80">
            {isPurchase
              ? `Save credit purchase of "${command.productAlias}" (Qty: ${command.quantity}) for ${command.customerName}?`
              : `Save payment of Rs.${command.amount} from ${command.customerName}?`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 min-h-12 rounded-md bg-leaf-600 font-black text-white hover:bg-leaf-700 transition text-base"
        >
          {isPurchase ? "Save Credit" : "Save Payment"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 min-h-12 rounded-md bg-[#ffe9e3] font-black text-chilli hover:bg-[#ffdcd2] transition text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
