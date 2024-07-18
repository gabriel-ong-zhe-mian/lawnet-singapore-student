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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.LOGOUT_REDIRECT_URL_2 = exports.LOGOUT_REDIRECT_URL = exports.LOGOUT_REDIRECT_SCRIPT_2 = exports.LOGOUT_REDIRECT_SCRIPT = exports.FIRST_URL = void 0;
const axios_1 = __importDefault(require("axios"));
exports.FIRST_URL = {
    SMU: 'https://www-lawnet-sg.libproxy.smu.edu.sg',
    NUS: 'https://www-lawnet-sg.libproxy1.nus.edu.sg'
};
const SMU_LIBPROXY_URL = 'http://libproxy.smu.edu.sg/login?url=https://www.lawnet.sg/lawnet/web/lawnet/ip-access';
const SMU_ADFS_LOGIN_PAGE = 'https://login2.smu.edu.sg/adfs/ls/';
const SMU_ADFS_LOGIN_PAGE_ROOT = 'https://login2.smu.edu.sg';
const SMU_SHIBBOLETH_SSO_URL = 'https://login.libproxy.smu.edu.sg:443/Shibboleth.sso/SAML2/POST';
const SMU_INCORRECT_USER_ID_OR_PASSWORD = 'Incorrect user ID or password. Type the correct user ID and password, and try again.';
const SMU_RESET_PASSWORD_URL = 'https://smu.sg/password';
const NUS_LOGIN_URL = 'https://libproxy1.nus.edu.sg/login';
const NUS_LAWNET_URL = 'https://www.lawnet.sg/lawnet/ip-access';
const NUS_VAFS_LOGIN_PAGE = 'https://vafs.nus.edu.sg/adfs/ls/';
const NUS_VAFS_ALTERNATE_LOGIN_PAGE = 'https://vafs.u.nus.edu/adfs/ls/';
const NUS_VAFS_PREFIX = 'https://vafs.nus.edu.sg';
const NUS_VAFS_ALTERNATE_PREFIX = 'https://vafs.u.nus.edu';
const NUS_LAWPROXY_URL = 'https://www-lawnet-sg.libproxy1.nus.edu.sg/lawnet/group/lawnet/legal-research/basic-search';
const NUS_IP_ACCESS_URL = 'http://www.lawnet.sg/lawnet/ip-access';
const NUS_LOGIN_FORM_URL = 'https://proxylogin.nus.edu.sg/libproxy1/public/login_form.asp';
const NUS_INCORRECT_USER_ID_OR_PASSWORD = 'We are unable to authenticate the Userid and password that was entered. The Domain, NUSNET ID or the password entered could be invalid / mistyped.';
const NUS_HELPDESK_URL = 'http://www.nus.edu.sg/comcen/gethelp';
const DUPLICATE_LOGIN = '<div>Multiple logins with the same User ID are not allowed.</div> <div>To terminate the earlier session, please click on the Remove Button.</div> <div><br><br></div> <div>Sharing of User ID is prohibited. Legal action will be taken if access is unauthorised.</div>';
const DUPLICATE_LOGIN_REMOVE_URL = '/lawnet/group/lawnet/duplicate-login?p_p_id=lawnetuniquelogin_WAR_lawnet3portalportlet&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&p_p_col_id=column-2&p_p_col_count=1&_lawnetuniquelogin_WAR_lawnet3portalportlet_loginType=old&_lawnetuniquelogin_WAR_lawnet3portalportlet_javax.portlet.action=removeOldLogin';
exports.LOGOUT_REDIRECT_SCRIPT = '<script type="text/javascript">location.href="\\x2flawnet\\x2fweb\\x2flawnet\\x2fhome";</script>';
exports.LOGOUT_REDIRECT_SCRIPT_2 = '<script type="text/javascript">location.href="\\x2flawnet\\x2fc";</script>';
exports.LOGOUT_REDIRECT_URL = '/lawnet/web/lawnet/home';
exports.LOGOUT_REDIRECT_URL_2 = '/lawnet/c';
function followRedirects(response, localAxios, corsPrefix) {
    return __awaiter(this, void 0, void 0, function* () {
        while (response.status >= 300 && response.status < 400) {
            let locationCaseSensitive = '';
            for (let i in response.headers) {
                if (i.toLowerCase() === 'location')
                    locationCaseSensitive = i;
            }
            if (!locationCaseSensitive)
                throw new Error('Redirect without location header');
            let location = response.headers[locationCaseSensitive];
            if (corsPrefix && !location.startsWith(corsPrefix))
                location = corsPrefix + location;
            response = yield localAxios.get(location, { responseType: 'document' });
        }
        return response;
    });
}
function loginSMU(username, password, corsPrefix, domain, localAxios) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
    return __awaiter(this, void 0, void 0, function* () {
        let libproxyPage = yield followRedirects(yield localAxios.get(corsPrefix + SMU_LIBPROXY_URL, { responseType: 'document' }), localAxios, corsPrefix);
        let libproxyAction = (_b = (_a = libproxyPage === null || libproxyPage === void 0 ? void 0 : libproxyPage.data) === null || _a === void 0 ? void 0 : _a.querySelector('form[name="EZproxyForm"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('action');
        if (!libproxyAction)
            throw new Error('No EZproxyForm on SMU login page');
        let samlRequest = (_d = (_c = libproxyPage === null || libproxyPage === void 0 ? void 0 : libproxyPage.data) === null || _c === void 0 ? void 0 : _c.querySelector('input[name="SAMLRequest"]')) === null || _d === void 0 ? void 0 : _d.getAttribute('value');
        if (!samlRequest)
            throw new Error('No SAMLRequest on SMU login page');
        let relayState = (_f = (_e = libproxyPage === null || libproxyPage === void 0 ? void 0 : libproxyPage.data) === null || _e === void 0 ? void 0 : _e.querySelector('input[name="RelayState"]')) === null || _f === void 0 ? void 0 : _f.getAttribute('value');
        if (!relayState)
            throw new Error('No RelayState on SMU login page');
        // if(!samlRequest||!relayState)return localAxios; //already authenticated
        let params = new URLSearchParams();
        params.append('SAMLRequest', samlRequest);
        params.append('RelayState', relayState);
        //params.append('back','2');
        let microsoftLoginPage = yield followRedirects(yield localAxios.post(corsPrefix + libproxyAction, params, { responseType: 'document' }), localAxios, corsPrefix);
        let hiddenformRedirectSMU;
        if (!((_g = microsoftLoginPage === null || microsoftLoginPage === void 0 ? void 0 : microsoftLoginPage.data) === null || _g === void 0 ? void 0 : _g.querySelector('form[name="hiddenform"][action]'))) {
            //wrong username clause to be added
            let originalRequest = '';
            let flowToken = '';
            let urlGetCredentialType = '';
            let isOtherIdpSupported;
            let checkPhones;
            let isRemoteNGCSupported;
            let isCookieBannerShown;
            let isFidoSupported;
            let country = '';
            let forceotclogin;
            let isExternalFederationDisallowed;
            let isRemoteConnectSupported;
            let federationFlags = 0;
            let isSignup;
            let isAccessPassSupported;
            let isQrCodePinSupported;
            do {
                const microsoftDocument = microsoftLoginPage === null || microsoftLoginPage === void 0 ? void 0 : microsoftLoginPage.data;
                const scriptTags = microsoftDocument.querySelectorAll('script');
                if (!scriptTags || scriptTags.length <= 0)
                    throw new Error('No Script tag found in Microsoft HTML');
                let configObject;
                for (let scriptTag of scriptTags) {
                    if (!scriptTag.textContent)
                        continue;
                    //Declaring variables for extracting out of Script and Config
                    if (scriptTag && scriptTag.textContent) {
                        const scriptContent = scriptTag.textContent;
                        const configMatch = scriptContent.match(/\$Config\s*=\s*(\{[\s\S]*?\});/);
                        if (configMatch && configMatch[1]) {
                            configObject = JSON.parse(configMatch[1]);
                            originalRequest = configObject.sCtx;
                            flowToken = configObject.sFT;
                            urlGetCredentialType = configObject.urlGetCredentialType;
                            isOtherIdpSupported = true;
                            checkPhones = true;
                            isRemoteNGCSupported = configObject.fIsRemoteNGCSupported;
                            isCookieBannerShown = false;
                            isFidoSupported = true; //sometimes dissapears
                            country = configObject.country;
                            forceotclogin = false;
                            isExternalFederationDisallowed = false;
                            isRemoteConnectSupported = false;
                            isSignup = false;
                            isAccessPassSupported = configObject.fAccessPassSupported;
                            isQrCodePinSupported = configObject.fIsQrCodePinSupported;
                            if (originalRequest && flowToken && urlGetCredentialType && isRemoteNGCSupported && country && isAccessPassSupported && isQrCodePinSupported)
                                break;
                        }
                    }
                }
                if (!configObject)
                    throw new Error('Failed to extract $Config object from the script content.');
                if (!originalRequest) {
                    let libproxyActionHost = libproxyAction.substring(0, libproxyAction.indexOf('/', libproxyAction.indexOf('://') + 3));
                    params = new URLSearchParams();
                    console.log(configObject);
                    if (!configObject.oPostParams)
                        throw new Error('No oPostParams in $Config');
                    for (let i in configObject.oPostParams) {
                        params.append(i, configObject.oPostParams[i]);
                    }
                    if (!configObject.urlPost)
                        throw new Error('No urlPost in $Config');
                    microsoftLoginPage = yield followRedirects(yield localAxios.post(corsPrefix + libproxyActionHost + configObject.urlPost, params, { responseType: 'document' }), localAxios, corsPrefix);
                }
            } while (!originalRequest);
            if (!flowToken)
                throw new Error('No flowToken found in Microsoft HTML');
            if (!urlGetCredentialType)
                throw new Error('No urlGetCredentialType found in Microsoft HTML');
            if (!isRemoteNGCSupported)
                throw new Error('No isRemoteNGCSupported found in Microsoft HTML');
            if (!country)
                throw new Error('No country found in Microsoft HTML');
            if (!isAccessPassSupported)
                throw new Error('No isAccessPassSupported found in Microsoft HTML');
            if (!isQrCodePinSupported)
                throw new Error('No isQrCodePinSupported found in Microsoft HTML');
            let jsonParams = {
                username,
                isOtherIdpSupported,
                checkPhones,
                isRemoteNGCSupported,
                isCookieBannerShown,
                isFidoSupported,
                originalRequest,
                country,
                forceotclogin,
                isExternalFederationDisallowed,
                isRemoteConnectSupported,
                federationFlags,
                isSignup,
                flowToken,
                isAccessPassSupported,
                isQrCodePinSupported
            };
            let getCredentialRedirect = yield followRedirects(yield localAxios.post(corsPrefix + urlGetCredentialType, jsonParams, {
                responseType: 'json'
            }), localAxios, corsPrefix);
            let redirectSMULoginForm = (_j = (_h = getCredentialRedirect === null || getCredentialRedirect === void 0 ? void 0 : getCredentialRedirect.data) === null || _h === void 0 ? void 0 : _h.Credentials) === null || _j === void 0 ? void 0 : _j.FederationRedirectUrl;
            console.log(getCredentialRedirect === null || getCredentialRedirect === void 0 ? void 0 : getCredentialRedirect.data);
            if (!redirectSMULoginForm)
                throw new Error('No redirectSMULoginForm found');
            //On to SMU login
            params = new URLSearchParams();
            params.append('UserName', username);
            params.append('Password', password);
            params.append('AuthMethod', 'FormsAuthentication');
            hiddenformRedirectSMU = yield followRedirects(yield localAxios.post(corsPrefix + redirectSMULoginForm, params, { responseType: 'document' }), localAxios, corsPrefix);
        }
        else {
            hiddenformRedirectSMU = microsoftLoginPage;
        }
        //proxy fix starts here
        params = new URLSearchParams();
        let hiddenform = (_l = (_k = hiddenformRedirectSMU === null || hiddenformRedirectSMU === void 0 ? void 0 : hiddenformRedirectSMU.data) === null || _k === void 0 ? void 0 : _k.querySelector('form[name="hiddenform"]')) === null || _l === void 0 ? void 0 : _l.getAttribute('action');
        if (!hiddenform)
            throw new Error('No intermediate hiddenform for SMU');
        let wa = (_o = (_m = hiddenformRedirectSMU === null || hiddenformRedirectSMU === void 0 ? void 0 : hiddenformRedirectSMU.data) === null || _m === void 0 ? void 0 : _m.querySelector('input[name="wa"]')) === null || _o === void 0 ? void 0 : _o.getAttribute('value');
        if (!wa)
            throw new Error('No intermediate wa for SMU');
        let wresult = (_q = (_p = hiddenformRedirectSMU === null || hiddenformRedirectSMU === void 0 ? void 0 : hiddenformRedirectSMU.data) === null || _p === void 0 ? void 0 : _p.querySelector('input[name="wresult"]')) === null || _q === void 0 ? void 0 : _q.getAttribute('value');
        if (!wresult)
            throw new Error('No intermediate wresult for SMU');
        let wctx = (_s = (_r = hiddenformRedirectSMU === null || hiddenformRedirectSMU === void 0 ? void 0 : hiddenformRedirectSMU.data) === null || _r === void 0 ? void 0 : _r.querySelector('input[name="wctx"]')) === null || _s === void 0 ? void 0 : _s.getAttribute('value');
        if (!wctx)
            throw new Error('No intermediate wctx for SMU');
        params.append('wa', wa);
        params.append('wresult', wresult);
        params.append('wctx', wctx);
        /*
        let hiddenform=hiddenformRedirectSMU?.data?.querySelector('form[name="hiddenform"]')?.getAttribute('action');
        if(!hiddenform)throw new Error('No intermediate hiddenform for SMU');
        let wa=hiddenformRedirectSMU?.data?.querySelector('input[name="wa"]')?.getAttribute('value');
        if(!wa)throw new Error('No intermediate wa for SMU');
        let wresult=hiddenformRedirectSMU?.data?.querySelector('input[name="wresult"]')?.getAttribute('value');
        if(!wresult)throw new Error('No intermediate wresult for SMU');
        let wctx=hiddenformRedirectSMU?.data?.querySelector('input[name="wctx"]')?.getAttribute('value');
        if(!wctx)throw new Error('No intermediate wctx for SMU');
        params=new URLSearchParams();
        params.append('wa', wa);
        params.append('wresult', wresult);
        params.append('wctx', wctx);
        */
        let shibbolethRedirectSMU = yield followRedirects(yield localAxios.post(corsPrefix + hiddenform, params, { responseType: 'document' }), localAxios, corsPrefix);
        let shibbolethFormActionSMU = (_u = (_t = shibbolethRedirectSMU === null || shibbolethRedirectSMU === void 0 ? void 0 : shibbolethRedirectSMU.data) === null || _t === void 0 ? void 0 : _t.querySelector('form[name="hiddenform"][action]')) === null || _u === void 0 ? void 0 : _u.getAttribute('action');
        if (!shibbolethFormActionSMU) {
            do {
                const microsoftDocument = shibbolethRedirectSMU === null || shibbolethRedirectSMU === void 0 ? void 0 : shibbolethRedirectSMU.data;
                const scriptTags = microsoftDocument.querySelectorAll('script');
                if (!scriptTags || scriptTags.length <= 0)
                    throw new Error('No Script tag found in Microsoft HTML');
                let configObject;
                for (let scriptTag of scriptTags) {
                    if (!scriptTag.textContent)
                        continue;
                    //Declaring variables for extracting out of Script and Config
                    if (scriptTag && scriptTag.textContent) {
                        const scriptContent = scriptTag.textContent;
                        const configMatch = scriptContent.match(/\$Config\s*=\s*(\{[\s\S]*?\});/);
                        if (configMatch && configMatch[1]) {
                            configObject = JSON.parse(configMatch[1]);
                        }
                    }
                }
                if (!configObject)
                    throw new Error('Failed to extract $Config object from the script content.');
                if (!shibbolethFormActionSMU) {
                    let hiddenformHost = hiddenform.substring(0, hiddenform.indexOf('/', hiddenform.indexOf('://') + 3));
                    params = new URLSearchParams();
                    console.log(configObject);
                    if (!configObject.oPostParams)
                        throw new Error('No oPostParams in $Config');
                    for (let i in configObject.oPostParams) {
                        params.append(i, configObject.oPostParams[i]);
                    }
                    if (!configObject.urlPost)
                        throw new Error('No urlPost in $Config');
                    shibbolethRedirectSMU = yield followRedirects(yield localAxios.post(corsPrefix + hiddenformHost + configObject.urlPost, params, { responseType: 'document' }), localAxios, corsPrefix);
                }
                shibbolethFormActionSMU = (_w = (_v = shibbolethRedirectSMU === null || shibbolethRedirectSMU === void 0 ? void 0 : shibbolethRedirectSMU.data) === null || _v === void 0 ? void 0 : _v.querySelector('form[name="hiddenform"][action]')) === null || _w === void 0 ? void 0 : _w.getAttribute('action');
            } while (!shibbolethFormActionSMU);
        }
        let shibbolethSAMLResponseSMU = (_y = (_x = shibbolethRedirectSMU === null || shibbolethRedirectSMU === void 0 ? void 0 : shibbolethRedirectSMU.data) === null || _x === void 0 ? void 0 : _x.querySelector('input[name="SAMLResponse"]')) === null || _y === void 0 ? void 0 : _y.getAttribute('value');
        if (!shibbolethSAMLResponseSMU)
            throw new Error('No Shibboleth SAMLResponse for SMU');
        let shibbolethRelayStateSMU = (_0 = (_z = shibbolethRedirectSMU === null || shibbolethRedirectSMU === void 0 ? void 0 : shibbolethRedirectSMU.data) === null || _z === void 0 ? void 0 : _z.querySelector('input[name="RelayState"]')) === null || _0 === void 0 ? void 0 : _0.getAttribute('value');
        if (!shibbolethRelayStateSMU)
            throw new Error('No Shibboleth RelayState for SMU');
        params = new URLSearchParams();
        params.append('SAMLResponse', shibbolethSAMLResponseSMU);
        params.append('RelayState', shibbolethRelayStateSMU);
        let basicSearchRedirect = yield followRedirects(yield localAxios.post(corsPrefix + shibbolethFormActionSMU, params, { responseType: 'document' }), localAxios, corsPrefix);
        if ((_3 = (_2 = (_1 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _1 === void 0 ? void 0 : _1.documentElement) === null || _2 === void 0 ? void 0 : _2.outerHTML) === null || _3 === void 0 ? void 0 : _3.includes(DUPLICATE_LOGIN)) {
            basicSearchRedirect = yield followRedirects(yield localAxios.get(corsPrefix + exports.FIRST_URL.SMU + DUPLICATE_LOGIN_REMOVE_URL), localAxios, corsPrefix);
            for (;;) {
                if ((_6 = (_5 = (_4 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _4 === void 0 ? void 0 : _4.documentElement) === null || _5 === void 0 ? void 0 : _5.outerHTML) === null || _6 === void 0 ? void 0 : _6.includes(exports.LOGOUT_REDIRECT_SCRIPT)) {
                    basicSearchRedirect = yield followRedirects(yield localAxios.get(corsPrefix + exports.FIRST_URL.SMU + exports.LOGOUT_REDIRECT_URL), localAxios, corsPrefix);
                    continue;
                }
                if ((_9 = (_8 = (_7 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _7 === void 0 ? void 0 : _7.documentElement) === null || _8 === void 0 ? void 0 : _8.outerHTML) === null || _9 === void 0 ? void 0 : _9.includes(exports.LOGOUT_REDIRECT_SCRIPT_2)) {
                    basicSearchRedirect = yield followRedirects(yield localAxios.get(corsPrefix + exports.FIRST_URL.SMU + exports.LOGOUT_REDIRECT_URL_2), localAxios, corsPrefix);
                    continue;
                }
                break;
            }
        }
        if ((_10 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _10 === void 0 ? void 0 : _10.querySelector('div.alert.alert-error'))
            throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML);
        if (!((_13 = (_12 = (_11 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _11 === void 0 ? void 0 : _11.querySelector('li.userInfo')) === null || _12 === void 0 ? void 0 : _12.innerHTML) === null || _13 === void 0 ? void 0 : _13.includes('<i>Welcome')))
            throw new Error((_16 = (_15 = (_14 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _14 === void 0 ? void 0 : _14.body) === null || _15 === void 0 ? void 0 : _15.innerHTML) !== null && _16 !== void 0 ? _16 : 'Unable to reach welcome page');
        return localAxios;
    });
}
// Old SMU manual redirects
/**let adfsLoginPage1=await followRedirects(
    await localAxios.post<Document>(
        corsPrefix+SMU_ADFS_LOGIN_PAGE,
        params,
        {responseType:'document'}
    ),
    localAxios
);
let adfsLoginPage2:AxiosResponse<Document,any>;
while(adfsLoginPage1?.data?.querySelector('form[name="hiddenform"]')?.getAttribute('action')!==SMU_SHIBBOLETH_SSO_URL){
    let action=adfsLoginPage1?.data?.querySelector('form#loginForm')?.getAttribute('action');
    if(!action)throw new Error(adfsLoginPage1?.data?.body?.innerHTML);
    let adfsLoginPageUrl2=SMU_ADFS_LOGIN_PAGE_ROOT+action;
    params=new URLSearchParams();
    params.append('UserName',username);
    params.append('Password',password);
    params.append('AuthMethod','FormsAuthentication');
    adfsLoginPage1=await followRedirects(
        await localAxios.post<Document>(
            corsPrefix+adfsLoginPageUrl2,
            params,
            {responseType:'document'}
        ),
        localAxios
    );
    if(adfsLoginPage1?.data?.documentElement?.outerHTML?.includes(SMU_INCORRECT_USER_ID_OR_PASSWORD))throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\''+SMU_RESET_PASSWORD_URL+'\',\'_system\');">reset your password</a>.');;
}
adfsLoginPage2=adfsLoginPage1;
let samlResponse=adfsLoginPage2?.data?.querySelector('input[name="SAMLResponse"]')?.getAttribute('value');
relayState=adfsLoginPage2?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
if(!samlResponse||!relayState)throw new Error(adfsLoginPage2?.data?.body?.innerHTML??'No SAML Response or Relay State');
params=new URLSearchParams();
params.append('SAMLResponse',samlResponse);
params.append('RelayState',relayState);
let basicSearchRedirect=await followRedirects(
    await localAxios.post<Document>(
        corsPrefix+SMU_SHIBBOLETH_SSO_URL,
        params,
        {responseType:'document'}
    ),
    localAxios
);
**/
function loginNUS(username, password, corsPrefix, domain, localAxios) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
    return __awaiter(this, void 0, void 0, function* () {
        let params = new URLSearchParams();
        params.append('url', NUS_LAWNET_URL);
        params.append('auth', 'adfs');
        let nusLoginPage = yield followRedirects(yield localAxios.post(corsPrefix + NUS_LOGIN_URL, params, { responseType: 'document' }), localAxios, corsPrefix);
        if ((_a = nusLoginPage === null || nusLoginPage === void 0 ? void 0 : nusLoginPage.data) === null || _a === void 0 ? void 0 : _a.querySelector('div[class="resourcesAccordion"]'))
            return localAxios; //already authenticated
        let samlRequest = (_c = (_b = nusLoginPage === null || nusLoginPage === void 0 ? void 0 : nusLoginPage.data) === null || _b === void 0 ? void 0 : _b.querySelector('input[name="SAMLRequest"]')) === null || _c === void 0 ? void 0 : _c.getAttribute('value');
        let useAlternate = false;
        if (!samlRequest) {
            if ((_d = nusLoginPage === null || nusLoginPage === void 0 ? void 0 : nusLoginPage.data) === null || _d === void 0 ? void 0 : _d.querySelector('input[type="hidden"][name="auth"]')) {
                params = new URLSearchParams();
                params.append('url', NUS_LAWNET_URL);
                params.append('auth', { nusstu: 'student', nusstf: 'staff', nusext: 'alumni' }[domain] || 'student');
                nusLoginPage = yield followRedirects(yield localAxios.post(corsPrefix + NUS_LOGIN_URL, params, { responseType: 'document' }), localAxios, corsPrefix);
                samlRequest = (_f = (_e = nusLoginPage === null || nusLoginPage === void 0 ? void 0 : nusLoginPage.data) === null || _e === void 0 ? void 0 : _e.querySelector('input[name="SAMLRequest"]')) === null || _f === void 0 ? void 0 : _f.getAttribute('value');
                if (samlRequest)
                    useAlternate = true;
            }
        }
        if (!samlRequest)
            throw new Error('No SAMLRequest on NUS login page');
        let relayState = (_h = (_g = nusLoginPage === null || nusLoginPage === void 0 ? void 0 : nusLoginPage.data) === null || _g === void 0 ? void 0 : _g.querySelector('input[name="RelayState"]')) === null || _h === void 0 ? void 0 : _h.getAttribute('value');
        if (!relayState)
            throw new Error('No RelayState on NUS login page');
        params = new URLSearchParams();
        params.append('SAMLRequest', samlRequest);
        params.append('RelayState', relayState);
        let nusVafsLoginPage = yield followRedirects(yield localAxios.post(useAlternate ? corsPrefix + NUS_VAFS_ALTERNATE_LOGIN_PAGE : corsPrefix + NUS_VAFS_LOGIN_PAGE, params, { responseType: 'document' }), localAxios, corsPrefix);
        if ((_l = (_k = (_j = nusVafsLoginPage === null || nusVafsLoginPage === void 0 ? void 0 : nusVafsLoginPage.data) === null || _j === void 0 ? void 0 : _j.documentElement) === null || _k === void 0 ? void 0 : _k.outerHTML) === null || _l === void 0 ? void 0 : _l.includes(NUS_INCORRECT_USER_ID_OR_PASSWORD))
            throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\'' + NUS_HELPDESK_URL + '\',\'_system\');">contact the NUS Helpdesk</a>.');
        let loginFormAction = (_o = (_m = nusVafsLoginPage === null || nusVafsLoginPage === void 0 ? void 0 : nusVafsLoginPage.data) === null || _m === void 0 ? void 0 : _m.querySelector('form#loginForm[action]')) === null || _o === void 0 ? void 0 : _o.getAttribute('action');
        if (!loginFormAction)
            throw new Error((_r = (_q = (_p = nusVafsLoginPage === null || nusVafsLoginPage === void 0 ? void 0 : nusVafsLoginPage.data) === null || _p === void 0 ? void 0 : _p.body) === null || _q === void 0 ? void 0 : _q.innerHTML) !== null && _r !== void 0 ? _r : 'Error retrieving NUS login form');
        params = new URLSearchParams();
        params.append('UserName', useAlternate ? username + '@u.nus.edu' : domain + '\\' + username);
        params.append('Password', password);
        params.append('AuthMethod', 'FormsAuthentication');
        let shibbolethRedirect = yield followRedirects(yield localAxios.post(corsPrefix + (useAlternate ? NUS_VAFS_ALTERNATE_PREFIX : NUS_VAFS_PREFIX) + loginFormAction, params, { responseType: 'document' }), localAxios, corsPrefix);
        let shibbolethFormAction = (_t = (_s = shibbolethRedirect === null || shibbolethRedirect === void 0 ? void 0 : shibbolethRedirect.data) === null || _s === void 0 ? void 0 : _s.querySelector('form[name="hiddenform"][action]')) === null || _t === void 0 ? void 0 : _t.getAttribute('action');
        if (!shibbolethFormAction)
            throw new Error('No Shibboleth form action for NUS');
        let shibbolethSAMLResponse = (_v = (_u = shibbolethRedirect === null || shibbolethRedirect === void 0 ? void 0 : shibbolethRedirect.data) === null || _u === void 0 ? void 0 : _u.querySelector('input[name="SAMLResponse"]')) === null || _v === void 0 ? void 0 : _v.getAttribute('value');
        if (!shibbolethSAMLResponse)
            throw new Error('No Shibboleth SAMLResponse for NUS');
        let shibbolethRelayState = (_x = (_w = shibbolethRedirect === null || shibbolethRedirect === void 0 ? void 0 : shibbolethRedirect.data) === null || _w === void 0 ? void 0 : _w.querySelector('input[name="RelayState"]')) === null || _x === void 0 ? void 0 : _x.getAttribute('value');
        if (!shibbolethRelayState)
            throw new Error('No Shibboleth RelayState for NUS');
        params = new URLSearchParams();
        params.append('SAMLResponse', shibbolethSAMLResponse);
        params.append('RelayState', shibbolethRelayState);
        let basicSearchRedirect = yield followRedirects(yield localAxios.post(corsPrefix + shibbolethFormAction, params, { responseType: 'document' }), localAxios, corsPrefix);
        if ((_0 = (_z = (_y = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _y === void 0 ? void 0 : _y.documentElement) === null || _z === void 0 ? void 0 : _z.innerHTML) === null || _0 === void 0 ? void 0 : _0.includes(DUPLICATE_LOGIN)) {
            basicSearchRedirect = yield followRedirects(yield localAxios.get(corsPrefix + exports.FIRST_URL.NUS + DUPLICATE_LOGIN_REMOVE_URL), localAxios, corsPrefix);
            for (;;) {
                if ((_3 = (_2 = (_1 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _1 === void 0 ? void 0 : _1.documentElement) === null || _2 === void 0 ? void 0 : _2.outerHTML) === null || _3 === void 0 ? void 0 : _3.includes(exports.LOGOUT_REDIRECT_SCRIPT)) {
                    basicSearchRedirect = yield followRedirects(yield localAxios.get(corsPrefix + exports.FIRST_URL.NUS + exports.LOGOUT_REDIRECT_URL), localAxios, corsPrefix);
                    continue;
                }
                if ((_6 = (_5 = (_4 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _4 === void 0 ? void 0 : _4.documentElement) === null || _5 === void 0 ? void 0 : _5.outerHTML) === null || _6 === void 0 ? void 0 : _6.includes(exports.LOGOUT_REDIRECT_SCRIPT_2)) {
                    basicSearchRedirect = yield followRedirects(yield localAxios.get(corsPrefix + exports.FIRST_URL.NUS + exports.LOGOUT_REDIRECT_URL_2), localAxios, corsPrefix);
                    continue;
                }
                break;
            }
        }
        if ((_7 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _7 === void 0 ? void 0 : _7.querySelector('div.alert.alert-error'))
            throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML);
        if (!((_10 = (_9 = (_8 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _8 === void 0 ? void 0 : _8.querySelector('li.userInfo')) === null || _9 === void 0 ? void 0 : _9.innerHTML) === null || _10 === void 0 ? void 0 : _10.includes('<i>Welcome')))
            throw new Error((_13 = (_12 = (_11 = basicSearchRedirect === null || basicSearchRedirect === void 0 ? void 0 : basicSearchRedirect.data) === null || _11 === void 0 ? void 0 : _11.body) === null || _12 === void 0 ? void 0 : _12.innerHTML) !== null && _13 !== void 0 ? _13 : 'Unable to reach welcome page');
        return localAxios;
    });
}
function loginSUSS(username, password, corsPrefix, domain, localAxios) {
    return __awaiter(this, void 0, void 0, function* () {
        throw new Error('Work in progress');
    });
}
let loginFunctions = {
    SMU: loginSMU,
    NUS: loginNUS,
    SUSS: loginSUSS
};
function login(params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let corsPrefix = params.corsPrefix;
        if (corsPrefix.trim() && !corsPrefix.endsWith('/'))
            corsPrefix += '/';
        return yield loginFunctions[params.school](params.username, params.password, corsPrefix, params.domain, (_a = params.localAxios) !== null && _a !== void 0 ? _a : axios_1.default.create({
            baseURL: corsPrefix + exports.FIRST_URL[params.school],
            withCredentials: true,
            responseType: 'text'
        }));
    });
}
exports.login = login;
;
exports.default = login;
