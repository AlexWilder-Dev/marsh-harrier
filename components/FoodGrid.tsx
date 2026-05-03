"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// TODO: replace all six with dedicated food photography
const images = [
  { src: "/images/marsh-harrier-pub-food.jpg",                   alt: "Food at The Marsh Harrier" },
  { src: "/images/marsh-harrier-oxford-burger-most-delicious.jpeg", alt: "The Marsh Harrier burger" },
  { src: "/images/marsh-harrier-pub-bar.jpg",                    alt: "The bar at The Marsh Harrier" },
  { src: "/images/marsh-harrier-pub-room-kitchen.avif",          alt: "The kitchen at The Marsh Harrier" },
  { src: "/images/marsh-harrier-pub-room-table.avif",            alt: "A table at The Marsh Harrier" },
  { src: "/images/marsh-harrier-pub-sign-beautiful.webp",        alt: "The Marsh Harrier pub" },
];

export default function FoodGrid() {
  return (
    <section className="bg-parchment pt-16 md:pt-24" aria-label="From the kitchen">
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-8 md:mb-12">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-ink text-xs tracking-widest uppercase"
        >
          From the Kitchen
        </motion.p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-parchment-dark">
        {images.map((img, i) => (
          <motion.div
            key={img.src}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.07, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/3] overflow-hidden bg-parchment-dark"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
