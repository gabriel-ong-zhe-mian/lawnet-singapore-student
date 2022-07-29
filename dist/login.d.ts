import { AxiosInstance } from 'axios';
export declare let corsPrefix: string;
export declare const FIRST_URL: {
    SMU: string;
    NUS: string;
};
export declare function login(params: {
    school: 'SMU' | 'NUS' | 'SUSS';
    username: string;
    password: string;
    domain?: string;
    localAxios?: AxiosInstance;
}): Promise<AxiosInstance>;
export default login;
