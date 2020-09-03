export enum ContactUsTypeEnum {

    /**
     * مشكلة فى تسجيل الدخول
     */
    problemInSignIn = 1,
    /**
     * مشكلة فى انشاء حساب جديد
     */
    problemInSignUp = 2,
    /**
     * مشكلة فى انشاء اختصار جديد
     */
    problemInCreateNewShoretener = 3,

    /**
     * لقد تم العثور على رابط مختصر ينتهك سياسة الاستخدام
     */
    findShortLinkThatViolatesThwUsagePolicy = 4,

    other =5
}