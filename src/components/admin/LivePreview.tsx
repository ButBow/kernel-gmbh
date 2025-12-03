import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface LivePreviewProps {
  title?: string;
  children: ReactNode;
}

export function LivePreview({ title = 'Live-Vorschau', children }: LivePreviewProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden bg-background">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
