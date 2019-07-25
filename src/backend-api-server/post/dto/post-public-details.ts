import {IFileMulterGridfsInfo} from "../../filestore/dto/file-multer-gridfs-info";

export interface IPostPublicDetails {
    _id: any;
    url: string;
    createDate: Date;
    updateDate: Date;
    pubDate?: Date | null;
    titleImg?: IFileMulterGridfsInfo | null;
    title: string;
    content: string;
    description: string;
    tags: string[];
}
