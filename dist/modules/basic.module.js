"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicModule = void 0;
const resource_en_1 = require("../resources/resource.en");
const http_code_1 = require("../consts/http.code");
const response_model_1 = require("../models/response.model");
const congif_const_1 = require("../consts/congif.const");
const resource_ar_1 = require("../resources/resource.ar");
const languages_const_1 = require("../consts/languages.const");
/**Basic Module */
class BasicModule {
    /**
     *
     * @param res Current Express Reponse
     */
    constructor(req, res) {
        this.req = req;
        this.res = res;
        //Fill Current User Data 
        this.fillLoggedUserData();
        //Fill Language
        this.fillCurrentResources();
        //Fill DB Clinet
        this.fillDataBaseClinet();
    }
    /**
     * End This Request With Failed
     * @param mesage
     * @param responseCode
     */
    end_failed(mesage, exp = null) {
        this.res.json(response_model_1.ResponseModel.error(mesage, exp));
    }
    /**
     * End With unAuthorized
     */
    end_unauthorized(message = this.resource.pleaseLogin) {
        this.res.status(http_code_1.HttpCodes.forbidden).json(response_model_1.ResponseModel.error(message));
    }
    /**
     * End With Invalid Access Token
     */
    end_invalidAccessToken() {
        this.res.status(http_code_1.HttpCodes.forbidden).json(response_model_1.ResponseModel.error(this.resource.invalidAccessToken));
    }
    /**
     * End This Request With Successfully
     * @param mesage
     * @param responseCode
     */
    end_successfully(mesage = this.resource.successfully, data = null, responseCode = http_code_1.HttpCodes.ok) {
        this.res.status(responseCode).json(response_model_1.ResponseModel.success(mesage, data)).end();
    }
    /**
      * End This Request With Info
      * @param mesage
      * @param responseCode
      */
    end_info(mesage, noMoreOfResult = null) {
        this.res.status(http_code_1.HttpCodes.ok).json(response_model_1.ResponseModel.info(mesage, noMoreOfResult)).end();
    }
    /**
     * Fill Logged User Data
     */
    fillLoggedUserData() {
        this.loggedUser = this.res.locals[congif_const_1.config.loggedUerInformation];
    }
    /**
     * Fill Current Resources By Current Request Language
     * @param lang
     */
    fillCurrentResources(lang = this.req.headers["accept-language"]) {
        this.languageCode = lang;
        switch (lang) {
            case languages_const_1.LanguagesSupported.english:
                this.resource = new resource_en_1.ResourceEn();
                break;
            case languages_const_1.LanguagesSupported.arabic:
                this.resource = new resource_ar_1.ResourceAr();
                break;
            default:
                this.resource = new resource_en_1.ResourceEn();
                break;
        }
    }
    /**
     * Get Data Base Clinet
     */
    fillDataBaseClinet() {
        this.db = this.res.locals[congif_const_1.config.db].db();
    }
    /**
     * Catch Error Method For Any Promis Catch
     * @param exp
     */
    catchError(exp) {
        this.res.status(http_code_1.HttpCodes.badRequest).json(response_model_1.ResponseModel.error(this.resource.someErrorHasBeen, exp.toString()));
    }
    /**
     * createed For Catch Error From Sing In By Googel
     * @param exp
     * @param bs
     */
    catchError2(exp, bs) {
        console.log('catchError2', exp);
        bs.res.status(http_code_1.HttpCodes.badRequest).json(response_model_1.ResponseModel.error(bs.resource.someErrorHasBeen, exp.toString()));
    }
} //End Class
exports.BasicModule = BasicModule;
//# sourceMappingURL=basic.module.js.map