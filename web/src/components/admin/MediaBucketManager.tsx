import { useEffect, useState, useRef } from 'react';
import {
  listMemberMediaFiles,
  uploadMemberMedia,
  deleteMemberMediaFile,
  MEMBERS_BUCKET,
  type StorageFileItem,
} from '../../lib/storage';
import { FolderIcon, TrashIcon } from '../ui/Icons';

interface MediaBucketManagerProps {
  onSelectFile?: (fileUrl: string, fileType: 'video' | 'image' | 'pdf') => void;
  title?: string;
  compact?: boolean;
}

// F-10: Gestor de Storage con iconos SVG de trazo y sin emojis funcionales
export function MediaBucketManager({
  onSelectFile,
  title = 'Biblioteca Multimedia (Bucket: members-media)',
  compact = false,
}: MediaBucketManagerProps) {
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image' | 'pdf'>('all');
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setLoading(true);
    const { items, error } = await listMemberMediaFiles();
    if (error) {
      setStatusMsg({ text: `Aviso: ${error}. Si el bucket aún no está creado en Supabase, ejecuta el script SQL.`, error: true });
    } else {
      setFiles(items);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploading(true);
    setStatusMsg({ text: `Subiendo "${selected.name}" al bucket ${MEMBERS_BUCKET}...` });

    let targetFolder: 'videos' | 'images' | 'documents' | 'misc' = 'misc';
    if (selected.type.startsWith('video/')) targetFolder = 'videos';
    else if (selected.type.startsWith('image/')) targetFolder = 'images';
    else if (selected.type === 'application/pdf') targetFolder = 'documents';

    const result = await uploadMemberMedia(selected, targetFolder);
    setUploading(false);

    if (result.success) {
      setStatusMsg({ text: `Archivo "${selected.name}" subido con éxito al bucket.` });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadFiles();
      if (onSelectFile) {
        const type = selected.type.startsWith('video/')
          ? 'video'
          : selected.type.startsWith('image/')
          ? 'image'
          : 'pdf';
        onSelectFile(result.publicUrl, type);
      }
    } else {
      setStatusMsg({
        text: `Error al subir: ${result.error}. Verifica que el bucket "${MEMBERS_BUCKET}" exista en Supabase con permisos de subida.`,
        error: true,
      });
    }
  };

  const handleDelete = async (path: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}" del bucket ${MEMBERS_BUCKET}?`)) return;
    const { success, error } = await deleteMemberMediaFile(path);
    if (success) {
      setStatusMsg({ text: `Archivo "${name}" eliminado.` });
      setFiles((prev) => prev.filter((f) => f.path !== path));
    } else {
      setStatusMsg({ text: `Error al eliminar: ${error}`, error: true });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setStatusMsg({ text: 'URL copiada al portapapeles' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const isVideo = (name: string) => /\.(mp4|webm|mov|m4v)$/i.test(name);
  const isImage = (name: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(name);
  const isPdf = (name: string) => /\.pdf$/i.test(name);

  const filteredFiles = files.filter((f) => {
    if (filterType === 'video') return isVideo(f.name);
    if (filterType === 'image') return isImage(f.name);
    if (filterType === 'pdf') return isPdf(f.name);
    return true;
  });

  return (
    <div className={`bg-raised border border-border rounded-2xl ${compact ? 'p-4' : 'p-6'} space-y-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-accent" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Bucket de Supabase Storage: <code className="bg-background px-1.5 py-0.5 rounded text-accent font-mono">{MEMBERS_BUCKET}</code>
          </p>
        </div>
        <button
          type="button"
          onClick={loadFiles}
          disabled={loading || uploading}
          className="text-xs text-text-secondary hover:text-white border border-border px-3 py-1.5 rounded-pill transition min-h-[36px]"
        >
          {loading ? 'Cargando...' : 'Actualizar lista'}
        </button>
      </div>

      {/* Zona de subida */}
      <div className="bg-background/60 border-2 border-dashed border-border hover:border-accent/50 transition-colors rounded-xl p-5 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="member-media-upload-input"
        />
        <label
          htmlFor="member-media-upload-input"
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <FolderIcon className="w-8 h-8 text-accent/80" />
          <span className="font-semibold text-sm text-text-primary">
            {uploading ? 'Subiendo archivo al bucket...' : 'Haz clic para seleccionar o subir multimedia'}
          </span>
          <span className="text-xs text-text-secondary">
            MP4, WebM, WebP, JPG, PNG o PDF. Se asignará a la carpeta correspondiente.
          </span>
        </label>
      </div>

      {/* Mensaje de estado */}
      {statusMsg && (
        <div
          role="status"
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            statusMsg.error
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button type="button" onClick={() => setStatusMsg(null)} className="ml-2 hover:opacity-75">✕</button>
        </div>
      )}

      {/* Filtros por tipo de archivo */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-text-secondary font-semibold mr-1">Filtrar:</span>
        {(['all', 'video', 'image', 'pdf'] as const).map((t) => {
          const labels = { all: 'Todos', video: 'Videos', image: 'Imágenes', pdf: 'PDFs' };
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-pill text-xs font-semibold transition ${
                filterType === t
                  ? 'bg-accent text-background'
                  : 'bg-surface border border-border text-text-secondary hover:text-white'
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
        <span className="text-xs text-text-secondary ml-auto">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'archivo' : 'archivos'}
        </span>
      </div>

      {/* Lista de archivos */}
      {loading ? (
        <div className="py-8 text-center text-xs text-text-secondary">Cargando biblioteca de archivos...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-8 text-center text-xs text-text-secondary border border-dashed border-border rounded-xl">
          No hay archivos de este tipo en el bucket.
        </div>
      ) : (
        <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'} max-h-96 overflow-y-auto pr-1`}>
          {filteredFiles.map((file) => {
            const isVid = isVideo(file.name);
            const isImg = isImage(file.name);
            const isDoc = isPdf(file.name);

            return (
              <div
                key={file.path}
                className="bg-surface border border-border/80 hover:border-accent/40 rounded-xl p-3 flex flex-col justify-between gap-2 text-xs transition"
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50 text-accent font-bold">
                    {isVid ? 'VID' : isImg ? 'IMG' : isDoc ? 'PDF' : 'DOC'}
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p className="font-semibold text-text-primary truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-text-secondary truncate mt-0.5">
                      {file.path.split('/')[0] || 'general'} · {file.sizeFormatted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                  {onSelectFile && (
                    <button
                      type="button"
                      onClick={() => onSelectFile(file.publicUrl, isVid ? 'video' : isImg ? 'image' : 'pdf')}
                      className="btn-accent !px-2.5 !py-1 text-[11px] font-bold"
                    >
                      Asignar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copyUrl(file.publicUrl)}
                    title="Copiar URL"
                    className="px-2 py-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition text-xs"
                  >
                    Copiar URL
                  </button>
                  <a
                    href={file.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir en pestaña nueva"
                    className="px-2 py-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition text-xs"
                  >
                    Ver
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.path, file.name)}
                    title="Eliminar del bucket"
                    className="p-1 hover:bg-red-500/20 text-text-secondary hover:text-red-400 rounded transition text-xs"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
