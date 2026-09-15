interface LegalPageProps {
  title: string;
  paragraphs: string[];
}

function LegalPage({ title, paragraphs }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
      <h1 className="font-serif-display text-4xl text-charcoal">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-warmgray">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      paragraphs={[
        "We collect only the information you choose to share with us when you contact us over WhatsApp, phone, or email — such as your name, phone number, and delivery address for orders you confirm with us directly.",
        "This information is used solely to respond to your enquiries and fulfil orders. We do not sell or share your information with third parties.",
        "Since all conversations and order confirmations happen directly on WhatsApp, please also review WhatsApp's own privacy policy for how your messages are handled on that platform.",
      ]}
    />
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      paragraphs={[
        "This website is a catalog for browsing our saree collection. Prices and availability are shown for reference and are confirmed at the time of your enquiry on WhatsApp.",
        "All orders are finalized through direct conversation with us — we do not process payments or orders through this website.",
        "Product colors may vary slightly from what is shown on screen due to photography and display settings. We're happy to share additional photos or a video on request before you decide.",
      ]}
    />
  );
}

export function Returns() {
  return (
    <LegalPage
      title="Refund & Return Policy"
      paragraphs={[
        "Because every order is confirmed personally over WhatsApp, our return and exchange terms are discussed and agreed with you directly at the time of purchase.",
        "If you receive a saree that is damaged or different from what was described, please reach out to us on WhatsApp within a reasonable time and we'll be happy to help.",
        "We want you to be genuinely happy with your purchase, so please don't hesitate to ask us questions before confirming an order.",
      ]}
    />
  );
}
