import {AxiosInstance} from 'axios';

export async function downloadCitation(params:{
	citation:string,
	format:'html'|'pdf',
	localAxios:AxiosInstance
}):Promise<Blob>{
	return null;
};

export default downloadCitation;