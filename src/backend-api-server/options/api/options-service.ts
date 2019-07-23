import {IOptionsRobotsTxt} from "../dto/options-robots-txt";
import {IWithUserContext} from "../../auth/dto/with-user-context";

export interface IOptionsService {
    getRobotsTxt(options: IWithUserContext): Promise<IOptionsRobotsTxt>;
    getRobotsTxtContent(): Promise<string | null>;
    createOrUpdateRobotsTxt(rorbotsTxtRequest: IOptionsRobotsTxt, options: IWithUserContext): Promise<boolean>
}
