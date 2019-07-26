import {IPostAllDetailsPopulated} from "./post-all-details-populated";

type OmitForPostPublicBrief =
    'status'
    | 'allowRead'
    | 'author'
    | 'contentType'
    | 'brief'
    | 'content'
    | 'attachments'
    | 'hru';

export interface IPostPublicBrief extends Omit<IPostAllDetailsPopulated, OmitForPostPublicBrief> {
    preview: string;
    useCut?: boolean | null;
}
