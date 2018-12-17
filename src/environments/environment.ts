// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  envName: 'local',
  APP_NAME: 'Simple-Psych EMR',
  APP_VERSION: '0.0.1',
  SERVER_VERSION: '0.0.1',
  //HUBCOMM_VERSION: '2.5.4',
  /* PREPRODUCTION */

  HOST_NAME: 'http://localhost:8000/#/',

  //ADMIN_PANEL_URL: 'https://devapi.elhubio.com/admin',

  /* DEVELOP */
  API_HTTP_URL: 'http://localhost:3000/', //'https://devapi.elhubio.com/api/',
  //API_SOCKET_URL: 'https://devapi.elhubio.com/',
  //API_SOCKET_URL_CONNECT: 'https://devapi.elhubio.com/faye/',

  /* PREPRODUCTION */
  // API_HTTP_URL: 'https://elhubio.com/api/',
  // API_SOCKET_URL: 'https://elhubio.com/',
  // API_SOCKET_URL_CONNECT: 'https://elhubio.com/faye/',

  /* !!! PRODUCTION !!! */
  // API_HTTP_URL: 'https://api.hubspringhealth.com/api/',
  // API_SOCKET_URL: 'https://api.hubspringhealth.com/',
  // API_SOCKET_URL_CONNECT: 'https://api.hubspringhealth.com/faye/',
  // API_ANALYTICS: 'https://stat.hubspringhealth.com/',

  /* LOCAL SERVER */

  // API_HTTP_URL: 'http://192.168.0.104/api/',
  // API_SOCKET_URL: 'http://192.168.0.104:3005/',


  // API_HTTP_URL:   'http://10.20.10.143/api/',
  // API_SOCKET_URL: 'http://10.20.10.143/',
  // API_SOCKET_URL_CONNECT: 'http://10.20.10.143/faye/',

  // API_HTTP_URL:   'http://10.20.1.200/api/',
  // API_SOCKET_URL: 'http://10.20.1.200/',
  // API_SOCKET_URL_CONNECT: 'http://10.20.1.200/faye/',


  // API_HTTP_URL:   'http://192.168.0.102/api/',
  // API_SOCKET_URL: 'http://192.168.0.102/',
  // API_SOCKET_URL_CONNECT: 'http://192.168.0.102/faye/',
};
