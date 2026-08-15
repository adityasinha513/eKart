export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm">
      <div className="rounded-[24px] border border-white/20 bg-white/90 px-6 py-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-bounce rounded-full bg-maroon-700" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-mithai-500 [animation-delay:120ms]" />
          <div className="h-3 w-3 animate-bounce rounded-full bg-saffron-500 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}
