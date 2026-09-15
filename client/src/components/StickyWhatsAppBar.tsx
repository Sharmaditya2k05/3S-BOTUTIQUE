import { Product } from "../types";
import WhatsAppButton from "./WhatsAppButton";

export default function StickyWhatsAppBar({ product }: { product: Product }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/10 bg-ivory/95 p-3 backdrop-blur lg:hidden">
      <WhatsAppButton product={product} full />
    </div>
  );
}
