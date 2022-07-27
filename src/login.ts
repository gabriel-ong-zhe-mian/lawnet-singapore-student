import axios,{
	AxiosInstance
}from 'axios';

export let corsPrefix='';
export const FIRST_URL={
	SMU:'https://www-lawnet-sg.libproxy.smu.edu.sg'
};
const DUPLICATE_LOGIN_REMOVE_URL='/lawnet/group/lawnet/duplicate-login?p_p_id=lawnetuniquelogin_WAR_lawnet3portalportlet&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&p_p_col_id=column-2&p_p_col_count=1&_lawnetuniquelogin_WAR_lawnet3portalportlet_loginType=old&_lawnetuniquelogin_WAR_lawnet3portalportlet_javax.portlet.action=removeOldLogin';
const LOGOUT_REDIRECT_SCRIPT='<script type="text/javascript">location.href="\\x2flawnet\\x2fweb\\x2flawnet\\x2fhome";</script>';
const LOGOUT_REDIRECT_SCRIPT_2='<script type="text/javascript">location.href="\\x2flawnet\\x2fc";</script>';
const LOGOUT_REDIRECT_URL='/lawnet/web/lawnet/home';
const LOGOUT_REDIRECT_URL_2='/lawnet/c';

async function loginSMU(
	username:string,
	password:string,
	localAxios?:AxiosInstance
){
	let libproxyPage=await localAxios.get<Document>(
		'https://login.libproxy.smu.edu.sg/login?auth=shibboleth&url=https://www.lawnet.sg/lawnet/web/lawnet/ip-access',
		{responseType:'document'}
	);
	let samlRequest=libproxyPage?.data?.querySelector('input[name="SAMLRequest"]')?.getAttribute('value');
	let relayState=libproxyPage?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if(!samlRequest||!relayState)return localAxios; //already authenticated
	let params=new URLSearchParams();
	params.append('SAMLRequest',samlRequest);
	params.append('RelayState',relayState);
	params.append('UserName',username);
	params.append('Password',password);
	params.append('AuthMethod','FormsAuthentication');
	let adfsLoginPage=await localAxios.post<Document>(
		'https://login.smu.edu.sg/adfs/ls/',
		params,
		{responseType:'document'}
	);
	let samlResponse=adfsLoginPage?.data?.querySelector('input[name="SAMLResponse"]')?.getAttribute('value');
	relayState=adfsLoginPage?.data?.querySelector('input[name="RelayState"]')?.getAttribute('value');
	if(!samlResponse||!relayState)throw new Error(adfsLoginPage?.data?.documentElement?.outerHTML??'No SAML Response or Relay State');
	params=new URLSearchParams();
	params.append('SAMLResponse',samlResponse);
	params.append('RelayState',relayState);
	let basicSearchRedirect=await localAxios.post<Document>(
		'https://login.libproxy.smu.edu.sg/Shibboleth.sso/SAML2/POST',
		params,
		{responseType:'document'}
	);
	if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes('<div>Multiple logins with the same User ID are not allowed.</div> <div>To terminate the earlier session, please click on the Remove Button.</div> <div><br><br></div> <div>Sharing of User ID is prohibited. Legal action will be taken if access is unauthorised.</div>')){
		basicSearchRedirect=await localAxios.get<Document>(FIRST_URL['SMU']+DUPLICATE_LOGIN_REMOVE_URL)
		for(;;){
			if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT)){
				basicSearchRedirect=await localAxios.get<Document>(FIRST_URL['SMU']+LOGOUT_REDIRECT_URL);
				continue;
			}
			if(basicSearchRedirect?.data?.documentElement?.outerHTML?.includes(LOGOUT_REDIRECT_SCRIPT_2)){
				basicSearchRedirect=await localAxios.get<Document>(FIRST_URL['SMU']+LOGOUT_REDIRECT_URL_2);
				continue;
			}
			break;
		}
	}
	if(basicSearchRedirect?.data?.querySelector('div.alert.alert-error'))throw new Error(basicSearchRedirect.data.querySelector('div.alert.alert-error').innerHTML+' Too many wrong attempts will result in your account being locked. If in doubt, <a href="javascript:window.open(\'https://www.lawnet.sg/lawnet/web/lawnet/forgot-password?p_p_id=58&p_p_lifecycle=0&p_p_col_id=column-1&p_p_col_count=2\',\'_system\');">reset your password</a>.');
	if(!basicSearchRedirect?.data?.querySelector('li.userInfo')?.innerHTML?.includes('<i>Welcome'))throw new Error(basicSearchRedirect?.data?.documentElement?.outerHTML??'Unable to reach welcome page');
	return localAxios;
}

async function loginNUS(
	username:string,
	password:string,
	localAxios?:AxiosInstance
){
	return localAxios;
}

async function loginSUSS(
	username:string,
	password:string,
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
	localAxios?:AxiosInstance
}):Promise<AxiosInstance>{
	if(corsPrefix&&!corsPrefix.endsWith('/'))corsPrefix+='/';
	return await loginFunctions[params.school](
		params.username,
		params.password,
		params.localAxios??axios.create({
			baseURL:corsPrefix+FIRST_URL,
			withCredentials:true,
			responseType:'text'
		})
	);
};

export default login;