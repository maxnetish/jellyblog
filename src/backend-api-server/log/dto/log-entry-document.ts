import {ILogEntry} from "./log-entry";
import {Document} from "mongoose";

export interface ILogEntryDocument extends Document, ILogEntry {}
