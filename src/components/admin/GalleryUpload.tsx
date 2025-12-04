import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Image, Video, Link, Upload, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/data/initialData';

interface GalleryUploadProps {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  className?: string;
}

type UploadMode = 'file' | 'url';

export function GalleryUpload({ value, onChange, className }: GalleryUploadProps) {
  const [mode, setMode] = useState<UploadMode>('file');
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const isVideo = file.type.startsWith('video/');
        
        const newItem: GalleryItem = {
          id: generateId(),
          type: isVideo ? 'video' : 'image',
          url: result,
          title: file.name.replace(/\.[^/.]+$/, '')
        };
        
        onChange([...value, newItem]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    // Detect video URLs
    const isVideoUrl = urlInput.includes('youtube.com') || 
                       urlInput.includes('youtu.be') || 
                       urlInput.includes('vimeo.com') ||
                       urlInput.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);

    const detectedType = isVideoUrl ? 'video' : urlType;

    // Convert YouTube URLs to embed format
    let finalUrl = urlInput;
    if (urlInput.includes('youtube.com/watch')) {
      const videoId = new URL(urlInput).searchParams.get('v');
      if (videoId) {
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (urlInput.includes('youtu.be/')) {
      const videoId = urlInput.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    const newItem: GalleryItem = {
      id: generateId(),
      type: detectedType,
      url: finalUrl,
    };

    onChange([...value, newItem]);
    setUrlInput('');
  };

  const removeItem = (id: string) => {
    onChange(value.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...value];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Controls */}
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={mode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('file')}
        >
          <Upload className="h-4 w-4 mr-1" />
          Datei
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('url')}
        >
          <Link className="h-4 w-4 mr-1" />
          URL
        </Button>
      </div>

      {mode === 'file' ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="gallery-upload"
          />
          <label htmlFor="gallery-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <Image className="h-8 w-8 text-muted-foreground" />
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Bilder oder Videos hochladen
              </p>
              <p className="text-xs text-muted-foreground">
                Mehrfachauswahl möglich
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={urlType === 'image' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setUrlType('image')}
            >
              <Image className="h-4 w-4 mr-1" />
              Bild
            </Button>
            <Button
              type="button"
              variant={urlType === 'video' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setUrlType('video')}
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="URL eingeben (YouTube, Vimeo, oder direkte URL)"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
            />
            <Button type="button" onClick={handleUrlAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            YouTube/Vimeo URLs werden automatisch erkannt
          </p>
        </div>
      )}

      {/* Gallery Items */}
      {value.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Galerie ({value.length} {value.length === 1 ? 'Element' : 'Elemente'})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {value.map((item, index) => (
              <Card key={item.id} className="relative group overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title || 'Gallery image'}
                      className="w-full h-full object-cover"
                    />
                  ) : item.url.includes('youtube.com/embed') || item.url.includes('vimeo.com') ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <Video className="h-8 w-8 text-primary" />
                      <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                        YouTube/Vimeo
                      </span>
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  <Badge
                    variant="secondary"
                    className="absolute top-1 left-1 text-xs"
                  >
                    {item.type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                  </Badge>
                </div>
                
                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {index > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => moveItem(index, 'up')}
                    >
                      ←
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {index < value.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => moveItem(index, 'down')}
                    >
                      →
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
