interface MonthDividerProps {
  label: string;
}

/*
 * The month is a period marker in a chronological register, so it is a heading
 * in the display face rather than an eyebrow label. The hairline delimits the
 * period — it encodes structure, it is not decoration.
 */
export const MonthDivider = ({ label }: MonthDividerProps) => {
  return (
    <h2 className="border-b border-border pb-2 font-serif text-step-4 font-medium">
      {label}
    </h2>
  );
};
