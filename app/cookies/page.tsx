import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — The Marsh Harrier",
  description: "Information about how The Marsh Harrier website uses cookies.",
  alternates: { canonical: "/cookies" },
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <main className="bg-parchment min-h-screen py-20 md:py-32 px-6 md:px-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">Legal</p>
        <h1 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9] mb-10">
          Cookie Policy
        </h1>
        <p className="font-sans text-ink/50 text-sm mb-12">Last updated: April 2026</p>

        <div className="space-y-10 font-sans text-sm text-ink/70 font-light leading-relaxed">
          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They are
              widely used to make websites work, or to work more efficiently, and to provide
              information to the site owner.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Cookies We Use</h2>
            <p className="mb-4">
              We use a minimal number of cookies. We do not use analytics, advertising, or
              third-party tracking cookies.
            </p>
            <div className="space-y-0">
              <div className="py-4 border-b border-forest-deep/8">
                <p className="font-sans text-sm font-medium text-forest-deep mb-1">session</p>
                <p className="font-sans text-xs tracking-widest uppercase text-ink/35 mb-2">Strictly necessary · Expires: 30 days</p>
                <p>
                  Used by our staff administration system to maintain a login session. This cookie
                  is only set when a member of staff logs in to the admin dashboard. It is not set
                  for regular visitors to the site.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Third-Party Cookies</h2>
            <p className="mb-3">
              We use the following third-party services which may set their own cookies or make
              requests to their servers:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Google Fonts</strong> — loads typefaces for this website. Google may log
                requests made to their font servers. We have no control over Google&apos;s cookie
                practices; please refer to Google&apos;s privacy policy.
              </li>
              <li>
                <strong>Formspree</strong> — processes enquiry form submissions. Formspree may set
                cookies in connection with spam prevention and form processing. See formspree.io
                for details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Managing Cookies</h2>
            <p className="mb-3">
              You can control and manage cookies in your browser settings. Note that removing or
              blocking some cookies may affect your ability to use certain features of this site.
            </p>
            <p>
              For information on managing cookies in your browser, visit your browser&apos;s help
              pages or{" "}
              <a
                href="https://www.aboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ochre hover:text-ink transition-colors"
              >
                aboutcookies.org
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">More Information</h2>
            <p>
              For more information about how we handle your personal data, see our{" "}
              <Link href="/privacy" className="text-ochre hover:text-ink transition-colors">
                Privacy Policy
              </Link>
              . If you have questions about our use of cookies, contact us on{" "}
              <a href="tel:01865718225" className="text-ochre hover:text-ink transition-colors">
                01865 718225
              </a>
              .
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
