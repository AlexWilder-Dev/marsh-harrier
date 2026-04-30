import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Responsible Drinking — The Marsh Harrier",
  description:
    "The Marsh Harrier operates Challenge 25. Information on responsible drinking, our licensing policy, and where to get help.",
  alternates: { canonical: "/responsible-drinking" },
};

export default function ResponsibleDrinkingPage() {
  return (
    <main className="bg-parchment min-h-screen py-20 md:py-32 px-6 md:px-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">Licensing</p>
        <h1 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9] mb-10">
          Responsible Drinking
        </h1>

        <div className="space-y-10 font-sans text-sm text-ink/70 font-light leading-relaxed">
          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Challenge 25</h2>
            <p className="mb-3">
              The Marsh Harrier operates a <strong>Challenge 25</strong> policy. If you are lucky
              enough to look under 25, you will be asked to prove you are over 18 before we serve
              you alcohol. Accepted forms of ID are:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Passport</li>
              <li>UK driving licence (full or provisional)</li>
              <li>PASS-accredited proof of age card</li>
            </ul>
            <p className="mt-3">
              We reserve the right to refuse service of alcohol to anyone who cannot provide
              acceptable ID, or to any person who appears to be intoxicated.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Under 18s</h2>
            <p>
              It is illegal to purchase or attempt to purchase alcohol for a person under the age of
              18. It is also illegal for a person under 18 to purchase or attempt to purchase alcohol.
              We take this seriously and our staff are trained to identify and refuse such transactions.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Sensible Drinking</h2>
            <p className="mb-3">
              The UK Chief Medical Officers recommend that to keep health risks from alcohol to a low
              level:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Adults should not regularly drink more than 14 units of alcohol per week.</li>
              <li>These units should be spread over 3 or more days.</li>
              <li>If you are pregnant or trying to become pregnant, the safest approach is not to drink at all.</li>
            </ul>
            <p className="mt-3">
              One unit equals 10ml of pure alcohol. A pint of 4% lager is approximately 2.3 units.
              A large (250ml) glass of 12% wine is 3 units.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Our Commitment</h2>
            <p>
              We are committed to running a safe, welcoming, and responsible pub. Our staff are
              trained in responsible alcohol service. We offer a range of soft drinks, alcohol-free
              beers, and low-alcohol options. We will not serve anyone who is drunk.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Getting Help</h2>
            <p className="mb-3">If you are concerned about your own or someone else&apos;s drinking:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong>Drinkaware</strong> — drinkaware.co.uk — independent charity with advice and tools
              </li>
              <li>
                <strong>NHS Alcohol Support</strong> — nhs.uk/live-well/alcohol-advice — guidance and
                local service finder
              </li>
              <li>
                <strong>Alcoholics Anonymous</strong> — alcoholics-anonymous.org.uk — 0800 9177 650
                (free, 24 hours)
              </li>
              <li>
                <strong>Drinkline</strong> — 0300 123 1110 (Mon–Fri 9am–8pm, weekends 11am–4pm)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Licensing</h2>
            <p>
              The Marsh Harrier holds a Premises Licence issued by Oxford City Council under the
              Licensing Act 2003. A copy of our licence is available for inspection on request.
              Our designated premises supervisor is responsible for the day-to-day operation under
              this licence.
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
