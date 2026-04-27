
const nav = [
  { label: "Our Story", href: "/#about" },
  { label: "The Garden", href: "/#garden" },
  { label: "Food & Drink", href: "/#food" },
  { label: "Ales & Cellar", href: "/#ales" },
  { label: "Find Us", href: "/#find-us" },
  { label: "Rooms", href: "/rooms" },
];

const menus = [
  { label: "Food Menu", href: "https://marshharriercowley.co.uk/media/food-menu.pdf" },
  { label: "Drinks Menu", href: "https://marshharriercowley.co.uk/media/drinks-menu.pdf" },
];

export default function Footer() {
  return (
    <footer
      className="bg-ochre text-ink/60 py-16 md:py-20"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-parchment/25 to-transparent mb-12" aria-hidden="true" />

        <div className="grid md:grid-cols-3 gap-10 md:gap-16 mb-12">
          <div>
            <h2 className="font-serif font-light text-ink text-display-md leading-none mb-2">
              The Marsh Harrier
            </h2>
            <p className="font-serif italic text-ink/35 text-sm mb-4">
              Master Cellarman. Est. Cowley.
            </p>
            <p className="font-sans text-sm font-light leading-relaxed text-ink/55">
              A beer fan&apos;s haven in the heart of Cowley, Oxford.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <p className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">
              Navigate
            </p>
            <ul className="flex flex-col gap-2.5">
              {nav.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-ink/55 hover:text-ink transition-colors duration-200 font-light focus-visible:outline-ochre"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-sans text-[15px] tracking-widest uppercase text-ink mb-4">
              Visit
            </p>
            <address className="font-sans not-italic text-sm text-ink/55 leading-loose font-light mb-5">
              40 Marsh Road<br />
              Cowley, Oxford OX4 2HH
            </address>
            {/* Arrow-rule menu links */}
            <ul className="flex flex-col gap-0">
              {menus.map((m) => (
                <li key={m.label}>
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center py-2.5 border-t border-ink/[0.06] hover:border-ink/20 transition-colors duration-200 focus-visible:outline-ochre"
                    aria-label={`${m.label} — opens in new tab`}
                  >
                    <span className="font-sans text-xs tracking-wider uppercase text-ink/55 group-hover:text-ink transition-colors duration-200 flex-shrink-0">
                      {m.label}
                    </span>
                    <span
                      className="flex-1 mx-3 h-px bg-ink/10 group-hover:bg-ink/20 transition-colors duration-200"
                      aria-hidden="true"
                    />
                    <span className="text-ink/35 group-hover:text-ink transition-colors duration-200" aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="font-sans text-xs text-ink/35 font-light">
            © {new Date().getFullYear()} The Marsh Harrier. All rights reserved.
          </p>
          <p className="font-serif italic text-ink/25 text-sm">
            Cowley · Oxford · Since 2009
          </p>
          <p className="font-sans text-xs text-ink/30 font-light">
            Please drink responsibly. Challenge 25 in operation.
          </p>
        </div>
      </div>
    </footer>
  );
}
