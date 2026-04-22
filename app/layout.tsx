import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "The Marsh Harrier — A Beer Fan's Haven, Cowley Oxford",
  description:
    "A proper community local in Cowley, Oxford. Master Cellarman status, one of the best Sunday roasts in Oxford, and a beautiful beer garden. 40 Marsh Road, OX4 2HH.",
  keywords: [
    "pub Oxford",
    "Sunday roast Oxford",
    "beer garden Cowley",
    "real ale Oxford",
    "The Marsh Harrier",
    "Cowley pub",
    "Master Cellarman Oxford",
  ],
  authors: [{ name: "The Marsh Harrier" }],
  creator: "The Marsh Harrier",
  metadataBase: new URL("https://marshharriercowley.co.uk"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Marsh Harrier — A Beer Fan's Haven",
    description:
      "A proper community local in Cowley, Oxford. Master Cellarman status, one of the best Sunday roasts in Oxford.",
    url: "https://marshharriercowley.co.uk",
    siteName: "The Marsh Harrier",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "https://marshharriercowley.co.uk/images/marsh-harrier-pub-bar.jpg",
        width: 1200,
        height: 630,
        alt: "The Marsh Harrier bar — warm timber and golden light",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Marsh Harrier — A Beer Fan's Haven, Cowley Oxford",
    description:
      "A proper community local in Cowley, Oxford. Master Cellarman status, one of the best Sunday roasts in Oxford.",
    images: ["https://marshharriercowley.co.uk/images/marsh-harrier-pub-bar.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BarOrPub",
  name: "The Marsh Harrier",
  description:
    "A proper community local in Cowley, Oxford. Master Cellarman status and one of the best Sunday roasts in Oxford.",
  url: "https://marshharriercowley.co.uk",
  hasMap: "https://maps.google.com/?q=The+Marsh+Harrier,+40+Marsh+Road,+Cowley,+Oxford,+OX4+2HH",
  menu: "https://marshharriercowley.co.uk/media/food-menu.pdf",
  address: {
    "@type": "PostalAddress",
    streetAddress: "40 Marsh Road",
    addressLocality: "Cowley",
    addressRegion: "Oxford",
    postalCode: "OX4 2HH",
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 51.742,
    longitude: -1.228,
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "16:00", closes: "23:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday"], opens: "15:00", closes: "00:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "12:00", closes: "00:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"], opens: "12:00", closes: "22:30" },
  ],
  servesCuisine: ["British", "Traditional pub food"],
  priceRange: "££",
  image: "https://marshharriercowley.co.uk/images/marsh-harrier-pub-bar.jpg",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link
          rel="preload"
          href="/images/marsh-harrier-pub-front.avif"
          as="image"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
