export interface IMarkdownConverter {
    markdown2Html(markdown: string): Promise<string>;
    reset(): void;
}
