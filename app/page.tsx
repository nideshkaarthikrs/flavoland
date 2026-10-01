import Link from "next/link";
import { ArrowRight, MapPin, Clock3, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const spices = [
  {
    name: "Turmeric",
    detail: "Golden & earthy",
    image: "/images/turmeric.jpg",
    alt: "Vibrant golden turmeric powder and fresh turmeric root",
  },
  {
    name: "Red chilli",
    detail: "Warm & fiery",
    image:
      "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=85",
    alt: "Dried red chillies with their rich scarlet color",
  },
  {
    name: "Black pepper",
    detail: "Bold & aromatic",
    image: "/images/black-pepper.jpg",
    alt: "Whole black peppercorns ready to be freshly ground",
  },
  {
    name: "Cardamom",
    detail: "Fragrant & sweet",
    image:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=85",
    alt: "Green cardamom pods with delicate ridged shells",
  },
  {
    name: "Cinnamon",
    detail: "Sweet & warming",
    image:
      "https://images.unsplash.com/photo-1600326145552-327f74b9c189?auto=format&fit=crop&w=800&q=85",
    alt: "Rolled cinnamon sticks in warm brown tones",
  },
  {
    name: "Cloves",
    detail: "Deep & warming",
    image: "/images/cloves.jpg",
    alt: "Aromatic whole cloves with dark flower-bud heads",
  },
  {
    name: "Star anise",
    detail: "Sweet & licorice-like",
    image:
      "https://images.unsplash.com/photo-1604495772376-9657f0035eb5?auto=format&fit=crop&w=800&q=85",
    alt: "Whole star anise pods with their distinctive star shape",
  },
  {
    name: "Cumin",
    detail: "Toasty & earthy",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85",
    alt: "A close view of aromatic cumin seeds",
  },
  {
    name: "Coriander seeds",
    detail: "Citrusy & mellow",
    image: "/images/coriander-seeds.jpg",
    alt: "Round coriander seeds with a light golden color",
  },
  {
    name: "Mustard seeds",
    detail: "Pungent & lively",
    image: "/images/mustard-seeds.jpg",
    alt: "Small mustard seeds ready for tempering",
  },
];

export default function Home() {
  return (
    <main>
      <section className="bg-[#123f38] text-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-[#9de0d4]">
              Local shopping, made simple
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Find your nearest Flavoland store.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
              Discover nearby stores, opening hours, useful services and the quickest way to get there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/stores">
                <Button size="lg" className="bg-[#f59e0b] text-[#123f38] hover:bg-[#f7b84a]">
                  Find a store <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  Explore services
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative rounded-[2rem] bg-[#1b554c] p-5 shadow-2xl">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 text-[#123f38] sm:col-span-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e4f3ef] text-[#0f766e]"><MapPin /></span>
                  <div><div className="font-bold">15 stores nearby</div><div className="text-sm text-[#647b76]">Sorted by distance</div></div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5"><Clock3 className="text-[#9de0d4]" /><div className="mt-8 font-bold">Live hours</div><div className="mt-1 text-sm text-white/60">Know before you go</div></div>
              <div className="rounded-2xl bg-white/10 p-5"><ShoppingBag className="text-[#9de0d4]" /><div className="mt-8 font-bold">Store services</div><div className="mt-1 text-sm text-white/60">Parking, pharmacy &amp; more</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#0f766e]">A world of flavour</p>
          <h2 className="mt-2 text-3xl font-black">Everyday spices, extraordinary meals.</h2>
          <p className="mt-3 text-[#647b76]">Explore the vibrant aromas and natural colors behind your favorite dishes.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {spices.map((spice) => (
            <article key={spice.name} className="group overflow-hidden rounded-2xl border border-[#dce7e4] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden bg-[#e4f3ef]">
                <img
                  src={spice.image}
                  alt={spice.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#123f38]">{spice.name}</h3>
                <p className="mt-1 text-sm text-[#647b76]">{spice.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
