import { ErrorHandler } from "../../../helper";
import { compare } from "../../../utils/hash";
import { throwError } from "../../../utils/helper";
import { signAccessToken, signRefreshToken } from "../../../utils/jwt";
import { NOT_ACCEPTABLE, NOT_FOUND, UNAUTHORIZED } from "../../../utils/status-codes";
import AuthRepository from "./auth.repository";
import { LoginBody } from "./auth.type";

class AuthService {
  private readonly repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }
  async login(body: LoginBody) {
    try {
      const { email, password } = body;
      const user = await this.repository.getUserByEmail(email, true);
      if (!user) {
        throw new ErrorHandler(NOT_FOUND, "User with this email does not exists");
      }
      if (!user.password) {
        throw new ErrorHandler(
          NOT_ACCEPTABLE,
          "You have not set a password for your account. Please login with otp and set password from profile section.",
        );
      }
      const isCorrectPassword = await compare(user.password, password);
      if (!isCorrectPassword) {
        throw new ErrorHandler(UNAUTHORIZED, "Invalid Password");
      }
      const userDetails = await this.repository.getUserById(user.id);
      const payload = {
        userId: user.id,
        roleId: user.roleId,
        tenantId: user.tenantId,
      };
      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);
      return {
        userDetails,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throwError(error);
    }
  }
}
export default AuthService;
