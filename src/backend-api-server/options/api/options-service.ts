import {IOptionsRobotsTxt} from "../dto/options-robots-txt";
import {IWithUserContext} from "../../auth/dto/with-user-context";
import {ShowdownOptions} from "showdown";
import {IOptionsSitemap} from "../dto/options-sitemap";

export interface IOptionsService {
    getRobotsTxt(options: IWithUserContext): Promise<IOptionsRobotsTxt>;
    getRobotsTxtContent(): Promise<string | null>;
    createOrUpdateRobotsTxt(rorbotsTxtRequest: IOptionsRobotsTxt, options: IWithUserContext): Promise<boolean>;
    getShowdownOptions(): Promise<ShowdownOptions>;
    updateShowdownOptions(showdownOptionsRequest: ShowdownOptions, options: IWithUserContext): Promise<boolean>;
}
