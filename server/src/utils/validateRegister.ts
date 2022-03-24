import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";
import validator from "validator";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!validator.isEmail(options.email)) {
  return [
      {
        field: "email",
        message: "email is invalid",
      }
    ]
  }

  // username validation
  if (!validator.isLength(options.username, { min: 2 })) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      }
    ]
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include '@' in username",
      }
    ]
  }

  // password validation
  if (!validator.isLength(options.password, { min: 3 })) {
    return [
      {
        field: "password",
        message: "length must be greater than 3",
      }
    ]
  }
  return null;
}