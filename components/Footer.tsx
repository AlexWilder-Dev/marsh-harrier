
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
  { label: "BBQ Menu", href: "https://marshharriercowley.co.uk/media/bbq-menu.pdf" },
  { label: "Buffet Menu", href: "https://marshharriercowley.co.uk/media/buffet-menu.pdf" },
  { label: "Christmas Menu", href: "https://marshharriercowley.co.uk/media/christmas-menu-2025.pdf" },
];

const social = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/marshharriercowley",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/marshharriercowley",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@marshharriercowley",
    icon: (
      <svg width="20" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="bg-ochre text-ink/60 py-16 md:py-20"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-parchment/25 to-transparent mb-12" aria-hidden="true" />

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 mb-12">
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

        <div className="border-t border-ink/10 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="font-sans text-xs text-ink/35 font-light">
            © {new Date().getFullYear()} The Marsh Harrier. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-ink/40 hover:text-ink transition-colors duration-200 focus-visible:outline-ochre"
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p className="font-sans text-xs text-ink/30 font-light">
            Please drink responsibly. Challenge 25 in operation.
          </p>
        </div>
      </div>
    </footer>
  );
}
