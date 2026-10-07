export interface R2SyncProgress {
  current: number;
  total: number;
  currentCar?: string;
  isComplete: boolean;
  successCount: number;
  failedCount: number;
}

/**
 * Legacy sync stub - Patel Motors strictly uses Supabase Storage.
 * Completely disables fetching or syncing any legacy Bombay Motors photos.
 */
export async function syncPendingImagesToR2(
  onProgress?: (progress: R2SyncProgress) => void
): Promise<{ success: boolean; migratedCount: number; failedCount: number }> {
  if (onProgress) {
    onProgress({ current: 0, total: 0, isComplete: true, successCount: 0, failedCount: 0 });
  }
  return { success: true, migratedCount: 0, failedCount: 0 };
}
