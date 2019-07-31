import {IOptionsService} from "../api/options-service";
import {inject, injectable} from "inversify";
import {Model} from "mongoose";
import {IOptionsDocument} from "../dto/options-document";
import {TYPES} from "../../ioc/types";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IOptionsRobotsTxt} from "../dto/options-robots-txt";
import {IOptionsShowdown} from "../dto/options-showdown";
import {ShowdownOptions} from 'showdown';
import {IMarkdownConverter} from "../../utils/api/markdown-converter";
import {container} from "../../ioc/container";

@injectable()
export class OptionsService implements IOptionsService {

    @inject(TYPES.ModelOptions)
    private OptionsModel: Model<IOptionsDocument>;

    private optionKeys = {
        'ROBOTS.TXT': 'ROBOTS.TXT',
        'showdownOptions': 'showdownOptions'
    };

    private isRobotsTxtOptions(options: IOptionsDocument): options is IOptionsDocument<IOptionsRobotsTxt> {
        return options.key === this.optionKeys["ROBOTS.TXT"];
    }

    private isShowdownOptions(options: IOptionsDocument): options is IOptionsDocument<IOptionsShowdown> {
        return options.key === this.optionKeys.showdownOptions;
    }

    async createOrUpdateRobotsTxt(robotsTxtRequest: IOptionsRobotsTxt, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([{role: ['admin']}]);

        await this.OptionsModel.updateOne({
            key: this.optionKeys["ROBOTS.TXT"],
        }, {
            value: {
                content: robotsTxtRequest.content,
                allowRobots: robotsTxtRequest.allowRobots,
            }
        }, {
            upsert: true,
            multi: false,
        }).exec();

        return true;
    }

    async getRobotsTxt(options: IWithUserContext): Promise<IOptionsRobotsTxt> {
        options.user.assertAuth([{role: ['admin']}]);

        const found = await this.OptionsModel.findOne({
            key: this.optionKeys["ROBOTS.TXT"]
        }).exec();

        if(!found) {
            return {
                allowRobots: false,
                content: '',
            };
        }

        if(!this.isRobotsTxtOptions(found)) {
            throw 'Options type mismatch';
        }

        return {
          allowRobots: found.value.allowRobots,
          content: found.value.content,
        };
    }

    async getRobotsTxtContent(): Promise<string | null> {
        const optionsDocument = await this.OptionsModel.findOne({
            key: this.optionKeys["ROBOTS.TXT"]
        }).exec();

        if(optionsDocument && this.isRobotsTxtOptions(optionsDocument) && optionsDocument.value.allowRobots) {
            return optionsDocument.value.content;
        }

        return null;
    }

    async getShowdownOptions(): Promise<ShowdownOptions> {
        // open for all
        const optionsDocument = await this.OptionsModel.findOne({
            key: this.optionKeys.showdownOptions
        }).exec();

        if(optionsDocument && this.isShowdownOptions(optionsDocument)) {
            return optionsDocument.value.options;
        }

        return {};
    }

    async updateShowdownOptions(showdownOptionsRequest: ShowdownOptions, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([{role: ['admin']}]);

        await this.OptionsModel.updateOne({
            key: this.optionKeys.showdownOptions,
        }, {
            value: {
                options: showdownOptionsRequest
            }
        }, {
            upsert: true,
            multi: false,
        }).exec();

        // We have to reset converter to apply new options
        const markdownConverter: IMarkdownConverter = container.get<IMarkdownConverter>(TYPES.MarkdownConverter);
        markdownConverter.reset();

        return true;
    }

}
