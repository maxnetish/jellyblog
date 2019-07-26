import {IPostAllDetailsPopulated} from "./post-all-details-populated";

type OmitForPostPublicDetails = 'status' | 'allowRead' | 'author' | 'contentType' | 'brief' | 'attachments' | 'hru';
export type IPostPublicDetails = Omit<IPostAllDetailsPopulated, OmitForPostPublicDetails>;
