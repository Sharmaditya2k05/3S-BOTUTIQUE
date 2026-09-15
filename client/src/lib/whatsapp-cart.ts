import { CartItem } from "../context/CartContext";

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
