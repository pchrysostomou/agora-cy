'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, X, ImageIcon, GripVertical } from 'lucide-react';

interface Props {
  images: string[];                               // object URL / data URL previews
  onChange: (images: string[], files: File[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 8 }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileListRef = useRef<File[]>([]);

  const processFiles = useCallback(
    (inputFiles: FileList | File[]) => {
      const remaining = maxImages - images.length;
      const toProcess = Array.from(inputFiles).filter((f) => f.type.startsWith('image/')).slice(0, remaining);

      toProcess.forEach((file) => {
        const url = URL.createObjectURL(file);
        fileListRef.current = [...fileListRef.current, file];
        onChange([...images, url], fileListRef.current);
      });
    },
    [images, maxImages, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    fileListRef.current = fileListRef.current.filter((_, i) => i !== idx);
    onChange(images.filter((url, i) => {
      if (i !== idx) return true;
      URL.revokeObjectURL(url); // free memory
      return false;
    }), fileListRef.current);
  };

  // Drag-to-reorder
  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const reorderedImages = [...images];
      const [movedImg] = reorderedImages.splice(dragIndex, 1);
      reorderedImages.splice(dragOverIndex, 0, movedImg);

      const reorderedFiles = [...fileListRef.current];
      const [movedFile] = reorderedFiles.splice(dragIndex, 1);
      reorderedFiles.splice(dragOverIndex, 0, movedFile);
      fileListRef.current = reorderedFiles;

      onChange(reorderedImages, reorderedFiles);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const canAdd = images.length < maxImages;

  return (
    <div>
      {/* Drop zone */}
      {canAdd && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('image-file-input')?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-teal)' : 'var(--color-gray-300)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--color-teal-50)' : 'var(--color-gray-50)',
            transition: 'all var(--transition)',
            marginBottom: images.length > 0 ? '16px' : 0,
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--color-teal-light)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Upload size={22} style={{ color: 'var(--color-teal)' }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-2)', marginBottom: '4px' }}>
            Σύρε ή κάνε κλικ για upload
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Έως {maxImages} φωτογραφίες · JPG, PNG, WEBP · Max 10MB
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '4px' }}>
            {images.length}/{maxImages} φωτογραφίες
          </p>
          <input
            id="image-file-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px',
        }}>
          {images.map((src, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
              onDragEnd={handleDragEnd}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: idx === 0 ? '2px solid var(--color-teal)' : '2px solid var(--color-gray-200)',
                opacity: dragIndex === idx ? 0.5 : 1,
                transition: 'all var(--transition)',
                cursor: 'grab',
                background: 'var(--color-gray-100)',
              }}
            >
              <img
                src={src}
                alt={`Φωτογραφία ${idx + 1}`}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
              />

              {/* Primary badge */}
              {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(9,177,186,0.9)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '3px',
                }}>
                  ΚΥΡΙΑ
                </div>
              )}

              {/* Drag handle */}
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '4px',
                padding: '2px',
                color: '#fff',
              }}>
                <GripVertical size={12} />
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '22px',
                  height: '22px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'background var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.85)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Add more button */}
          {canAdd && images.length > 0 && (
            <button
              type="button"
              onClick={() => document.getElementById('image-file-input')?.click()}
              style={{
                aspectRatio: '1',
                border: '2px dashed var(--color-gray-300)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: 'var(--color-gray-400)',
                fontSize: '12px',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-teal)';
                e.currentTarget.style.background = 'var(--color-teal-50)';
                e.currentTarget.style.color = 'var(--color-teal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
                e.currentTarget.style.background = 'var(--color-gray-50)';
                e.currentTarget.style.color = 'var(--color-gray-400)';
              }}
            >
              <ImageIcon size={20} />
              <span>Προσθήκη</span>
            </button>
          )}
        </div>
      )}

      <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '8px' }}>
        💡 Σύρε για αλλαγή σειράς. Η πρώτη φωτογραφία εμφανίζεται ως κύρια.
      </p>
    </div>
  );
}
