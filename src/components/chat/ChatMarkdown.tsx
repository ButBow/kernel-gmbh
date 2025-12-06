import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface ChatMarkdownProps {
  content: string;
  isUser?: boolean;
}

export function ChatMarkdown({ content, isUser = false }: ChatMarkdownProps) {
  return (
    <div className="chat-markdown text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className={cn(
              "font-semibold",
              isUser ? "text-primary-foreground" : "text-foreground"
            )}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className={cn(
                "underline hover:no-underline",
                isUser ? "text-primary-foreground/90" : "text-primary"
              )}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className={cn(
              "px-1 py-0.5 rounded text-xs font-mono",
              isUser ? "bg-primary-foreground/20" : "bg-muted"
            )}>{children}</code>
          ),
          pre: ({ children }) => (
            <pre className={cn(
              "p-2 rounded-lg overflow-x-auto my-2 text-xs",
              isUser ? "bg-primary-foreground/20" : "bg-muted"
            )}>{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className={cn(
              "border-l-2 pl-2 my-2 italic",
              isUser ? "border-primary-foreground/50" : "border-primary"
            )}>{children}</blockquote>
          ),
          h1: ({ children }) => <p className="font-bold mb-1">{children}</p>,
          h2: ({ children }) => <p className="font-bold mb-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
