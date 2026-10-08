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
