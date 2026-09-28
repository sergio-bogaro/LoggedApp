import { useMemo } from "react";

import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setMediaTypeFilter } from "@/store/settings/slice";
import { MediaTypeEnum } from "@/types/media";
import { getTrackFlags } from "@/utils/mediaTrack";

const ALL_TYPES = Object.values(MediaTypeEnum);

/**
 * Shared media-type filter for the views hub and the collection pages. The
 * selection lives in the UI slice (persisted to localStorage) so it survives
 * navigating between the hub and a collection, and across sessions.
 */
export function useMediaTypeFilter() {
  const dispatch = useAppDispatch();
  const stored = useAppSelector((state) => state.ui.mediaTypeFilter);
  const { user } = useAppSelector((state) => state.auth);

  const availableTypes = useMemo(() => {
    const tracked = ALL_TYPES.filter((type) => getTrackFlags(user)[type]);
    return tracked.length > 0 ? tracked : ALL_TYPES;
  }, [user]);

  // `null` = not chosen yet → everything the user tracks.
  const selectedTypes = stored ?? availableTypes;

  const setSelectedTypes = (types: MediaTypeEnum[]) => dispatch(setMediaTypeFilter(types));

  return { selectedTypes, setSelectedTypes, availableTypes };
}
