// Chat message renderer. LLM responses commonly contain markdown
// (**bold**, [links](url), bullet lists, inline code, occasional code
// blocks). We use react-markdown + remark-gfm so the full markdown
// surface — including code blocks and tables — renders correctly
// instead of leaking literal asterisks and backticks.
//
// User messages are still plain text; only assistant messages go
// through markdown rendering (the caller decides which to use).

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageBodyProps {
  content: string;
}

export function ChatMessageBody({ content }: ChatMessageBodyProps) {
  return (
    <div className="prose-chat space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Links open in a new tab, decorated with the karte accent.
          a: ({ children, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/40 underline-offset-2 transition hover:decoration-current"
            >
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p className="leading-[1.55]" style={{ whiteSpace: 'pre-wrap' }}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5 marker:text-current/50">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5 marker:text-current/50">
              {children}
            </ol>
          ),
          code: ({ children, className }) => {
            const isBlock = (className ?? '').includes('language-');
            if (isBlock) {
              return (
                <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-[12px] leading-[1.5]">
                  <code className={className}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded bg-white/[0.08] px-1 py-px font-mono text-[0.9em]">
                {children}
              </code>
            );
          },
          // Tables are surprisingly common in LLM output; this keeps
          // them readable in a tight chat bubble.
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/10 px-2 py-1.5 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/[0.04] px-2 py-1.5">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
