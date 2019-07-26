import {IFileMulterGridfsInfo} from "../../filestore/dto/file-multer-gridfs-info";
import {IPostAllDetails} from "./post-all-details";

type OmitForPostPoulated = 'titleImg' | 'attachments';

export interface IPostAllDetailsPopulated extends Omit<IPostAllDetails, OmitForPostPoulated> {
    titleImg?: IFileMulterGridfsInfo | null;
    attachments: IFileMulterGridfsInfo[];
}
