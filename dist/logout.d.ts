import { AxiosInstance } from 'axios';
export declare function logout(params: {
    school: 'SMU' | 'NUS' | 'SUSS';
    localAxios: AxiosInstance;
}): Promise<void>;
export default logout;
