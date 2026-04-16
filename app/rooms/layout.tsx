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
        url: "https://marshharriercowley.co.uk/media/photo-bar.jpg",
        width: 1200,
        height: 630,
        alt: "The Marsh Harrier, Cowley Oxford",
      },
    ],
  },
};

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
