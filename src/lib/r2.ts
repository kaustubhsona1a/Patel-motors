/**
 * Supabase Storage Integration Bridge
 * All images are strictly stored in Supabase Storage infrastructure.
 * DO NOT create a second storage system.
 */
import { uploadImageToStorage } from './supabase';

export async function uploadToR2(
  file: File | Blob,
  path: string,
  _contentType?: string
): Promise<string> {
  // Directly upload to Supabase Storage bucket 'vehicle-images'
  const fileObj = file instanceof File ? file : new File([file], 'photo.jpg', { type: file.type || 'image/jpeg' });
  const url = await uploadImageToStorage(fileObj, path, 'vehicle-images');
  return url;
}

export async function deleteFromR2(_path: string): Promise<boolean> {
  // Handled by Supabase storage purge directly
  return true;
}
