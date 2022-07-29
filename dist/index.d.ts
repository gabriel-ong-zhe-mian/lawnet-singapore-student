import { corsPrefix, FIRST_URL, login } from './login';
import { logout } from './logout';
export { corsPrefix, FIRST_URL, login, logout };
declare const _default: {
    corsPrefix: string;
    FIRST_URL: {
        SMU: string;
        NUS: string;
    };
    login: typeof login;
    logout: typeof logout;
};
export default _default;
