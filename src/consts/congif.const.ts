export const config={
    port:process.env?.port||2524,
    db:"dataaBase",
    loggedUerInformation:"loggedUerInformation",
    loggedUerAccessToken:"loggedUerAccessToken",
    mongoDataBaseUrl:"mongodb://127.0.0.1:27017/posty5",
    apiFullPath:"http://www.localhost:"+(process.env?.port||2524),
    websiteUrl:"http://localhost:4200",
    googelOAuth2ClientClinetId:"610924539803-jp51binjkoh9qlja2k2l6or1t2i83t86.apps.googleusercontent.com",
    googelOAuth2ClientSecretId:"2Gr5j5E9N63Dto4bf-ZnDR_d",
};

//Freeze
Object.freeze(config);