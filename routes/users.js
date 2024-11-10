const express = require("express");
const router = express.Router();
const Users = require("../db/models/Users");
const Response = require("../lib/Response");
const bcrypt = require("bcrypt-nodejs");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const Roles = require("../db/models/Roles");
const UserRoles = require("../db/models/UserRoles");
/* GET users listing. */
router.get("/", async (req, res, next) => {
  try {
    const users = await Users.find({});
    res.json(Response.successResponse(users));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/", async (req, res, next) => {
  const { body } = req;
  try {
    if (!body.email)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Email is required",
        "The 'email' field is missing in the request body"
      );
    if (!body.password)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "password is required",
        "The 'password' field is missing in the request body"
      );
    if (!body.first_name)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "first_name is required",
        "The 'first_name' field is missing in the request body"
      );
    if (!body.roles || !Array.isArray(body.roles) || body.roles.length == 0) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "roles field must be an array"
      );
    }
    const roles = await Roles.find({_id:{$in:body.roles}});
    if (roles.length == 0) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "roles field must be filled"
      );
    }
    const password = bcrypt.hashSync(
      body.password,
      bcrypt.genSaltSync(8),
      null
    );
    const user = new Users({
      email: body.email,
      password: password,
      is_active: body.is_active,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
    });
    await user.save();
    console.log(roles[0])
    for(let i=0;i<roles.length;i++){
      const userRoles = new UserRoles({
        role_id:roles[i]._id,
        user_id:user._id,
      })
      userRoles.save();
    }
    res.json(Response.successResponse(user));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/register", async (req, res, next) => {
  const { body } = req;
  try {
    if (!body.email)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Email is required",
        "The 'email' field is missing in the request body"
      );
    if (!body.password)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "password is required",
        "The 'password' field is missing in the request body"
      );
    if (!body.first_name)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "first_name is required",
        "The 'first_name' field is missing in the request body"
      );
    const password = bcrypt.hashSync(
      body.password,
      bcrypt.genSaltSync(8),
      null
    );
    const user = new Users({
      email: body.email,
      password: password,
      is_active: body.is_active,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number,
    });
    await user.save();
    const role = new Roles({
      role_name: "SUPER_ADMIN",
      is_active: true,
      created_by: user._id,
    });
    await role.save();
    const userRole = new UserRoles({
      role_id: role._id,
      user_id: user._id,
    });
    await userRole.save();
    res.json(Response.successResponse(user));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
