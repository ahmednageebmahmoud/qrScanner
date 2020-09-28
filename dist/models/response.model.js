"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseModel = void 0;
const response_type_enum_1 = require("../enums/response.type.enum");
class ResponseModel {
    constructor(responseType, message, isSuccess, result = null, exeption = null, noMoreOfResult = null) {
        this.responseType = responseType;
        this.message = message;
        this.isSuccess = isSuccess;
        this.result = result;
        this.exeption = exeption;
        this.noMoreOfResult = noMoreOfResult;
    }
    static success(message, data = {}) {
        return new ResponseModel(response_type_enum_1.ResponseTypeEnum.success, message, true, data);
    }
    static error(message, exp = null) {
        return new ResponseModel(response_type_enum_1.ResponseTypeEnum.error, message, false, null, exp);
    }
    static info(message, noMoreOfResult = null) {
        return new ResponseModel(response_type_enum_1.ResponseTypeEnum.info, message, false, null, null, noMoreOfResult);
    }
    static unauthorized(message) {
        return new ResponseModel(response_type_enum_1.ResponseTypeEnum.unauthorized, message, false);
    }
    static invalidAccessToken(message) {
        return new ResponseModel(response_type_enum_1.ResponseTypeEnum.invalidAccessToken, message, false);
    }
}
exports.ResponseModel = ResponseModel;
//# sourceMappingURL=response.model.js.map