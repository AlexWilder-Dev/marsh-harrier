import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    label: "Eat & Drink",
    title: "Proper food,\ndone properly.",
    description: "Seasonal menus, guest ales & cocktails.",
    image: "/images/marsh-harrier-pub-food.jpg",
    href: "/#food",
  },
  {
    label: "The Garden",
    title: "South-facing.\nSummer-ready.",
    description: "Sheltered, south-facing — made for long evenings.",
    image: "/images/marsh-harrier-pub-outdoor-garden.webp",
    href: "/#garden",
  },
  {
    label: "Rooms",
    title: "Stay a\nlittle longer.",
    description: "Three individually styled rooms above the pub.",
    image: "/images/marsh-harrier-pub-room-bedroom.avif",
    href: "/rooms",
  },
];

export default function CTACards() {
  return (
    <section aria-label="Explore the pub" className="grid grid-cols-1 md:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="relative h-[58vw] min-h-[220px] md:h-[58vh] overflow-hidden group block focus-visible:outline-ochre focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
          aria-label={`${card.label} — ${card.description}`}
        >
          <Image
            src={card.image}
            alt=""
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/25 to-forest-deep/10 transition-opacity duration-500 group-hover:opacity-90"
            aria-hidden="true"
          />
          {/* Thin separator between cards on desktop */}
          <div
            className="absolute top-0 bottom-0 right-0 w-px bg-parchment/10 hidden md:block"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
            <p className="font-sans text-parchment-light/55 text-[10px] tracking-widest uppercase mb-2">
              {card.label}
            </p>
            <h2 className="font-serif font-light text-parchment-light text-2xl sm:text-3xl leading-[0.92] mb-3 whitespace-pre-line">
              {card.title}
            </h2>
            <p className="font-sans text-parchment-light/55 text-sm font-light leading-relaxed">
              {card.description}
            </p>
            <div className="flex items-center gap-2 mt-5">
              <span className="font-sans text-[10px] tracking-widest uppercase text-parchment-light/45 group-hover:text-parchment-light transition-colors duration-300">
                Explore
              </span>
              <span
                className="h-px bg-parchment-light/35 transition-all duration-500 w-5 group-hover:w-10 group-hover:bg-ochre"
                aria-hidden="true"
              />
              <span
                className="font-sans text-parchment-light/45 group-hover:text-ochre transition-colors duration-300"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
