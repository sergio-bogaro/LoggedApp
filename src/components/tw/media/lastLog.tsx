import { StatusBadge } from "../generic/badges";
import { Card } from "../generic/card";

import { MediaLogResponse } from "@/types/logged";

export const LastLog = ({ lastLog } : { lastLog?: MediaLogResponse }) => {
  if (!lastLog) return null;

  return (
    <Card>
      <p>{new Date(lastLog.date).toLocaleDateString()} <StatusBadge status={lastLog.status} /></p>
    </Card>
  )
}