import axios, {
	AxiosInstance,
	AxiosResponse
} from 'axios';

export const FIRST_URL = {
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
const NUS_OTHER_INCORRECT_USER_ID_OR_PASSWORD = 'Incorrect user ID or password. Type the correct user ID and password, and try again.';
const NUS_HELPDESK_URL = 'http://www.nus.edu.sg/comcen/gethelp';

const DUPLICATE_LOGIN = '<div>Multiple logins with the same User ID are not allowed.</div> <div>To terminate the earlier session, please click on the Remove Button.</div> <div><br><br></div> <div>Sharing of User ID is prohibited. Legal action will be taken if access is unauthorised.</div>';
const DUPLICATE_LOGIN_REMOVE_URL = '/lawnet/group/lawnet/duplicate-login?p_p_id=lawnetuniquelogin_WAR_lawnet3portalportlet&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&p_p_col_id=column-2&p_p_col_count=1&_lawnetuniquelogin_WAR_lawnet3portalportlet_loginType=old&_lawnetuniquelogin_WAR_lawnet3portalportlet_javax.portlet.action=removeOldLogin';
export const LOGOUT_REDIRECT_SCRIPT = '<script type="text/javascript">location.href="\\x2flawnet\\x2fweb\\x2flawnet\\x2fhome";</script>';
export const LOGOUT_REDIRECT_SCRIPT_2 = '<script type="text/javascript">location.href="\\x2flawnet\\x2fc";</script>';
export const LOGOUT_REDIRECT_URL = '/lawnet/web/lawnet/home';
export const LOGOUT_REDIRECT_URL_2 = '/lawnet/c';

async function followRedirects<T>(response: AxiosResponse<T>, localAxios: AxiosInstance, corsPrefix?: string) {
	while (response.status >= 300 && response.status < 400) {
		let locationCaseSensitive = '';
		for (let i in response.headers) {
			if (i.toLowerCase() === 'location') locationCaseSensitive = i;
		}
		if (!locationCaseSensitive) throw new Error('Redirect without location header');
		let location = response.headers[locationCaseSensitive];
		if (corsPrefix && !location.startsWith(corsPrefix)) location = corsPrefix + location;
		response = await localAxios.get<T>(
			location,
			{ responseType: 'document' }
		);
	}
	return response;
}

async function loginSMU(
	username: string,
	password: string,
	corsPrefix?: string,
	domain?: string,
	localAxios?: AxiosInstance
) {
	let libproxyPage = await followRedirects(
		await localAxios.get<Document>(
			corsPrefix + SMU_LIBPROXY_URL,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);
	let libproxyAction = libproxyPage?.data?.querySelector('form[name="EZproxyForm"]')?.getAttribute('action');
	if (!libproxyAction) throw new Error('No EZproxyForm on SMU login page');
	let samlRequest = libproxyPage?.data?.querySelector('input[name="SAMLRequest"]')?.getAttribute('value');
	if (!samlRequest) throw new Error('No SAMLRequest on SMU login page');
	let relayState = libproxyPage?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if (!relayState) throw new Error('No RelayState on SMU login page');
	// if(!samlRequest||!relayState)return localAxios; //already authenticated

	let params = new URLSearchParams();
	params.append('SAMLRequest', samlRequest);
	params.append('RelayState', relayState);
	//params.append('back','2');

	let microsoftLoginPage = await followRedirects(
		await localAxios.post<Document>(
			corsPrefix + libproxyAction,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);
	let hiddenformRedirectSMU: AxiosResponse<Document>;

	if (!microsoftLoginPage?.data?.querySelector('form[name="hiddenform"][action]')) {
		//wrong username clause to be added
		let originalRequest = '';
		let flowToken = '';
		let urlGetCredentialType = '';
		let isOtherIdpSupported: boolean;
		let checkPhones: boolean;
		let isRemoteNGCSupported: boolean;
		let isCookieBannerShown: boolean;
		let isFidoSupported: boolean;
		let country = '';
		let forceotclogin: boolean;
		let isExternalFederationDisallowed: boolean;
		let isRemoteConnectSupported: boolean;
		let federationFlags = 0;
		let isSignup: boolean;
		let isAccessPassSupported: boolean;
		let isQrCodePinSupported: boolean;

		do {
			const microsoftDocument = microsoftLoginPage?.data;

			const scriptTags = microsoftDocument.querySelectorAll('script');
			if (!scriptTags || scriptTags.length <= 0) throw new Error('No Script tag found in Microsoft HTML');
			let configObject: any;
			for (let scriptTag of scriptTags) {
				if (!scriptTag.textContent) continue;

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


						if (originalRequest && flowToken && urlGetCredentialType && isRemoteNGCSupported && country && isAccessPassSupported && isQrCodePinSupported) break;
					}
				}
			}

			if (!configObject) throw new Error('Failed to extract $Config object from the script content.')

			if (!originalRequest) {
				let libproxyActionHost = libproxyAction.substring(0, libproxyAction.indexOf('/', libproxyAction.indexOf('://') + 3));
				params = new URLSearchParams();
				if (!configObject.oPostParams) throw new Error('No oPostParams in $Config');
				for (let i in configObject.oPostParams) {
					params.append(i, configObject.oPostParams[i]);
				}
				if (!configObject.urlPost) throw new Error('No urlPost in $Config');
				microsoftLoginPage = await followRedirects(
					await localAxios.post<Document>(
						corsPrefix + libproxyActionHost + configObject.urlPost,
						params,
						{ responseType: 'document' }
					),
					localAxios,
					corsPrefix
				);
			}
		} while (!originalRequest);
		if (!flowToken) throw new Error('No flowToken found in Microsoft HTML');
		if (!urlGetCredentialType) throw new Error('No urlGetCredentialType found in Microsoft HTML');
		if (!isRemoteNGCSupported) throw new Error('No isRemoteNGCSupported found in Microsoft HTML');
		if (!country) throw new Error('No country found in Microsoft HTML');
		if (!isAccessPassSupported) throw new Error('No isAccessPassSupported found in Microsoft HTML');
		if (!isQrCodePinSupported) throw new Error('No isQrCodePinSupported found in Microsoft HTML');

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


		let getCredentialRedirect = await followRedirects(
			await localAxios.post<any>(
				corsPrefix + urlGetCredentialType,
				jsonParams,
				{
					responseType: 'json'
				}
			),
			localAxios,
			corsPrefix
		);

		let redirectSMULoginForm = getCredentialRedirect?.data?.Credentials?.FederationRedirectUrl;
		//FederationRedirectUrl will be inside GetCredentialType if microsoft email is correct
		if (!redirectSMULoginForm) throw new Error('Invalid email, please try again.');


		//On to SMU login

		params = new URLSearchParams();
		params.append('UserName', username);
		params.append('Password', password);
		params.append('AuthMethod', 'FormsAuthentication');

		hiddenformRedirectSMU = await followRedirects(
			await localAxios.post<Document>(
				corsPrefix + redirectSMULoginForm,
				params,
				{ responseType: 'document' }
			),
			localAxios,
			corsPrefix
		);
	} else {
		hiddenformRedirectSMU = microsoftLoginPage;
	}

	//proxy fix starts here

	params = new URLSearchParams();
	if (hiddenformRedirectSMU?.data?.documentElement?.outerHTML?.includes(SMU_INCORRECT_USER_ID_OR_PASSWORD)) throw new Error('Invalid email or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\'' + SMU_RESET_PASSWORD_URL + '\',\'_system\');">reset password here</a>.');
	let hiddenform = hiddenformRedirectSMU?.data?.querySelector('form[name="hiddenform"]')?.getAttribute('action');
	if (!hiddenform) throw new Error('No intermediate hiddenform for SMU');
	let wa = hiddenformRedirectSMU?.data?.querySelector('input[name="wa"]')?.getAttribute('value');
	if (!wa) throw new Error('No intermediate wa for SMU');
	let wresult = hiddenformRedirectSMU?.data?.querySelector('input[name="wresult"]')?.getAttribute('value');
	if (!wresult) throw new Error('No intermediate wresult for SMU');
	let wctx = hiddenformRedirectSMU?.data?.querySelector('input[name="wctx"]')?.getAttribute('value');
	if (!wctx) throw new Error('No intermediate wctx for SMU');
	params.append('wa', wa);
	params.append('wresult', wresult);
	params.append('wctx', wctx);

	let shibbolethRedirectSMU = await followRedirects(
		await localAxios.post<Document>(
			corsPrefix + hiddenform,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);


	let shibbolethFormActionSMU = shibbolethRedirectSMU?.data?.querySelector('form[name="hiddenform"][action]')?.getAttribute('action');
	let shibbolethSAMLResponseSMU = shibbolethRedirectSMU?.data?.querySelector('input[name="SAMLResponse"]')?.getAttribute('value');
	let shibbolethRelayStateSMU = shibbolethRedirectSMU?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');

	if (!shibbolethFormActionSMU) {

		do {
			const microsoftDocument = shibbolethRedirectSMU?.data;

			const scriptTags = microsoftDocument.querySelectorAll('script');
			if (!scriptTags || scriptTags.length <= 0) throw new Error('No Script tag found in Microsoft HTML');
			let configObject: any;
			for (let scriptTag of scriptTags) {
				if (!scriptTag.textContent) continue;

				//Declaring variables for extracting out of Script and Config

				if (scriptTag && scriptTag.textContent) {
					const scriptContent = scriptTag.textContent;
					const configMatch = scriptContent.match(/\$Config\s*=\s*(\{[\s\S]*?\});/);

					if (configMatch && configMatch[1]) {
						configObject = JSON.parse(configMatch[1]);
					}
				}
			}

			if (!configObject) {
				shibbolethSAMLResponseSMU = shibbolethRedirectSMU?.data?.querySelector('input[name="SAMLRequest"]')?.getAttribute('value');
				shibbolethRelayStateSMU = shibbolethRedirectSMU?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
				if (!shibbolethSAMLResponseSMU || !shibbolethRelayStateSMU) throw new Error('Failed to extract $Config object from the script content.');
			}

			if (!shibbolethFormActionSMU) {
				let hiddenformHost = 'https://login.libproxy.smu.edu.sg/';//hiddenform.substring(0,hiddenform.indexOf('/',hiddenform.indexOf('://')+3));
				params = new URLSearchParams();

				if (!configObject.oPostParams && !configObject.urlResume) throw new Error('No oPostParams or urlResume in $Config');
				if (configObject.oPostParams) {
					for (let i in configObject.oPostParams) {
						params.append(i, configObject.oPostParams[i]);
					}
					if (!configObject.urlPost) throw new Error('No urlPost in $Config');
					shibbolethRedirectSMU = await followRedirects(
						await localAxios.post<Document>(
							corsPrefix + hiddenformHost + configObject.urlPost,
							params,
							{ responseType: 'document' }
						),
						localAxios,
						corsPrefix
					);
				}

				if (configObject.urlResume) {
					let urlResume = configObject.urlResume;
					shibbolethRedirectSMU = await followRedirects(
						await localAxios.get<Document>(
							corsPrefix + urlResume,
							{ responseType: 'document' }
						),
						localAxios,
						corsPrefix
					);

				}
			}
			shibbolethFormActionSMU = shibbolethRedirectSMU?.data?.querySelector('form[name="hiddenform"][action]')?.getAttribute('action');
			shibbolethSAMLResponseSMU = shibbolethRedirectSMU?.data?.querySelector('input[name="SAMLResponse"]')?.getAttribute('value');
			shibbolethRelayStateSMU = shibbolethRedirectSMU?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
			if (!shibbolethFormActionSMU && shibbolethSAMLResponseSMU && shibbolethRelayStateSMU) {
				console.log('Force rouing shibbolethFormAction to https://login.libproxy.smu.edu.sg/Shibboleth.sso/SAML2/POST');
				shibbolethFormActionSMU = 'https://login.libproxy.smu.edu.sg/Shibboleth.sso/SAML2/POST';
			}
		} while (!shibbolethFormActionSMU);
	}

	if (!shibbolethSAMLResponseSMU) throw new Error('No Shibboleth SAMLResponse for SMU');
	if (!shibbolethRelayStateSMU) throw new Error('No Shibboleth RelayState for SMU');

	params = new URLSearchParams();
	params.append('SAMLResponse', shibbolethSAMLResponseSMU);
	params.append('RelayState', shibbolethRelayStateSMU);
	let basicSearchRedirect = await followRedirects(
		await localAxios.post<Document>(
			corsPrefix + shibbolethFormActionSMU,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);

	if (basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(DUPLICATE_LOGIN)) {
		basicSearchRedirect = await followRedirects(
			await localAxios.get<Document>(corsPrefix + FIRST_URL.SMU + DUPLICATE_LOGIN_REMOVE_URL),
			localAxios,
			corsPrefix
		);
		for (; ;) {
			if (basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT)) {
				basicSearchRedirect = await followRedirects(
					await localAxios.get<Document>(corsPrefix + FIRST_URL.SMU + LOGOUT_REDIRECT_URL),
					localAxios,
					corsPrefix
				);
				continue;
			}
			if (basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT_2)) {
				basicSearchRedirect = await followRedirects(
					await localAxios.get<Document>(corsPrefix + FIRST_URL.SMU + LOGOUT_REDIRECT_URL_2),
					localAxios,
					corsPrefix
				);
				continue;
			}
			break;
		}
	}
	if (basicSearchRedirect?.data?.querySelector('div.alert.alert-error')) throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML);
	if (!basicSearchRedirect?.data?.querySelector('li.userInfo')?.innerHTML?.includes('<i>Welcome')) throw new Error(basicSearchRedirect?.data?.body?.innerHTML ?? 'Unable to reach welcome page');
	return localAxios;
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



async function loginNUS(
	username: string,
	password: string,
	corsPrefix?: string,
	domain?: string,
	localAxios?: AxiosInstance
) {
	let params = new URLSearchParams();
	params.append('url', NUS_LAWNET_URL);
	params.append('auth', 'adfs');

	let nusLoginPage = await followRedirects(
		await localAxios.post<Document>(
			corsPrefix + NUS_LOGIN_URL,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);
	if (nusLoginPage?.data?.querySelector('div[class="resourcesAccordion"]')) return localAxios; //already authenticated
	let samlRequest = nusLoginPage?.data?.querySelector('input[name="SAMLRequest"]')?.getAttribute('value');
	let useAlternate = false;
	if (!samlRequest) {
		if (nusLoginPage?.data?.querySelector('input[type="hidden"][name="auth"]')) {
			params = new URLSearchParams();
			params.append('url', NUS_LAWNET_URL);
			params.append('auth', { nusstu: 'student', nusstf: 'staff', nusext: 'alumni' }[domain] || 'student');
			nusLoginPage = await followRedirects(
				await localAxios.post<Document>(
					corsPrefix + NUS_LOGIN_URL,
					params,
					{ responseType: 'document' }
				),
				localAxios,
				corsPrefix
			);
			samlRequest = nusLoginPage?.data?.querySelector('input[name="SAMLRequest"]')?.getAttribute('value');
			if (samlRequest) useAlternate = true;
		}
	}
	if (!samlRequest) throw new Error('No SAMLRequest on NUS login page');
	let relayState = nusLoginPage?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if (!relayState) throw new Error('No RelayState on NUS login page');
	params = new URLSearchParams();
	params.append('SAMLRequest', samlRequest);
	params.append('RelayState', relayState);
	let nusVafsLoginPage = await followRedirects(
		await localAxios.post<Document>(
			useAlternate ? corsPrefix + NUS_VAFS_ALTERNATE_LOGIN_PAGE : corsPrefix + NUS_VAFS_LOGIN_PAGE,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);
	if (nusVafsLoginPage?.data?.documentElement?.outerHTML?.includes(NUS_INCORRECT_USER_ID_OR_PASSWORD)) throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\'' + NUS_HELPDESK_URL + '\',\'_system\');">contact the NUS Helpdesk</a>.');
	if (nusVafsLoginPage?.data?.documentElement?.outerHTML?.includes(NUS_OTHER_INCORRECT_USER_ID_OR_PASSWORD)) throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\'' + NUS_HELPDESK_URL + '\',\'_system\');">contact the NUS Helpdesk</a>.');
	let loginFormAction = nusVafsLoginPage?.data?.querySelector('form#loginForm[action]')?.getAttribute('action');
	if (!loginFormAction) throw new Error(nusVafsLoginPage?.data?.body?.innerHTML ?? 'Error retrieving NUS login form');
	params = new URLSearchParams();
	params.append('UserName', useAlternate ? username + '@u.nus.edu' : domain + '\\' + username);
	params.append('Password', password);
	params.append('AuthMethod', 'FormsAuthentication');
	let shibbolethRedirect = await followRedirects(
		await localAxios.post<Document>(
			corsPrefix + (useAlternate ? NUS_VAFS_ALTERNATE_PREFIX : NUS_VAFS_PREFIX) + loginFormAction,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);

	if (shibbolethRedirect?.data?.documentElement?.outerHTML?.includes(NUS_OTHER_INCORRECT_USER_ID_OR_PASSWORD)) throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\'' + NUS_HELPDESK_URL + '\',\'_system\');">contact the NUS Helpdesk</a>.');

	let shibbolethFormAction = shibbolethRedirect?.data?.querySelector('form[name="hiddenform"][action]')?.getAttribute('action');
	if (!shibbolethFormAction) throw new Error('No Shibboleth form action for NUS');
	let shibbolethSAMLResponse = shibbolethRedirect?.data?.querySelector('input[name="SAMLResponse"]')?.getAttribute('value');
	if (!shibbolethSAMLResponse) throw new Error('No Shibboleth SAMLResponse for NUS');
	let shibbolethRelayState = shibbolethRedirect?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if (!shibbolethRelayState) throw new Error('No Shibboleth RelayState for NUS');
	params = new URLSearchParams();
	params.append('SAMLResponse', shibbolethSAMLResponse);
	params.append('RelayState', shibbolethRelayState);
	let basicSearchRedirect = await followRedirects(
		await localAxios.post<Document>(
			corsPrefix + shibbolethFormAction,
			params,
			{ responseType: 'document' }
		),
		localAxios,
		corsPrefix
	);
	if (basicSearchRedirect?.data?.documentElement?.innerHTML?.includes(DUPLICATE_LOGIN)) {
		basicSearchRedirect = await followRedirects(
			await localAxios.get<Document>(corsPrefix + FIRST_URL.NUS + DUPLICATE_LOGIN_REMOVE_URL),
			localAxios,
			corsPrefix
		);
		for (; ;) {
			if (basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT)) {
				basicSearchRedirect = await followRedirects(
					await localAxios.get<Document>(corsPrefix + FIRST_URL.NUS + LOGOUT_REDIRECT_URL),
					localAxios,
					corsPrefix
				);
				continue;
			}
			if (basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT_2)) {
				basicSearchRedirect = await followRedirects(
					await localAxios.get<Document>(corsPrefix + FIRST_URL.NUS + LOGOUT_REDIRECT_URL_2),
					localAxios,
					corsPrefix
				);
				continue;
			}
			break;
		}
	}
	if (basicSearchRedirect?.data?.querySelector('div.alert.alert-error')) throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML);
	if (!basicSearchRedirect?.data?.querySelector('li.userInfo')?.innerHTML?.includes('<i>Welcome')) throw new Error(basicSearchRedirect?.data?.body?.innerHTML ?? 'Unable to reach welcome page');
	return localAxios;
}

async function loginSUSS(
	username: string,
	password: string,
	corsPrefix?: string,
	domain?: string,
	localAxios?: AxiosInstance
): Promise<AxiosInstance> {
	throw new Error('Work in progress');
}

let loginFunctions = {
	SMU: loginSMU,
	NUS: loginNUS,
	SUSS: loginSUSS
};

export async function login(params: {
	school: 'SMU' | 'NUS' | 'SUSS',
	username: string,
	password: string,
	corsPrefix?: string,
	domain?: string,
	localAxios?: AxiosInstance
}): Promise<AxiosInstance> {
	let corsPrefix = params.corsPrefix;
	if (corsPrefix.trim() && !corsPrefix.endsWith('/')) corsPrefix += '/';
	return await loginFunctions[params.school](
		params.username,
		params.password,
		corsPrefix,
		params.domain,
		params.localAxios ?? axios.create({
			baseURL: corsPrefix + FIRST_URL[params.school],
			withCredentials: true,
			responseType: 'text'
		})
	);
};

export default login;