export interface ApiConfigInterface {
  readonly BASE_URL: string;
  readonly LOGIN_PATH: string;
  readonly CAPTCHA_PATH: string;
  readonly GET_INFO_PATH: string;
}

export const ApiConfig: ApiConfigInterface = {
  BASE_URL: 'http://172.16.18.9:8080',
  LOGIN_PATH: '/login',
  CAPTCHA_PATH: '/captchaImage',
  GET_INFO_PATH: '/getInfo'
};
