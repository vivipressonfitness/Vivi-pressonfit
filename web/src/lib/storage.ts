import { supabase } from './supabase';

export const MEMBERS_BUCKET = 'members-media';

export interface StorageFileItem {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: {
    size?: number;
    mimetype?: string;
  } | null;
  publicUrl: string;
  path: string;
  sizeFormatted: string;
}

/**
 * Formatea bytes en KB o MB legibles.
 */
function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Obtiene la URL pública de un archivo en el bucket 'members-media'.
 */
export function getMemberMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const { data } = supabase.storage.from(MEMBERS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Sube un archivo multimedia al bucket 'members-media' de Supabase.
 */
export async function uploadMemberMedia(
  file: File,
  folder: 'videos' | 'images' | 'documents' | 'misc' = 'misc'
): Promise<{ success: boolean; publicUrl: string; path: string; error?: string }> {
  try {
    // Sanitizar nombre de archivo y evitar colisiones con timestamp
    const cleanName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    const timestamp = Date.now();
    const filePath = `${folder}/${timestamp}_${cleanName}`;

    const { data, error } = await supabase.storage
      .from(MEMBERS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, publicUrl: '', path: '', error: error.message };
    }

    const publicUrl = getMemberMediaUrl(data.path);
    return { success: true, publicUrl, path: data.path };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al subir archivo';
    return { success: false, publicUrl: '', path: '', error: message };
  }
}

/**
 * Lista todos los archivos del bucket 'members-media'.
 */
export async function listMemberMediaFiles(): Promise<{ items: StorageFileItem[]; error?: string }> {
  try {
    const folders = ['videos', 'images', 'documents', 'misc', ''];
    const allFiles: StorageFileItem[] = [];

    for (const folder of folders) {
      const { data, error } = await supabase.storage
        .from(MEMBERS_BUCKET)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (!error && data) {
        for (const f of data) {
          // Ignorar placeholders vacíos o carpetas
          if (f.id === null || f.name === '.emptyFolderPlaceholder') continue;
          const fullPath = folder ? `${folder}/${f.name}` : f.name;
          allFiles.push({
            name: f.name,
            id: f.id,
            created_at: f.created_at,
            updated_at: f.updated_at,
            metadata: f.metadata,
            publicUrl: getMemberMediaUrl(fullPath),
            path: fullPath,
            sizeFormatted: formatFileSize(f.metadata?.size),
          });
        }
      }
    }

    return { items: allFiles };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al listar archivos';
    return { items: [], error: message };
  }
}

/**
 * Elimina un archivo del bucket 'members-media'.
 */
export async function deleteMemberMediaFile(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(MEMBERS_BUCKET).remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar archivo';
    return { success: false, error: message };
  }
}
