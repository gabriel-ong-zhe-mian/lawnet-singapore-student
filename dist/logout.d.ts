import { AxiosInstance } from 'axios';
export declare function logout(args: {
    school: 'SMU' | 'NUS' | 'SUSS';
    corsPrefix?: string;
    localAxios: AxiosInstance;
}): Promise<void>;
export default logout;
