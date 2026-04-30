import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — The Marsh Harrier",
  description: "Terms and conditions for using The Marsh Harrier website and services.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <main className="bg-parchment min-h-screen py-20 md:py-32 px-6 md:px-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">Legal</p>
        <h1 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9] mb-10">
          Terms &amp; Conditions
        </h1>
        <p className="font-sans text-ink/50 text-sm mb-12">Last updated: April 2026</p>

        <div className="space-y-10 font-sans text-sm text-ink/70 font-light leading-relaxed">
          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Use of This Website</h2>
            <p>
              This website is operated by The Marsh Harrier, 40 Marsh Road, Cowley, Oxford OX4 2HH.
              By accessing and using this site, you agree to these terms. If you do not agree, please
              do not use the site.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Table Ordering</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Orders placed via this website are subject to availability and kitchen capacity.</li>
              <li>Placing an order does not constitute a binding contract until your order is accepted and prepared by our staff.</li>
              <li>Payment is made in person at the time of delivery. We accept card payments only.</li>
              <li>A discretionary service charge of 10% is included in the order total. This goes entirely to staff.</li>
              <li>If you have a dietary requirement or allergy, please speak to a member of staff before ordering. Do not rely solely on menu descriptions.</li>
              <li>We reserve the right to refuse or cancel any order at our discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Takeaway Orders</h2>
            <p>
              Takeaway orders submitted through this website are a pre-order request only.
              Our staff will call you on the number provided to confirm your order and arrange
              payment before preparation begins. Orders are not confirmed until you have spoken
              to a member of staff.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Room Enquiries</h2>
            <p>
              Room enquiries submitted through this website are not a confirmed booking.
              We will contact you within 24 hours to confirm availability and provide pricing.
              A booking is only confirmed once you have received written or verbal confirmation
              from us.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Alcohol &amp; Licensing</h2>
            <p>
              The Marsh Harrier operates under a Premises Licence issued by Oxford City Council.
              We operate a Challenge 25 policy. It is an offence to purchase or attempt to purchase
              alcohol for a person under the age of 18. We reserve the right to refuse service to
              any person at any time.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Limitation of Liability</h2>
            <p>
              This website is provided on an &ldquo;as is&rdquo; basis. We make no warranties about
              the accuracy or completeness of information on this site, including menu items, prices,
              and opening hours. We are not liable for any loss or damage arising from your use of
              this website or reliance on its content.
            </p>
            <p className="mt-3">
              Nothing in these terms excludes or limits liability for death or personal injury caused
              by negligence, or for fraud or fraudulent misrepresentation.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be
              subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Contact</h2>
            <p>
              For any questions about these terms, contact us at{" "}
              <a href="tel:01865718225" className="text-ochre hover:text-ink transition-colors">
                01865 718225
              </a>{" "}
              or visit us at 40 Marsh Road, Cowley, Oxford OX4 2HH.
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
