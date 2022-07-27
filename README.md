# lawnet-singapore-student

Library to login and logout from LawNet for students in Singapore law schools, and containing the URL prefix for each school from which other LawNet URLs may be accessed to retrieve cases.

Initial support for Singapore Management University and National University of Singapore. Support for Singapore University of Social Sciences is planned.

## Copyright Notice

&copy; 2022 Wilson Foo Yu Kang. All rights reserved except as otherwise expressly provided in writing.

Licensed by Wilson Foo Yu Kang to the sole licensee Custom Automated Systems &reg; Pte Ltd on private and confidential terms which may be revoked with express written notice at any time at the sole and absolute discretion of Wilson Foo Yu Kang. By using and continuing to use this package, all parties agree that they are sub-licensing this package, including where this is pursuant to the LICENSE file containing herein, from Custom Automated Systems &reg; Pte Ltd and are not contracting directly with Wilson Foo Yu Kang, save that Wilson Foo Yu Kang shall be availed of all protections at law including all limitations of liability. Contact sales@customautosys.com for custom licensing terms.

Removal of this Copyright Notice is prohibited.

## Methods

```typescript
login(params:{
	school:'SMU'|'NUS'|'SUSS',
	username:string,
	password:string,
	domain?:string,
	localAxios?:AxiosInstance
}):Promise<AxiosInstance>
```

Logs in to LawNet. If localAxios is null, a new Axios instance is created. The Axios instance should be retained for use with the downloadCitation method.

```typescript
logout(params:{
	school:'SMU'|'NUS'|'SUSS'
	localAxios:AxiosInstance
}):Promise<void>
```

Logs out of LawNet.

## Fields

```typescript
corsPrefix:string
```

URL to a Cross-Origin Resource Sharing proxy.

```typescript
FIRST_URL:{
	SMU:string,
	NUS:string,
	SUSS:string
}
```

The first or base URL for each school's access to LawNet.

## Importing

```typescript
import * as LawnetSingaporeStudent from 'lawnet-singapore-student';
import LawnetSingaporeStudent from 'lawnet-singapore-student'; //default import is the same
import{
	corsPrefix,
	FIRST_URL,
	login,
	logout
}from 'lawnet-singapore-student';
```