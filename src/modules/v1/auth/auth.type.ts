export interface LoginBody {
  email: string;
  password: string;
}
export interface GoogleLogincallbackQuery {
  code: string;
}
export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

export interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}
