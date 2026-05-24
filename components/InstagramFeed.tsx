"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const INSTAGRAM_URL = "https://www.instagram.com/themarshharrier/";

type IgPost = {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
};

// Used until NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN is configured (or if the API call fails).
const PLACEHOLDER_POSTS: IgPost[] = [
  { id: "p1", media_url: "/images/marsh-harrier-pub-food.jpg",             permalink: INSTAGRAM_URL, caption: "Food at The Marsh Harrier" },
  { id: "p2", media_url: "/images/marsh-harrier-pub-outdoor-garden.webp",  permalink: INSTAGRAM_URL, caption: "The Marsh Harrier beer garden" },
  { id: "p3", media_url: "/images/marsh-harrier-pub-bar.jpg",              permalink: INSTAGRAM_URL, caption: "The Marsh Harrier bar" },
  { id: "p4", media_url: "/images/marsh-harrier-pub-room-bedroom.avif",    permalink: INSTAGRAM_URL, caption: "Guest bedroom" },
  { id: "p5", media_url: "/images/marsh-harrier-pub-sign-beautiful.webp",  permalink: INSTAGRAM_URL, caption: "The Marsh Harrier pub sign" },
  { id: "p6", media_url: "/images/marsh-harrier-pub-front.webp",           permalink: INSTAGRAM_URL, caption: "The Marsh Harrier exterior" },
];

export default function InstagramFeed() {
  const [posts, setPosts] = useState<IgPost[]>(PLACEHOLDER_POSTS);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
    if (!token) return;

    const controller = new AbortController();
    const url = `https://graph.instagram.com/me/media?fields=id,media_url,permalink,caption,media_type,thumbnail_url&limit=6&access_token=${encodeURIComponent(token)}`;

    fetch(url, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Instagram API error"))))
      .then((data: { data?: IgPost[] }) => {
        if (Array.isArray(data.data) && data.data.length > 0) {
          setPosts(data.data.slice(0, 6));
        }
      })
      .catch(() => {
        // Silently fall back to placeholders.
      });

    return () => controller.abort();
  }, []);

  return (
    <section
      className="bg-parchment-dark py-24 sm:py-32 overflow-hidden"
      aria-label="Instagram feed"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="font-sans text-ink text-xs tracking-widest uppercase mb-4">Follow along</p>
            <h2 className="font-serif font-light text-display-lg text-forest-deep leading-[0.9]">
              @themarshharrier
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow The Marsh Harrier on Instagram (opens in new tab)"
            className="group inline-flex items-center gap-4 font-sans text-xs tracking-widest uppercase text-forest-deep hover:text-ochre transition-colors duration-300 focus-visible:outline-ochre flex-shrink-0"
          >
            Follow on Instagram
            <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-14" aria-hidden="true" />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {posts.map((post, i) => {
            const src = post.media_type === "VIDEO" && post.thumbnail_url
              ? post.thumbnail_url
              : post.media_url;
            const alt = post.caption?.slice(0, 120) || "Instagram post";
            return (
              <motion.a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${alt} — view on Instagram`}
                className="group relative aspect-square overflow-hidden focus-visible:outline-ochre"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 bg-forest-deep/0 group-hover:bg-forest-deep/30 transition-colors duration-300 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
