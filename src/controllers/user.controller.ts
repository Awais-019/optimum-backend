import { Request, Response } from "express";
import constants from "../constants";
import APIHelpers from "../helpers/APIHelpers";
import cryptoHelpers from "../helpers/crypto";
import userService from "../services/user.service";
import logger from "../startup/logger";

export default {
  create: async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (await userService.exists("email", email)) {
      return APIHelpers.sendError(
        res,
        constants.BAD_REQUEST,
        constants.EMAIL_EXISTS_MESSAGE
      );
    }

    const user = await userService.create({
      name,
      email,
      password: cryptoHelpers.encryptPassword(password),
      role,
    });

    userService.sendEmail(user).catch((err) => {
      logger.error(err);
    });

    return APIHelpers.sendSuccess(
      res,
      null,
      constants.SUCCESS,
      constants.SUCCESS_MESSAGE
    );
  },
};
