import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Card } from "@/components/tw/generic/card";
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

const CollectionCard = ({ title, count, previews, to }: CollectionCardProps) => {
  const { t } = useTranslation("media");
  const isEmpty = count === 0;
  const shown = previews.slice(0, MAX_PREVIEWS);

  const content = (
    <Card
      className={cn(
        "h-full gap-4 transition-colors",
        !isEmpty && "group-hover:border-foreground/30"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-step-3 font-medium">{title}</h3>
        <span className="font-serif text-step-3 tabular-nums text-muted-foreground">{count}</span>
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
                className="aspect-2/3 w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-20 items-center justify-center rounded border border-dashed border-border text-step-0 text-muted-foreground">
          {t("views.empty")}
        </div>
      )}
    </Card>
  );

  if (isEmpty) {
    return <div className="opacity-50">{content}</div>;
  }

  return (
    <Link to={to} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      {content}
    </Link>
  );
};

export default CollectionCard;
