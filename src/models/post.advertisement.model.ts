import { AdvertisingNetworkTypeEnum } from "../enums/advertisement.type.enum";

export class PostAdvertisemetnModel {
    /** Advertising Network Type */
    advertiseingNetworkType: AdvertisingNetworkTypeEnum;

    //Adsebse Setting
    /** User Adsense Account Publisher Id  */
    adsense_pub: string;

    /**Adsense Unit Solt Ids :  ممكن يدخل اكثر من معرف اذا اختار وحدتين اعلانيتين */
    adsense_slot: string[];


    /**
     * 
     *              فيما بعد سوف يتم اضافة جميع الاعدادات لجميع الشبكات الاعلانية التى سوف تعتمد فيما بعد
     * 
     * 
     */

}