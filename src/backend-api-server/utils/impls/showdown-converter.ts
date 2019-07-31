import {IMarkdownConverter} from "../api/markdown-converter";
import {inject, injectable} from "inversify";
import {Converter} from "showdown";
import {TYPES} from "../../ioc/types";
import {IOptionsService} from "../../options/api/options-service";

@injectable()
export class ShowdownConverter implements IMarkdownConverter {

    @inject(TYPES.OptionsService)
    private optionsService: IOptionsService;
    private _memoizedConverter: Promise<Converter> | null = null;


    private async getConverter(): Promise<Converter> {
        if(!this._memoizedConverter) {
            this._memoizedConverter = this.optionsService.getShowdownOptions()
                .then(options => new Converter(options));
        }
        return this._memoizedConverter;
    }

    async markdown2Html(markdown: string): Promise<string> {
        const converter = await this.getConverter();
        return converter.makeHtml(markdown);
    }

    reset(): void {
        this._memoizedConverter = null;
    }
}
