import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { MusicAlbumDetails } from "@/querries/externalMedia/music";

export const MusicDetailsView = ({ data }: { data: MusicAlbumDetails }) => {
  return (
    <div className="divide-y divide-border">
      <DetailsLabel
        label={t("musicTabs.artist", { ns: "media" })}
        value={data.artist ?? " --- "}
      />

      <DetailsLabel
        label={t("musicTabs.genre", { ns: "media" })}
        value={data.genre ?? " --- "}
      />

      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={data.releaseDate ?? " --- "}
      />

      <DetailsLabel
        label={t("musicTabs.trackCount", { ns: "media" })}
        value={String(data.trackCount ?? data.tracks.length)}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          data.collectionId ? (
            <Link to={`https://music.apple.com/album/${data.collectionId}`} target="_blank">
              iTunes
            </Link>
          ) : (
            " --- "
          )
        }
      />
    </div>
  );
};
