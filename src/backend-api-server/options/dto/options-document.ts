import {Document} from "mongoose";
import {IOptionsRobotsTxt} from "./options-robots-txt";
import {IOptionsShowdown} from "./options-showdown";

export interface IOptionsDocument<TValue = IOptionsRobotsTxt | IOptionsShowdown> extends Document {
    key: string;
    value: TValue;
}
