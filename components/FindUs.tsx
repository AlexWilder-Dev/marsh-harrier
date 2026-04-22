"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormState = "idle" | "submitting" | "success" | "error";

function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID;

    if (!formspreeId) {
      if (process.env.NODE_ENV !== "production") {
        console.log("Contact form (Formspree not configured):", Object.fromEntries(data));
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
        throw new Error();
      }
    } catch {
      setErrorMsg("Sorry, we couldn\u2019t send your message. Please try again or call us directly.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-14 h-14 rounded-full border border-ochre/50 flex items-center justify-center mb-8">
          <span className="font-serif italic text-ochre text-xl">✓</span>
        </div>
        <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-4">Message received</p>
        <h3 className="font-serif font-light text-parchment-light text-2xl mb-3">
          Thanks \u2014 we\u2019ll be in touch shortly.
        </h3>
        <p className="font-sans text-parchment-light/50 text-sm font-light max-w-sm">
          We aim to reply within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2">
            Name <span aria-label="required">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2">
            Email <span aria-label="required">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2">
          Message <span aria-label="required">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors resize-none"
          placeholder="Table booking, event hire enquiry, general question…"
        />
      </div>

      {state === "error" && errorMsg && (
        <p className="font-sans text-sm text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-60 transition-colors"
      >
        {state === "submitting" ? "Sending\u2026" : "Send Message"}
      </button>
    </form>
  );
}

export default function FindUs() {
  return (
    <>
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
                  <p className="font-sans text-[15px] text-ochre tracking-widest uppercase mb-4">Address</p>
                  <address className="font-sans not-italic text-ink/70 text-base leading-loose font-light">
                    The Marsh Harrier<br />
                    40 Marsh Road<br />
                    Cowley, Oxford<br />
                    <strong className="font-medium text-forest-deep">OX4 2HH</strong>
                  </address>
                </div>

                <div className="border-t border-forest-deep/10 pt-6">
                  <p className="font-sans text-[15px] text-ochre tracking-widest uppercase mb-4">Contact</p>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <a
                        href="tel:01865718225"
                        className="font-sans text-sm font-light text-ink/65 hover:text-forest-deep transition-colors focus-visible:outline-ochre"
                      >
                        <span className="font-medium text-forest-deep">Phone — </span>
                        01865 718225
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:info@marshharrieroxford.co.uk"
                        className="font-sans text-sm font-light text-ink/65 hover:text-forest-deep transition-colors break-all focus-visible:outline-ochre"
                      >
                        <span className="font-medium text-forest-deep">Email — </span>
                        info@marshharrieroxford.co.uk
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-forest-deep/10 pt-6">
                  <p className="font-sans text-[15px] text-ochre tracking-widest uppercase mb-4">Getting Here</p>
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
                  <p className="font-sans text-sm font-light text-ink/65 mb-4">
                    We also hire the pub for{" "}
                    <strong className="font-medium text-forest-deep">private events</strong>
                    {" "}— birthdays, corporate dos, wakes, and everything in between.{" "}
                    <a href="#contact" className="text-ochre underline underline-offset-2 hover:text-ochre-light transition-colors">
                      Get in touch
                    </a>
                    {" "}to find out more.
                  </p>
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
              {/* Cartographic corner marks */}
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

      {/* Contact form */}
      <section
        id="contact"
        className="bg-forest-deep py-24 md:py-36 overflow-hidden"
        aria-label="Contact form"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-5">Get in touch</p>
              <h2 className="font-serif font-light text-parchment-light text-display-xl leading-[0.9] mb-8">
                Bookings &amp;
                <br />
                <em className="italic text-ochre-light">enquiries.</em>
              </h2>
              <div className="flex flex-col gap-1 mb-10">
                <div className="rule-ochre w-20" />
                <div className="rule-ochre w-10 opacity-40" />
              </div>
              <p className="font-sans text-parchment-light/55 text-base leading-relaxed font-light mb-4">
                Got a question, want to book a table, or thinking about hiring the pub for a private event? Drop us a message and we&apos;ll come back to you within 24 hours.
              </p>
              <p className="font-sans text-parchment-light/55 text-base leading-relaxed font-light">
                Or call us on{" "}
                <a href="tel:01865718225" className="font-medium text-parchment-light/80 hover:text-ochre transition-colors">
                  01865 718225
                </a>
                .
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <ContactForm />
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}
