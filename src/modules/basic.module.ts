import { Request, Response } from "express";
import { IResource } from "../resources/i.resource";
import { UserModel } from "../models/user.model";
import { ResourceEn } from "../resources/resource.en";

import { HttpCodes } from "../consts/http.code";
import { ResponseModel } from "../models/response.model";
import { isRegExp } from "util";
import { config } from "../consts/congif.const";
import { MongoClient, Db } from "mongodb";
import { LoggedUserInformation } from "../models/logged.user.information";
import { ResourceAr } from "../resources/resource.ar";
import { LanguagesSupported } from "../consts/languages.const";

/**Basic Module */
export class BasicModule {
    resource: IResource;
    loggedUser: LoggedUserInformation;
    languageCode:string;

    db: Db;
    /**
     * 
     * @param res Current Express Reponse
     */
    constructor(public req: Request, public res: Response) {

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
    end_failed(mesage: string, exp: any = null): void {
        this.res.json(ResponseModel.error(mesage, exp));
    }

    /**
     * End With unAuthorized
     */
    end_unauthorized(message: string = this.resource.pleaseLogin): void {
        this.res.status(HttpCodes.forbidden).json(ResponseModel.error(message));
    }


    /**
     * End With Invalid Access Token
     */
    end_invalidAccessToken(): void {
        this.res.status(HttpCodes.forbidden).json(ResponseModel.error(this.resource.invalidAccessToken));
    }

    /**
     * End This Request With Successfully 
     * @param mesage 
     * @param responseCode 
     */
    end_successfully(mesage: string = this.resource.successfully, data: any = null, responseCode: number = HttpCodes.ok): void {
        this.res.status(responseCode).json(ResponseModel.success(mesage, data)).end();
    }

    /**
      * End This Request With Info 
      * @param mesage 
      * @param responseCode 
      */
    end_info(mesage: string,noMoreOfResult:boolean=null): void {
        this.res.status(HttpCodes.ok).json(ResponseModel.info(mesage,noMoreOfResult)).end();
    }

    /**
     * Fill Logged User Data
     */    
    fillLoggedUserData(): void {
        this.loggedUser = this.res.locals[config.loggedUerInformation];
    }


    /**
     * Fill Current Resources By Current Request Language
     * @param lang 
     */
    fillCurrentResources(lang: string = this.req.headers["accept-language"]): void {
        this.languageCode=lang;
        switch (lang) {
            case LanguagesSupported.english: this.resource = new ResourceEn(); break;
            case LanguagesSupported.arabic: this.resource = new ResourceAr(); break;
            default: this.resource = new ResourceEn(); break;
        }
    }

    /**
     * Get Data Base Clinet
     */
    fillDataBaseClinet(): void {
        this.db = (<MongoClient>this.res.locals[config.db]).db();
    }


    /**
     * Catch Error Method For Any Promis Catch
     * @param exp 
     */
    catchError(exp: any) {
        this.res.status(HttpCodes.badRequest).json(ResponseModel.error(this.resource.someErrorHasBeen, exp.toString()));
    }

    /**
     * createed For Catch Error From Sing In By Googel
     * @param exp 
     * @param bs 
     */
    catchError2(exp: any, bs: BasicModule) {
        console.log('catchError2',exp);
        
        bs.res.status(HttpCodes.badRequest).json(ResponseModel.error(bs.resource.someErrorHasBeen, exp.toString()));
    }
}//End Class