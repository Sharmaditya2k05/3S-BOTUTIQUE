import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { getWhatsAppLink } from "../lib/whatsapp";

interface Message {
  role: "user" | "assistant";
  content: string;
  redirectToWhatsApp?: boolean;
}

function formatMarkdown(text: string) {
  const lines = text.split("\n");
  const result: (string | JSX.Element)[] = [];
  let key = 0;
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    result.push(
      <ul key={key++} className="my-1 ml-4 list-disc space-y-0.5">
        {listItems.map((item, i) => (
          <li key={i}>{formatInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  function formatInline(line: string) {
    const parts: (string | JSX.Element)[] = [];
    let k = 0;
    const regex = /\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`]+)`/g;
    let lastIdx = 0;
    let m;
    while ((m = regex.exec(line)) !== null) {
      if (m.index > lastIdx) parts.push(line.slice(lastIdx, m.index));
      if (m[1]) parts.push(<strong key={k++}><em>{m[1]}</em></strong>);
      else if (m[2]) parts.push(<strong key={k++}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={k++}>{m[3]}</em>);
      else if (m[4]) parts.push(<code key={k++} className="rounded bg-black/10 px-1 py-0.5 text-xs">{m[4]}</code>);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < line.length) parts.push(line.slice(lastIdx));
    return parts;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)/);
    const numberedMatch = line.match(/^[\s]*\d+[.)]\s+(.+)/);

    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
    } else if (numberedMatch) {
      listItems.push(numberedMatch[1]);
    } else {
      flushList();
      if (i > 0 && result.length > 0) result.push(<br key={key++} />);
      if (line.trim()) result.push(<span key={key++}>{formatInline(line)}</span>);
    }
  }
  flushList();
  return result;
}

export default function ChatWidget() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const welcomeMessage =
    "Namaste! 🙏 I'm the 3S Saree assistant. Ask me anything about our saree collection, pricing, fabrics, or ordering!";

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      const rawReply: string = data.reply ?? "Sorry, something went wrong.";
      const hasWhatsAppLink = /wa\.me\//i.test(rawReply);
      const cleanReply = rawReply
        .replace(/\[([^\]]*)\]\(https?:\/\/wa\.me\/[^)]*\)/gi, "")
        .replace(/\s*https?:\/\/wa\.me\/\S+/gi, "")
        .replace(/👉\s*/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cleanReply,
          redirectToWhatsApp: data.redirectToWhatsApp || hasWhatsAppLink,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting. Please try again or reach out on WhatsApp!",
          redirectToWhatsApp: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const whatsappLink = getWhatsAppLink(
    settings.whatsappNumber,
    "Hi! I have a query from the 3S Saree website chat."
  );

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex w-[350px] flex-col overflow-hidden rounded-2xl border border-wine/10 bg-white shadow-2xl max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:rounded-none max-sm:border-0" style={{ height: "min(500px, calc(100vh - 120px))" }}>
          {/* Header */}
          <div className="flex items-center justify-between bg-wine px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-ivory" />
              <span className="font-semibold text-ivory">3S Saree Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 text-ivory/80 transition-colors hover:bg-white/10 hover:text-ivory"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollBehavior: "smooth" }}>
            {/* Welcome message */}
            <div className="mb-3 flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-2.5 text-sm text-charcoal">
                {welcomeMessage}
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex max-w-[80%] flex-col gap-1.5">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-wine text-ivory"
                        : "rounded-tl-sm bg-gray-100 text-charcoal"
                    }`}
                  >
                    {msg.role === "assistant" ? formatMarkdown(msg.content) : msg.content}
                  </div>
                  {msg.redirectToWhatsApp && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.142 1.534 5.883L0 24l6.294-1.5A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.923 0-3.71-.537-5.24-1.467l-.376-.223-3.898.928.985-3.602-.252-.4A9.697 9.697 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
                      </svg>
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="mb-3 flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                  <span className="chat-dot h-2 w-2 rounded-full bg-wine/50" style={{ animation: "chatBounce 1.4s infinite", animationDelay: "0s" }} />
                  <span className="chat-dot h-2 w-2 rounded-full bg-wine/50" style={{ animation: "chatBounce 1.4s infinite", animationDelay: "0.2s" }} />
                  <span className="chat-dot h-2 w-2 rounded-full bg-wine/50" style={{ animation: "chatBounce 1.4s infinite", animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our sarees..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-charcoal placeholder-warmgray outline-none transition-colors focus:border-wine/30 focus:bg-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-wine text-ivory transition-all hover:bg-wine/90 disabled:opacity-40 disabled:hover:bg-wine"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating chat bubble */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className={`fixed bottom-[88px] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${
          open ? "bg-charcoal text-ivory" : "bg-wine text-ivory"
        }`}
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-wine/30" style={{ animationDuration: "2.5s" }} />
        )}
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Bounce animation for loading dots */}
      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
