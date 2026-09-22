import { useTranslation } from "react-i18next";

interface LoadingProps {
  isLoading?: boolean;
}

export const Loading = ({ isLoading }: LoadingProps) => {
  const { t } = useTranslation("common");

  if (!isLoading) return null;

  return (
    <div
      role="status"
      className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/40"
    >
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s] motion-reduce:animate-none" />

        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s] motion-reduce:animate-none" />

        <span className="h-2 w-2 animate-bounce rounded-full bg-primary motion-reduce:animate-none" />
      </div>

      <span className="sr-only">{t("a11y.loading")}</span>
    </div>
  );
};
