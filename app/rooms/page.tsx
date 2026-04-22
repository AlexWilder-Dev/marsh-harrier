"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ─── Data (replace with real content when client delivers) ───────────────────

const ROOM_IMAGES = [
  { src: "/images/marsh-harrier-pub-outdoor-garden.webp",      alt: "The Marsh Harrier garden" },
  { src: "/images/marsh-harrier-pub-room-bedroom.avif",      alt: "Guest bedroom" },
  { src: "/images/marsh-harrier-pub-room-living-space.avif", alt: "Living space" },
  { src: "/images/marsh-harrier-pub-room-kitchen.avif",      alt: "Kitchen" },
  { src: "/images/marsh-harrier-pub-room-bathroom.avif",     alt: "En-suite bathroom" },
  { src: "/images/marsh-harrier-pub-room-bedroom2.avif",     alt: "Bedroom detail" },
  { src: "/images/marsh-harrier-pub-room-shower.avif",       alt: "Walk-in shower" },
  { src: "/images/marsh-harrier-pub-room-kitchen2.avif",     alt: "Kitchen detail" },
  { src: "/images/marsh-harrier-pub-room-books.avif",        alt: "Reading corner" },
  { src: "/images/marsh-harrier-pub-room-table.avif",        alt: "Dining area" },
  { src: "/images/marsh-harrier-pub-room-outdoor.avif",      alt: "Private outdoor space" },
];

const AMENITIES = [
  "Private en-suite bathroom",
  "Free WiFi",
  "Flat-screen TV",
  "Tea and coffee making facilities",
  "Towels and linen provided",
  "Private entrance",
  "Ground-floor access",
  "Secure key lockbox",
];

const HIGHLIGHTS = [
  { label: "Guests", value: "Up to 2" },
  { label: "Bedrooms", value: "1" },
  { label: "Bathrooms", value: "1 en-suite" },
  { label: "From", value: "On enquiry" },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function RoomsHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section
      ref={ref}
      className="relative h-[70vh] min-h-[480px] overflow-hidden flex items-end"
      aria-label="Rooms hero"
    >
      <motion.div
        className="absolute inset-0 scale-[1.12]"
        style={{ y: imageY }}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ROOM_IMAGES[0].src}
          alt={ROOM_IMAGES[0].alt}
          className="absolute inset-0 w-full h-full object-cover object-center"
          fetchPriority="high"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/30 to-forest-deep/50"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-deep/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 px-6 md:px-16 lg:px-24 pb-16 max-w-7xl w-full">
        <motion.p
          className="font-sans text-ochre text-xs tracking-widest uppercase mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          Stay at the pub
        </motion.p>
        <motion.h1
          className="font-serif font-light text-parchment-light text-display-xl leading-[0.9]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
        >
          Rooms at the
          <br />
          <em className="italic text-ochre-light block ml-[6vw] md:ml-[10vw]">
            Marsh Harrier.
          </em>
        </motion.h1>
      </div>
    </section>
  );
}

// ─── Description ─────────────────────────────────────────────────────────────

function RoomsDescription() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="bg-parchment py-24 md:py-36 overflow-hidden"
      aria-label="Room description"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">
              The room
            </p>
            <h2 className="font-serif font-light text-display-xl text-forest-deep leading-[0.9] mb-8">
              Wake up above
              <br />
              <em className="italic">the best pub</em>
              <br />
              in Cowley.
            </h2>
            <div className="flex flex-col gap-1 mb-10">
              <div className="rule-ochre w-20" />
              <div className="rule-ochre w-10 opacity-40" />
            </div>
            <p className="font-sans text-ink/65 text-base leading-relaxed font-light mb-5">
              A comfortable, well-appointed room above The Marsh Harrier, giving
              you a home in the heart of Cowley. Ideal for visitors to Oxford
              looking for something with more character than a chain hotel.
            </p>
            <p className="font-sans text-ink/65 text-base leading-relaxed font-light">
              Wake up to a proper breakfast, step downstairs for a perfect pint,
              and fall asleep somewhere that actually has a soul.
            </p>
          </motion.div>

          {/* Highlights grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="grid grid-cols-2 gap-px bg-forest-deep/10"
          >
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.label}
                className="bg-parchment-light px-5 py-7 flex flex-col"
              >
                <p className="font-sans text-[15px] tracking-widest uppercase text-ochre mb-2">
                  {h.label}
                </p>
                <p className="font-serif font-light text-forest-deep text-xl md:text-2xl leading-tight">
                  {h.value}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Amenities ───────────────────────────────────────────────────────────────

function RoomsAmenities() {
  return (
    <section
      className="bg-forest-deep py-24 md:py-32 overflow-hidden relative"
      aria-label="Room amenities"
    >
      <div
        className="absolute -left-4 top-0 bottom-0 font-serif text-[22vw] leading-none text-forest-rich/60 select-none pointer-events-none flex items-center"
        aria-hidden="true"
      >
        &amp;
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-4">
            What&apos;s included
          </p>
          <h2 className="font-serif font-light text-parchment-light text-display-lg leading-[0.9]">
            Everything you need.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0">
          {AMENITIES.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                delay: i * 0.06,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border-t border-parchment-light/10 py-5 pr-6 flex items-start gap-3"
            >
              <span
                className="w-1 h-1 rounded-full bg-ochre flex-shrink-0 mt-2"
                aria-hidden="true"
              />
              <p className="font-sans text-parchment-light/70 text-sm font-light leading-relaxed">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function RoomsGallery() {
  return (
    <section
      className="bg-parchment-dark py-24 md:py-32"
      aria-label="Room photo gallery"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-4">
            Take a look
          </p>
          <h2 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9]">
            The space.
          </h2>
        </motion.div>
      </div>

      {/* Asymmetric grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-3 gap-2">
        {ROOM_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.08,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative overflow-hidden ${
              i === 0 ? "col-span-2 md:col-span-2 aspect-[16/9]" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Enquiry Form ─────────────────────────────────────────────────────────────

type FormState = "idle" | "submitting" | "success" | "error";

function EnquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Validate check-out is after check-in
    const checkIn = new Date(data.get("checkin") as string);
    const checkOut = new Date(data.get("checkout") as string);
    if (checkOut <= checkIn) {
      setErrorMsg("Check-out date must be after check-in date.");
      setState("error");
      return;
    }

    const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
    if (!formspreeId) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Enquiry (Formspree not configured):", Object.fromEntries(data));
      }
      setState("success");
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setState("success");
        form.reset();
      } else {
        throw new Error("Formspree error");
      }
    } catch {
      setErrorMsg(
        "Sorry, we couldn't send your message. Please try again or call us directly."
      );
      setState("error");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (state === "success") {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <div className="w-14 h-14 rounded-full border border-ochre/50 flex items-center justify-center mb-8">
          <span className="font-serif italic text-ochre text-xl">✓</span>
        </div>
        <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-4">
          Enquiry received
        </p>
        <h3 className="font-serif font-light text-parchment-light text-display-sm mb-4">
          Thanks — we&apos;ll be in touch within 24 hours.
        </h3>
        <p className="font-sans text-parchment-light/50 text-sm font-light max-w-sm">
          We check messages daily and will confirm availability and pricing as
          soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Name + Email */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
          >
            Full Name <span aria-label="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
          >
            Email <span aria-label="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
        >
          Phone <span className="text-parchment-light/20">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors"
          placeholder="+44 7700 000000"
        />
      </div>

      {/* Check-in + Check-out */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="checkin"
            className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
          >
            Check-in <span aria-label="required">*</span>
          </label>
          <input
            id="checkin"
            name="checkin"
            type="date"
            required
            min={today}
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 focus:outline-none focus:border-ochre/50 transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label
            htmlFor="checkout"
            className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
          >
            Check-out <span aria-label="required">*</span>
          </label>
          <input
            id="checkout"
            name="checkout"
            type="date"
            required
            min={today}
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 focus:outline-none focus:border-ochre/50 transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Guests */}
      <div>
        <label
          htmlFor="guests"
          className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
        >
          Number of Guests <span aria-label="required">*</span>
        </label>
        <div className="relative">
          <select
            id="guests"
            name="guests"
            required
            defaultValue=""
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 pr-10 focus:outline-none focus:border-ochre/50 transition-colors appearance-none"
          >
            <option value="" disabled>
              Select
            </option>
            {[1, 2].map((n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-parchment-light/30 text-xs"
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
        >
          Message <span className="text-parchment-light/20">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors resize-none"
          placeholder="Anything we should know — special occasions, early arrival, etc."
        />
      </div>

      {(state === "error" && errorMsg) && (
        <p className="font-sans text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-60 transition-colors"
      >
        {state === "submitting" ? "Sending…" : "Send Enquiry"}
      </button>

      <p className="font-sans text-parchment-light/25 text-xs text-center leading-relaxed">
        We&apos;ll reply within 24 hours. No booking fee — we confirm directly
        by email.
      </p>
    </form>
  );
}

function RoomsEnquiry() {
  return (
    <section
      id="enquiry"
      className="bg-forest-deep py-24 md:py-36 overflow-hidden"
      aria-label="Room enquiry form"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">
              Make an enquiry
            </p>
            <h2 className="font-serif font-light text-parchment-light text-display-xl leading-[0.9] mb-8">
              Book your
              <br />
              <em className="italic text-ochre-light">stay.</em>
            </h2>
            <div className="flex flex-col gap-1 mb-10">
              <div className="rule-ochre w-20" />
              <div className="rule-ochre w-10 opacity-40" />
            </div>
            <p className="font-sans text-parchment-light/55 text-base leading-relaxed font-light mb-6">
              Fill in the form and we&apos;ll come back to you within 24 hours
              to confirm availability and answer any questions.
            </p>
            <p className="font-sans text-parchment-light/55 text-base leading-relaxed font-light">
              Prefer to call? Find us at{" "}
              <strong className="font-medium text-parchment-light/80">
                40 Marsh Road, Cowley, Oxford OX4 2HH
              </strong>
              .
            </p>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <EnquiryForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoomsPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <RoomsHero />
        <RoomsDescription />
        <RoomsAmenities />
        <RoomsGallery />
        <RoomsEnquiry />
      </main>
      <Footer />
    </>
  );
}
