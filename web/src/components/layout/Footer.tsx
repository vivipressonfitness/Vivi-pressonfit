export function Footer() {
  const wa = (import.meta.env.VITE_WHATSAPP_NUMBER as string) ?? '59178000000';
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
        <p>© {new Date().getFullYear()} VIVIPREFIT — Entrenamiento y estilo de vida saludable</p>
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          className="bg-whatsapp-green hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-pill transition"
        >
          Soporte por WhatsApp
        </a>
      </div>
    </footer>
  );
}
