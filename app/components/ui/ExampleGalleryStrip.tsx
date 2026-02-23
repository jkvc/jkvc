"use client";

export interface ExampleGalleryItem {
  id: string;
  imageUrl: string;
  alt?: string;
}

type ThumbnailSize = "sm" | "md";

interface Props {
  items: ExampleGalleryItem[];
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  title?: string;
  thumbnailSize?: ThumbnailSize;
  center?: boolean;
  className?: string;
  showTitle?: boolean;
  deleteInDevOnly?: boolean;
}

const SIZE_MAP: Record<ThumbnailSize, string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
};

export default function ExampleGalleryStrip({
  items,
  onSelect,
  onDelete,
  title = "Examples",
  thumbnailSize = "sm",
  center = false,
  className = "",
  showTitle = true,
  deleteInDevOnly = true,
}: Props) {
  if (items.length === 0) return null;

  const showDelete = !!onDelete && (!deleteInDevOnly || process.env.NODE_ENV === "development");

  return (
    <div className={`flex flex-col gap-2 ${center ? "items-center" : ""} ${className}`}>
      {showTitle && (
        <p className="text-[10px] text-[#BBB] uppercase tracking-widest">
          {title}
        </p>
      )}
      <div className={`flex flex-wrap gap-2 ${center ? "justify-center" : ""}`}>
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
              className={`rounded-lg overflow-hidden border border-[#E8E8E8] hover:border-gold/40 transition-colors ${SIZE_MAP[thumbnailSize]} p-0 cursor-pointer`}
            >
              <img
                src={item.imageUrl}
                alt={item.alt ?? "Example"}
                className="w-full h-full object-cover"
              />
            </button>
            {showDelete && (
              <button
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E0E0E0] text-[#999] hover:bg-red-400 hover:text-white text-[9px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                title="Delete"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
