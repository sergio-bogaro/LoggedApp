import { useTranslation } from "react-i18next";

import { GameDetails } from "./details";

import { AppTabs } from "@/components/tw/tabs";
import { GameBrainGame } from "@/querries/externalMedia/gamebrain";

export function GameTabs({ data }: { data: GameBrainGame }) {
  const { t } = useTranslation("media");

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <GameDetails data={data} />,
        },
      ]}
    />
  );
}
