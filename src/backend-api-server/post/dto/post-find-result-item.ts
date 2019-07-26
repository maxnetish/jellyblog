import {IPostAllDetails} from "./post-all-details";

type OmitPropsForResultItem =
    'allowRead'
    | 'author'
    | 'contentType'
    | 'content'
    | 'tags'
    | 'attachments'
    | 'hru'
    | 'url';
export type IPostFindResultItem = Omit<IPostAllDetails, OmitPropsForResultItem>;
