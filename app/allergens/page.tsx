import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Allergen Information — The Marsh Harrier",
  description:
    "Allergen and dietary information for food served at The Marsh Harrier, Cowley Oxford. Speak to staff before ordering if you have an allergy.",
  alternates: { canonical: "/allergens" },
};

const ALLERGENS = [
  { name: "Celery", desc: "Including celery stalks, leaves, seeds, and celeriac." },
  { name: "Cereals containing gluten", desc: "Including wheat, rye, barley, oats, spelt, kamut, and their hybridised strains." },
  { name: "Crustaceans", desc: "Including prawns, crabs, lobster, and crayfish." },
  { name: "Eggs", desc: "Including eggs from all species of poultry." },
  { name: "Fish", desc: "Including all species of fish and products thereof." },
  { name: "Lupin", desc: "Including lupin seeds and flour. May be found in breads, pastries, and pasta." },
  { name: "Milk", desc: "Including lactose and products made from milk." },
  { name: "Molluscs", desc: "Including mussels, oysters, squid, and land snails." },
  { name: "Mustard", desc: "Including mustard seeds, powder, paste, and leaves." },
  { name: "Nuts (tree nuts)", desc: "Including almonds, hazelnuts, walnuts, cashews, pecan, Brazil, pistachio, macadamia." },
  { name: "Peanuts", desc: "Including peanut oil and products made from peanuts." },
  { name: "Sesame seeds", desc: "Including sesame oil and tahini." },
  { name: "Soya", desc: "Including soya flour, soya milk, tofu, and edamame." },
  { name: "Sulphur dioxide & sulphites", desc: "Preservatives found in wine, beer, dried fruits, and some processed foods. Declared when concentration exceeds 10mg/kg or 10mg/litre." },
];

export default function AllergensPage() {
  return (
    <main className="bg-parchment min-h-screen py-20 md:py-32 px-6 md:px-16">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-ink text-xs tracking-widest uppercase mb-5">Food Information</p>
        <h1 className="font-serif font-light text-forest-deep text-display-lg leading-[0.9] mb-6">
          Allergen Information
        </h1>
        <p className="font-sans text-ink/50 text-sm mb-12">
          In accordance with the UK Food Information Regulations 2014 (EU FIC)
        </p>

        <div className="bg-ochre/10 border border-ochre/30 px-6 py-5 mb-12">
          <p className="font-sans text-sm text-forest-deep font-medium leading-relaxed">
            If you have a food allergy, intolerance, or coeliac disease,{" "}
            <strong>please speak to a member of staff before ordering.</strong> Do not
            rely solely on menu descriptions or ingredient lists, as recipes and
            suppliers may change. Our kitchen handles all 14 major allergens.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-6">
            The 14 Major Allergens
          </h2>
          <div className="space-y-0">
            {ALLERGENS.map((a) => (
              <div key={a.name} className="flex gap-6 py-4 border-b border-forest-deep/8">
                <p className="font-sans text-sm font-medium text-forest-deep w-48 flex-shrink-0">
                  {a.name}
                </p>
                <p className="font-sans text-sm text-ink/60 font-light">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 font-sans text-sm text-ink/70 font-light leading-relaxed">
          <div>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Cross-Contamination</h2>
            <p>
              Our kitchen is not a nut-free or allergen-free environment. We take
              reasonable precautions but cannot guarantee that any dish is completely
              free from any allergen. Customers with severe allergies should assess
              their own risk before ordering.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Calorie Information</h2>
            <p>
              Calorie and nutritional information for our menu items is available on
              request. Adults need around 2,000 kcal a day.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">Contact Us</h2>
            <p>
              For detailed allergen information on any specific dish, please call us on{" "}
              <a href="tel:01865718225" className="text-ochre hover:text-ink transition-colors">
                01865 718225
              </a>{" "}
              before your visit, or speak to any member of our team when you arrive.
            </p>
          </div>
        </section>

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
