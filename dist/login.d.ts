import { AxiosInstance } from 'axios';
export declare const FIRST_URL: {
    SMU: string;
    NUS: string;
};
export declare const LOGOUT_REDIRECT_SCRIPT = "<script type=\"text/javascript\">location.href=\"\\x2flawnet\\x2fweb\\x2flawnet\\x2fhome\";</script>";
export declare const LOGOUT_REDIRECT_SCRIPT_2 = "<script type=\"text/javascript\">location.href=\"\\x2flawnet\\x2fc\";</script>";
export declare const LOGOUT_REDIRECT_URL = "/lawnet/web/lawnet/home";
export declare const LOGOUT_REDIRECT_URL_2 = "/lawnet/c";
export declare function login(params: {
    school: 'SMU' | 'NUS' | 'SUSS';
    username: string;
    password: string;
    corsPrefix?: string;
    domain?: string;
    localAxios?: AxiosInstance;
}): Promise<AxiosInstance>;
export default login;
