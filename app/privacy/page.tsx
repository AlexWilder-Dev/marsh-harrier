import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — The Marsh Harrier",
  description: "How The Marsh Harrier collects and uses your personal data.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="bg-parchment min-h-screen py-20 md:py-32 px-6 md:px-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">Legal</p>
        <h1 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9] mb-10">
          Privacy Policy
        </h1>
        <p className="font-sans text-ink/50 text-sm mb-12">Last updated: April 2026</p>

        <div className="space-y-10 font-sans text-sm text-ink/70 font-light leading-relaxed">
          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Who We Are</h2>
            <p>
              The Marsh Harrier is a public house located at 40 Marsh Road, Cowley, Oxford OX4 2HH.
              For data protection purposes, we are the data controller for personal information
              collected through this website.
            </p>
            <p className="mt-3">
              Contact us at:{" "}
              <a href="tel:01865718225" className="text-ochre hover:text-ink transition-colors">
                01865 718225
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">What Data We Collect</h2>
            <p className="mb-3">We collect the following personal data:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Room enquiries:</strong> name, email address, phone number (optional), and preferred dates. Submitted via Formspree.</li>
              <li><strong>Table orders:</strong> table number, food and drink items ordered. Takeaway orders also collect your name and phone number for collection purposes.</li>
              <li><strong>Contact enquiries:</strong> name, email address, and your message. Submitted via Formspree.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To process your food and drink order and deliver it to your table or for collection.</li>
              <li>To respond to room availability enquiries and confirm bookings.</li>
              <li>To respond to general enquiries sent via our contact form.</li>
            </ul>
            <p className="mt-3">
              We do not use your data for marketing, sell it to third parties, or share it with anyone
              other than the service providers listed below.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Formspree</strong> (formspree.io) — processes enquiry form submissions on our behalf. Their privacy policy applies to data transmitted through their service.</li>
              <li><strong>Google Fonts</strong> — loads typefaces for this site. Google may log your IP address in connection with font delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Data Retention</h2>
            <p>
              Order data is retained in our systems for up to 90 days for operational purposes, then
              permanently deleted. Enquiry form data is held by Formspree subject to their retention
              policy.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Your Rights</h2>
            <p className="mb-3">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Lodge a complaint with the ICO (ico.org.uk)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us on{" "}
              <a href="tel:01865718225" className="text-ochre hover:text-ink transition-colors">
                01865 718225
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Cookies</h2>
            <p>
              This website uses a single functional cookie to maintain your login session if you are
              a member of staff. We do not use analytics cookies, tracking cookies, or advertising
              cookies. See our{" "}
              <Link href="/cookies" className="text-ochre hover:text-ink transition-colors">
                Cookie Policy
              </Link>{" "}
              for details.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-forest-deep/10">
          <Link
            href="/"
            className="font-sans text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors"
          >
            ← Back to The Marsh Harrier
          </Link>
        </div>
      </div>
    </main>
  );
}
