import {IOptionsService} from "../api/options-service";
import {inject, injectable} from "inversify";
import {Model} from "mongoose";
import {IOptionsDocument} from "../dto/options-document";
import {TYPES} from "../../ioc/types";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {IOptionsRobotsTxt} from "../dto/options-robots-txt";

@injectable()
export class OptionsService implements IOptionsService {

    @inject(TYPES.ModelOptions)
    private OptionsModel: Model<IOptionsDocument>;

    async createOrUpdateRobotsTxt(robotsTxtRequest: IOptionsRobotsTxt, options: IWithUserContext): Promise<boolean> {
        options.user.assertAuth([{role: ['admin']}]);

        await this.OptionsModel.updateOne({
            key: 'ROBOTS.TXT'
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

        const optionsDocument = await this.OptionsModel.findOne({
            key: 'ROBOTS.TXT'
        }).exec();

        return {
          allowRobots: optionsDocument ? optionsDocument.value.allowRobots : false,
          content:   optionsDocument ? optionsDocument.value.content : '',
        };
    }

    async getRobotsTxtContent(): Promise<string | null> {
        const optionsDocument = await this.OptionsModel.findOne({
            key: 'ROBOTS.TXT'
        }).exec();

        if(optionsDocument && optionsDocument.value.allowRobots) {
            return optionsDocument.value.content;
        }

        return null;
    }

}
