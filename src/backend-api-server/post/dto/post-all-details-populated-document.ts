import {Document} from "mongoose";
import {IPostAllDetailsPopulated} from "./post-all-details-populated";

export interface IPostAllDetailsPopulatedDocument extends Document, IPostAllDetailsPopulated {
}
