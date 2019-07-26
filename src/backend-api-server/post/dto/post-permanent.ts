import {IPostAllDetails} from "./post-all-details";

type OmitForPostPermanent = 'author' | 'url';

// for export-import
export type IPostPermanent = Omit<IPostAllDetails, OmitForPostPermanent>;
