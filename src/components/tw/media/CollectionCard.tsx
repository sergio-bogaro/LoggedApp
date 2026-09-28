import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { cn } from "@/lib/utils";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaResponse } from "@/types/logged";

interface CollectionCardProps {
  title: string;
  count: number;
  previews: MediaResponse[];
  to: string;
}

const MAX_PREVIEWS = 4;

/*
 * No card chrome: the collection reads as a heading plus a strip of posters,
 * the same editorial treatment the rest of the app uses for sections.
 */
const CollectionCard = ({ title, count, previews, to }: CollectionCardProps) => {
  const { t } = useTranslation("media");
  const isEmpty = count === 0;
  const shown = previews.slice(0, MAX_PREVIEWS);

  const content = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h3
          className={cn(
            "font-serif text-step-3 font-medium",
            !isEmpty && "underline-offset-4 group-hover:underline"
          )}
        >
          {title}
        </h3>

        <span className="font-serif text-step-3 tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>

      {shown.length > 0 ? (
        <div className="flex gap-2 overflow-hidden">
          {shown.map((media) => (
            <div
              key={`${media.externalId}:${media.type}`}
              className="w-14 shrink-0 overflow-hidden rounded"
            >
              <ImageWithSkeleton
                src={media.imagePath ? (mediaImageUrl(media.imagePath) ?? "") : (media.coverUrl ?? "")}
                alt={media.title}
                className="aspect-2/3 w-full"
                imgClassName={cn(
                  "transition-transform duration-300 ease-out",
                  !isEmpty && "group-hover:scale-[1.03]"
                )}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-step-1 text-muted-foreground">{t("views.empty")}</p>
      )}
    </>
  );

  if (isEmpty) {
    return <div className="space-y-3 opacity-50">{content}</div>;
  }

  return (
    <Link
      to={to}
      className="group block space-y-3 rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {content}
    </Link>
  );
};

export default CollectionCard;
