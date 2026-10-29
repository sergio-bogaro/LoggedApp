import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MediaTypeEnum } from "@/types/media";
import { getMediaTypesOptions } from "@/utils/mediaText";

interface MediaTypeFilterProps {
  value: MediaTypeEnum[];
  onChange: (types: MediaTypeEnum[]) => void;
  availableTypes?: MediaTypeEnum[];
}

const typeDot: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "bg-type-film",
  [MediaTypeEnum.ANIME]: "bg-type-anime",
  [MediaTypeEnum.SERIES]: "bg-type-series",
  [MediaTypeEnum.MANGA]: "bg-type-manga",
  [MediaTypeEnum.GAME]: "bg-type-game",
  [MediaTypeEnum.BOOK]: "bg-type-book",
  [MediaTypeEnum.MUSIC]: "bg-type-music",
};

/**
 * Multi-select filter of media types rendered as toggle chips. The dot carries
 * the type hue; the chip itself stays quiet so the page is not a wall of
 * saturated buttons.
 */
const MediaTypeFilter = ({ value, onChange, availableTypes }: MediaTypeFilterProps) => {
  const { t } = useTranslation("media");

  const options = getMediaTypesOptions(t).filter(
    (option) => !availableTypes || availableTypes.includes(option.value)
  );

  const toggle = (type: MediaTypeEnum) => {
    if (value.includes(type)) {
      onChange(value.filter((item) => item !== type));
    } else {
      onChange([...value, type]);
    }
  };

  return (
    <div
      role="group"
      aria-label={t("views.filterLabel")}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const selected = value.includes(option.value);

        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={selected}
            onClick={() => toggle(option.value)}
            className={cn(
              "gap-2 border-border bg-background font-normal text-muted-foreground shadow-none",
              "hover:border-foreground/25 hover:bg-accent/60 hover:text-foreground",
              selected && "border-primary/40 bg-primary/10 font-medium text-primary hover:bg-primary/10"
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", typeDot[option.value])}
            />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

export default MediaTypeFilter;
