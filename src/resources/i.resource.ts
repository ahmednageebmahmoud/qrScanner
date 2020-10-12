import { SrvRecord } from "dns";
import { ServerResponse } from "http";

export interface IResource {
    userName: string;
    email: string;
    password: string;
    successfully: string;
    failed: string;
    invalidAccessToken: string;
    pleaseEnterUserNameAndEmailAndPassword: string;
    emailBeforeUsed: string;
    userNameBeforeUsed: string;
    someErrorHasBeen: string;
    iCanNotRegisterNewAccount: string;
    iCreatedYourAccountButICouldNotSignYouIn: string;
    accountCreatedSuccessfully: string;
    invalidUserNameOrPassword: string;
    iCouldNotSignYouIn: string;
    signInSuccessfully: string;
    pleaseEnterAllRequiredData: string;
    iCouldNotCreateNewPost: string;
    postCreatedSuccessfully: string;
    iNotFoundAnyPost: string;
    noMorePosts: string;
    idIsNotFound: string;
    postIsNotFound: string;
    thereAreNoNewModifications: string;
    noBodyToNow: string;
    unFavoriteSuccessfully: string;
    favoriteSuccessfully: string;
    unLoveSuccessfully: string;
    loveSuccessfully: string;
    iCouldNotSaveNewPicture: string;
    updated:string;
    accountIsNotFound:string;
    pleaseLogin:string;
    contactUsSuccessfully:string;
    updatedPostsCount:string;
    iCouldNotSavePostImage:string;


    justNow:string;
    ago:string;
    oneYear:string;
    towYears:string;
    years:string;
    oneMonth:string;
    towMonths:string;
    months:string;
    oneDay:string;
    towDays:string;
    days:string;
    oneHour:string;
    towHours:string;
    hours:string;
    oneMinute:string;
    towMinutes:string;
    minutes:string;
    oneSecound:string;
    towSecounds:string;
    secounds:string;
    videoIsNotFound:string;
    videosAreNotFound:string;
    codeSentSuccessfully:string;
    iCanNotSendCodeToYoureEmail:string;

    codeIsInvalid:string;
    codeIsValid:string;
    removedVideoFromFavoriteList:string;
    removedVideoFromNotLoveList:string;
    removedVideoFromLoveList:string;
    noMoreVideos:string;


    removedPostFromLoveList:string;
    removedPostFromNotLoveList:string;
    removedPostFromFavoriteList:string;

    noVideosFound:string;
    noPostsFound:string;

    iCantDeleteThePost:string;
    deleted:string;
    postUpdatedSuccessfully:string;
    userInformationIsNotDefiend:string;
    userAccountIsNotFound:string;
    currentPasswordIsNotCorrect:string;

}