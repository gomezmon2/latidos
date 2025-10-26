import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "experience-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  url: string;
  path: string;
}

export class StorageService {
  /**
   * Upload an image file to Supabase Storage
   * @param file - The image file to upload
   * @param userId - The user ID to organize files by user
   * @returns The public URL and storage path
   */
  static async uploadImage(file: File, userId: string): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Tipo de archivo no permitido. Solo se permiten: ${ALLOWED_TYPES.join(", ")}`
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Error al subir la imagen: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  }

  /**
   * Delete an image from Supabase Storage
   * @param path - The storage path of the file to delete
   */
  static async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Delete error:", error);
      throw new Error(`Error al eliminar la imagen: ${error.message}`);
    }
  }

  /**
   * Replace an existing image with a new one
   * @param oldPath - The storage path of the old file
   * @param newFile - The new image file
   * @param userId - The user ID
   * @returns The new public URL and storage path
   */
  static async replaceImage(
    oldPath: string | null,
    newFile: File,
    userId: string
  ): Promise<UploadResult> {
    // Upload new image
    const result = await this.uploadImage(newFile, userId);

    // Delete old image if exists
    if (oldPath) {
      try {
        await this.deleteImage(oldPath);
      } catch (error) {
        console.warn("Failed to delete old image:", error);
        // Don't throw - new image was uploaded successfully
      }
    }

    return result;
  }

  /**
   * Extract storage path from public URL
   * @param url - The public URL
   * @returns The storage path or null if not a valid storage URL
   */
  static getPathFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/object\/public\/experience-images\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate if a file is a valid image
   * @param file - The file to validate
   * @returns True if valid, error message if not
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP, GIF`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  }
}
