import { useTranslation } from "react-i18next";

import { DateRangePicker } from "@/components/ui/dateRangePicker";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { PeriodKey, PeriodRange } from "@/utils/date";

interface PeriodFilterProps {
  value: PeriodKey;
  onChange: (period: PeriodKey) => void;
  custom: PeriodRange;
  onCustomChange: (range: PeriodRange) => void;
  /** The range currently in effect — what the field displays. */
  resolvedRange: PeriodRange;
}

/*
 * Page-level scope selector. A select rather than a segmented row on purpose:
 * the tabs directly above already use the underline idiom, and a second row of
 * underlined items would read as a second tab bar.
 *
 * The range field is always visible, so you can see which period you are in
 * without opening anything. With a preset it is disabled and only reports the
 * resolved range; switching to "Custom" — via the select — enables it, already
 * seeded with the dates that were on screen.
 */
export const PeriodFilter = ({
  value,
  onChange,
  custom,
  onCustomChange,
  resolvedRange,
}: PeriodFilterProps) => {
  const { t } = useTranslation("media");

  const options = [
    { value: "all", label: t("stats.period.all") },
    { value: "week", label: t("stats.period.week") },
    { value: "month", label: t("stats.period.month") },
    { value: "year", label: t("stats.period.year") },
    { value: "custom", label: t("stats.period.custom") },
  ];

  const isCustom = value === "custom";
  const displayed = isCustom ? custom : resolvedRange;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        name="period"
        label={t("stats.period.label")}
        options={options}
        value={value}
        onValueChange={(next) => onChange(next as PeriodKey)}
        width={170}
      />

      <div className="flex flex-col gap-1">
        <Label htmlFor="period-range">{t("stats.period.range")}</Label>

        <DateRangePicker
          id="period-range"
          className="w-60"
          from={displayed.start}
          to={displayed.end}
          placeholder={t("form.datePlaceholder", { ns: "common" })}
          disabled={!isCustom}
          onChange={(range) => onCustomChange({ start: range.from, end: range.to })}
        />
      </div>
    </div>
  );
};
