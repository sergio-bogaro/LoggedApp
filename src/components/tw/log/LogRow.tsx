import { RegisterRow } from "../media/RegisterRow";

import type { MediaLogWithMedia } from "@/querries/media/logged";

interface LogRowProps {
  log: MediaLogWithMedia;
  onOpenDetails?: () => void;
}

/* A log entry is a register row whose fields come from the log. */
export const LogRow = ({ log, onOpenDetails }: LogRowProps) => (
  <RegisterRow
    media={log.media}
    status={log.status}
    date={log.date}
    rating={log.rating}
    onOpenDetails={onOpenDetails}
  />
);
