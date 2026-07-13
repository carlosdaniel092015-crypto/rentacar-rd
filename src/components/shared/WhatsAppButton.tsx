"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "18091234567";
const MESSAGE = encodeURIComponent("Hola, me interesa rentar un vehículo");

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const timer = setTimeout(() => setVisible(true), isMobile ? 0 : 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-500",
        "bg-[#25D366] text-white hover:bg-[#20BA5C] hover:scale-110",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle className="size-7 fill-white" />
    </a>
  );
}
