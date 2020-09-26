import { ObjectId } from "mongodb";

export class ActionModel {
    actionDate: Date;
    targetId: string | ObjectId;
}