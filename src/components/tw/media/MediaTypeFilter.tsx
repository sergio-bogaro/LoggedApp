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

/**
 * Multi-select filter of media types rendered as toggle chips.
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
            variant={selected ? "default" : "outline"}
            aria-pressed={selected}
            onClick={() => toggle(option.value)}
            className={cn("border", selected && "border-transparent shadow-xs")}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

export default MediaTypeFilter;
