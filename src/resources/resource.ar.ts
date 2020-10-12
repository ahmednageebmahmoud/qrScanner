import { IResource } from "./i.resource";

export class ResourceAr implements IResource {

    userName: string = "اسم المستخدم";
    email: string = "البريد الآلكترونى";
    password: string = "كلمة المرور";
    successfully: string = "تمت العملية بنجاح";
    failed: string = "فشلت اتمام العملية";
    invalidAccessToken: string = "انتهت جلسة الدخول ... الرجاء تسجيل الدخول مرة آخرى";
    pleaseEnterUserNameAndEmailAndPassword: string = "من فضلك قم بادخال اسم المستخدم والاميل وكلمة المرور";
    emailBeforeUsed: string = "البريد الآلكترونى مستخدم من قبل";
    userNameBeforeUsed: string = "اسم المستخدم مستخدم من قبل";
    someErrorHasBeen: string = "لقد حدث خطاء ما";
    iCanNotRegisterNewAccount: string = "لم استطيع انشاء حساب جديد";
    iCreatedYourAccountButICouldNotSignYouIn: string = "قمت بانشاء حسابك ولاكن لم استطع تسجيل دخولك";
    accountCreatedSuccessfully: string = "تم انشاء الحساب بنجاح";
    invalidUserNameOrPassword: string = "اسم المستخدم أو كلمة المرور غير الصالحة";
    iCouldNotSignYouIn: string = "لم أتمكن من تسجيل الدخول لك";
    signInSuccessfully: string = "تم تسجيل الدخول بنجاح";
    pleaseEnterAllRequiredData: string = "من فضلك ادخل كل البيانات المطلوبة";
    iCouldNotCreateNewPost: string = "لم اتمكن من انشاء رابط مختصر جديد";
    postCreatedSuccessfully: string = "تم اشناء الرابط المختصر بـ نجاح";
    iNotFoundAnyPost: string = "لم يتم العثور على روابط مختصرة ";
    noMorePosts: string = "لا مزيد من الروباط المختصرة";
    idIsNotFound: string = "لم يتم ارسال المعرف الى السيرفر";
    postIsNotFound: string = "لم يتم العثور على الرابط المختصر";
    thereAreNoNewModifications: string = "لا يوجد هناك تعديلات جديدة";
    noBodyToNow: string = "لا احد حتى الآن";
    unFavoriteSuccessfully: string = "تم الالغاء من المفضلة بنجاح";
    favoriteSuccessfully: string = "تمت الاضافة الى المفضلة بنجاح";
    unLoveSuccessfully: string = "تم الغاء الاعجاب بنجاح";
    loveSuccessfully: string = "تم الاعجاب بنجاح";
    iCouldNotSaveNewPicture: string = "لم اتمكن من حفظ الصورة الجديدة";
    updated: string = "تم التحديث";
    accountIsNotFound: string = "لم يتم العثور على الحساب";
    pleaseLogin: string = "من فضلك سجل الدخول";
    contactUsSuccessfully: string = "تم استلام رسالتك بنجاح وسوف يتم الرد عليكم فى اقرب وقت";
    updatedPostsCount: string = "تم تحديث num منشور بنجاح";
    iCouldNotSavePostImage = "لم استطيع حفظ صورة الموضوع";


    justNow = "الآت";
    ago = "منذ";
    oneYear = "عام واحد";
    towYears = "عامين";
    years = "اعوام";
    oneMonth = "شهر واحد";
    towMonths = "شهرين";
    months = "اشهر";
    oneDay = "يوم";
    towDays = "يومان";
    days = "ايام";
    oneHour = "ساعة واحدة";
    towHours = "ساعتان";
    hours = "ساعات";
    oneMinute = "دقيقة";
    towMinutes = "دقيقتين";
    minutes = "دقائق";
    oneSecound = "ثانية";
    towSecounds = "ثانيتين";
    secounds = "ثوانى";

    videoIsNotFound = "لم يتم العثور على الفديو";

    videosAreNotFound = "لم يتم العثور على مقاطع الفديو";
    codeSentSuccessfully = "تم ارسال بنجاح";
    iCanNotSendCodeToYoureEmail = "لم اتمكن من ارسال الكود الى الاميل الخاص بك";

    codeIsInvalid="الكود غير صالح";
    codeIsValid="كود صالح";
    removedVideoFromFavoriteList="تمت إزالة الفديو من قائمة المفضلة";
    removedVideoFromNotLoveList="تمت إزالة الفديو من قائمة الغير محبوبة";
    removedVideoFromLoveList="لقد تمت إزالة الفديو من قائمة المحبوبة";
    noMoreVideos="لم يتم العثور على مزيد من مقاطع الفديو";



    removedPostFromLoveList="تمت إزالة الموضوع من قائمة المفضلة";
    removedPostFromNotLoveList="تمت إزالة الموضوع من قائمة الغير محبوبة";
    removedPostFromFavoriteList="لقد تمت إزالة الموضوع من قائمة المحبوبة";


    noVideosFound='لم يتم العثور على الفديوهات';
    noPostsFound='لم يتم العثور على مواضيع';

    iCantDeleteThePost='لم اتمكن من حذف هذا الموضوع';
    deleted='تم الحذف';
    postUpdatedSuccessfully='تم التحديث الموضوع بنجاح';


    userInformationIsNotDefiend='لم يتم العثور على بيانات المستخدم';
    userAccountIsNotFound='لم  يتم العثور على المستخدم';
    currentPasswordIsNotCorrect='كلمة السر الحالية ليست صحيحة';






}
