import { ApiConfig } from '../constants/ApiConfig';
import http from '@ohos.net.http';

interface ApiResponse<T> {
  readonly code?: number;
  readonly msg?: string;
  readonly data?: T;
}

export interface CaptchaPayload {
  readonly captchaEnabled?: boolean;
  readonly img?: string;
  readonly uuid?: string;
}

export interface LoginRequest {
  readonly username: string;
  readonly password: string;
  readonly code?: string;
  readonly uuid?: string;
}

interface UserProfile {
  userId?: number;
  userName?: string;
  nickName?: string;
  avatar?: string;
}

export interface LoginResult {
  readonly token?: string;
  readonly loginTime?: string;
  readonly expireTime?: string;
  readonly user?: UserProfile;
}

export interface UserInfoResponse {
  readonly user?: UserProfile;
  readonly roles?: string[];
  readonly permissions?: string[];
}

interface RequestOptions {
  readonly method: http.RequestMethod;
  readonly headers: RequestHeaders;
  readonly body?: string;
}

interface RequestHeaders {
  contentType?: string;
  authorization?: string;
  isToken?: string;
}

async function httpRequest<T>(path: string, options?: Partial<RequestOptions>): Promise<T> {
  const url = `${ApiConfig.BASE_URL}${path}`;
  console.info('HTTP: requesting ' + url);

  const httpRequest = http.createHttp();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (options?.headers) {
    const optHeaders = options.headers;
    if (optHeaders.contentType) {
      headers['Content-Type'] = optHeaders.contentType;
    }
    if (optHeaders.authorization) {
      headers['Authorization'] = optHeaders.authorization;
    }
    if (optHeaders.isToken) {
      headers['isToken'] = optHeaders.isToken;
    }
  }

  try {
    const response = await httpRequest.request(url, {
      method: options?.method ?? http.RequestMethod.GET,
      header: headers,
      extraData: options?.body,
      expectDataType: http.HttpDataType.STRING,
      readTimeout: 15000,
      connectTimeout: 15000
    });

    const payloadText = response.result as string;
    const responseData = payloadText
      ? (JSON.parse(payloadText) as ApiResponse<T>)
      : { code: response.responseCode } as ApiResponse<T>;

    const code = responseData.code ?? response.responseCode;
    if (code !== 200) {
      throw new Error(responseData.msg ?? '请求失败: ' + code);
    }

    // 处理数据返回
    if (responseData.data !== undefined) {
      return responseData.data as T;
    }
    return responseData as Object as T;
  } catch (error) {
    console.error('HTTP: request error: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(JSON.stringify(error));
  } finally {
    httpRequest.destroy();
  }
}

export async function getCodeImg(): Promise<CaptchaPayload> {
  const headers: RequestHeaders = {
    isToken: 'false'
  };
  return httpRequest<CaptchaPayload>(ApiConfig.CAPTCHA_PATH, {
    method: http.RequestMethod.GET,
    headers
  });
}

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const headers: RequestHeaders = {
    isToken: 'false'
  };
  return httpRequest<LoginResult>(ApiConfig.LOGIN_PATH, {
    method: http.RequestMethod.POST,
    headers,
    body: JSON.stringify(payload)
  });
}

export async function getInfo(token: string): Promise<UserInfoResponse> {
  if (!token) {
    throw new Error('缺少登录令牌');
  }
  const headers: RequestHeaders = {
    authorization: `Bearer ${token}`
  };
  return httpRequest<UserInfoResponse>(ApiConfig.GET_INFO_PATH, {
    method: http.RequestMethod.GET,
    headers
  });
}
