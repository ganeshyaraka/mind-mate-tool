// Minimal markdown renderer: headings, paragraphs, bullet & numbered lists, bold text.
// Keeps the AI response readable without adding a heavy dependency.

type Block =
  | { type: "h"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
      continue;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
      continue;
    }
    const numbered = /^(\d+)[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushParagraph();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ol") last.items.push(numbered[2]);
      else blocks.push({ type: "ol", items: [numbered[2]] });
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  return blocks;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-muted px-1.5 py-0.5 text-sm">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function Markdown({ content }: { content: string }) {
  const blocks = parse(content);

  return (
    <div className="space-y-4 leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        if (block.type === "h") {
          const size =
            block.level <= 2 ? "text-xl" : block.level === 3 ? "text-lg" : "text-base";
          return (
            <h3 key={i} className={`${size} font-semibold tracking-tight text-foreground`}>
              <Inline text={block.text} />
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 marker:text-primary">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={i} className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-primary">
              {block.items.map((item, j) => (
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="text-[0.975rem] text-foreground/90">
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
