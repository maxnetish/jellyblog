import {IMarkdownConverter} from "../api/markdown-converter";
import {injectable} from "inversify";
import {Converter} from "showdown";

@injectable()
export class ShowdownConverter implements IMarkdownConverter {

    // TODO add Showdown options
    private showdownConverter = new Converter();

    markdown2Html(markdown: string): string {
        return this.showdownConverter.makeHtml(markdown);
    }
}
