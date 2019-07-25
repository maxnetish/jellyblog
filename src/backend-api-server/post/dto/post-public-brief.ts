import {IFileMulterGridfsInfo} from "../../filestore/dto/file-multer-gridfs-info";

export interface IPostPublicBrief {
    _id: any;
    url: string;
    createDate: Date;
    updateDate: Date;
    pubDate?: Date | null;
    titleImg?: IFileMulterGridfsInfo | null;
    title: string;
    preview: string;
    useCut?: boolean | null;
    tags: string[];
}
