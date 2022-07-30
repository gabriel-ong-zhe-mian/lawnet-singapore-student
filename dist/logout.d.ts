import { AxiosInstance } from 'axios';
export declare function logout(args: {
    school: 'SMU' | 'NUS' | 'SUSS';
    localAxios: AxiosInstance;
}): Promise<void>;
export default logout;
