import { NextRequest, NextResponse } from "next/server";

// ─── Twilio credentials (set these in .env.local + Vercel env vars) ──────────
const TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN  ?? "";
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886"; // Twilio sandbox default

// ─── Message templates per language ──────────────────────────────────────────
type Lang = "ENGLISH"|"TAMIL"|"HINDI"|"TELUGU"|"KANNADA"|"MALAYALAM";

const templates: Record<string, Record<Lang, string>> = {
  CREDIT_SALE: {
    ENGLISH:   (d: any) => `🛒 *GramMart Alert*\nHello ${d.customerName}!\n${d.quantity} ${d.productName} has been added on credit to your account.\n💰 Amount: ₹${d.amount}\n📊 Total Due: ₹${d.balance}\n\n_${d.shopName}_`,
    TAMIL:     (d: any) => `🛒 *கிராம்மார்ட் அறிவிப்பு*\nவணக்கம் ${d.customerName}!\n${d.quantity} ${d.productName} உங்கள் கணக்கில் கடனாக சேர்க்கப்பட்டது.\n💰 தொகை: ₹${d.amount}\n📊 மொத்த நிலுவை: ₹${d.balance}\n\n_${d.shopName}_`,
    HINDI:     (d: any) => `🛒 *ग्रामार्ट अलर्ट*\nनमस्ते ${d.customerName}!\n${d.quantity} ${d.productName} आपके खाते में उधार जोड़ा गया।\n💰 राशि: ₹${d.amount}\n📊 कुल बकाया: ₹${d.balance}\n\n_${d.shopName}_`,
    TELUGU:    (d: any) => `🛒 *గ్రామ్‌మార్ట్ అలర్ట్*\nనమస్తే ${d.customerName}!\n${d.quantity} ${d.productName} మీ ఖాతాలో అప్పుగా జోడించబడింది.\n💰 మొత్తం: ₹${d.amount}\n📊 మొత్తం బాకీ: ₹${d.balance}\n\n_${d.shopName}_`,
    KANNADA:   (d: any) => `🛒 *ಗ್ರಾಮ್‌ಮಾರ್ಟ್ ಅಲರ್ಟ್*\nನಮಸ್ಕಾರ ${d.customerName}!\n${d.quantity} ${d.productName} ನಿಮ್ಮ ಖಾತೆಗೆ ಸಾಲವಾಗಿ ಸೇರಿಸಲಾಗಿದೆ.\n💰 ಮೊತ್ತ: ₹${d.amount}\n📊 ಒಟ್ಟು ಬಾಕಿ: ₹${d.balance}\n\n_${d.shopName}_`,
    MALAYALAM: (d: any) => `🛒 *ഗ്രാംമാർട്ട് അലർട്ട്*\nനമസ്കാരം ${d.customerName}!\n${d.quantity} ${d.productName} നിങ്ങളുടെ അക്കൗണ്ടിൽ കടമായി ചേർത്തു.\n💰 തുക: ₹${d.amount}\n📊 മൊത്തം ബാക്കി: ₹${d.balance}\n\n_${d.shopName}_`,
  } as any,
  PAYMENT_RECEIVED: {
    ENGLISH:   (d: any) => `✅ *GramMart Payment*\nHello ${d.customerName}!\nPayment of ₹${d.amount} received. Thank you!\n📊 Remaining Balance: ₹${d.balance}\n\n_${d.shopName}_`,
    TAMIL:     (d: any) => `✅ *கிராம்மார்ட் பணம்*\nவணக்கம் ${d.customerName}!\n₹${d.amount} பணம் பெறப்பட்டது. நன்றி!\n📊 மீதமுள்ள நிலுவை: ₹${d.balance}\n\n_${d.shopName}_`,
    HINDI:     (d: any) => `✅ *ग्रामार्ट भुगतान*\nनमस्ते ${d.customerName}!\n₹${d.amount} का भुगतान प्राप्त हुआ। धन्यवाद!\n📊 शेष बकाया: ₹${d.balance}\n\n_${d.shopName}_`,
    TELUGU:    (d: any) => `✅ *గ్రామ్‌మార్ట్ పేమెంట్*\nనమస్తే ${d.customerName}!\n₹${d.amount} చెల్లింపు అందింది. ధన్యవాదాలు!\n📊 మిగిలిన బాకీ: ₹${d.balance}\n\n_${d.shopName}_`,
    KANNADA:   (d: any) => `✅ *ಗ್ರಾಮ್‌ಮಾರ್ಟ್ ಪಾವತಿ*\nನಮಸ್ಕಾರ ${d.customerName}!\n₹${d.amount} ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಧನ್ಯವಾದ!\n📊 ಉಳಿದ ಬಾಕಿ: ₹${d.balance}\n\n_${d.shopName}_`,
    MALAYALAM: (d: any) => `✅ *ഗ്രാംമാർട്ട് പേമെന്റ്*\nനമസ്കാരം ${d.customerName}!\n₹${d.amount} പണം ലഭിച്ചു. നന്ദി!\n📊 ബാക്കി തുക: ₹${d.balance}\n\n_${d.shopName}_`,
  } as any,
  BALANCE_REMINDER: {
    ENGLISH:   (d: any) => `🔔 *GramMart Reminder*\nHello ${d.customerName},\nYou have an outstanding balance of ₹${d.balance} at ${d.shopName}.\nPlease settle at your earliest convenience.\n\n_Thank you!_`,
    TAMIL:     (d: any) => `🔔 *கிராம்மார்ட் நினைவூட்டல்*\nவணக்கம் ${d.customerName},\n${d.shopName} இல் உங்கள் நிலுவை ₹${d.balance} உள்ளது.\nதயவுசெய்து விரைவில் செலுத்துங்கள்.\n\n_நன்றி!_`,
    HINDI:     (d: any) => `🔔 *ग्रामार्ट रिमाइंडर*\nनमस्ते ${d.customerName},\n${d.shopName} में आपका बकाया ₹${d.balance} है।\nकृपया जल्द से जल्द भुगतान करें।\n\n_धन्यवाद!_`,
    TELUGU:    (d: any) => `🔔 *గ్రామ్‌మార్ట్ రిమైండర్*\nనమస్తే ${d.customerName},\n${d.shopName} లో మీ బాకీ ₹${d.balance} ఉంది.\nదయచేసి త్వరగా చెల్లించండి.\n\n_ధన్యవాదాలు!_`,
    KANNADA:   (d: any) => `🔔 *ಗ್ರಾಮ್‌ಮಾರ್ಟ್ ರಿಮೈಂಡರ್*\nನಮಸ್ಕಾರ ${d.customerName},\n${d.shopName} ನಲ್ಲಿ ನಿಮ್ಮ ಬಾಕಿ ₹${d.balance} ಇದೆ.\nದಯವಿಟ್ಟು ಬೇಗ ಪಾವತಿ ಮಾಡಿ.\n\n_ಧನ್ಯವಾದ!_`,
    MALAYALAM: (d: any) => `🔔 *ഗ്രാംമാർട്ട് റിമൈൻഡർ*\nനമസ്കാരം ${d.customerName},\n${d.shopName} ൽ നിങ്ങളുടെ ബാക്കി ₹${d.balance} ആണ്.\nദയവായി ഉടൻ അടക്കുക.\n\n_നന്ദി!_`,
  } as any,
};

// ─── POST /api/whatsapp ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      to: string;          // customer phone e.g. "+919876543210"
      type: "CREDIT_SALE" | "PAYMENT_RECEIVED" | "BALANCE_REMINDER";
      language: Lang;
      data: {
        customerName: string;
        productName?: string;
        quantity?: string;
        amount?: string;
        balance: string;
        shopName: string;
      };
    };

    // Validate
    if (!body.to || !body.type || !body.data) {
      return NextResponse.json({ error: "Missing required fields: to, type, data" }, { status: 400 });
    }
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return NextResponse.json({ error: "Twilio credentials not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your environment." }, { status: 503 });
    }

    // Build message body
    const lang    = body.language ?? "ENGLISH";
    const tmpl    = (templates[body.type] as any)?.[lang];
    const message: string = tmpl ? tmpl(body.data) : `GramMart: Hi ${body.data.customerName}, balance: ₹${body.data.balance}`;

    // Format destination number
    const to = body.to.startsWith("whatsapp:") ? body.to : `whatsapp:${body.to.startsWith("+") ? body.to : "+91" + body.to}`;

    // Call Twilio Messages API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const form = new URLSearchParams();
    form.append("From", TWILIO_WHATSAPP_FROM);
    form.append("To", to);
    form.append("Body", message);

    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const twilioRes  = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const result = await twilioRes.json() as { sid?: string; error_message?: string; message?: string };

    if (!twilioRes.ok) {
      return NextResponse.json(
        { error: result.error_message ?? result.message ?? "Twilio error", twilioStatus: twilioRes.status },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, messageSid: result.sid, to, message });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
