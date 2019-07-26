import {IPostAllDetails} from "./post-all-details";

type OmitPropsToCreatePost = '_id' | 'createDate' | 'pubDate' | 'updateDate' | 'author' | 'url';
export type IPostCreateRequest = Omit<IPostAllDetails, OmitPropsToCreatePost>
