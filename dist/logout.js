"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const login_1 = require("./login");
const LOGOUT_CHECK_URL = '/lawnet/group/lawnet/legal-research/basic-search?p_p_id=portalmenu_WAR_lawnet3portalportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=2&_portalmenu_WAR_lawnet3portalportlet_cmd=beforeLogoutCheck';
const LOGOUT_POST = new URLSearchParams('_portalmenu_WAR_lawnet3portalportlet_cmd=beforeLogoutCheck');
const LOGOUT_CHECK_SCRIPT = '{"isTimerStart":';
const LOGOUT_URL = '/lawnet/c/portal/logout?referer=/lawnet/web/lawnet/home';
function logout(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = login_1.FIRST_URL[args.school] + LOGOUT_CHECK_URL, method = 'POST', params = LOGOUT_POST;
        //assume that you are logged in to force a logout
        let loggedIn = true;
        while (loggedIn) {
            try {
                if (!url.startsWith(args.corsPrefix))
                    url = args.corsPrefix + url;
                let response = yield args.localAxios.request({
                    url,
                    method,
                    params,
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    responseType: 'text',
                    transformResponse: void (0)
                });
                if (response.data.toLowerCase().includes('<meta http-equiv="refresh"')) {
                    let urlbegin = response.data.indexOf('URL=') + 4;
                    let urlend = response.data.indexOf('"', urlbegin);
                    url = response.data.substring(urlbegin, urlend);
                    args.localAxios.defaults.baseURL = url.substring(0, url.indexOf('/', url.indexOf('://') + 3));
                    method = 'get';
                }
                else if (response.data.includes(LOGOUT_CHECK_SCRIPT)) {
                    url = args.localAxios.defaults.baseURL + LOGOUT_URL;
                    method = 'get';
                }
                else if (response.data.includes(login_1.LOGOUT_REDIRECT_SCRIPT)) {
                    url = args.localAxios.defaults.baseURL = args.corsPrefix + login_1.FIRST_URL[args.school] + '/lawnet/web/lawnet/home';
                    method = 'get';
                }
                else if (response.data.includes(login_1.LOGOUT_REDIRECT_SCRIPT_2)) {
                    url = args.corsPrefix + login_1.FIRST_URL[args.school] + '/lawnet/c';
                    method = 'get';
                }
                else {
                    loggedIn = false;
                }
            }
            catch (error) {
                //break infinite loop
                if (url.includes(LOGOUT_CHECK_URL))
                    url = args.corsPrefix + login_1.FIRST_URL[args.school] + LOGOUT_URL;
                else
                    loggedIn = false; //give up
            }
        }
    });
}
exports.logout = logout;
;
exports.default = logout;
