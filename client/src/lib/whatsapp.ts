import { Product } from "../types";
import { CartItem } from "../context/CartContext";

export function generateWhatsAppMessage(product: Product): string {
  const productUrl = `${window.location.origin}/sarees/${product.slug}`;
  const lines = [
    `Hi! I'm interested in this saree:`,
    ``,
    `*${product.name}*`,
    `Product ID: ${product.sku}`,
    `Price: ₹${product.price.toLocaleString("en-IN")}`,
    ``,
    `Could you please share more details about its availability?`,
    ``,
    `Product: ${productUrl}`,
  ];
  return lines.join("\n");
}

export function getWhatsAppLink(
  whatsappNumber: string,
  message: string
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function generateGeneralWhatsAppMessage(): string {
  return "Hi! I'd love to know more about your saree collection.";
}

export function generateWishlistWhatsAppMessage(products: Product[]): string {
  const items = products
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} — ₹${p.price.toLocaleString("en-IN")}`
    )
    .join("\n");
  const lines = [
    `Hi! Here's my wishlist from 3S Saree:`,
    ``,
    items,
    ``,
    `Could you tell me about availability for these?`,
  ];
  return lines.join("\n");
}

export function generateCartWhatsAppMessage(items: CartItem[], total: number): string {
  const lines = [
    "Hi! I'd like to order the following sarees:",
    "",
  ];

  items.forEach((item, i) => {
    lines.push(`${i + 1}. *${item.name}* — ₹${item.price.toLocaleString("en-IN")}`);
  });

  lines.push("");
  lines.push(`Total: ₹${total.toLocaleString("en-IN")}`);
  lines.push("");
  lines.push("Please confirm availability and share payment details. Thank you!");

  return lines.join("\n");
}
