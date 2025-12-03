import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Link, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  placeholder?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  className,
  aspectRatio = 'auto',
  placeholder = 'Bild hochladen oder URL eingeben'
}: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value.startsWith('http') ? value : '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'min-h-[120px]'
  }[aspectRatio];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus.');
      return;
    }

    // Warn if file is too large (> 500KB)
    if (file.size > 500 * 1024) {
      // Compress the image
      setIsLoading(true);
      try {
        const compressed = await compressImage(file, 800, 0.8);
        onChange(compressed);
        setError('');
      } catch {
        setError('Fehler beim Verarbeiten des Bildes.');
      }
      setIsLoading(false);
    } else {
      // Convert to base64
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        setError('');
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError('Fehler beim Lesen der Datei.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (file: File, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError('');
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Hochladen
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('url')}
        >
          <Link className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {/* Preview / Upload Area */}
      {value ? (
        <div className={cn('relative rounded-lg overflow-hidden bg-secondary', aspectClass)}>
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={() => setError('Bild konnte nicht geladen werden.')}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className={cn(
            'relative rounded-lg border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors',
            aspectClass
          )}
          onClick={() => mode === 'upload' && fileInputRef.current?.click()}
        >
          {isLoading ? (
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center px-4">
                {placeholder}
              </p>
            </>
          )}
        </div>
      )}

      {/* URL Input */}
      {mode === 'url' && !value && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
          />
          <Button type="button" onClick={handleUrlSubmit}>
            Laden
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
