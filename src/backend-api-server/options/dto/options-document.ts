import {Document} from "mongoose";
import {IOptionsRobotsTxt} from "./options-robots-txt";

export interface IOptionsDocument<TValue = IOptionsRobotsTxt> extends Document {
    key: string;
    value: TValue;
}
