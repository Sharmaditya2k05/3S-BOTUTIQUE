import { Router, Request, Response } from "express";
import { readDB } from "../db";

const router = Router();

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

function buildSystemPrompt(): string {
  const db = readDB();
  const s = db.settings;

  const storeInfo = [
    `Store: ${s.businessName}`,
    `Address: ${s.address}, ${s.city}`,
    `Business Hours: ${s.businessHours}`,
    `Phone: ${s.phone}`,
    `Email: ${s.email}`,
    `WhatsApp: ${s.whatsappNumber}`,
    s.description ? `About: ${s.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const productLines = db.products
    .filter((p) => p.isPublished)
    .map((p) => {
      const cat = db.categories.find((c) => c.id === p.categoryId);
      const status = p.isAvailable ? "Available" : "Unavailable";
      return `- ${p.name} | ₹${p.price.toLocaleString("en-IN")} | Category: ${cat?.name ?? "General"} | Fabric: ${p.fabric} | ${status}`;
    })
    .join("\n");

  const categoryNames = db.categories.map((c) => c.name).join(", ");

  const whatsappLink = `https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, "")}`;

  const blogTitles = (db.blog || [])
    .filter((b: any) => b.status === "published")
    .map((b: any) => b.title)
    .slice(0, 10)
    .join(", ");

  return `You are the friendly AI assistant for ${s.businessName} (Satyam Shivam Sundaram), a premium home-based saree boutique. You are an expert on sarees, Indian textiles, and this store's catalog.

STORE INFORMATION:
${storeInfo}
WhatsApp ordering link: ${whatsappLink}
Website: Our website lets customers browse sarees, add to cart, create wishlists, read our blog, check the size & draping guide, and order via WhatsApp.

WEBSITE FEATURES (answer questions about these):
- Browse & search sarees by category, fabric, color, occasion, price
- Product pages with image gallery, zoom, and video
- Shopping cart — add items and checkout via WhatsApp (we send a formatted message with your order)
- Wishlist — save favorites and share via WhatsApp
- Size & Draping Guide — saree lengths (5.5m, 6m, 6.3m), blouse measurements, 4 draping styles (Nivi, Gujarati, Bengali, Seedha Pallu), fabric care tips
- Blog/Lookbook — styling tips and saree stories${blogTitles ? "\n  Recent posts: " + blogTitles : ""}
- Hindi/English language toggle
- Coupon codes — customers can apply discount codes at checkout
- Photo reviews — customers can leave reviews with photos

OUR PRODUCT CATEGORIES: ${categoryNames}

OUR CATALOG:
${productLines || "Our catalog is being updated. Please check the website or WhatsApp us for the latest collection."}

SAREE KNOWLEDGE (use this to answer general questions):
- Fabrics: Silk (Banarasi, Kanjivaram/Kanchipuram, Tussar, Mysore), Cotton (Handloom, Tant, Mangalagiri), Chiffon, Georgette, Organza, Crepe, Linen, Net, Satin
- Banarasi Silk: Woven in Varanasi, known for gold/silver brocade work (zari), ideal for weddings and festivals. Price range varies by zari purity
- Kanjivaram Silk: From Tamil Nadu, heavy silk with contrasting borders, temple motifs. Considered the queen of silk sarees
- Organza: Lightweight, sheer, elegant. Great for parties and summer events
- Chiffon/Georgette: Lightweight, flowy, easy to drape. Perfect for daily wear and office
- Cotton Handloom: Breathable, comfortable, suitable for daily wear and summer. Each region has its specialty
- Occasions: Wedding (heavy silks, zari work), Festival (silk, embroidered), Party (organza, georgette, designer), Daily wear (cotton, chiffon), Office (cotton, linen, light silk)
- Care: Silk — dry clean, store in muslin; Cotton — gentle wash cold water; Georgette/Chiffon — hand wash or dry clean; Organza — dry clean only
- Saree lengths: 5.5m standard, 6m for taller women/wider pleats, 6.3m for Kanjivaram/bridal
- Blouse: Usually 0.8m fabric included. Key measurements: bust, waist, shoulder, sleeve length, neck depth

HOW TO ORDER:
1. Browse sarees on our website
2. Add items to your cart or wishlist
3. Click "Order via WhatsApp" — this sends your cart details directly to our WhatsApp
4. We confirm availability, share photos/videos, and arrange delivery
5. Payment is handled directly (UPI, bank transfer, or COD depending on location)

GUIDELINES:
- Be warm, helpful, knowledgeable, and conversational — like a trusted saree advisor
- When recommending sarees, suggest specific products from our catalog when possible
- For fabric questions, give genuine textile knowledge — our customers appreciate expertise
- Answer questions about our website features confidently (cart, wishlist, size guide, blog, reviews, language toggle, etc.)
- For custom orders, negotiations, specific measurements, urgent delivery, payment issues, or anything you're unsure about, say: "For this, I'd recommend chatting with our team directly on WhatsApp for personalized help!" and include ${whatsappLink}
- Keep responses under 200 words unless the question needs more detail
- If the user writes in Hindi, respond in Hindi. Mix Hindi/English naturally if the user does
- Never make up product details — only mention products actually in our catalog
- If our catalog is empty or a category has no products, say we're updating our collection and suggest WhatsApp for the latest arrivals`;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as ChatRequest;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GROK_API_KEY;

    if (!apiKey) {
      const db = readDB();
      const wa = db.settings.whatsappNumber.replace(/[^0-9]/g, "");
      return res.json({
        reply: `I'm currently offline, but our team is ready to help you on WhatsApp! Click below to chat with us directly.`,
        redirectToWhatsApp: true,
        whatsappNumber: wa,
      });
    }

    const systemPrompt = buildSystemPrompt();

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    if (history && Array.isArray(history)) {
      const recent = history.slice(-10);
      for (const h of recent) {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    // Auto-detect provider by key prefix
    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.x.ai/v1/chat/completions";
    const model = process.env.AI_MODEL || (isGroq ? "qwen/qwen3.8-27b" : "grok-3-mini-fast");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      return res.json({
        reply: "I'm having trouble right now. Please try again in a moment, or reach out to us on WhatsApp!",
        redirectToWhatsApp: true,
      });
    }

    const data = (await response.json()) as any;
    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "Sorry, I couldn't process that. Please try again!";

    const shouldRedirect =
      reply.toLowerCase().includes("whatsapp") &&
      (reply.toLowerCase().includes("speak directly") ||
        reply.toLowerCase().includes("personalized assistance") ||
        reply.toLowerCase().includes("contact us"));

    return res.json({
      reply,
      redirectToWhatsApp: shouldRedirect || undefined,
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return res.json({
      reply: "Something went wrong. Please try again or reach out to us on WhatsApp!",
      redirectToWhatsApp: true,
    });
  }
});

export default router;
