import { ResponseTypeEnum } from "../enums/response.type.enum";

export class ResponseModel {
    static success(message: string, data: any = {}): ResponseModel {
        return new ResponseModel(ResponseTypeEnum.success, message, true, data);
    }
    static error(message: string, exp: any = null): ResponseModel {
        return new ResponseModel(ResponseTypeEnum.error, message, false, null, exp);
    }

    static info(message: string, noMoreOfResult: boolean = null): ResponseModel {
        return new ResponseModel(ResponseTypeEnum.info, message, false, null,null,noMoreOfResult);
    }

    static unauthorized(message: string): ResponseModel {
        return new ResponseModel(ResponseTypeEnum.unauthorized, message, false)
    }

    static invalidAccessToken(message: string): ResponseModel {
        return new ResponseModel(ResponseTypeEnum.invalidAccessToken, message, false)
    }


    constructor(public responseType: number, public message: string,
        public isSuccess: boolean, public result: any = null, public exeption: any = null,public noMoreOfResult:boolean=null) {

    }

}