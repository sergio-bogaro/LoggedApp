import { toast } from "sonner";

import { MediaTypeEnum } from "./mediaText";

export function handleBacklog(mediaId: string, mediaType: MediaTypeEnum) {
  //TODO: validar se ja existe na lista antes de adicionar e remover caso esteja

  toast.success("Added to Backlog");
}