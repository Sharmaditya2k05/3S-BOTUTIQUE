import { useEffect } from "react";

interface MetaOptions {
  title?: string;
  description?: string;
  ogImage?: string;
}

const BASE_TITLE = "3S Saree — Handpicked Saree Boutique";

export function useMeta({ title, description, ogImage }: MetaOptions) {
  useEffect(() => {
    document.title = title ? `${title} | 3S Saree` : BASE_TITLE;

    function setMeta(name: string, content: string, attr = "name") {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }
    if (title) {
      setMeta("og:title", `${title} | 3S Saree`, "property");
    }
    if (ogImage) {
      setMeta("og:image", ogImage, "property");
    }
    setMeta("og:type", "website", "property");

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description, ogImage]);
}
