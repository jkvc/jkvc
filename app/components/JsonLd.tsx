type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

interface JsonLdProps {
  data: JsonLdValue;
}

/** Renders schema.org JSON-LD for crawlers and rich-result parsers. */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
