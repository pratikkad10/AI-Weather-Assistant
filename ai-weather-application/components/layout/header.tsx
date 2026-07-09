export function Header() {
  return (
    <header className="flex justify-between items-center px-gutter py-stack-md w-full h-16 bg-transparent z-30">
      <div className="md:hidden flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">cloud</span>
      </div>
      <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">Weather Assistant</h2>
      <div className="flex items-center gap-stack-sm text-on-surface-variant">

        <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
        </div>
      </div>
    </header>
  );
}
