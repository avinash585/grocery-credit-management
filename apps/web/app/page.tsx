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
import { notifyCreditSale, notifyPaymentReceived } from "@/lib/whatsapp";
import { getDisplayName } from "@/lib/transliterate";
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
  {"id": "demo-rice-1", "sku": "RICE-001", "name": "Rice", "sellingPrice": "45.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அரிசி", "nameHi": "चावल", "nameTe": "బియ్యం", "nameKn": "ಅಕ್ಕಿ", "nameMl": "അരി"},
  {"id": "demo-rice-2", "sku": "RICE-002", "name": "Premium Basmati Rice", "sellingPrice": "140.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாஸ்மதி அரிசி", "nameHi": "बासमती चावल", "nameTe": "బాస్మతి బియ్యం", "nameKn": "ಬಾಸ್ಮತಿ ಅಕ್ಕಿ", "nameMl": "ബാസ്മതി അരി"},
  {"id": "demo-rice-3", "sku": "RICE-003", "name": "Sona Masoori Rice", "sellingPrice": "70.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோனா மசூரி அரிசி", "nameHi": "सोना मसूरी चावल", "nameTe": "సోనా మసూరి బియ్యం", "nameKn": "ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ", "nameMl": "സോന മസൂരി അരി"},
  {"id": "demo-rice-4", "sku": "RICE-004", "name": "Ponni Rice", "sellingPrice": "62.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பொன்னி அரிசி", "nameHi": "पोन्नी चावल", "nameTe": "పొన్ని బియ్యం", "nameKn": "ಪೊನ್ನಿ ಅಕ್ಕಿ", "nameMl": "പൊന്നി അരി"},
  {"id": "demo-rice-5", "sku": "RICE-005", "name": "Boiled Rice", "sellingPrice": "48.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "புழுங்கல் அரிசி", "nameHi": "उबला चावल", "nameTe": "ఉడికించిన బియ్యం", "nameKn": "ಬೇಯಿಸಿದ ಅಕ್ಕಿ", "nameMl": "പുഴുങ്ങലരി"},
  {"id": "demo-rice-6", "sku": "RICE-006", "name": "Broken Rice", "sellingPrice": "33.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "குருணை அரிசி", "nameHi": "टूटा चावल", "nameTe": "నూకలు", "nameKn": "ನುಚ್ಚು ಅಕ್ಕಿ", "nameMl": "നുറുക്കരി"},
  {"id": "demo-rice-7", "sku": "RICE-007", "name": "Brown Rice", "sellingPrice": "95.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கைக்குத்தல் அரிசி", "nameHi": "भूरा चावल", "nameTe": "దంపుడు బియ్యం", "nameKn": "ಕಂದು ಅಕ್ಕಿ", "nameMl": "തവിടുള്ള അരി"},
  {"id": "demo-wht-1", "sku": "WHT-001", "name": "Wheat", "sellingPrice": "32.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கோதுமை", "nameHi": "गेहूं", "nameTe": "గోధుమలు", "nameKn": "ಗೋಧಿ", "nameMl": "ഗോതമ്പ്"},
  {"id": "demo-wht-2", "sku": "WHT-002", "name": "Wheat Atta", "sellingPrice": "37.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கோதுமை மாவு", "nameHi": "गेहूं का आटा", "nameTe": "గోధుమ పిండి", "nameKn": "ಗೋಧಿ ಹಿಟ್ಟು", "nameMl": "ഗോതമ്പ് പൊടി"},
  {"id": "demo-wht-3", "sku": "WHT-003", "name": "Maida", "sellingPrice": "42.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மைதா மாவு", "nameHi": "मैदा", "nameTe": "మైదా పిండి", "nameKn": "ಮೈದಾ ಹಿಟ್ಟು", "nameMl": "മൈദ"},
  {"id": "demo-wht-4", "sku": "WHT-004", "name": "Rava / Sooji", "sellingPrice": "47.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "ரவா", "nameHi": "सूजी / रवा", "nameTe": "రవ్వ", "nameKn": "ರವೆ", "nameMl": "റവ"},
  {"id": "demo-wht-5", "sku": "WHT-005", "name": "Besan", "sellingPrice": "96.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடலை மாவு", "nameHi": "बेसन", "nameTe": "శనగ పిండి", "nameKn": "ಕಡಲೆ ಹಿಟ್ಟು", "nameMl": "കടലപ്പൊടി"},
  {"id": "demo-wht-6", "sku": "WHT-006", "name": "Corn Flour", "sellingPrice": "45.00", "category": "Rice & Grains", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோள மாவு", "nameHi": "मक्के का आटा", "nameTe": "మొక్కజొన్న పిండి", "nameKn": "ಮೆಕ್ಕೆಜೋಳದ ಹಿಟ್ಟು", "nameMl": "ചോളം പൊടി"},
  {"id": "demo-wht-7", "sku": "WHT-007", "name": "Rice Flour", "sellingPrice": "55.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அரிசி மாவு", "nameHi": "चावल का आटा", "nameTe": "వరి పిండి", "nameKn": "ಅಕ್ಕಿ ಹಿಟ್ಟು", "nameMl": "അരിപ്പൊടി"},
  {"id": "demo-wht-8", "sku": "WHT-008", "name": "Bajra", "sellingPrice": "40.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கம்பு", "nameHi": "बाजरा", "nameTe": "సజ్జలు", "nameKn": "ಸಜ್ಜೆ", "nameMl": "കമ്പ്"},
  {"id": "demo-wht-9", "sku": "WHT-009", "name": "Jowar", "sellingPrice": "45.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோளம்", "nameHi": "ज्वार", "nameTe": "జొన్నలు", "nameKn": "ಜೋಳ", "nameMl": "ചോളം"},
  {"id": "demo-wht-10", "sku": "WHT-010", "name": "Ragi Flour", "sellingPrice": "60.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கேழ்வரகு மாவு", "nameHi": "रागी का आटा", "nameTe": "రాగి పిండి", "nameKn": "ರಾಗಿ ಹಿಟ್ಟು", "nameMl": "രാഗി പൊടി"},
  {"id": "demo-wht-11", "sku": "WHT-011", "name": "Poha", "sellingPrice": "60.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அவல்", "nameHi": "पोहा", "nameTe": "అటుకులు", "nameKn": "ಅವಲಕ್ಕಿ", "nameMl": "അവൽ"},
  {"id": "demo-wht-12", "sku": "WHT-012", "name": "Aval", "sellingPrice": "60.00", "category": "Rice & Grains", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "அவல்", "nameHi": "चिड़वा", "nameTe": "అటుకులు", "nameKn": "ಅವಲಕ್ಕಿ", "nameMl": "അവൽ"},
  {"id": "demo-wht-13", "sku": "WHT-013", "name": "Vermicelli", "sellingPrice": "35.00", "category": "Rice & Grains", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சேமியா", "nameHi": "सेवई", "nameTe": "సేమ్యా", "nameKn": "ಶಾವಿಗೆ", "nameMl": "സേമിയ"},
  {"id": "demo-dal-1", "sku": "DAL-001", "name": "Toor Dal", "sellingPrice": "123.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "துவரம் பருப்பு", "nameHi": "अरहर दाल", "nameTe": "కందిపప్పు", "nameKn": "ತೊಗರಿ ಬೇಳೆ", "nameMl": "തുവര പരിപ്പ്"},
  {"id": "demo-dal-2", "sku": "DAL-002", "name": "Urad Dal", "sellingPrice": "120.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உளுத்தம் பருப்பு", "nameHi": "उड़द दाल", "nameTe": "మినప పప్పు", "nameKn": "ಉದ್ದಿನ ಬೇಳೆ", "nameMl": "ഉഴുന്ന് പരിപ്പ്"},
  {"id": "demo-dal-3", "sku": "DAL-003", "name": "Moong Dal", "sellingPrice": "112.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாசிப் பருப்பு", "nameHi": "मूंग दाल", "nameTe": "పెసర పప్పు", "nameKn": "ಹೆಸರು ಬೇಳೆ", "nameMl": "ചെറുപയർ പരിപ്പ്"},
  {"id": "demo-dal-4", "sku": "DAL-004", "name": "Masoor Dal", "sellingPrice": "90.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "மைசூர் பருப்பு", "nameHi": "मसूर दाल", "nameTe": "మసూర్ పప్పు", "nameKn": "ಮಸೂರ್ ಬೇಳೆ", "nameMl": "മസൂർ പരിപ്പ്"},
  {"id": "demo-dal-5", "sku": "DAL-005", "name": "Chana Dal", "sellingPrice": "86.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடலைப் பருப்பு", "nameHi": "चना दाल", "nameTe": "శనగ పప్పు", "nameKn": "ಕಡಲೆ ಬೇಳೆ", "nameMl": "കടല പരിപ്പ്"},
  {"id": "demo-dal-6", "sku": "DAL-006", "name": "Green Gram", "sellingPrice": "110.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பச்சைப் பயறு", "nameHi": "साबुत मूंग", "nameTe": "పెసలు", "nameKn": "ಹೆಸರು ಕಾಳು", "nameMl": "ചെറുപയർ"},
  {"id": "demo-dal-7", "sku": "DAL-007", "name": "Black Gram", "sellingPrice": "120.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உளுந்து", "nameHi": "साबुत उड़द", "nameTe": "మినుములు", "nameKn": "ಉದ್ದಿನ ಕಾಳು", "nameMl": "ഉഴുന്ന്"},
  {"id": "demo-dal-8", "sku": "DAL-008", "name": "Kabuli Chana", "sellingPrice": "130.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொண்டைக் கடலை", "nameHi": "काबुली चना", "nameTe": "కాబూలీ శనగలు", "nameKn": "ಕಬುಲಿ ಕಡಲೆ", "nameMl": "വെള്ളക്കടല"},
  {"id": "demo-dal-9", "sku": "DAL-009", "name": "White Peas", "sellingPrice": "90.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெள்ளை பட்டாணி", "nameHi": "सफेद मटर", "nameTe": "తెల్ల బఠానీలు", "nameKn": "ಬಿಳಿ ಬಟಾಣಿ", "nameMl": "വെള്ള പയർ"},
  {"id": "demo-dal-10", "sku": "DAL-010", "name": "Horse Gram", "sellingPrice": "95.00", "category": "Dal & Pulses", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொள்ளு", "nameHi": "कुलथी", "nameTe": "ఉలవలు", "nameKn": "ಹುರುಳಿ ಕಾಳು", "nameMl": "മുതിര"},
  {"id": "demo-oil-1", "sku": "OIL-001", "name": "Groundnut Oil", "sellingPrice": "205.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடலை எண்ணெய்", "nameHi": "मूंगफली तेल", "nameTe": "వేరుశనగ నూనె", "nameKn": "ಕಡಲೆಕಾಯಿ ಎಣ್ಣೆ", "nameMl": "കടല എണ്ണ"},
  {"id": "demo-oil-2", "sku": "OIL-002", "name": "Sunflower Oil", "sellingPrice": "189.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "சூரியகாந்தி எண்ணெய்", "nameHi": "सूरजमुखी तेल", "nameTe": "సన్‌ఫ్లవర్ ఆయిల్", "nameKn": "ಸೂರ್ಯಕಾಂತಿ ಎಣ್ಣೆ", "nameMl": "സൺഫ്ലവർ ഓയിൽ"},
  {"id": "demo-oil-3", "sku": "OIL-003", "name": "Mustard Oil", "sellingPrice": "194.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடுகு எண்ணெய்", "nameHi": "सरसों का तेल", "nameTe": "ఆవ నూనె", "nameKn": "ಸಾಸಿವೆ ಎಣ್ಣೆ", "nameMl": "കടുക് എണ്ണ"},
  {"id": "demo-oil-4", "sku": "OIL-004", "name": "Coconut Oil", "sellingPrice": "260.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "தேங்காய் எண்ணெய்", "nameHi": "नारियल तेल", "nameTe": "కొబ్బరి నూనె", "nameKn": "ತೆಂಗಿನ ಎಣ್ಣೆ", "nameMl": "വെളിച്ചെണ്ണ"},
  {"id": "demo-oil-5", "sku": "OIL-005", "name": "Palm Oil", "sellingPrice": "148.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாமாயில்", "nameHi": "पाम तेल", "nameTe": "పామ్ ఆయిల్", "nameKn": "ಪಾಮ್ ಎಣ್ಣೆ", "nameMl": "പാമോയിൽ"},
  {"id": "demo-oil-6", "sku": "OIL-006", "name": "Soya Oil", "sellingPrice": "164.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோயா எண்ணெய்", "nameHi": "सोयाबीन तेल", "nameTe": "సోయాబీన్ నూనె", "nameKn": "ಸೋಯಾಬೀನ್ ಎಣ್ಣೆ", "nameMl": "സോയാബീൻ എണ്ണ"},
  {"id": "demo-oil-7", "sku": "OIL-007", "name": "Gingelly Oil", "sellingPrice": "310.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "நல்லெண்ணெய்", "nameHi": "तिल का तेल", "nameTe": "నువ్వుల నూనె", "nameKn": "ಎಳ್ಳೆಣ್ಣೆ", "nameMl": "നല്ലെണ്ണ"},
  {"id": "demo-oil-8", "sku": "OIL-008", "name": "Olive Oil", "sellingPrice": "650.00", "category": "Cooking Oil", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஆலிவ் எண்ணெய்", "nameHi": "जैतून का तेल", "nameTe": "ఆలివ్ నూనె", "nameKn": "ಆಲಿವ್ ಎಣ್ಣೆ", "nameMl": "ഒലിവ് എണ്ണ"},
  {"id": "demo-spc-1", "sku": "SPC-001", "name": "Turmeric Powder", "sellingPrice": "35.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மஞ்சள் தூள்", "nameHi": "हल्दी पाउडर", "nameTe": "పసుపు పొడి", "nameKn": "ಅರಿಶಿನ ಪುಡಿ", "nameMl": "മഞ്ഞൾ പൊടി"},
  {"id": "demo-spc-2", "sku": "SPC-002", "name": "Chilli Powder", "sellingPrice": "45.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மிளகாய் தூள்", "nameHi": "लाल मिर्च पाउडर", "nameTe": "కారం పొడి", "nameKn": "ಖಾರದ ಪುಡಿ", "nameMl": "മുളക് പൊടി"},
  {"id": "demo-spc-3", "sku": "SPC-003", "name": "Coriander Powder", "sellingPrice": "30.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மல்லித் தூள்", "nameHi": "धनिया पाउडर", "nameTe": "ధనియాల పొడి", "nameKn": "ಕೊತ್ತಂಬರಿ ಪುಡಿ", "nameMl": "മല്ലിപ്പൊടി"},
  {"id": "demo-spc-4", "sku": "SPC-004", "name": "Cumin Seeds", "sellingPrice": "42.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சீரகம்", "nameHi": "जीरा", "nameTe": "జీలకర్ర", "nameKn": "ಜೀರಿಗೆ", "nameMl": "ജീരകം"},
  {"id": "demo-spc-5", "sku": "SPC-005", "name": "Black Pepper", "sellingPrice": "90.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மிளகு", "nameHi": "काली मिर्च", "nameTe": "మిరియాలు", "nameKn": "ಮೆಣಸು", "nameMl": "കുരുമുളക്"},
  {"id": "demo-spc-6", "sku": "SPC-006", "name": "Mustard Seeds", "sellingPrice": "25.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கடுகு", "nameHi": "राई / सरसों", "nameTe": "ఆవాలు", "nameKn": "ಸಾಸಿವೆ", "nameMl": "കടുക്"},
  {"id": "demo-spc-7", "sku": "SPC-007", "name": "Fenugreek", "sellingPrice": "20.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெந்தயம்", "nameHi": "मेथी", "nameTe": "మెంతులు", "nameKn": "ಮೆಂತೆ", "nameMl": "ഉലുവ"},
  {"id": "demo-spc-8", "sku": "SPC-008", "name": "Fennel", "sellingPrice": "35.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோம்பு", "nameHi": "सौंफ", "nameTe": "సోంపు", "nameKn": "ಸೋಂಪು", "nameMl": "പെരുംജീരകം"},
  {"id": "demo-spc-9", "sku": "SPC-009", "name": "Cardamom", "sellingPrice": "180.00", "category": "Spices", "unit": "50 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஏலக்காய்", "nameHi": "इलायची", "nameTe": "యాలకులు", "nameKn": "ಏಲಕ್ಕಿ", "nameMl": "ഏലക്കായ്"},
  {"id": "demo-spc-10", "sku": "SPC-010", "name": "Cloves", "sellingPrice": "90.00", "category": "Spices", "unit": "50 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கிராம்பு", "nameHi": "लौंग", "nameTe": "లవంగాలు", "nameKn": "ಲವಂಗ", "nameMl": "ഗ്രാമ്പൂ"},
  {"id": "demo-spc-11", "sku": "SPC-011", "name": "Cinnamon", "sellingPrice": "60.00", "category": "Spices", "unit": "50 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பட்டை", "nameHi": "दालचीनी", "nameTe": "దాల్చిన చెక్క", "nameKn": "ದಾಲ್ಚಿನ್ನಿ", "nameMl": "കറുവപ്പട്ട"},
  {"id": "demo-spc-12", "sku": "SPC-012", "name": "Bay Leaf", "sellingPrice": "25.00", "category": "Spices", "unit": "25 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பிரிஞ்சி இலை", "nameHi": "तेजपत्ता", "nameTe": "బిర్యానీ ఆకు", "nameKn": "ಬಿರಿಯಾನಿ ಎಲೆ", "nameMl": "വഴനയില"},
  {"id": "demo-spc-13", "sku": "SPC-013", "name": "Garam Masala", "sellingPrice": "55.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கரம் மசாலா", "nameHi": "गरम मसाला", "nameTe": "గరం మసాలా", "nameKn": "ಗರಂ ಮಸಾಲಾ", "nameMl": "ഗരം മസാല"},
  {"id": "demo-spc-14", "sku": "SPC-014", "name": "Sambar Powder", "sellingPrice": "60.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சாம்பார் பொடி", "nameHi": "सांभर पाउडर", "nameTe": "సాంబారు పొడి", "nameKn": "ಸಾಂಬಾರ್ ಪುಡಿ", "nameMl": "സാമ്പാർ പൊടി"},
  {"id": "demo-spc-15", "sku": "SPC-015", "name": "Rasam Powder", "sellingPrice": "55.00", "category": "Spices", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "ரசம் பொடி", "nameHi": "रसम पाउडर", "nameTe": "రసం పొడి", "nameKn": "ರಸಂ ಪುಡಿ", "nameMl": "രസം പൊടി"},
  {"id": "demo-spc-16", "sku": "SPC-016", "name": "Biryani Masala", "sellingPrice": "65.00", "category": "Spices", "unit": "50 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பிரியாணி மசாலா", "nameHi": "बिरयानी मसाला", "nameTe": "బిర్యానీ మసాలా", "nameKn": "ಬಿರಿಯಾನಿ ಮಸಾಲಾ", "nameMl": "ബിരിയാണി മസാല"},
  {"id": "demo-spc-17", "sku": "SPC-017", "name": "Asafoetida / Hing", "sellingPrice": "40.00", "category": "Spices", "unit": "25 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பெருங்காயம்", "nameHi": "हींग", "nameTe": "ఇంగువ", "nameKn": "ಇಂಗು", "nameMl": "കായം"},
  {"id": "demo-sug-1", "sku": "SUG-001", "name": "Sugar", "sellingPrice": "47.00", "category": "Sugar & Salt", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சர்க்கரை", "nameHi": "चीनी", "nameTe": "చక్కెర", "nameKn": "ಸಕ್ಕರೆ", "nameMl": "പഞ്ചസാര"},
  {"id": "demo-sug-2", "sku": "SUG-002", "name": "Brown Sugar", "sellingPrice": "70.00", "category": "Sugar & Salt", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "நாட்டுச் சர்க்கரை", "nameHi": "ब्राउन शुगर", "nameTe": "బ్రౌన్ షుగర్", "nameKn": "ಬ್ರೌನ್ ಸಕ್ಕರೆ", "nameMl": "ബ്രൗൺ ഷുഗർ"},
  {"id": "demo-sug-3", "sku": "SUG-003", "name": "Rock Salt", "sellingPrice": "35.00", "category": "Sugar & Salt", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "இந்துப்பு", "nameHi": "सेंधा नमक", "nameTe": "రాతి ఉప్పు", "nameKn": "ಕಲ್ಲು ಉಪ್ಪು", "nameMl": "കല്ലുപ്പ്"},
  {"id": "demo-sug-4", "sku": "SUG-004", "name": "Iodized Salt", "sellingPrice": "22.00", "category": "Sugar & Salt", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உப்பு", "nameHi": "नमक", "nameTe": "ఉప్పు", "nameKn": "ಉಪ್ಪು", "nameMl": "ഉപ്പ്"},
  {"id": "demo-sug-5", "sku": "SUG-005", "name": "Jaggery", "sellingPrice": "70.00", "category": "Sugar & Salt", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெல்லம்", "nameHi": "गुड़", "nameTe": "బెల్లం", "nameKn": "ಬೆಲ್ಲ", "nameMl": "ശർക്കര"},
  {"id": "demo-sug-6", "sku": "SUG-006", "name": "Honey", "sellingPrice": "280.00", "category": "Sugar & Salt", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "தேன்", "nameHi": "शहद", "nameTe": "తేనె", "nameKn": "ಜೇನುತುಪ್ಪ", "nameMl": "തേൻ"},
  {"id": "demo-sug-7", "sku": "SUG-007", "name": "Palm Sugar / Karupatti", "sellingPrice": "120.00", "category": "Sugar & Salt", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கருப்பட்டி", "nameHi": "ताड़ का गुड़", "nameTe": "తాటి బెల్లం", "nameKn": "ತಾಳೆ ಬೆಲ್ಲ", "nameMl": "കരിമ്പട്ടി"},
  {"id": "demo-dly-1", "sku": "DLY-001", "name": "Milk", "sellingPrice": "62.00", "category": "Dairy", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பால்", "nameHi": "दूध", "nameTe": "పాలు", "nameKn": "ಹಾಲು", "nameMl": "പാൽ"},
  {"id": "demo-dly-2", "sku": "DLY-002", "name": "Butter", "sellingPrice": "280.00", "category": "Dairy", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெண்ணெய்", "nameHi": "मक्खन", "nameTe": "వెన్న", "nameKn": "ಬೆಣ್ಣೆ", "nameMl": "വെണ്ണ"},
  {"id": "demo-dly-3", "sku": "DLY-003", "name": "Ghee", "sellingPrice": "550.00", "category": "Dairy", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "நெய்", "nameHi": "घी", "nameTe": "నేయి", "nameKn": "ತುಪ್ಪ", "nameMl": "നെയ്യ്"},
  {"id": "demo-dly-4", "sku": "DLY-004", "name": "Curd / Yogurt", "sellingPrice": "40.00", "category": "Dairy", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "தயிர்", "nameHi": "दही", "nameTe": "పెరుగు", "nameKn": "ಮೊಸರು", "nameMl": "തൈര്"},
  {"id": "demo-dly-5", "sku": "DLY-005", "name": "Paneer", "sellingPrice": "90.00", "category": "Dairy", "unit": "200 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பனீர்", "nameHi": "पनीर", "nameTe": "పనీర్", "nameKn": "ಪನೀರ್", "nameMl": "പനീർ"},
  {"id": "demo-dly-6", "sku": "DLY-006", "name": "Milkmaid", "sellingPrice": "148.00", "category": "Dairy", "unit": "400 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "மில்க்மெய்ட்", "nameHi": "मिल्कमेड", "nameTe": "మిల్క్ మెయిడ్", "nameKn": "ಮಿಲ್ಕ್‌ಮೇಡ್", "nameMl": "മിൽക്ക്മെയ്ഡ്"},
  {"id": "demo-dly-7", "sku": "DLY-007", "name": "Cheese Slices", "sellingPrice": "155.00", "category": "Dairy", "unit": "200 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "சீஸ் துண்டுகள்", "nameHi": "चीज़ स्लाइस", "nameTe": "చీజ్ స్లైస్", "nameKn": "ಚೀಸ್ ಸ್ಲೈಸ್", "nameMl": "ചീസ് സ്ലൈസ്"},
  {"id": "demo-dly-8", "sku": "DLY-008", "name": "Buttermilk", "sellingPrice": "25.00", "category": "Dairy", "unit": "500 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "மோர்", "nameHi": "छाछ", "nameTe": "మజ్జిగ", "nameKn": "ಮಜ್ಜಿಗೆ", "nameMl": "മോര്"},
  {"id": "demo-dly-9", "sku": "DLY-009", "name": "Khoa / Mawa", "sellingPrice": "120.00", "category": "Dairy", "unit": "250 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "கோவா", "nameHi": "खोया / मावा", "nameTe": "ఖోవా", "nameKn": "ಖೋವಾ", "nameMl": "ഖോവ"},
  {"id": "demo-dly-10", "sku": "DLY-010", "name": "Amul Cream", "sellingPrice": "65.00", "category": "Dairy", "unit": "200 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "அமுல் க்ரீம்", "nameHi": "अमूल क्रीम", "nameTe": "అముల్ క్రీమ్", "nameKn": "ಅಮೂಲ್ ಕ್ರೀಮ್", "nameMl": "അമുൽ ക്രീം"},
  {"id": "demo-bev-1", "sku": "BEV-001", "name": "Tea Powder", "sellingPrice": "220.00", "category": "Beverages", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "தேநீர் தூள்", "nameHi": "चाय पाउडर", "nameTe": "టీ పొడి", "nameKn": "ಚಹಾ ಪುಡಿ", "nameMl": "ചായ പൊടി"},
  {"id": "demo-bev-2", "sku": "BEV-002", "name": "Coffee Powder", "sellingPrice": "185.00", "category": "Beverages", "unit": "200 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "காபி பொடி", "nameHi": "कॉफी पाउडर", "nameTe": "కాఫీ పొడి", "nameKn": "ಕಾಫಿ ಪುಡಿ", "nameMl": "കോഫി പൊടി"},
  {"id": "demo-bev-3", "sku": "BEV-003", "name": "Bournvita", "sellingPrice": "275.00", "category": "Beverages", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "போர்ன்விட்டா", "nameHi": "बॉर्नविटा", "nameTe": "బోర్న్‌విటా", "nameKn": "ಬಾರ್ನ್‌ವಿಟಾ", "nameMl": "ബോൺവിറ്റ"},
  {"id": "demo-bev-4", "sku": "BEV-004", "name": "Horlicks", "sellingPrice": "285.00", "category": "Beverages", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஹார்லிக்ஸ்", "nameHi": "हॉर्लिक्स", "nameTe": "హార్లిక్స్", "nameKn": "ಹಾರ್ಲಿಕ್ಸ್", "nameMl": "ഹോർലിക്സ്"},
  {"id": "demo-bev-5", "sku": "BEV-005", "name": "Boost", "sellingPrice": "265.00", "category": "Beverages", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பூஸ்ட்", "nameHi": "बूस्ट", "nameTe": "బూస్ట్", "nameKn": "ಬೂಸ್ಟ್", "nameMl": "ബൂസ്റ്റ്"},
  {"id": "demo-bev-6", "sku": "BEV-006", "name": "Mineral Water", "sellingPrice": "20.00", "category": "Beverages", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "குடிநீர்", "nameHi": "मिनरल वाटर", "nameTe": "మినరల్ వాటర్", "nameKn": "ಮಿನರಲ್ ವಾಟರ್", "nameMl": "മിനറൽ വാട്ടർ"},
  {"id": "demo-bev-7", "sku": "BEV-007", "name": "Soft Drink 750 ml", "sellingPrice": "40.00", "category": "Beverages", "unit": "750 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "குளிர்பானம்", "nameHi": "सॉफ्ट ड्रिंक", "nameTe": "సాఫ్ట్ డ్రింక్", "nameKn": "ಸಾಫ್ಟ್ ಡ್ರಿಂಕ್", "nameMl": "സോഫ്റ്റ് ഡ്രിങ്ക്"},
  {"id": "demo-bev-8", "sku": "BEV-008", "name": "Soft Drink 2 L", "sellingPrice": "95.00", "category": "Beverages", "unit": "2 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "குளிர்பானம் 2 லி", "nameHi": "सॉफ्ट ड्रिंक 2 लि", "nameTe": "సాఫ్ట్ డ్రింక్ 2 లి", "nameKn": "ಸಾಫ್ಟ್ ಡ್ರಿಂಕ್ 2 ಲಿ", "nameMl": "സോഫ്റ്റ് ഡ്രിങ്ക് 2 ലി"},
  {"id": "demo-bev-9", "sku": "BEV-009", "name": "Fruit Juice", "sellingPrice": "120.00", "category": "Beverages", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பழச் சாறு", "nameHi": "फ्रूट जूस", "nameTe": "ఫ్రూట్ జూస్", "nameKn": "ಹಣ್ಣಿನ ರಸ", "nameMl": "ഫ്രൂട്ട് ജ്യൂസ്"},
  {"id": "demo-bev-10", "sku": "BEV-010", "name": "Coconut Water", "sellingPrice": "45.00", "category": "Beverages", "unit": "500 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "இளநீர்", "nameHi": "नारियल पानी", "nameTe": "కొబ్బరి నీళ్ళు", "nameKn": "ಎಳನೀರು", "nameMl": "ഇളനീർ"},
  {"id": "demo-bev-11", "sku": "BEV-011", "name": "Complan", "sellingPrice": "310.00", "category": "Beverages", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "காம்ப்ளான்", "nameHi": "कॉम्प्लान", "nameTe": "కాంప్లాన్", "nameKn": "ಕಾಂಪ್ಲಾನ್", "nameMl": "കോംപ്ലാൻ"},
  {"id": "demo-bis-1", "sku": "BIS-001", "name": "Parle-G", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பார்லே-ஜி", "nameHi": "पारले-जी", "nameTe": "పార్లే-జి", "nameKn": "ಪಾರ್ಲೆ-ಜಿ", "nameMl": "പാർലെ-ജി"},
  {"id": "demo-bis-2", "sku": "BIS-002", "name": "Marie Gold", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மேரி கோல்ட்", "nameHi": "मैरी गोल्ड", "nameTe": "మేరీ గోల్డ్", "nameKn": "ಮೇರಿ ಗೋಲ್ಡ್", "nameMl": "മേരി ഗോൾഡ്"},
  {"id": "demo-bis-3", "sku": "BIS-003", "name": "Good Day", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "குட் டே", "nameHi": "गुड डे", "nameTe": "గుడ్ డే", "nameKn": "ಗುಡ್ ಡೇ", "nameMl": "ഗുഡ് ഡേ"},
  {"id": "demo-bis-4", "sku": "BIS-004", "name": "Bourbon", "sellingPrice": "35.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "போர்பன்", "nameHi": "बोर्बोन", "nameTe": "బోర్బన్", "nameKn": "ಬೋರ್ಬನ್", "nameMl": "ബോർബൺ"},
  {"id": "demo-bis-5", "sku": "BIS-005", "name": "Oreo", "sellingPrice": "30.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஓரியோ", "nameHi": "ओरियो", "nameTe": "ఓరియో", "nameKn": "ಓರಿಯೊ", "nameMl": "ഓറിയോ"},
  {"id": "demo-bis-6", "sku": "BIS-006", "name": "50-50", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "50-50", "nameHi": "50-50", "nameTe": "50-50", "nameKn": "50-50", "nameMl": "50-50"},
  {"id": "demo-bis-7", "sku": "BIS-007", "name": "Monaco", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மொனாக்கோ", "nameHi": "मोनाको", "nameTe": "మోనాకో", "nameKn": "ಮೊನಾಕೊ", "nameMl": "മൊണാക്കോ"},
  {"id": "demo-bis-8", "sku": "BIS-008", "name": "Hide & Seek", "sellingPrice": "35.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஹைட் & சீக்", "nameHi": "हाइड एंड सीक", "nameTe": "హైడ్ అండ్ సీక్", "nameKn": "ಹೈಡ್ ಆಂಡ್ ಸೀಕ್", "nameMl": "ഹൈഡ് ആൻഡ് സീക്ക്"},
  {"id": "demo-bis-9", "sku": "BIS-009", "name": "Dairy Milk", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "டைரி மில்க்", "nameHi": "डेयरी मिल्क", "nameTe": "డైరీ మిల్క్", "nameKn": "ಡೈರಿ ಮಿಲ್ಕ್", "nameMl": "ഡയറി മിൽക്ക്"},
  {"id": "demo-bis-10", "sku": "BIS-010", "name": "KitKat", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "கிட்காட்", "nameHi": "किटकेट", "nameTe": "కిట్‌క్యాట్", "nameKn": "ಕಿಟ್‌ಕ್ಯಾಟ್", "nameMl": "കിറ്റ്കാറ്റ്"},
  {"id": "demo-bis-11", "sku": "BIS-011", "name": "Five Star", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "பைவ் ஸ்டார்", "nameHi": "फाइव स्टार", "nameTe": "ఫైవ్ స్టార్", "nameKn": "ಫೈವ್ ಸ್ಟಾರ್", "nameMl": "ഫൈവ് സ്റ്റാർ"},
  {"id": "demo-bis-12", "sku": "BIS-012", "name": "Munch", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "மஞ்ச்", "nameHi": "मंच", "nameTe": "మంచ్", "nameKn": "ಮಂಚ್", "nameMl": "മഞ്ച്"},
  {"id": "demo-bis-13", "sku": "BIS-013", "name": "Perk", "sellingPrice": "10.00", "category": "Snacks & Biscuits", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "பெர்க்", "nameHi": "पर्क", "nameTe": "పెర్క్", "nameKn": "ಪರ್ಕ್", "nameMl": "പെർക്ക്"},
  {"id": "demo-bis-14", "sku": "BIS-014", "name": "Gems", "sellingPrice": "20.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஜெம்ஸ்", "nameHi": "जेम्स", "nameTe": "జెమ్స్", "nameKn": "ಜೆಮ್ಸ್", "nameMl": "ജെംസ്"},
  {"id": "demo-ins-1", "sku": "INS-001", "name": "Maggi Noodles", "sellingPrice": "14.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மேகி நூடுல்ஸ்", "nameHi": "मैगी नूडल्स", "nameTe": "మేగీ నూడుల్స్", "nameKn": "ಮ್ಯಾಗಿ ನೂಡಲ್ಸ್", "nameMl": "മാഗി നൂഡിൽസ്"},
  {"id": "demo-ins-2", "sku": "INS-002", "name": "Yippee Noodles", "sellingPrice": "15.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "இப்பி நூடுல்ஸ்", "nameHi": "यिप्पी नूडल्स", "nameTe": "యిప్పీ నూడుల్స్", "nameKn": "ಯಿಪ್ಪಿ ನೂಡಲ್ಸ್", "nameMl": "ഇപ്പി നൂഡിൽസ്"},
  {"id": "demo-ins-3", "sku": "INS-003", "name": "Pasta", "sellingPrice": "40.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாஸ்தா", "nameHi": "पास्ता", "nameTe": "పాస్తా", "nameKn": "ಪಾಸ್ತಾ", "nameMl": "പാസ്ത"},
  {"id": "demo-ins-4", "sku": "INS-004", "name": "Oats", "sellingPrice": "180.00", "category": "Snacks & Biscuits", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஓட்ஸ்", "nameHi": "ओट्स", "nameTe": "ఓట్స్", "nameKn": "ಓಟ್ಸ್", "nameMl": "ഓട്സ്"},
  {"id": "demo-ins-5", "sku": "INS-005", "name": "Corn Flakes", "sellingPrice": "180.00", "category": "Snacks & Biscuits", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோளக் கஞ்சி", "nameHi": "कॉर्न फ्लेक्स", "nameTe": "కార్న్ ఫ్లేక్స్", "nameKn": "ಕಾರ್ನ್ ಫ್ಲೇಕ್ಸ್", "nameMl": "കോൺ ഫ്ലേക്സ്"},
  {"id": "demo-ins-6", "sku": "INS-006", "name": "Instant Upma Mix", "sellingPrice": "65.00", "category": "Snacks & Biscuits", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "உப்புமா மிக்ஸ்", "nameHi": "इंस्टेंट उपमा मिक्स", "nameTe": "ఇన్‌స్టంట్ ఉప్మా మిక్స్", "nameKn": "ಇನ್‌ಸ್ಟೆಂಟ್ ಉಪ್ಮಾ ಮಿಕ್ಸ್", "nameMl": "ഉപ്പുമാ മിക്സ്"},
  {"id": "demo-bak-1", "sku": "BAK-001", "name": "White Bread", "sellingPrice": "35.00", "category": "Bakery", "unit": "Loaf", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெள்ளை பிரெட்", "nameHi": "सफेद ब्रेड", "nameTe": "తెల్ల బ్రెడ్", "nameKn": "ಬಿಳಿ ಬ್ರೆಡ್", "nameMl": "വെള്ള ബ്രഡ്"},
  {"id": "demo-bak-2", "sku": "BAK-002", "name": "Brown Bread", "sellingPrice": "45.00", "category": "Bakery", "unit": "Loaf", "enabled": true, "stockQuantity": "100.00", "nameTa": "பழுப்பு பிரெட்", "nameHi": "ब्राउन ब्रेड", "nameTe": "బ్రౌన్ బ్రెడ్", "nameKn": "ಬ್ರೌನ್ ಬ್ರೆಡ್", "nameMl": "ബ്രൗൺ ബ്രഡ്"},
  {"id": "demo-bak-3", "sku": "BAK-003", "name": "Pav / Buns", "sellingPrice": "30.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாவ் / பன்ஸ்", "nameHi": "पाव / बन्स", "nameTe": "పావ్ / బన్స్", "nameKn": "ಪಾವ್ / ಬನ್ಸ್", "nameMl": "പാവ് / ബൺസ്"},
  {"id": "demo-bak-4", "sku": "BAK-004", "name": "Cake", "sellingPrice": "80.00", "category": "Bakery", "unit": "Piece", "enabled": true, "stockQuantity": "100.00", "nameTa": "கேக்", "nameHi": "केक", "nameTe": "కేక్", "nameKn": "ಕೇಕ್", "nameMl": "കേക്ക്"},
  {"id": "demo-bak-5", "sku": "BAK-005", "name": "Rusk", "sellingPrice": "45.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ரஸ்க்", "nameHi": "रस्क", "nameTe": "రస్క్", "nameKn": "ರಸ್ಕ್", "nameMl": "റസ്ക്"},
  {"id": "demo-bak-6", "sku": "BAK-006", "name": "Cake Rusk", "sellingPrice": "60.00", "category": "Bakery", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "கேக் ரஸ்க்", "nameHi": "केक रस्क", "nameTe": "కేక్ రస్క్", "nameKn": "ಕೇಕ್ ರಸ್ಕ್", "nameMl": "കേക്ക് റസ്ക്"},
  {"id": "demo-pca-1", "sku": "PCA-001", "name": "Soap", "sellingPrice": "45.00", "category": "Personal Care", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "சோப்பு", "nameHi": "साबुन", "nameTe": "సబ్బు", "nameKn": "ಸಾಬೂನು", "nameMl": "സോപ്പ്"},
  {"id": "demo-pca-2", "sku": "PCA-002", "name": "Shampoo", "sellingPrice": "150.00", "category": "Personal Care", "unit": "200 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "ஷாம்பூ", "nameHi": "शैम्पू", "nameTe": "షాంపూ", "nameKn": "ಶಾಂಪೂ", "nameMl": "ഷാംപൂ"},
  {"id": "demo-pca-3", "sku": "PCA-003", "name": "Toothpaste", "sellingPrice": "80.00", "category": "Personal Care", "unit": "Tube", "enabled": true, "stockQuantity": "100.00", "nameTa": "பல் விளக்கும் பேஸ்ட்", "nameHi": "टूथपेस्ट", "nameTe": "టూత్‌పేస్ట్", "nameKn": "ಟೂಥ್‌ಪೇಸ್ಟ್", "nameMl": "ടൂത്ത്‌പേസ്റ്റ്"},
  {"id": "demo-pca-4", "sku": "PCA-004", "name": "Toothbrush", "sellingPrice": "35.00", "category": "Personal Care", "unit": "Piece", "enabled": true, "stockQuantity": "100.00", "nameTa": "பல் தூரிகை", "nameHi": "टूथब्रश", "nameTe": "టూత్‌బ్రష్", "nameKn": "ಟೂಥ್‌ಬ್ರಶ್", "nameMl": "ടൂത്ത്ബ്രഷ്"},
  {"id": "demo-pca-5", "sku": "PCA-005", "name": "Detergent Powder", "sellingPrice": "120.00", "category": "Personal Care", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சலவைப் பொடி", "nameHi": "डिटर्जेंट पाउडर", "nameTe": "డిటర్జెంట్ పొడి", "nameKn": "ಡಿಟರ್ಜೆಂಟ್ ಪುಡಿ", "nameMl": "ഡിറ്റർജന്റ് പൊടി"},
  {"id": "demo-pca-6", "sku": "PCA-006", "name": "Detergent Cake", "sellingPrice": "40.00", "category": "Personal Care", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "சலவை கேக்", "nameHi": "डिटर्जेंट केक", "nameTe": "డిటర్జెంట్ కేక్", "nameKn": "ಡಿಟರ್ಜೆಂಟ್ ಕೇಕ್", "nameMl": "ഡിറ്റർജന്റ് കേക്ക്"},
  {"id": "demo-pca-7", "sku": "PCA-007", "name": "Dish Wash Bar", "sellingPrice": "30.00", "category": "Personal Care", "unit": "Bar", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாத்திரம் கழுவும் கட்டி", "nameHi": "बर्तन धोने की बट्टी", "nameTe": "పాత్రలు కడిగే బార్", "nameKn": "ಪಾತ್ರೆ ತೊಳೆಯುವ ಬಾರ್", "nameMl": "പാത്ര ബാർ"},
  {"id": "demo-pca-8", "sku": "PCA-008", "name": "Dish Wash Liquid", "sellingPrice": "90.00", "category": "Personal Care", "unit": "500 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாத்திரம் கழுவும் திரவம்", "nameHi": "बर्तन धोने का तरल", "nameTe": "పాత్రలు కడిగే ద్రావణం", "nameKn": "ಪಾತ್ರೆ ತೊಳೆಯುವ ದ್ರಾವಣ", "nameMl": "പാത്ര ലിക്വിഡ്"},
  {"id": "demo-pca-9", "sku": "PCA-009", "name": "Floor Cleaner", "sellingPrice": "90.00", "category": "Personal Care", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "தரை சுத்தம் செய்யும் திரவம்", "nameHi": "फ्लोर क्लीनर", "nameTe": "ఫ్లోర్ క్లీనర్", "nameKn": "ಫ್ಲೋರ್ ಕ್ಲೀನರ್", "nameMl": "ഫ്ലോർ ക്ലീനർ"},
  {"id": "demo-pca-10", "sku": "PCA-010", "name": "Phenyl", "sellingPrice": "60.00", "category": "Personal Care", "unit": "1 L", "enabled": true, "stockQuantity": "100.00", "nameTa": "பெனைல்", "nameHi": "फिनाइल", "nameTe": "ఫినాయిల్", "nameKn": "ಫೀನೈಲ್", "nameMl": "ഫിനൈൽ"},
  {"id": "demo-pca-11", "sku": "PCA-011", "name": "Toilet Cleaner", "sellingPrice": "85.00", "category": "Personal Care", "unit": "500 ml", "enabled": true, "stockQuantity": "100.00", "nameTa": "கழிவறை சுத்தப்படுத்தி", "nameHi": "टॉयलेट क्लीनर", "nameTe": "టాయిలెట్ క్లీనర్", "nameKn": "ಟಾಯ್ಲೆಟ್ ಕ್ಲೀನರ್", "nameMl": "ടോയ്‌ലറ്റ് ക്ലീനർ"},
  {"id": "demo-pca-12", "sku": "PCA-012", "name": "Mosquito Coil", "sellingPrice": "30.00", "category": "Personal Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொசு சுருள்", "nameHi": "मच्छर कॉइल", "nameTe": "దోమ అగరొత్తి", "nameKn": "ಸೊಳ್ಳೆ ಕಾಯಿಲ್", "nameMl": "കൊതുക് കോയ്ൽ"},
  {"id": "demo-pca-13", "sku": "PCA-013", "name": "Mosquito Liquid Refill", "sellingPrice": "145.00", "category": "Personal Care", "unit": "Refill", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொசு திரவம் ரீஃபில்", "nameHi": "मच्छर लिक्विड रिफिल", "nameTe": "దోమ లిక్విడ్ రీఫిల్", "nameKn": "ಸೊಳ್ಳೆ ಲಿಕ್ವಿಡ್ ರಿಫಿಲ್", "nameMl": "കൊതുക് ലിക്വിഡ് റീഫിൽ"},
  {"id": "demo-pca-14", "sku": "PCA-014", "name": "Sanitary Pads", "sellingPrice": "70.00", "category": "Personal Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மாதவிடாய் பட்டைகள்", "nameHi": "सैनिटरी पैड्स", "nameTe": "శానిటరీ ప్యాడ్స్", "nameKn": "ಸ್ಯಾನಿಟರಿ ಪ್ಯಾಡ್ಸ್", "nameMl": "സാനിറ്ററി പാഡ്സ്"},
  {"id": "demo-pca-15", "sku": "PCA-015", "name": "Diapers", "sellingPrice": "250.00", "category": "Personal Care", "unit": "12 pc", "enabled": true, "stockQuantity": "100.00", "nameTa": "குழந்தை டயபர்", "nameHi": "डायपर", "nameTe": "డైపర్స్", "nameKn": "ಡಯಾಪರ್ಸ್", "nameMl": "ഡയപ്പർ"},
  {"id": "demo-hh-1", "sku": "HH-001", "name": "Matchbox", "sellingPrice": "5.00", "category": "Household Care", "unit": "Box", "enabled": true, "stockQuantity": "100.00", "nameTa": "தீக்குச்சி பெட்டி", "nameHi": "माचिस", "nameTe": "అగ్గిపెట్టె", "nameKn": "ಬೆಂಕಿಪೆಟ್ಟಿ", "nameMl": "തീപ്പെട്ടി"},
  {"id": "demo-hh-2", "sku": "HH-002", "name": "Candle", "sellingPrice": "20.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "மெழுகுவர்த்தி", "nameHi": "मोमबत्ती", "nameTe": "కొవ్వొత్తి", "nameKn": "ಮೇಣದಬತ್ತಿ", "nameMl": "മെഴുകുതിരി"},
  {"id": "demo-hh-3", "sku": "HH-003", "name": "Incense Sticks", "sellingPrice": "30.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "அகர்பத்தி", "nameHi": "अगरबत्ती", "nameTe": "అగరవత్తులు", "nameKn": "ಅಗರಬತ್ತಿ", "nameMl": "അഗർബത്തി"},
  {"id": "demo-hh-4", "sku": "HH-004", "name": "Camphor", "sellingPrice": "40.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "கர்பூரம்", "nameHi": "कपूर", "nameTe": "కర్పూరం", "nameKn": "ಕರ್ಪೂರ", "nameMl": "കർപ്പൂരം"},
  {"id": "demo-hh-5", "sku": "HH-005", "name": "Rubber Band", "sellingPrice": "10.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "ரப்பர் பட்டை", "nameHi": "रबर बैंड", "nameTe": "రబ్బర్ బ్యాండ్", "nameKn": "ರಬ್ಬರ್ ಬ್ಯಾಂಡ್", "nameMl": "റബ്ബർ ബാൻഡ്"},
  {"id": "demo-hh-6", "sku": "HH-006", "name": "Polythene Bag", "sellingPrice": "15.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாலிதீன் பை", "nameHi": "पॉलिथीन बैग", "nameTe": "పాలిథీన్ బ్యాగ్", "nameKn": "ಪಾಲಿಥೀನ್ ಬ್ಯಾಗ್", "nameMl": "പോളിത്തീൻ ബാഗ്"},
  {"id": "demo-hh-7", "sku": "HH-007", "name": "Safety Pin", "sellingPrice": "5.00", "category": "Household Care", "unit": "Pack", "enabled": true, "stockQuantity": "100.00", "nameTa": "பாதுகாப்பு ஊசி", "nameHi": "सेफ्टी पिन", "nameTe": "సేఫ్టీ పిన్", "nameKn": "ಸೇಫ್ಟಿ ಪಿನ್", "nameMl": "സേഫ്റ്റി പിൻ"},
  {"id": "demo-veg-1", "sku": "VEG-001", "name": "Onion", "sellingPrice": "30.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெங்காயம்", "nameHi": "प्याज", "nameTe": "ఉల్లిపాయ", "nameKn": "ಈರುಳ್ಳಿ", "nameMl": "സവോള"},
  {"id": "demo-veg-2", "sku": "VEG-002", "name": "Tomato", "sellingPrice": "35.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "தக்காளி", "nameHi": "टमाटर", "nameTe": "టొమాటో", "nameKn": "ಟೊಮೇಟೊ", "nameMl": "തക്കാളി"},
  {"id": "demo-veg-3", "sku": "VEG-003", "name": "Potato", "sellingPrice": "28.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "உருளைக்கிழங்கு", "nameHi": "आलू", "nameTe": "బంగాళాదుంప", "nameKn": "ಆಲೂಗಡ್ಡೆ", "nameMl": "ഉരുളക്കിഴങ്ങ്"},
  {"id": "demo-veg-4", "sku": "VEG-004", "name": "Garlic", "sellingPrice": "45.00", "category": "Vegetables", "unit": "250 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பூண்டு", "nameHi": "लहसुन", "nameTe": "వెల్లుల్లి", "nameKn": "ಬೆಳ್ಳುಳ್ಳಿ", "nameMl": "വെളുത്തുള്ളി"},
  {"id": "demo-veg-5", "sku": "VEG-005", "name": "Ginger", "sellingPrice": "40.00", "category": "Vegetables", "unit": "250 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "இஞ்சி", "nameHi": "अदरक", "nameTe": "అల్లం", "nameKn": "ಶುಂಠಿ", "nameMl": "ഇഞ്ചി"},
  {"id": "demo-veg-6", "sku": "VEG-006", "name": "Green Chilli", "sellingPrice": "15.00", "category": "Vegetables", "unit": "100 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பச்சை மிளகாய்", "nameHi": "हरी मिर्च", "nameTe": "పచ్చి మిర్చి", "nameKn": "ಹಸಿ ಮೆಣಸಿನಕಾಯಿ", "nameMl": "പച്ചമുളക്"},
  {"id": "demo-veg-7", "sku": "VEG-007", "name": "Coriander Leaves", "sellingPrice": "10.00", "category": "Vegetables", "unit": "Bunch", "enabled": true, "stockQuantity": "100.00", "nameTa": "கொத்தமல்லி", "nameHi": "धनिया पत्ता", "nameTe": "కొత్తిమీర", "nameKn": "ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು", "nameMl": "മല്ലിയില"},
  {"id": "demo-veg-8", "sku": "VEG-008", "name": "Curry Leaves", "sellingPrice": "10.00", "category": "Vegetables", "unit": "Bunch", "enabled": true, "stockQuantity": "100.00", "nameTa": "கறிவேப்பிலை", "nameHi": "कड़ी पत्ता", "nameTe": "కరివేపాకు", "nameKn": "ಕರಿಬೇವಿನ ಸೊಪ್ಪು", "nameMl": "കറിവേപ്പില"},
  {"id": "demo-veg-9", "sku": "VEG-009", "name": "Carrot", "sellingPrice": "40.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கேரட்", "nameHi": "गाजर", "nameTe": "క్యారెట్", "nameKn": "ಗಾಜರು", "nameMl": "കാരറ്റ്"},
  {"id": "demo-veg-10", "sku": "VEG-010", "name": "Beetroot", "sellingPrice": "35.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "பீட்ரூட்", "nameHi": "चुकंदर", "nameTe": "బీట్‌రూట్", "nameKn": "ಬೀಟ್‌ರೂಟ್", "nameMl": "ബീറ്റ്‌റൂട്ട്"},
  {"id": "demo-veg-11", "sku": "VEG-011", "name": "Cabbage", "sellingPrice": "30.00", "category": "Vegetables", "unit": "Piece", "enabled": true, "stockQuantity": "100.00", "nameTa": "முட்டைக்கோஸ்", "nameHi": "पत्तागोभी", "nameTe": "క్యాబేజీ", "nameKn": "ಎಲೆಕೋಸು", "nameMl": "കാബേജ്"},
  {"id": "demo-veg-12", "sku": "VEG-012", "name": "Cauliflower", "sellingPrice": "40.00", "category": "Vegetables", "unit": "Piece", "enabled": true, "stockQuantity": "100.00", "nameTa": "காலிஃப்ளவர்", "nameHi": "फूलगोभी", "nameTe": "కాలీఫ్లవర్", "nameKn": "ಹೂಕೋಸು", "nameMl": "കോളിഫ്ലവർ"},
  {"id": "demo-veg-13", "sku": "VEG-013", "name": "Brinjal / Eggplant", "sellingPrice": "30.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "கத்தரிக்காய்", "nameHi": "बैंगन", "nameTe": "వంకాయ", "nameKn": "ಬದನೆಕಾಯಿ", "nameMl": "വഴുതന"},
  {"id": "demo-veg-14", "sku": "VEG-014", "name": "Lady Finger / Okra", "sellingPrice": "40.00", "category": "Vegetables", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "வெண்டைக்காய்", "nameHi": "भिंडी", "nameTe": "బెండకాయ", "nameKn": "ಬೆಂಡೆಕಾಯಿ", "nameMl": "വെണ്ട"},
  {"id": "demo-veg-15", "sku": "VEG-015", "name": "Beans", "sellingPrice": "45.00", "category": "Vegetables", "unit": "500 g", "enabled": true, "stockQuantity": "100.00", "nameTa": "பீன்ஸ்", "nameHi": "फलियाँ", "nameTe": "బీన్స్", "nameKn": "ಬೀನ್ಸ್", "nameMl": "ബീൻസ്"},
  {"id": "demo-veg-16", "sku": "VEG-016", "name": "Drumstick", "sellingPrice": "30.00", "category": "Vegetables", "unit": "Bunch", "enabled": true, "stockQuantity": "100.00", "nameTa": "முருங்கைக்காய்", "nameHi": "सहजन", "nameTe": "మునగకాయ", "nameKn": "ನುಗ್ಗೆಕಾಯಿ", "nameMl": "മുരിങ്ങക്കായ"},
  {"id": "demo-veg-17", "sku": "VEG-017", "name": "Raw Banana", "sellingPrice": "35.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "வாழைக்காய்", "nameHi": "कच्चा केला", "nameTe": "పచ్చి అరటికాయ", "nameKn": "ಕಾಯಿ ಬಾಳೆ", "nameMl": "കായ്"},
  {"id": "demo-veg-18", "sku": "VEG-018", "name": "Sweet Potato", "sellingPrice": "40.00", "category": "Vegetables", "unit": "1 kg", "enabled": true, "stockQuantity": "100.00", "nameTa": "சர்க்கரைவள்ளிக்கிழங்கு", "nameHi": "शकरकंद", "nameTe": "చిలగడదుంప", "nameKn": "ಸಿಹಿ ಗೆಣಸು", "nameMl": "ശക്കരവള്ളി"}

];

const voiceEssentialProducts: Product[] = [
  {
    id: "demo-milk-1",
    sku: "DAIRY-001",
    name: "Milk",
    sellingPrice: "60.00",
    category: "Dairy",
    unit: "1 L",
    enabled: true,
    stockQuantity: "100.00",
    nameTa: "பால்",
    nameHi: "दूध",
    nameTe: "పాలు",
    nameKn: "ಹಾಲು",
    nameMl: "പാൽ",
    aliases: "milk,paal,doodh,amul milk,aavin milk,nandini milk"
  },
  {
    id: "demo-noodles-1",
    sku: "SNACK-001",
    name: "Maggi Noodles",
    sellingPrice: "15.00",
    category: "Snacks",
    unit: "Pack",
    enabled: true,
    stockQuantity: "100.00",
    aliases: "maggi,noodles,magi,maagi,instant noodles,2 minute noodles"
  }
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
  const [products, setProducts] = useState<Product[]>(() => {
    const existingSkus = new Set(starterProducts.map((product) => product.sku));
    return [
      ...voiceEssentialProducts.filter((product) => !existingSkus.has(product.sku)),
      ...starterProducts
    ];
  });
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
    const query = String(new FormData(event.currentTarget).get("query") ?? "").toLowerCase().trim();

    // Local search helper — works against starterProducts always
    const localSearch = (q: string) => {
      if (!q) return starterProducts;
      return starterProducts.filter((product) =>
        `${product.name} ${product.nameTa || ""} ${product.nameHi || ""} ${product.nameTe || ""} ${product.nameKn || ""} ${product.nameMl || ""} ${product.sku} ${product.category || ""}`.toLowerCase().includes(q)
      );
    };

    if (demoMode) {
      const result = localSearch(query);
      setProducts(result.length ? result : starterProducts);
      setActiveTask("products");
      setStatus(result.length ? `${result.length} product(s) found.` : "Showing all products.");
      setBusy(false);
      return;
    }
    try {
      const result = (await searchProducts(query)) ?? [];
      if (result.length > 0) {
        setProducts(result);
        setActiveTask("credit");
        setStatus("Tap a product to add it to this account.");
      } else {
        // Backend returned empty — fall back to local catalog
        const localResult = localSearch(query);
        setProducts(localResult.length ? localResult : starterProducts);
        setActiveTask("products");
        setStatus(localResult.length ? `${localResult.length} product(s) found in local catalog.` : "Showing all products.");
      }
    } catch (error) {
      const localResult = localSearch(query);
      setProducts(localResult.length ? localResult : starterProducts);
      setDemoMode(true);
      setActiveTask("products");
      setStatus(localResult.length ? `${localResult.length} product(s) found.` : "Showing all products.");
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
      // 📲 WhatsApp notification
      if (selectedCustomer?.phone) {
        const firstItem = itemsToSave[0];
        notifyCreditSale({
          phone: selectedCustomer.phone,
          customerName: selectedCustomer.name,
          productName: firstItem ? getProductName(firstItem.product, language) : "items",
          quantity: firstItem ? firstItem.quantity : String(itemsToSave.length),
          amount: total,
          balance: Math.max(0, Number(selectedCustomer.outstandingBalance ?? 0) + total),
          shopName: process.env.NEXT_PUBLIC_SHOP_NAME ?? "GramMart Store",
          language,
        }).catch(() => {});
      }
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
      // 📲 WhatsApp notification
      if (selectedCustomer?.phone) {
        notifyPaymentReceived({
          phone: selectedCustomer.phone,
          customerName: selectedCustomer.name,
          amount,
          balance: Math.max(0, Number(selectedCustomer.outstandingBalance ?? 0) - amount),
          shopName: process.env.NEXT_PUBLIC_SHOP_NAME ?? "GramMart Store",
          language,
        }).catch(() => {});
      }
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

  function applyResolvedCustomerBalance(customer: Customer, delta: number) {
    const nextBalance = Math.max(0, Number(customer.outstandingBalance ?? "0") + delta).toFixed(2);
    const updated = { ...customer, outstandingBalance: nextBalance };
    setSelectedCustomer(updated);
    setCustomers((existing) => existing.map((item) => item.id === updated.id ? updated : item));
    return updated;
  }

  function normalizeVoiceText(text: string) {
    return text.toLowerCase().trim().replace(/[.,!?_\-]/g, " ").replace(/\s+/g, " ");
  }

  function isProductInfoQueryText(text: string) {
    const normalized = normalizeVoiceText(text);
    return /\b(price|rate|cost|mrp|stock|available|availability|how much|what is|tell me|show me)\b/.test(normalized)
      || normalized.includes("விலை")
      || normalized.includes("இருப்பு")
      || normalized.includes("எவ்வளவு")
      || normalized.includes("கிடைக்குமா");
  }

  function isExplicitPurchaseCommandText(text: string) {
    const normalized = normalizeVoiceText(text);
    return /\b(add|put|give|credit|sale|sold|purchase|bought|bill|record|save|write|enter|log)\b/.test(normalized)
      || normalized.includes("கடன்")
      || normalized.includes("சேர்")
      || normalized.includes("போடு")
      || normalized.includes("கொடு")
      || normalized.includes("வாங்கினார்");
  }

  function productSearchText(product: Product, lang: Language) {
    return [
      product.name,
      getProductName(product, lang),
      product.sku,
      product.category,
      product.brand,
      product.unit,
      product.aliases
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function canonicalProductAlias(text: string) {
    const normalized = normalizeVoiceText(text);
    const aliases: Array<[string[], string]> = [
      [["milk", "paal", "doodh", "amul", "aavin", "nandini"], "milk"],
      [["rice", "arisi", "chawal", "ponni", "basmati"], "rice"],
      [["sugar", "sakkarai", "chini", "cheeni"], "sugar"],
      [["oil", "sunflower", "groundnut", "coconut oil"], "oil"],
      [["dal", "paruppu", "toor", "moong", "chana"], "dal"]
    ];
    for (const [keys, alias] of aliases) {
      if (keys.some((key) => normalized.includes(key))) return alias;
    }
    return normalized;
  }

  function resolveProductFromVoice(alias: string | undefined, fullText: string, lang: Language) {
    const resolution = resolveProductEntity(`${alias ?? ""} ${fullText}`, products, lang);
    return resolution.product;
  }

  function extractVoiceCustomerName(normalized: string) {
    for (const c of customers) {
      if (normalized.includes(c.name.toLowerCase())) return c.name;
      const firstName = c.name.toLowerCase().split(/\s+/)[0];
      if (firstName.length > 2 && normalized.includes(firstName)) return c.name;
    }

    const patterns = [
      /\b(?:to|for|into|in|on)\s+([a-z][a-z\s]{1,40}?)\s+(?:account|khata|book)\b/,
      /\b([a-z][a-z\s]{1,40}?)\s+(?:account|khata)\b/,
      /\b(?:open|show)\s+([a-z][a-z\s]{1,40}?)\s+(?:account|khata)?\b/
    ];
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (match?.[1]) {
        const cleaned = match[1]
          .replace(/\b(add|credit|sale|purchase|payment|paid|receive|received|rupees?|rs|milk|rice|sugar|oil|dal|liters?|litres?|kg|kilo|packet|of)\b/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (cleaned) return cleaned;
      }
    }
    return undefined;
  }

  function extractVoiceQuantity(normalized: string) {
    const numberWords: Record<string, string> = {
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      ten: "10"
    };
    const numeric = normalized.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram|g|gram|liter|litre|l|ml|packet|pack|piece|pc)?/);
    if (numeric) return numeric[1];
    for (const [word, value] of Object.entries(numberWords)) {
      if (normalized.includes(word)) return value;
    }
    return undefined;
  }

  function parseLocalCommand(text: string, lang: Language) {
    const normalized = normalizeVoiceText(text);
    let intent = "UNKNOWN";
    if (normalized.includes("open") || normalized.includes("account") || normalized.includes("khata") || normalized.includes("खोल") || normalized.includes("திற") || normalized.includes("கணக்கு")) {
      intent = "OPEN_CUSTOMER";
    }
    if (normalized.includes("paid") || normalized.includes("received") || normalized.includes("payment") || normalized.includes("ரூபாய்") || normalized.includes("பணம்") || normalized.includes("பற்று")) {
      intent = "RECEIVE_PAYMENT";
    }
    const detectedProduct = resolveProductFromVoice(undefined, normalized, lang);
    const isProductInfoQuery = isProductInfoQueryText(normalized);
    const isExplicitPurchaseCommand = isExplicitPurchaseCommandText(normalized);
    if (isExplicitPurchaseCommand && !isProductInfoQuery) {
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

    let customerName: string | undefined = extractVoiceCustomerName(normalized);

    let productAlias: string | undefined = undefined;
    if (detectedProduct) productAlias = detectedProduct.name;
    if (!productAlias) {
      if (normalized.includes("milk") || normalized.includes("paal") || normalized.includes("doodh")) productAlias = "Milk";
      else if (normalized.includes("sugar") || normalized.includes("சர்க்கரை") || normalized.includes("चीनी")) productAlias = "Sugar 1 kg";
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
    quantity = extractVoiceQuantity(normalized);
    if (!quantity) {
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

  // ─── Phonetic skeleton: strip vowels + normalize common sound groups ─────
  function phoneticKey(s: string) {
    return s.toLowerCase()
      .replace(/[aeiouáéíóúāēīōū]/g, "")   // strip vowels
      .replace(/sh|ch/g, "s")
      .replace(/ph/g, "f")
      .replace(/ck|kk/g, "k")
      .replace(/tt|dd/g, "t")
      .replace(/[^a-z]/g, "")              // keep only ascii letters
      .trim();
  }

  // ─── Tamil script → romanized phonetic map for common name sounds ─────────
  const TAMIL_ROMAN: [string, string][] = [
    ["லட்சுமி","lakshmi"],["லக்ஷ்மி","lakshmi"],["ராஜேஷ்","rajesh"],
    ["ரவி","ravi"],["அவினாஷ்","avinash"],["அவினாஷ","avinash"],
    ["சுரேஷ்","suresh"],["மகேஷ்","mahesh"],["ரமேஷ்","ramesh"],
    ["முருகன்","murugan"],["கார்த்திக்","karthik"],["கணேஷ்","ganesh"],
    ["விஜய்","vijay"],["அஜய்","ajay"],["சஞ்சய்","sanjay"],
    ["பிரியா","priya"],["கவிதா","kavitha"],["சவிதா","savitha"],
    ["அனிதா","anitha"],["மீனா","meena"],["கீதா","geetha"],
    ["சரிதா","saritha"],["லலிதா","lalitha"],["மாலா","mala"],
    ["சுந்தர்","sundar"],["வேலு","velu"],["பாண்டி","pandi"],
    ["செல்வம்","selvam"],["குமார்","kumar"],["பாலு","balu"],
    ["ரஞ்சித்","ranjith"],["திலீப்","dileep"],["சதீஷ்","satish"],
    ["அப்துல்","abdul"],["ஹுசேன்","hussain"],["இப்ராஹிம்","ibrahim"],
    ["ஜான்","john"],["மேரி","mary"],["ஜோஸஃப்","joseph"],
  ];

  // ─── Find customer with 4-layer fuzzy matching ────────────────────────────
  function findCustomerFuzzy(voiceName: string): Customer | undefined {
    if (!voiceName) return undefined;
    const query = voiceName.trim();
    const qLower = query.toLowerCase();

    // Layer 1: exact match (case-insensitive)
    let found = customers.find(c => c.name.toLowerCase() === qLower);
    if (found) return found;

    // Layer 2: partial includes (both ways)
    found = customers.find(c =>
      c.name.toLowerCase().includes(qLower) ||
      qLower.includes(c.name.toLowerCase())
    );
    if (found) return found;

    // Layer 3: Tamil script → romanized → match
    let romanized = qLower;
    for (const [ta, en] of TAMIL_ROMAN) {
      if (qLower.includes(ta.toLowerCase())) {
        romanized = qLower.replace(ta.toLowerCase(), en);
        break;
      }
    }
    if (romanized !== qLower) {
      found = customers.find(c =>
        c.name.toLowerCase().includes(romanized) ||
        romanized.includes(c.name.toLowerCase())
      );
      if (found) return found;
    }

    // Layer 4: phonetic skeleton similarity
    const qKey = phoneticKey(query);
    if (qKey.length >= 2) {
      // Find best phonetic match
      let best: Customer | undefined;
      let bestScore = 999;
      for (const c of customers) {
        const cKey = phoneticKey(c.name);
        // Levenshtein distance on phonetic keys
        const dist = levenshtein(qKey, cKey);
        const threshold = Math.max(2, Math.floor(cKey.length * 0.4));
        if (dist < bestScore && dist <= threshold) {
          bestScore = dist;
          best = c;
        }
      }
      if (best) return best;
    }

    return undefined;
  }

  function levenshtein(a: string, b: string): number {
    const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[a.length][b.length];
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

    // ── Helper: find & open customer ──────────────────────────────────────
    const resolveCustomer = (name?: string): Customer | null => {
      if (!name) return selectedCustomer ?? null;
      const found = findCustomerFuzzy(name);
      if (found) { openCustomer(found); return found; }
      setStatus(`❌ Customer "${name}" not found. Please check the name.`);
      return null;
    };

    // ── Helper: find product ──────────────────────────────────────────────
    const resolveProduct = (alias?: string) => {
      if (!alias) return selectedProduct ?? null;
      const p = resolveProductFromVoice(alias, alias, language);
      if (p) { setSelectedProduct(p); return p; }
      return null;
    };

    if (intent === "OPEN_CUSTOMER" || intent === "ASK_BALANCE") {
      const cust = resolveCustomer(cmd.customerName);
      if (!cust) return;
      if (intent === "ASK_BALANCE") {
        setActiveTask("ai");
        setStatus(`${cust.name}'s balance: ₹${cust.outstandingBalance ?? 0}.`);
      } else {
        setStatus(`✅ Opened account: ${cust.name}`);
      }

    } else if (intent === "ADD_PURCHASE") {
      // ── Step 1: find customer (do NOT rely on selectedCustomer state) ──────
      const commandMentionsCustomer = Boolean(cmd.customerName && cmd.customerName.trim());
      const cust = findCustomerFuzzy(cmd.customerName ?? "") ?? (!commandMentionsCustomer ? selectedCustomer : null);
      if (!cust) {
        setStatus(`❌ Customer "${cmd.customerName ?? "unknown"}" not found. Please check the name.`);
        return;
      }

      // ── Step 2: find product ────────────────────────────────────────────────
      const prod = resolveProduct(cmd.productAlias);
      if (!prod) {
        setStatus(`❌ Product "${cmd.productAlias ?? ""}" not found in catalog.`);
        return;
      }

      // ── Step 3: parse quantity ──────────────────────────────────────────────
      const qtyStr = (cmd.quantity ?? "1").match(/\d+(\.\d+)?/)?.[0] ?? "1";
      const total   = Number(prod.sellingPrice) * Number(qtyStr);

      // ── Step 4: set UI state so screen opens correctly ──────────────────────
      setSelectedCustomer(cust);
      setSelectedProduct(prod);
      setView("billing");
      setActiveTask("credit");
      setBusy(true);
      setStatus(`⏳ Adding ${qtyStr} ${prod.name} → ${cust.name}'s account…`);

      // ── Step 5: save — call API directly with `cust.id` (no stale state) ───
      try {
        if (demoMode) {
          // Demo mode: update local state directly
          const updatedCustomer = applyResolvedCustomerBalance(cust, total);
          setTodayCreditVal(prev => prev + total);
          setTodaySalesVal(prev => prev + total);
          setStatus(`✅ ${qtyStr} ${prod.name} added to ${cust.name}'s account! (₹${total.toFixed(2)})`);

          // WhatsApp notification
          if (cust.phone) {
            notifyCreditSale({
              phone: cust.phone,
              customerName: cust.name,
              productName: prod.name,
              quantity: qtyStr,
              amount: total,
              balance: Number(updatedCustomer.outstandingBalance ?? 0),
              shopName: process.env.NEXT_PUBLIC_SHOP_NAME ?? "GramMart Store",
              language,
            }).catch(() => {});
          }
        } else {
          // Live mode: call API with resolved cust.id directly
          const bill = await createCreditBill({
            customerId: cust.id,
            creditBill: true,
            items: [{ productId: prod.id, quantity: qtyStr }],
          });
          const billTotal = Number(bill?.totalAmount ?? total);
          const updatedCustomer = applyResolvedCustomerBalance(cust, billTotal);
          setTodayCreditVal(prev => prev + billTotal);
          setTodaySalesVal(prev => prev + billTotal);
          setStatus(`✅ ${qtyStr} ${prod.name} added to ${cust.name}'s account! (₹${billTotal.toFixed(2)})`);

          // WhatsApp notification
          if (cust.phone) {
            notifyCreditSale({
              phone: cust.phone,
              customerName: cust.name,
              productName: prod.name,
              quantity: qtyStr,
              amount: billTotal,
              balance: Number(updatedCustomer.outstandingBalance ?? 0),
              shopName: process.env.NEXT_PUBLIC_SHOP_NAME ?? "GramMart Store",
              language,
            }).catch(() => {});
          }
        }
      } catch {
        // Fallback to demo mode on API failure
        applyResolvedCustomerBalance(cust, total);
        setTodayCreditVal(prev => prev + total);
        setTodaySalesVal(prev => prev + total);
        setStatus(`✅ ${qtyStr} ${prod.name} added to ${cust.name}'s account! (₹${total.toFixed(2)})`);
      } finally {
        setSelectedProduct(null);
        setBusy(false);
      }


    } else if (intent === "RECEIVE_PAYMENT") {
      const cust = resolveCustomer(cmd.customerName);
      if (!cust) return;

      const amt = Number(cmd.amount ?? "0");
      if (amt <= 0) {
        setStatus("❌ Could not understand payment amount. Please retry.");
        return;
      }

      setView("billing");
      setActiveTask("payment");
      setBusy(true);
      setStatus(`⏳ Recording ₹${amt} payment from ${cust.name}…`);
      try {
        await executeSavePayment(amt);
        setStatus(`✅ ₹${amt} payment received from ${cust.name}!`);
      } catch {
        setStatus("❌ Could not save payment. Please try again.");
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
        const matched = findCustomerFuzzy(cmd.customerName) ?? customers.find(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)));
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
        const matched = findCustomerFuzzy(cmd.customerName) ?? customers.find(c => c.name.toLowerCase().includes(query));
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
        const matchedProduct = resolveProductFromVoice(alias, alias, language);
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
        const matched = findCustomerFuzzy(cmd.customerName) ?? customers.find(c => c.name.toLowerCase().includes(query));
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
        void executeDirectCommand({ ...pendingVoiceCommand, quantity: pendingVoiceCommand.quantity ?? voiceQuantity });
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
            todaySales={todaySalesVal}
            todayCredit={todayCreditVal}
            todayPayments={todayPaymentsVal}
            aiQueryOverride={aiQueryOverride}
            setAiQueryOverride={setAiQueryOverride}
            onRunCommand={executeDirectCommand}
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
                if (isProductInfoQueryText(transcript.trim())) {
                  setAiQueryOverride(transcript.trim());
                  setView("ai");
                  setActiveTask("ai");
                  setStatus(`Answering product question: "${transcript.trim()}"`);
                  return;
                }
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
        if (value) setStatus(value);
      }} onCommandParsed={async (cmd) => {
        if (!cmd || !cmd.intent) return;
        const transcriptText = [cmd.customerName, cmd.productAlias, cmd.quantity, cmd.amount, cmd.intent].filter(Boolean).join(" ");
        const rawText = "rawText" in cmd && typeof cmd.rawText === "string" ? cmd.rawText : "";
        if (isProductInfoQueryText(rawText || transcript || transcriptText)) {
          const question = rawText || transcript || transcriptText;
          setAiQueryOverride(question);
          setView("ai");
          setActiveTask("ai");
          setStatus(`Answering product question: "${question}"`);
          return;
        }
        const enrichedCommand = parseLocalCommand(rawText || transcript || transcriptText, language);
        const commandToRun = enrichedCommand.intent !== "UNKNOWN" ? enrichedCommand : cmd;
        if (String(commandToRun.intent).toUpperCase() === "UNKNOWN") {
          const question = rawText || transcript || transcriptText;
          setAiQueryOverride(question);
          setView("ai");
          setActiveTask("ai");
          setStatus(`Answering with AI Command Center: "${question}"`);
          return;
        }
        setTranscript(rawText || transcript || commandToRun.intent);
        // Always try direct execution first (auto-completes compound commands)
        try {
          await executeDirectCommand(commandToRun);
        } catch {
          // Fallback to guided mode
          handleVoiceCommand(commandToRun);
        }
      }} />
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
        <CustomerDirectory customers={customers} onOpenCustomer={props.onOpenCustomer} copy={props.copy} language={props.language} />
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
            {customers.slice(0, 5).map((item) => <CustomerCard key={item.id} customer={item} language={props.language} onClick={() => props.onOpenCustomer(item)} />)}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-ink p-5 text-white">
            <p className="text-sm font-black uppercase tracking-wide text-white/65">{props.copy.customerAccount}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-4xl font-black">{getDisplayName(customer.name, props.language)}</h2>
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
            {(view === "ai" || activeTask === "ai") && <InlineAI customer={customer} transcript={props.transcript} copy={props.copy} language={props.language} />}
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

function CustomerDirectory({ customers, onOpenCustomer, copy, language }: { customers: Customer[]; onOpenCustomer: (customer: Customer) => void; copy: ReturnType<typeof t>; language: Language }) {
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
        {customers.map((customer) => <CustomerCard key={customer.id} customer={customer} language={language} onClick={() => onOpenCustomer(customer)} />)}
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

function InlineAI({ customer, transcript, copy, language }: { customer: Customer; transcript: string; copy: ReturnType<typeof t>; language: Language }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-2xl font-black"><Sparkles className="h-6 w-6 text-leaf-700" aria-hidden /> {copy.aiHelp}</h3>
      <div className="mt-3 grid gap-2">
        <AssistantBubble text={`${getDisplayName(customer.name, language)} currently has Rs.${customer.outstandingBalance ?? "0"} pending.`} />
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
  MALAYALAM: "ml-IN",
  TANGLISH: "en-IN", // Tamil + English code-switching, use English voice
  HINGLISH: "en-IN"  // Hindi + English code-switching, use English voice
};

function normalizeAssistantText(text: string) {
  return text.toLowerCase().trim().replace(/[.,!?_\-|]/g, " ").replace(/\s+/g, " ");
}

function tokenizeAssistantText(text: string) {
  return normalizeAssistantText(text)
    .split(/\s+/)
    .filter(Boolean);
}

const productStopWords = new Set([
  "price", "rate", "cost", "mrp", "stock", "available", "availability", "how", "much", "what", "is", "the", "of",
  "tell", "show", "me", "add", "put", "give", "credit", "sale", "sold", "purchase", "bought", "bill", "record",
  "save", "write", "enter", "log", "to", "for", "in", "on", "account", "khata", "kg", "kilo", "kilogram", "g",
  "gram", "litre", "liter", "litres", "liters", "l", "ml", "packet", "pack", "piece", "pc"
]);

const canonicalProductSynonyms: Record<string, string[]> = {
  milk: ["milk", "paal", "doodh", "aavin", "amul milk", "nandini milk", "பால்"],
  rice: ["rice", "arisi", "chawal", "பச்சரிசி", "அரிசி"],
  sugar: ["sugar", "sakkarai", "chini", "cheeni", "சர்க்கரை"],
  oil: ["oil", "sunflower oil", "groundnut oil", "coconut oil", "ennai", "எண்ணெய்"],
  dal: ["dal", "paruppu", "toor dal", "moong dal", "chana dal", "பருப்பு"],
  noodles: ["noodles", "maggi", "magi", "maagi", "instant noodles", "2 minute noodles"]
};

type ProductResolution = {
  product: Product | null;
  confidence: number;
  alternatives: Product[];
  matchedTerm?: string;
};

function splitAliases(aliases?: string) {
  if (!aliases) return [];
  return aliases
    .replace(/[\[\]"]/g, " ")
    .split(/[,|;]/)
    .map((alias) => alias.trim())
    .filter(Boolean);
}

function productResolutionTerms(product: Product, language: Language) {
  const baseTerms = [
    product.name,
    getProductName(product, language),
    product.nameTa,
    product.nameHi,
    product.nameTe,
    product.nameKn,
    product.nameMl,
    product.brand ? `${product.brand} ${product.name}` : undefined,
    ...splitAliases(product.aliases)
  ].filter(Boolean) as string[];

  const normalizedName = normalizeAssistantText(product.name);
  const nameTokens = new Set(tokenizeAssistantText(product.name));
  const synonymTerms = Object.entries(canonicalProductSynonyms)
    .filter(([canonical, synonyms]) => nameTokens.has(canonical) || synonyms.some((term) => normalizedName === normalizeAssistantText(term)))
    .flatMap(([, synonyms]) => synonyms);

  return Array.from(new Set([...baseTerms, ...synonymTerms].map(normalizeAssistantText).filter((term) => term.length > 1)));
}

function resolveProductEntity(text: string, products: Product[], language: Language): ProductResolution {
  const normalized = normalizeAssistantText(text);
  const queryTokens = tokenizeAssistantText(text).filter((token) => !productStopWords.has(token) && !/^\d+(\.\d+)?$/.test(token));
  const scored = products
    .map((product) => {
      let score = 0;
      let matchedTerm: string | undefined;
      for (const term of productResolutionTerms(product, language)) {
        const termTokens = term.split(/\s+/).filter(Boolean);
        if (!termTokens.length) continue;
        const exactPhrase = new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(normalized);
        const allTokensPresent = termTokens.every((token) => queryTokens.includes(token));
        const anyMeaningfulToken = termTokens.some((token) => token.length > 2 && queryTokens.includes(token));
        if (exactPhrase) {
          const next = Math.min(0.99, 0.93 + Math.min(term.length, 20) / 400);
          if (next > score) {
            score = next;
            matchedTerm = term;
          }
        } else if (allTokensPresent) {
          const next = termTokens.length > 1 ? 0.92 : 0.9;
          if (next > score) {
            score = next;
            matchedTerm = term;
          }
        } else if (anyMeaningfulToken) {
          const next = 0.72;
          if (next > score) {
            score = next;
            matchedTerm = term;
          }
        }
      }
      return { product, score, matchedTerm };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.length - b.product.name.length);

  const best = scored[0];
  if (!best) return { product: null, confidence: 0, alternatives: [] };
  const alternatives = scored
    .filter((item) => item.product.id !== best.product.id && best.score - item.score < 0.04)
    .map((item) => item.product)
    .slice(0, 3);
  return {
    product: best.score >= 0.9 && alternatives.length === 0 ? best.product : null,
    confidence: best.score,
    alternatives: [best.product, ...alternatives].slice(0, 4),
    matchedTerm: best.matchedTerm
  };
}

function extractQuantityAndUnit(text: string) {
  const normalized = normalizeAssistantText(text);
  const numberWords: Record<string, string> = {
    one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10"
  };
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(kg|kilo|kilogram|g|gram|litre|liter|litres|liters|l|ml|packet|pack|piece|pc)?/);
  if (match) return { quantity: match[1], unit: match[2] };
  for (const [word, value] of Object.entries(numberWords)) {
    const wordMatch = normalized.match(new RegExp(`\\b${word}\\b\\s*(kg|kilo|kilogram|g|gram|litre|liter|litres|liters|l|ml|packet|pack|piece|pc)?`));
    if (wordMatch) return { quantity: value, unit: wordMatch[1] };
  }
  return { quantity: undefined, unit: undefined };
}

function isAssistantInfoQuery(text: string) {
  const normalized = normalizeAssistantText(text);
  return /\b(price|rate|cost|mrp|stock|available|availability|how much|what is|tell me|show me)\b/.test(normalized)
    || normalized.includes("விலை")
    || normalized.includes("இருப்பு")
    || normalized.includes("எவ்வளவு")
    || normalized.includes("கிடைக்குமா");
}

function isAssistantMutationCommand(text: string) {
  const normalized = normalizeAssistantText(text);
  return /\b(add|put|give|credit|sale|sold|purchase|bought|bill|record|save|write|enter|log|receive|received|paid|payment|send reminder|remind|open account|open)\b/.test(normalized)
    || normalized.includes("கடன்")
    || normalized.includes("சேர்")
    || normalized.includes("போடு")
    || normalized.includes("கொடு")
    || normalized.includes("பணம்")
    || normalized.includes("திற");
}

function findCatalogProductForQuestion(text: string, products: Product[], language: Language) {
  return resolveProductEntity(text, products, language).product;
}

function localProductQueryAnswer(text: string, products: Product[], language: Language) {
  if (!isAssistantInfoQuery(text) || isAssistantMutationCommand(text)) return null;
  const resolution = resolveProductEntity(text, products, language);
  const product = resolution.product;
  if (!product) {
    if (resolution.alternatives.length > 0) {
      return `I found similar products but confidence is ${Math.round(resolution.confidence * 100)}%. Did you mean ${resolution.alternatives.map((item) => getProductName(item, language)).join(" or ")}?`;
    }
    return "I could not identify the product confidently. Please say the exact item name, for example Milk, Rice, or Sugar.";
  }
  const name = getProductName(product, language);
  const unit = product.unit ? ` per ${product.unit}` : "";
  const stock = product.stockQuantity ? ` Stock: ${Number(product.stockQuantity).toLocaleString()}${product.unit ? ` ${product.unit}` : ""}.` : "";
  const { quantity, unit: spokenUnit } = extractQuantityAndUnit(text);
  const price = Number(product.sellingPrice);
  const qty = Number(quantity ?? "0");
  const mrp = product.mrp ? ` MRP: Rs.${Number(product.mrp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.` : "";
  if (qty > 0) {
    const total = price * qty;
    return `Intent: GET_PRODUCT_PRICE. Product: ${name}. Quantity: ${quantity}. Unit: ${spokenUnit ?? product.unit ?? "unit"}. ${quantity} ${spokenUnit ?? product.unit ?? ""} of ${name} costs Rs.${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Price: Rs.${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}.${stock}${mrp} Confidence: ${Math.round(resolution.confidence * 100)}%.`;
  }
  return `Intent: GET_PRODUCT_PRICE. Product: ${name}. Current Price: Rs.${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}.${stock}${mrp} Confidence: ${Math.round(resolution.confidence * 100)}%.`;
}

function findMentionedCustomer(text: string, customers: Customer[]) {
  const normalized = normalizeAssistantText(text);
  return customers.find((customer) => {
    const name = customer.name.toLowerCase();
    const first = name.split(/\s+/)[0];
    return normalized.includes(name) || (first.length > 2 && normalized.includes(first)) || Boolean(customer.phone && normalized.includes(customer.phone));
  });
}

function findMentionedProduct(text: string, products: Product[], language: Language) {
  return resolveProductEntity(text, products, language).product;
}

function extractAssistantAmount(text: string) {
  const normalized = normalizeAssistantText(text);
  const match = normalized.match(/(?:rs|rupees|₹)?\s*(\d+(?:\.\d+)?)/);
  return match?.[1];
}

function extractAssistantQuantity(text: string) {
  return extractQuantityAndUnit(text).quantity ?? "1";
}

function parseAssistantAction(text: string, customers: Customer[], products: Product[], language: Language, activeCustomer: Customer | null) {
  const normalized = normalizeAssistantText(text);
  const customer = findMentionedCustomer(text, customers) ?? activeCustomer;
  const product = findMentionedProduct(text, products, language);

  if (/\b(open|show|switch|load)\b/.test(normalized) && /\b(account|customer|khata)\b/.test(normalized)) {
    const explicitCustomer = findMentionedCustomer(text, customers);
    return { intent: "OPEN_CUSTOMER", customerName: explicitCustomer?.name };
  }

  if (/\b(paid|payment|receive|received|settled|cash)\b/.test(normalized)) {
    return {
      intent: "RECEIVE_PAYMENT",
      customerName: customer?.name,
      amount: extractAssistantAmount(text)
    };
  }

  if (isAssistantMutationCommand(text) && product) {
    return {
      intent: "ADD_PURCHASE",
      customerName: customer?.name,
      productAlias: product.name,
      quantity: extractAssistantQuantity(text)
    };
  }

  return null;
}

function localBusinessAnswer(
  text: string,
  customers: Customer[],
  products: Product[],
  todaySales: number,
  todayCredit: number,
  todayPayments: number,
  language: Language
) {
  const normalized = normalizeAssistantText(text);
  const totalPending = customers.reduce((sum, customer) => sum + Number(customer.outstandingBalance ?? "0"), 0);
  const pendingCustomers = customers
    .filter((customer) => Number(customer.outstandingBalance ?? "0") > 0)
    .sort((a, b) => Number(b.outstandingBalance ?? "0") - Number(a.outstandingBalance ?? "0"));

  if (normalized.includes("who owes") || normalized.includes("owes most") || normalized.includes("highest pending")) {
    const top = pendingCustomers[0];
    return top ? `${top.name} owes the most: Rs.${Number(top.outstandingBalance ?? "0").toLocaleString()}.` : "No customer has pending credit right now.";
  }

  if (normalized.includes("pending customers") || normalized.includes("pending balance above")) {
    const threshold = Number(extractAssistantAmount(text) ?? "0");
    const rows = pendingCustomers.filter((customer) => Number(customer.outstandingBalance ?? "0") >= threshold).slice(0, 6);
    return rows.length
      ? `Pending customers: ${rows.map((customer) => `${customer.name} Rs.${Number(customer.outstandingBalance ?? "0").toLocaleString()}`).join(", ")}.`
      : "No pending customers match that amount.";
  }

  if (normalized.includes("how many customers") || normalized.includes("customers registered")) {
    return `${customers.length} customers are registered.`;
  }

  if (normalized.includes("outstanding") || normalized.includes("total credit") || normalized.includes("credit outstanding")) {
    return `Total outstanding credit is Rs.${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
  }

  if (normalized.includes("today") && (normalized.includes("sale") || normalized.includes("sales"))) {
    return `Today's sales are Rs.${todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Credit sales: Rs.${todayCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Payments: Rs.${todayPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
  }

  if (normalized.includes("low stock") || normalized.includes("running low") || normalized.includes("restock")) {
    const lowStock = products
      .filter((product) => Number(product.stockQuantity ?? "9999") <= 10)
      .slice(0, 5);
    if (lowStock.length) {
      return `Restock needed: ${lowStock.map((product) => `${getProductName(product, language)} (${Number(product.stockQuantity ?? 0).toLocaleString()} left)`).join(", ")}.`;
    }
    const fastMoving = products.slice(0, 5).map((product) => getProductName(product, language)).join(", ");
    return `No low-stock alert from current catalog. Check fast movers today: ${fastMoving}.`;
  }

  return null;
}

function AIAssistant({
  status,
  setStatus,
  copy,
  language,
  customer,
  transcript,
  customers,
  products,
  todaySales,
  todayCredit,
  todayPayments,
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
  todaySales: number;
  todayCredit: number;
  todayPayments: number;
  aiQueryOverride: string;
  setAiQueryOverride: (val: string) => void;
  onRunCommand: (cmd: {
    intent: string;
    customerName?: string;
    productAlias?: string;
    amount?: string;
    quantity?: string;
  }) => void | Promise<void>;
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
      const actionCommand = !isAssistantInfoQuery(text)
        ? parseAssistantAction(text, customers, products, language, customer)
        : null;
      if (actionCommand) {
        const confirmation = actionCommand.intent === "ADD_PURCHASE"
          ? `Executing: add ${actionCommand.quantity ?? "1"} ${actionCommand.productAlias ?? "product"} to ${actionCommand.customerName ?? "current customer"} account.`
          : actionCommand.intent === "RECEIVE_PAYMENT"
            ? `Executing: receive Rs.${actionCommand.amount ?? "0"} from ${actionCommand.customerName ?? "current customer"}.`
            : `Executing: open ${actionCommand.customerName ?? "customer"} account.`;
        setAnswer(confirmation);
        setStatus(confirmation);
        await onRunCommand(actionCommand);
        return;
      }

      const localCatalogAnswer = localProductQueryAnswer(text, products, language);
      if (localCatalogAnswer) {
        setAnswer(localCatalogAnswer);
        setStatus(localCatalogAnswer);
        return;
      }

      const businessAnswer = localBusinessAnswer(text, customers, products, todaySales, todayCredit, todayPayments, language);
      if (businessAnswer) {
        setAnswer(businessAnswer);
        setStatus(businessAnswer);
        return;
      }

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
          // Always execute action commands from AI response
          if (actionCmd && actionCmd.intent) {
            await executeDirectCommand(actionCmd);
            // Keep the AI's natural language response
            if (!nextAnswer || nextAnswer.length < 10) {
              nextAnswer = `Done. ${actionCmd.intent === "ADD_PURCHASE" ? `Added ${actionCmd.quantity || "1"} ${actionCmd.productAlias} to ${actionCmd.customerName || customer?.name || "account"}.` : actionCmd.intent === "RECEIVE_PAYMENT" ? `Received Rs.${actionCmd.amount} from ${actionCmd.customerName || customer?.name}.` : `Opened ${actionCmd.customerName} account.`}`;
            }
          }
        } catch (e) {
          console.error("Failed to parse action from AI response:", e);
          nextAnswer = `${nextAnswer || "I understood your request but couldn't execute it. Please try again."}`;
        }
      } else if (isAssistantMutationCommand(text) && !isAssistantInfoQuery(text)) {
        // If user clearly wants to do something but AI didn't provide action block,
        // try to parse and execute it directly
        const fallbackAction = parseAssistantAction(text, customers, products, language, customer);
        if (fallbackAction) {
          nextAnswer = nextAnswer || "Processing your request...";
          try {
            await executeDirectCommand(fallbackAction);
          } catch (e) {
            console.error("Failed to execute fallback action:", e);
          }
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

function CustomerCard({ customer, onClick, language }: { customer: Customer; onClick: () => void; language: Language }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md bg-white p-3 text-left shadow-sm hover:shadow-soft">
      <p className="text-lg font-black">{getDisplayName(customer.name, language)}</p>
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
