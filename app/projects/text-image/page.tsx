import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import TextImageClient from "./TextImageClient";

export const metadata: Metadata = {
  title: "Image Labelifier | jkvc",
  description:
    "Every pixel has a name — watch your image dissolve into the words that describe it",
};

export default function TextImagePage() {
  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-20 pb-20 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Title & subtitle */}
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-text-heading">
            Image Labelifier
          </h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-text-muted">
            Every pixel has a name
          </p>
        </div>

        <div className="mt-10">
          <Suspense>
            <TextImageClient />
          </Suspense>
        </div>

        {/* Back to home */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border text-[#AAA] hover:border-gold/50 hover:text-gold transition-all"
            title="Home"
          >
            <i className="fa-solid fa-house text-[13px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
