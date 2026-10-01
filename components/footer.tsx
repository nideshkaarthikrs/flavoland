import Link from "next/link";

function SocialIcon({ name }: { name: "instagram" | "facebook" | "twitter" }) {
  if (name === "facebook") {
    return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.2v3.2H10V21h3.4Z" /></svg>;
  }

  if (name === "instagram") {
    return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none" /></svg>;
  }

  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.6 22H2.4l7.3-8.4L1.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z" /></svg>;
}

export default function Footer() {
  return <footer className="border-t border-[#dce7e4] bg-[#123f38] text-white"><div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8"><div><div className="text-2xl font-black">Flavoland<span className="text-[#7fd1c3]">.</span></div><p className="mt-3 max-w-sm text-sm leading-6 text-white/70">A modern store finder built to make nearby shopping simple.</p></div><div><h3 className="font-bold">Explore</h3><div className="mt-3 grid gap-2 text-sm text-white/70"><Link href="/stores">Store Finder</Link><Link href="/about">Services</Link><Link href="/contact">Contact</Link></div></div><div><h3 className="font-bold">Support</h3><div className="mt-3 grid gap-2 text-sm text-white/70"><span>Accessibility</span><span>Privacy</span><span>Terms</span></div></div><div><h3 className="font-bold">Follow us</h3><div className="mt-3 flex gap-2">{(["instagram", "facebook", "twitter"] as const).map((name) => <span key={name} className="rounded-lg bg-white/10 p-2"><SocialIcon name={name} /></span>)}</div></div></div><div className="border-t border-white/10 py-5 text-center text-xs text-white/50">Copyright 2026 Flavoland. All rights reserved.</div></footer>;
}

