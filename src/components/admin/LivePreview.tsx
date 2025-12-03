import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface LivePreviewProps {
  title?: string;
  children: ReactNode;
}

export function LivePreview({ title = 'Live-Vorschau', children }: LivePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader className="pb-3">
        <CardTitle 
          className="text-sm font-medium flex items-center justify-between cursor-pointer lg:cursor-default"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            {title}
          </span>
          <button className="lg:hidden p-1 hover:bg-secondary rounded">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="rounded-lg border border-border overflow-hidden bg-background">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}