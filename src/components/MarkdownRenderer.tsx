import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn(
      "prose prose-sm max-w-none dark:prose-invert",
      "prose-headings:font-display prose-headings:text-foreground",
      "prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4",
      "prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3",
      "prose-p:text-muted-foreground prose-p:mb-4 prose-p:leading-relaxed",
      "prose-ul:text-muted-foreground prose-ul:my-4 prose-ul:pl-6",
      "prose-ol:text-muted-foreground prose-ol:my-4 prose-ol:pl-6",
      "prose-li:my-1",
      "prose-strong:text-foreground prose-strong:font-semibold",
      "prose-a:text-primary prose-a:underline hover:prose-a:no-underline",
      "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:italic",
      className
    )}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
