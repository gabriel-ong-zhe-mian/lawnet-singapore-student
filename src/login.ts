import axios,{
	AxiosInstance,
	AxiosResponse
}from 'axios';

export let corsPrefix='';
export const FIRST_URL={
	SMU:'https://www-lawnet-sg.libproxy.smu.edu.sg',
	NUS:'https://www-lawnet-sg.lawproxy1.nus.edu.sg'
};
const SMU_LIBPROXY_URL='http://libproxy.smu.edu.sg/login?url=https://www.lawnet.sg/lawnet/web/lawnet/ip-access';
const SMU_ADFS_LOGIN_PAGE='https://login2.smu.edu.sg/adfs/ls/';
const SMU_ADFS_LOGIN_PAGE_ROOT='https://login2.smu.edu.sg';
const SMU_SHIBBOLETH_SSO_URL='https://login.libproxy.smu.edu.sg:443/Shibboleth.sso/SAML2/POST';
const SMU_INCORRECT_USER_ID_OR_PASSWORD='Incorrect user ID or password. Type the correct user ID and password, and try again.';
const SMU_RESET_PASSWORD_URL='https://smu.sg/password';

const NUS_LAWPROXY_URL='https://www-lawnet-sg.lawproxy1.nus.edu.sg/lawnet/group/lawnet/legal-research/basic-search';
const NUS_IP_ACCESS_URL='http://www.lawnet.sg/lawnet/ip-access';
const NUS_LOGIN_FORM_URL='https://proxylogin.nus.edu.sg/lawproxy1/public/login_form.asp';
const NUS_INCORRECT_USER_ID_OR_PASSWORD='We are unable to authenticate the Userid and password that was entered. The Domain, NUSNET ID or the password entered could be invalid / mistyped.';
const NUS_HELPDESK_URL='http://www.nus.edu.sg/comcen/gethelp';

const DUPLICATE_LOGIN='<div>Multiple logins with the same User ID are not allowed.</div> <div>To terminate the earlier session, please click on the Remove Button.</div> <div><br><br></div> <div>Sharing of User ID is prohibited. Legal action will be taken if access is unauthorised.</div>';
const DUPLICATE_LOGIN_REMOVE_URL='/lawnet/group/lawnet/duplicate-login?p_p_id=lawnetuniquelogin_WAR_lawnet3portalportlet&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&p_p_col_id=column-2&p_p_col_count=1&_lawnetuniquelogin_WAR_lawnet3portalportlet_loginType=old&_lawnetuniquelogin_WAR_lawnet3portalportlet_javax.portlet.action=removeOldLogin';
export const LOGOUT_REDIRECT_SCRIPT='<script type="text/javascript">location.href="\\x2flawnet\\x2fweb\\x2flawnet\\x2fhome";</script>';
export const LOGOUT_REDIRECT_SCRIPT_2='<script type="text/javascript">location.href="\\x2flawnet\\x2fc";</script>';
export const LOGOUT_REDIRECT_URL='/lawnet/web/lawnet/home';
export const LOGOUT_REDIRECT_URL_2='/lawnet/c';

async function loginSMU(
	username:string,
	password:string,
	domain?:string,
	localAxios?:AxiosInstance
){
	let libproxyPage=await localAxios.get<Document>(
		SMU_LIBPROXY_URL,
		{responseType:'document'}
	);
	let samlRequest=libproxyPage?.data?.querySelector('input[name="SAMLRequest"]')?.getAttribute('value');
	let relayState=libproxyPage?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if(!samlRequest||!relayState)return localAxios; //already authenticated
	let params=new URLSearchParams();
	params.append('SAMLRequest',samlRequest);
	params.append('RelayState',relayState);
	params.append('back','2');
	let adfsLoginPage1=await localAxios.post<Document>(
		SMU_ADFS_LOGIN_PAGE,
		params,
		{responseType:'document'}
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
		adfsLoginPage1=await localAxios.post<Document>(
			adfsLoginPageUrl2,
			params,
			{responseType:'document'}
		);
		while(adfsLoginPage1.status>=300&&adfsLoginPage1.status<400){
			let locationCaseSensitive='';
			for(let i in adfsLoginPage1.headers){
				if(i.toLowerCase()==='location')locationCaseSensitive=i;
			}
			if(!locationCaseSensitive)throw new Error('Redirect without location header');
			adfsLoginPage1=await localAxios.get<Document>(
				adfsLoginPage1.headers[locationCaseSensitive],
				{responseType:'document'}
			);
		}
		if(adfsLoginPage1?.data?.documentElement?.outerHTML?.includes(SMU_INCORRECT_USER_ID_OR_PASSWORD))throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\''+SMU_RESET_PASSWORD_URL+'\',\'_system\');">reset your password</a>.');;
	}
	adfsLoginPage2=adfsLoginPage1;
	let samlResponse=adfsLoginPage2?.data?.querySelector('input[name="SAMLResponse"]')?.getAttribute('value');
	relayState=adfsLoginPage2?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if(!samlResponse||!relayState)throw new Error(adfsLoginPage2?.data?.body?.innerHTML??'No SAML Response or Relay State');
	params=new URLSearchParams();
	params.append('SAMLResponse',samlResponse);
	params.append('RelayState',relayState);
	let basicSearchRedirect=await localAxios.post<Document>(
		SMU_SHIBBOLETH_SSO_URL,
		params,
		{responseType:'document'}
	);
	if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(DUPLICATE_LOGIN)){
		basicSearchRedirect=await localAxios.get<Document>(FIRST_URL.SMU+DUPLICATE_LOGIN_REMOVE_URL)
		for(;;){
			if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT)){
				basicSearchRedirect=await localAxios.get<Document>(FIRST_URL.SMU+LOGOUT_REDIRECT_URL);
				continue;
			}
			if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT_2)){
				basicSearchRedirect=await localAxios.get<Document>(FIRST_URL.SMU+LOGOUT_REDIRECT_URL_2);
				continue;
			}
			break;
		}
	}
	if(basicSearchRedirect?.data?.querySelector('div.alert.alert-error'))throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML);
	if(!basicSearchRedirect?.data?.querySelector('li.userInfo')?.innerHTML?.includes('<i>Welcome'))throw new Error(basicSearchRedirect?.data?.body?.innerHTML??'Unable to reach welcome page');
	return localAxios;
}

async function loginNUS(
	username:string,
	password:string,
	domain?:string,
	localAxios?:AxiosInstance
){
	let lawproxyPage=await localAxios.get<Document>(
		NUS_LAWPROXY_URL,
		{responseType:'document'}
	);
	if(lawproxyPage?.data?.querySelector('div[class="resourcesAccordion"]'))return localAxios; //already authenticated
	let params=new URLSearchParams();
	params.append('domain',domain);
	params.append('user',username);
	params.append('pass',password);
	params.append('url',NUS_IP_ACCESS_URL);
	let loginFormPage=await localAxios.post<Document>(
		NUS_LOGIN_FORM_URL,
		params,
		{responseType:'document'}
	);
	if(loginFormPage?.data?.documentElement?.outerHTML?.includes(NUS_INCORRECT_USER_ID_OR_PASSWORD))throw new Error('Incorrect username or password. Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\''+NUS_HELPDESK_URL+'\',\'_system\');">contact the NUS Helpdesk</a>.');
	let loginFormAction=loginFormPage?.data?.querySelector('form[action]')?.getAttribute('action');
	if(!loginFormAction)throw new Error(loginFormPage?.data?.body?.innerHTML??'Error retrieving NUS login form');
	let basicSearchRedirect=await localAxios.post<Document>(
		loginFormAction,
		params,
		{responseType:'document'}
	);
	if(basicSearchRedirect?.data?.documentElement?.innerHTML?.includes(DUPLICATE_LOGIN)){
		basicSearchRedirect=await localAxios.get<Document>(FIRST_URL.NUS+DUPLICATE_LOGIN_REMOVE_URL)
		for(;;){
			if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT)){
				basicSearchRedirect=await localAxios.get<Document>(FIRST_URL.NUS+LOGOUT_REDIRECT_URL);
				continue;
			}
			if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT_2)){
				basicSearchRedirect=await localAxios.get<Document>(FIRST_URL.NUS+LOGOUT_REDIRECT_URL_2);
				continue;
			}
			break;
		}
	}
	if(basicSearchRedirect?.data?.querySelector('div.alert.alert-error'))throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML);
	if(!basicSearchRedirect?.data?.querySelector('li.userInfo')?.innerHTML?.includes('<i>Welcome'))throw new Error(basicSearchRedirect?.data?.body?.innerHTML??'Unable to reach welcome page');
	return localAxios;
}

async function loginSUSS(
	username:string,
	password:string,
	domain?:string,
	localAxios?:AxiosInstance
):Promise<AxiosInstance>{
	throw new Error('Work in progress');
}

let loginFunctions={
	SMU:loginSMU,
	NUS:loginNUS,
	SUSS:loginSUSS
};

export async function login(params:{
	school:'SMU'|'NUS'|'SUSS',
	username:string,
	password:string,
	domain?:string,
	localAxios?:AxiosInstance
}):Promise<AxiosInstance>{
	if(corsPrefix.trim()&&!corsPrefix.endsWith('/'))corsPrefix+='/';
	return await loginFunctions[params.school](
		params.username,
		params.password,
		params.domain,
		params.localAxios??axios.create({
			baseURL:corsPrefix+FIRST_URL[params.school],
			withCredentials:true,
			responseType:'text'
		})
	);
};

export default login;