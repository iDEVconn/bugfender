import { Bugfender } from "@bugfender/sdk";
import { state } from "./state";

/**
 * Attach (or clear) the current user's identifier as a Bugfender device
 * key. Pass `null` on logout. No-op when the SDK isn't initialized so the
 * caller doesn't need to guard.
 */
export function setBugfenderDeviceKey(userId: string | null): void {
  if (!state.initialized) return;
  if (userId) {
    Bugfender.setDeviceKey("user.id", userId);
  } else {
    Bugfender.removeDeviceKey("user.id");
  }
}
