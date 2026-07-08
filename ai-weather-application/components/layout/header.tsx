export function Header() {
  return (
    <header className="flex justify-between items-center px-gutter py-stack-md w-full h-16 bg-transparent z-30">
      <div className="md:hidden flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">cloud</span>
      </div>
      <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">Weather Assistant</h2>
      <div className="flex items-center gap-stack-sm text-on-surface-variant">
        <button className="p-2 hover:opacity-80 cursor-pointer transition-opacity">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-white/10">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtrJ9WEbFblGy5FZaQ6m-9v-tJUtxiiTHnfQ8iyP23ky51BsKUc_OZqOm4agOXhY2Xo9FWrRtdSoIanZflJRRSap6MhwLNLt0Qrtugppej4OFNsV_I91ebd_zXSRG24-XMuptNsnufD_V0yGxh9qP88diji2NxiD3Sj-JJXjEI9vAnwsp8BWTq5htm3Ly-HI9QoI1poW2kHAuqa0qwN4xtIPqTJp2pV15ujBZl7e9G5ClcAD9ztpJSQcVcWAlvTIfLQlPbaGjcTCj5"
          />
        </div>
      </div>
    </header>
  );
}
