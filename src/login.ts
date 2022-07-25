import axios,{
	AxiosInstance
}from 'axios';

export let corsPrefix='';
export const FIRST_URL='';

export async function login(params:{
	school:'SMU'|'NUS'|'SUSS',
	username:string,
	password:string,
	domain?:string,
	localAxios?:AxiosInstance
}):Promise<AxiosInstance>{
	if(corsPrefix&&!corsPrefix.endsWith('/'))corsPrefix+='/';
	let axiosInstance=params.localAxios??axios.create({
		baseURL:corsPrefix+FIRST_URL,
		withCredentials:true,
		responseType:'text'
	});
	return axiosInstance;
};

export default login;