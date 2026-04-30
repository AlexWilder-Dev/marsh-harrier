import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms — Stay at The Marsh Harrier, Cowley Oxford",
  description:
    "A comfortable room above Oxford's best community local. Wake up above the Marsh Harrier and enjoy everything Cowley has to offer. Enquire today.",
  alternates: { canonical: "/rooms" },
  openGraph: {
    title: "Rooms at The Marsh Harrier, Cowley Oxford",
    description:
      "Stay above Oxford's best community local. A comfortable, well-appointed room in the heart of Cowley.",
    url: "https://marshharriercowley.co.uk/rooms",
    images: [
      {
        url: "https://marshharriercowley.co.uk/images/marsh-harrier-pub-room-bedroom.avif",
        width: 1200,
        height: 630,
        alt: "Guest room at The Marsh Harrier, Cowley Oxford",
      },
    ],
  },
};

const lodgingSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "The Marsh Harrier — Guest Room",
  url: "https://marshharriercowley.co.uk/rooms",
  image: "https://marshharriercowley.co.uk/images/marsh-harrier-pub-room-bedroom.avif",
  description:
    "A comfortable, well-appointed guest room above The Marsh Harrier pub in the heart of Cowley, Oxford.",
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
  telephone: "01865718225",
  priceRange: "££",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "En-suite bathroom", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private room", value: true },
  ],
};

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingSchema) }}
      />
      {children}
    </>
  );
}
