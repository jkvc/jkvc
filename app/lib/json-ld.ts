import { SITE } from "./site";
import type { Project } from "@/app/projects/data";

export const PERSON_ID = `${SITE.url}/about#person`;

function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

function metaTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim();
}

function authorRef() {
  return {
    "@type": "Person" as const,
    "@id": PERSON_ID,
    name: SITE.fullName,
    url: `${SITE.url}/about`,
  };
}

/** Site-wide identity — rendered from the root layout. */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    alternateName: SITE.fullName,
    url: SITE.url,
    description: SITE.description,
    author: { "@id": PERSON_ID },
  };
}

/** About page — mirrors the current role shown in the experience timeline. */
export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.fullName,
    alternateName: SITE.name,
    url: `${SITE.url}/about`,
    image: absoluteUrl("/head.jpeg"),
    description: SITE.description,
    jobTitle: "LLM harness and new AI experiences",
    worksFor: {
      "@type": "Organization",
      name: "Meta Superintelligence Lab",
    },
    sameAs: [
      SITE.social.linkedin,
      SITE.social.github,
      SITE.social.scholar,
    ],
  };
}

function codeRepositoryUrl(project: Project): string | undefined {
  return project.refs?.find((r) => r.kind === "code")?.url;
}

function externalSiteUrl(project: Project): string | undefined {
  return project.refs?.find((r) => r.kind === "site")?.url;
}

/** Project detail pages — article for readable, web app for playable. */
export function buildProjectJsonLd(project: Project) {
  const title = metaTitle(project.title);
  const url = `${SITE.url}/projects/${project.slug}`;
  const image = project.thumbnail
    ? absoluteUrl(project.thumbnail)
    : undefined;
  const author = authorRef();

  if (project.kind === "readable") {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: project.description,
      url,
      ...(image ? { image } : {}),
      ...(project.date ? { datePublished: project.date } : {}),
      author,
      publisher: author,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    };
  }

  const sameAs = [
    codeRepositoryUrl(project),
    externalSiteUrl(project),
  ].filter((value): value is string => Boolean(value));

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description: project.description,
    url,
    applicationCategory: "WebApplication",
    operatingSystem: "Web browser",
    ...(image ? { image } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    author,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
