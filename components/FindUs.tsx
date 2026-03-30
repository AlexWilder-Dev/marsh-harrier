"use client";

import { motion } from "framer-motion";

export default function FindUs() {
  return (
    <section
      id="find-us"
      className="bg-parchment py-28 md:py-40 overflow-hidden"
      aria-label="Location and directions"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

          {/* Content — visually right at md+ */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="md:order-2"
          >
            <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">
              Find Us
            </p>
            <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9] mb-2">
              Come on in.
            </h2>
            <p className="font-serif italic text-forest-deep/30 text-display-sm mb-12">
              40 Marsh Road, OX4 2HH
            </p>

            <div className="space-y-8">
              <div className="border-t border-forest-deep/10 pt-6">
                <p className="font-sans text-[10px] text-ochre tracking-widest uppercase mb-4">Address</p>
                <address className="font-sans not-italic text-ink/70 text-base leading-loose font-light">
                  The Marsh Harrier<br />
                  40 Marsh Road<br />
                  Cowley, Oxford<br />
                  <strong className="font-medium text-forest-deep">OX4 2HH</strong>
                </address>
              </div>

              <div className="border-t border-forest-deep/10 pt-6">
                <p className="font-sans text-[10px] text-ochre tracking-widest uppercase mb-4">Getting Here</p>
                <ul className="flex flex-col gap-3">
                  {[
                    { mode: "Bus", note: "Oxford Tube and local services on Cowley Road" },
                    { mode: "Cycle", note: "Parking available outside" },
                    { mode: "Car", note: "Street parking on Marsh Road" },
                  ].map((item) => (
                    <li key={item.mode} className="flex items-start gap-3">
                      <span className="w-1 h-1 rounded-full bg-ochre flex-shrink-0 mt-2" aria-hidden="true" />
                      <p className="font-sans text-sm font-light text-ink/65">
                        <span className="font-medium text-forest-deep">{item.mode} — </span>
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-forest-deep/10 pt-6">
                <a
                  href="https://maps.google.com/?q=The+Marsh+Harrier,+40+Marsh+Road,+Cowley,+Oxford,+OX4+2HH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-4 font-sans text-xs tracking-widest uppercase text-forest-deep hover:text-ochre transition-colors duration-300 focus-visible:outline-ochre"
                  aria-label="Open The Marsh Harrier in Google Maps (opens in new tab)"
                >
                  Open in Google Maps
                  <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-14" aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Map — visually left at md+ */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative md:order-1"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2470.5!2d-1.228!3d51.742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876c14b2b8ad3b1%3A0x1!2sThe+Marsh+Harrier%2C+40+Marsh+Rd%2C+Oxford+OX4+2HH!5e0!3m2!1sen!2suk!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "sepia(35%) saturate(70%) brightness(0.92)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map showing the location of The Marsh Harrier at 40 Marsh Road, Cowley, Oxford"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            {/* All four corner marks — cartographic frame */}
            <div className="absolute top-0 left-0 w-px h-14 bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 left-0 w-14 h-px bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-px h-14 bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-14 h-px bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-px h-14 bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-14 h-px bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-px h-14 bg-ochre pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-14 h-px bg-ochre pointer-events-none" aria-hidden="true" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
