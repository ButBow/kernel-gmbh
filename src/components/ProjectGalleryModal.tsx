import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/data/initialData';

interface ProjectGalleryModalProps {
  items: GalleryItem[];
  projectTitle: string;
  onClose: () => void;
  initialIndex?: number;
}

export function ProjectGalleryModal({ 
  items, 
  projectTitle, 
  onClose, 
  initialIndex = 0 
}: ProjectGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = items[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'Escape') onClose();
  };

  const isYouTubeEmbed = currentItem?.url.includes('youtube.com/embed');
  const isVimeoEmbed = currentItem?.url.includes('vimeo.com');
  const isExternalEmbed = isYouTubeEmbed || isVimeoEmbed;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-semibold text-white">{projectTitle}</h3>
          <p className="text-sm text-white/60">
            {currentIndex + 1} / {items.length}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10 h-12 w-12"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10 h-12 w-12"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Media Display */}
        <div className="max-w-5xl w-full max-h-[70vh] flex items-center justify-center">
          {currentItem?.type === 'image' ? (
            <img
              src={currentItem.url}
              alt={currentItem.title || projectTitle}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
          ) : isExternalEmbed ? (
            <div className="w-full aspect-video max-w-4xl">
              <iframe
                src={currentItem.url}
                className="w-full h-full rounded-lg shadow-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={currentItem?.url}
              controls
              autoPlay
              className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
            >
              Ihr Browser unterstützt dieses Video-Format nicht.
            </video>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {items.length > 1 && (
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2 justify-center overflow-x-auto pb-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all",
                  index === currentIndex 
                    ? "ring-2 ring-primary scale-105" 
                    : "opacity-60 hover:opacity-100"
                )}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0.5 right-0.5">
                  {item.type === 'video' ? (
                    <Video className="h-3 w-3 text-white drop-shadow-md" />
                  ) : (
                    <ImageIcon className="h-3 w-3 text-white drop-shadow-md" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
