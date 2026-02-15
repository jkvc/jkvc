import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import TextImageClient from "./TextImageClient";

export const metadata: Metadata = {
  title: "Text Image Canvas | jkvc",
  description:
    "Transform images into parallax text art using semantic segmentation",
};

export default function TextImagePage() {
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-base-content px-6 pt-4 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm opacity-50 hover:opacity-80 transition-opacity"
        >
          &larr; Back
        </Link>

        <div className="mt-12">
          <div className="inline-block bg-black/5 text-base-content/50 text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded mb-4">
            Under construction &mdash; dev only
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Text Image Canvas
          </h1>
          <p className="mt-3 text-base-content/60">
            Upload an image and watch it transform into parallax text art. Each
            detected region becomes its label rendered in its dominant color.
          </p>
        </div>

        <div className="mt-12">
          <Suspense>
            <TextImageClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
