import { useEffect, useState, useRef } from 'react';
import {
  listMemberMediaFiles,
  uploadMemberMedia,
  deleteMemberMediaFile,
  MEMBERS_BUCKET,
  type StorageFileItem,
} from '../../lib/storage';

interface MediaBucketManagerProps {
  onSelectFile?: (fileUrl: string, fileType: 'video' | 'image' | 'pdf') => void;
  title?: string;
  compact?: boolean;
}

export function MediaBucketManager({
  onSelectFile,
  title = 'Gestor de Contenido Multimedia (Bucket: members-media)',
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

    // Auto-detectar subcarpeta según tipo de archivo
    let targetFolder: 'videos' | 'images' | 'documents' | 'misc' = 'misc';
    if (selected.type.startsWith('video/')) targetFolder = 'videos';
    else if (selected.type.startsWith('image/')) targetFolder = 'images';
    else if (selected.type === 'application/pdf') targetFolder = 'documents';

    const result = await uploadMemberMedia(selected, targetFolder);
    setUploading(false);

    if (result.success) {
      setStatusMsg({ text: `✅ Archivo "${selected.name}" subido con éxito al bucket.` });
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
      setStatusMsg({ text: `🗑️ Archivo "${name}" eliminado.` });
      setFiles((prev) => prev.filter((f) => f.path !== path));
    } else {
      setStatusMsg({ text: `Error al eliminar: ${error}`, error: true });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setStatusMsg({ text: '📋 URL copiada al portapapeles' });
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
            <span>📦</span> {title}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Bucket de Supabase Storage: <code className="bg-background px-1.5 py-0.5 rounded text-accent font-mono">{MEMBERS_BUCKET}</code>
          </p>
        </div>
        <button
          type="button"
          onClick={loadFiles}
          disabled={loading || uploading}
          className="text-xs text-text-secondary hover:text-white border border-border px-3 py-1.5 rounded-pill transition"
        >
          {loading ? 'Cargando...' : '🔄 Actualizar lista'}
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
          <span className="text-3xl">📤</span>
          <span className="font-semibold text-sm text-text-primary">
            {uploading ? 'Subiendo archivo al bucket...' : 'Haz clic para seleccionar o subir multimedia'}
          </span>
          <span className="text-xs text-text-secondary">
            Videos (MP4, WebM) · Portadas e Imágenes (JPG, PNG, WebP) · Guías en PDF
          </span>
          <span className="inline-block mt-2 bg-accent hover:bg-white text-background font-bold px-4 py-2 rounded-full text-xs transition shadow-sm">
            {uploading ? 'Procesando subida...' : 'Seleccionar archivo local'}
          </span>
        </label>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            statusMsg.error
              ? 'bg-red-500/15 border border-red-500/30 text-red-200'
              : 'bg-green-500/15 border border-green-500/30 text-green-200'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-text-secondary hover:text-white ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros de archivo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex gap-1.5">
          {(['all', 'video', 'image', 'pdf'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-pill text-xs font-semibold transition ${
                filterType === t
                  ? 'bg-accent text-background'
                  : 'bg-background border border-border text-text-secondary hover:text-white'
              }`}
            >
              {t === 'all' && `Todos (${files.length})`}
              {t === 'video' && '🎬 Videos'}
              {t === 'image' && '🖼️ Imágenes'}
              {t === 'pdf' && '📄 PDFs'}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-secondary">
          {filteredFiles.length} archivo{filteredFiles.length === 1 ? '' : 's'} en el bucket
        </span>
      </div>

      {/* Lista / Cuadrícula de archivos */}
      {loading ? (
        <div className="py-8 text-center text-text-secondary text-xs">Cargando archivos del bucket...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-8 text-center text-text-secondary text-xs bg-background/30 rounded-xl border border-border/50">
          No hay archivos de este tipo en el bucket <code className="text-accent">{MEMBERS_BUCKET}</code>.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredFiles.map((file) => {
            const isVid = isVideo(file.name);
            const isImg = isImage(file.name);
            const isDoc = isPdf(file.name);

            return (
              <div
                key={file.path}
                className="bg-background border border-border rounded-xl p-3 flex flex-col justify-between space-y-2 group hover:border-accent/40 transition"
              >
                {/* Previsualizador miniatura */}
                <div className="w-full h-28 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center relative">
                  {isImg && (
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isVid && (
                    <video
                      src={file.publicUrl}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  )}
                  {isDoc && (
                    <div className="flex flex-col items-center justify-center text-text-secondary">
                      <span className="text-3xl">📄</span>
                      <span className="text-[10px] uppercase font-bold text-accent mt-1">Documento PDF</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[10px] text-gray-300 font-mono">
                    {file.sizeFormatted}
                  </span>
                </div>

                {/* Nombre y metadatos */}
                <div>
                  <p className="text-xs font-semibold text-text-primary truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-text-secondary font-mono truncate">{file.path}</p>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
                  {onSelectFile && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectFile(
                          file.publicUrl,
                          isVid ? 'video' : isImg ? 'image' : 'pdf'
                        )
                      }
                      className="flex-1 bg-accent/20 hover:bg-accent text-accent hover:text-background font-bold text-[11px] py-1 px-2 rounded-lg transition"
                    >
                      Asignar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => copyUrl(file.publicUrl)}
                    title="Copiar URL"
                    className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition text-xs"
                  >
                    📋
                  </button>
                  <a
                    href={file.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir en pestaña nueva"
                    className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition text-xs"
                  >
                    🔗
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.path, file.name)}
                    title="Eliminar del bucket"
                    className="p-1 hover:bg-red-500/20 text-text-secondary hover:text-red-400 rounded transition text-xs"
                  >
                    🗑️
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
