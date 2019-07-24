import {Document} from "mongoose";
import {IPostAllDetails} from "./post-all-details";

export interface IPostAllDetailsDocument extends Document, IPostAllDetails {
}
