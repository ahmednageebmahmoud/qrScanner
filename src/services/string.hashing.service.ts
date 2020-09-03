import * as passHash from "password-hash";
export class StringHashingService {

    /**Hash Password */
    static hash(password: string): string {
        return passHash.generate(password);
    }

    /** Verify */
    static verify(password: string, hasehedPassword: string): boolean {
        return passHash.verify(password, hasehedPassword);
    }
}