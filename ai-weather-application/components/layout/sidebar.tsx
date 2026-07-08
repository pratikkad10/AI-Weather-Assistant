import Link from "next/link";

export function Sidebar() {
  return (
    <nav className="hidden md:flex h-screen w-[300px] border-r border-white/10 bg-surface-container/60 backdrop-blur-xl flex-col p-stack-lg z-40 shadow-2xl relative">
      <div className="flex items-center gap-stack-sm mb-stack-xl">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
        </div>
        <div>
          <h1 className="font-display-xl text-[24px] leading-none text-primary font-bold tracking-tighter">
            Aether Weather
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Pune, 29°C</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-stack-sm">
        {/* Active Tab */}
        <Link href="/" className="flex items-center gap-stack-md px-4 py-3 text-primary font-bold bg-primary-container/20 rounded-lg transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined">add_comment</span>
          <span className="font-label-md text-label-md">New Chat</span>
        </Link>
        {/* Inactive Tabs */}
        <Link href="#" className="flex items-center gap-stack-md px-4 py-3 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined">history</span>
          <span className="font-label-md text-label-md">History</span>
        </Link>
        <Link href="#" className="flex items-center gap-stack-md px-4 py-3 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined">description</span>
          <span className="font-label-md text-label-md">Saved Reports</span>
        </Link>
        <Link href="#" className="flex items-center gap-stack-md px-4 py-3 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 rounded-lg">
          <span className="material-symbols-outlined">star</span>
          <span className="font-label-md text-label-md">Favorites</span>
        </Link>
        <Link href="#" className="flex items-center gap-stack-md px-4 py-3 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 rounded-lg mt-auto">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
      </div>
      
      <button className="mt-stack-lg w-full py-3 rounded-lg border border-primary/30 text-primary font-label-md text-label-md hover:bg-primary/10 transition-colors">
        Upgrade to Pro
      </button>
    </nav>
  );
}
