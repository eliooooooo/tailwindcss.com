'use client';

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { clsx } from "clsx";
import dedent from "dedent";
import theme from "./syntax-highlighter/theme.json";

import { highlighter } from "./highlight";
import { highlightClasses } from "./highlight-classes";

export function js(strings: TemplateStringsArray, ...args: any[]) {
  return { lang: "js", code: dedent(strings, ...args) };
}

export function ts(strings: TemplateStringsArray, ...args: any[]) {
  return { lang: "ts", code: dedent(strings, ...args) };
}

export function jsx(strings: TemplateStringsArray, ...args: any[]) {
  return { lang: "jsx", code: dedent(strings, ...args) };
}

export function html(strings: TemplateStringsArray, ...args: any[]) {
  return { lang: "html", code: dedent(strings, ...args) };
}

export function svelte(strings: TemplateStringsArray, ...args: any[]) {
  return { lang: "svelte", code: dedent(strings, ...args) };
}

export function css(strings: TemplateStringsArray, ...args: any[]) {
  return { lang: "css", code: dedent(strings, ...args) };
}

export async function CodeExample({
  example,
  filename,
  className = "",
}: {
  example: { lang: string; code: string };
  filename?: string;
  className?: string;
}) {
  return (
    <CodeExampleWrapper className={className}>
      {filename ? <CodeExampleHeader><CodeExampleFilename filename={filename} /><CopyButton content={example.code}/></CodeExampleHeader> : null}
      <HighlightedCode example={example} />
    </CodeExampleWrapper>
  );
}

export function CodeExampleWrapper({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-950 in-data-stack:mt-0 in-data-stack:rounded-none in-[figure]:-mx-1 in-[figure]:-mb-1 in-data-stack:[:first-child>&]:rounded-t-xl in-data-stack:[:last-child>&]:rounded-b-xl">
      <div
        className={clsx(
          "rounded-xl p-1 text-sm scheme-dark in-data-stack:not-first:rounded-t-none dark:bg-white/5 dark:inset-ring dark:inset-ring-white/10",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function CodeExampleStack({ children }: { children: React.ReactNode }) {
  return (
    <div data-stack>
      <div className="not-prose">{children}</div>
    </div>
  );
}

export function CodeExampleGroup({
  filenames,
  children,
  className = "",
}: {
  filenames: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div>
      <TabGroup className="not-prose">
        <div className="rounded-xl bg-gray-950 in-[figure]:-mx-1 in-[figure]:-mb-1">
          <div
            className={clsx(
              "rounded-xl p-1 text-sm scheme-dark dark:bg-white/5 dark:inset-ring dark:inset-ring-white/10",
              className,
            )}
          >
            <TabList>
              {filenames.map((filename) => (
                <Tab
                  key={filename}
                  className="hover:*:text-white/85 aria-selected:*:font-medium aria-selected:*:text-white"
                >
                  <CodeExampleFilename filename={filename} />
                </Tab>
              ))}
            </TabList>
            <TabPanels>{children}</TabPanels>
          </div>
        </div>
      </TabGroup>
    </div>
  );
}

export function CodeBlock({ example }: { example: { lang: string; code: string } }) {
  return (
    <TabPanel>
      <HighlightedCode example={example} />
    </TabPanel>
  );
}

export function HighlightedCode({
  example,
  className,
}: {
  example: { lang: string; code: string };
  className?: string;
}) {
  return (
    <RawHighlightedCode
      example={example}
      className={clsx(
        "*:flex *:*:max-w-none *:*:shrink-0 *:*:grow *:overflow-auto *:rounded-lg *:bg-white/10! *:p-5 dark:*:bg-white/5!",
        "**:[.line]:isolate **:[.line]:block **:[.line]:not-last:min-h-[1lh]",
        "*:inset-ring *:inset-ring-white/10 dark:*:inset-ring-white/5",
        className,
      )}
    />
  );
}

export function RawHighlightedCode({
  example,
  className,
}: {
  example: { lang: string; code: string };
  className?: string;
}) {
  let codeWithoutPrettierIgnore = example.code
    .split("\n")
    .filter((line) => !line.includes("prettier-ignore"))
    .join("\n");

  let code = highlighter
    .codeToHtml(codeWithoutPrettierIgnore, {
      lang: example.lang,
      theme: theme.name,
      transformers: [
        transformerNotationHighlight({
          classActiveLine: "-mx-5 pl-[calc(var(--spacing)*5-2px)] border-l-2 pr-5 border-sky-400 bg-sky-300/15",
        }),
        transformerNotationDiff({
          classLineAdd:
            "relative -mx-5 border-l-4 border-teal-400 bg-teal-300/15 pr-5 pl-8 before:absolute before:left-4 before:text-teal-400 before:content-['+']",
          classLineRemove:
            "relative -mx-5 border-l-4 border-red-400 bg-red-300/15 pr-5 pl-8 before:absolute before:left-4 before:text-red-400 before:content-['-']",
          classActivePre: "[:where(&_.line)]:pl-4",
        }),
        transformerNotationWordHighlight({
          classActiveWord:
            "highlighted-word relative before:absolute before:-inset-x-0.5 before:-inset-y-0.25 before:-z-10 before:block before:rounded-sm before:bg-[lab(19.93_-1.66_-9.7)] [.highlighted-word_+_&]:before:rounded-l-none",
        }),
        highlightClasses({
          highlightedClassName:
            "highlighted-word relative before:absolute before:-inset-x-0.5 before:-inset-y-0.25 before:-z-10 before:block before:rounded-sm before:bg-[lab(19.93_-1.66_-9.7)] [.highlighted-word_+_&]:before:rounded-l-none",
        }),
      ],
    })
    .replaceAll("\n", "");

  return <div className={className} dangerouslySetInnerHTML={{ __html: code }} />;
}

function CodeExampleHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2">{children}</div>;
}

function CodeExampleFilename({ filename }: { filename: string }) {
  return <div className="px-3 pt-0.5 pb-1.5 text-xs/5 text-gray-400 dark:text-white/50">{filename}</div>;
}

function CopyButton({ content }: { content: string }) {
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        alert('Code copié dans le presse-papiers! clipboard');
      }).catch(err => {
        console.error('Erreur lors de la copie du texte : ', err);
      });
    } else {
      // Méthode de secours pour copier le texte
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.classList.add('absolute', 'left-[-9999px]');
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        // textArea.remove();
        alert('Code copié dans le presse-papiers copy!');
      } catch (err) {
        console.error('Erreur lors de la copie du texte : ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button type="button" className="text-slate-500 hover:text-slate-400 cursor-pointer" aria-label="Copy code"
      onClick={handleCopyCode}>
      <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-8 h-8">
        <path d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19"></path>
        <path d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5"></path>
      </svg>
    </button>
  );
}
