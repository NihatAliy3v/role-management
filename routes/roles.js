const express = require("express");
const router = express.Router();

const Roles = require("../db/models/Roles");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const role_privileges = require("../config/role_privileges");
const RolePrivileges = require("../db/models/RolePrivileges");

router.get("/", async (req, res) => {
  try {
    const roles = await Roles.find({});
    res.json(Response.successResponse(roles));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post("/", async (req, res) => {
  const { body } = req;
  try {
    if (!body.role_name) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "role_name field must be filled"
      );
    }
    if (
      !body.permissions ||
      !Array.isArray(body.permissions) ||
      body.permissions.length == 0
    ) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "permissions field must be filled"
      );
    }

    const role = new Roles({
      role_name: body.role_name,
      is_active: true,
    });
    await role.save();

    for (let i = 0; i < body.permissions.length; i++) {
      const rolePrivs = new RolePrivileges({
        role_id: role._id,
        permission: body.permissions[i],
      });
      await rolePrivs.save();
    }
    res.json(Response.successResponse(role));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.put("/:id", async (req, res) => {
  const { body, params } = req;
  try {
    if (!params.id) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "id field must be filled"
      );
    }
    if (
      body.permissions &&
      Array.isArray(body.permissions) &&
      body.permissions.length >= 0
    ) {
      let permissions = await RolePrivileges.find({ role_id: params.id });
      let removedPermissions = permissions.filter(
        (x) => !body.permissions.includes(x.permission)
      );
      let newPermissions = body.permissions.filter(
        (x) => !permissions.map((p) => p.permission).includes(x)
      );

      if (removedPermissions.length > 0) {
        await RolePrivileges.deleteMany({
          _id: { $in: removedPermissions.map((x) => x._id) },
        });
      }
      if (newPermissions.length > 0) {
        for (let i = 0; i < newPermissions.length; i++) {
          const rolePrivs = new RolePrivileges({
            role_id: params.id,
            permission: newPermissions[i],
          });
          await rolePrivs.save();
        }
      }
    }

    const update = {};
    if (body.role_name) update.role_name = body.role_name;
    if (typeof body.is_active === "boolean") update.is_active = body.is_active;
    await Roles.updateOne({ _id: params.id }, update);
    res.json(Response.successResponse({ message: "update edildi" }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.delete("/:id", async (req, res) => {
  const { params } = req;
  console.log("params", params);

  try {
    console.log("params", params);
    if (!params.id) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "id field must be filled"
      );
    }

    const roles = await Roles.deleteOne({ _id: params.id });
    if (roles.deletedCount === 0) {
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "Id is wrong!"
      );
    }
    res.json(Response.successResponse({ message: "silindi" }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get("/rolePrivileges", async (req, res) => {
  res.json(role_privileges);
});

module.exports = router;
