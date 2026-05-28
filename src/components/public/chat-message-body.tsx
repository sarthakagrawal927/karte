// Tiny inline markdown renderer for assistant chat messages.
//
// LLM responses frequently include `**bold**`, `[link](url)`, and
// `- bullet` syntax which we want rendered as actual formatting,
// not literal asterisks and brackets. A full markdown library
// (react-markdown + remark-gfm) is overkill for a chat bubble — this
// handles the 95% of cases that show up in practice: bold, italic,
// inline code, links, bullet lists, and paragraph breaks.

import { Fragment } from 'react';

interface ChatMessageBodyProps {
  content: string;
}

// Split into block-level chunks: paragraphs separated by blank lines,
// with consecutive `- ` lines collapsed into a single bullet list.
type Block =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'list'; items: string[] };

function parseBlocks(input: string): Block[] {
  const blocks: Block[] = [];
  const raw = input.replace(/\r\n/g, '\n').split(/\n\n+/);

  for (const chunk of raw) {
    const lines = chunk.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i] ?? '';
      const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (bulletMatch) {
        const items: string[] = [];
        while (i < lines.length) {
          const m = (lines[i] ?? '').match(/^\s*[-*]\s+(.*)$/);
          if (!m) break;
          items.push(m[1] ?? '');
          i++;
        }
        blocks.push({ kind: 'list', items });
        continue;
      }
      // Group consecutive non-bullet lines into one paragraph.
      const paraLines: string[] = [];
      while (i < lines.length) {
        const peek = lines[i] ?? '';
        if (/^\s*[-*]\s+/.test(peek)) break;
        paraLines.push(peek);
        i++;
      }
      if (paraLines.some((l) => l.trim().length > 0)) {
        blocks.push({ kind: 'paragraph', lines: paraLines });
      }
    }
  }

  return blocks;
}

// Inline parsing: bold, italic, code, links. Order matters — handle
// links first so their square-bracketed text isn't mistaken for
// emphasis. Returned as an array of React nodes.
function renderInline(text: string): React.ReactNode[] {
  type Token =
    | { kind: 'text'; value: string }
    | { kind: 'bold'; value: string }
    | { kind: 'italic'; value: string }
    | { kind: 'code'; value: string }
    | { kind: 'link'; label: string; href: string };

  const out: Token[] = [];
  let i = 0;
  while (i < text.length) {
    // Link: [label](href)
    if (text[i] === '[') {
      const close = text.indexOf(']', i);
      if (close !== -1 && text[close + 1] === '(') {
        const parenClose = text.indexOf(')', close + 2);
        if (parenClose !== -1) {
          const label = text.slice(i + 1, close);
          const href = text.slice(close + 2, parenClose);
          if (label && href && /^https?:\/\//.test(href)) {
            out.push({ kind: 'link', label, href });
            i = parenClose + 1;
            continue;
          }
        }
      }
    }
    // Bold: **text** or __text__
    if (
      (text[i] === '*' && text[i + 1] === '*') ||
      (text[i] === '_' && text[i + 1] === '_')
    ) {
      const marker = text[i] + text[i + 1];
      const end = text.indexOf(marker, i + 2);
      if (end !== -1) {
        const value = text.slice(i + 2, end);
        if (value && !/\s$/.test(value) && !/^\s/.test(value)) {
          out.push({ kind: 'bold', value });
          i = end + 2;
          continue;
        }
      }
    }
    // Italic: *text* or _text_ (single-char, won't conflict because we
    // already consumed bold above)
    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i];
      const end = text.indexOf(marker, i + 1);
      if (end !== -1 && end > i + 1) {
        const value = text.slice(i + 1, end);
        if (value && !/\s$/.test(value) && !/^\s/.test(value)) {
          out.push({ kind: 'italic', value });
          i = end + 1;
          continue;
        }
      }
    }
    // Inline code: `text`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1 && end > i + 1) {
        const value = text.slice(i + 1, end);
        out.push({ kind: 'code', value });
        i = end + 1;
        continue;
      }
    }
    // Plain text — accumulate one char at a time into the last text
    // token, creating one if needed.
    const last = out[out.length - 1];
    if (last && last.kind === 'text') {
      last.value += text[i];
    } else {
      out.push({ kind: 'text', value: text[i] ?? '' });
    }
    i++;
  }

  return out.map((tok, idx) => {
    switch (tok.kind) {
      case 'text':
        return <Fragment key={idx}>{tok.value}</Fragment>;
      case 'bold':
        return (
          <strong key={idx} className="font-semibold">
            {tok.value}
          </strong>
        );
      case 'italic':
        return (
          <em key={idx} className="italic">
            {tok.value}
          </em>
        );
      case 'code':
        return (
          <code
            key={idx}
            className="rounded bg-white/[0.08] px-1 py-px font-mono text-[0.9em]"
          >
            {tok.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={idx}
            href={tok.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-current/40 underline-offset-2 transition hover:decoration-current"
          >
            {tok.label}
          </a>
        );
    }
  });
}

export function ChatMessageBody({ content }: ChatMessageBodyProps) {
  const blocks = parseBlocks(content);
  if (blocks.length === 0) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
  }
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === 'list') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-current/50">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        // Paragraph: join lines back, preserve intra-paragraph newlines.
        const text = block.lines.join('\n');
        return (
          <p key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {renderInline(text)}
          </p>
        );
      })}
    </div>
  );
}
