const express = require("express");
const Categories = require("../db/models/Caregories");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const AuditLogs = require("../lib/AuditLogs");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let categories = await Categories.find({});
    res.json(Response.successResponse(categories));
  } catch (err) {
    res.json(Response.errorResponse(err));
  }
});
router.post("/", async (req, res) => {
  const { body } = req; //req.body
  try {
    if (!body.name)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "name field must be filled"
      );
    const category = new Categories({
      name: body.name,
      is_active: true,
    });
    await category.save();
    AuditLogs.info(req.user?.email,"Categories","Add","Added");
    res.json(Response.successResponse({ message: "elave edildi" }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.put("/:id", async (req, res) => {
  const { body, params } = req; //req.body
  try {
    if (!params.id)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "id field must be filled"
      );
    let update = {};
    if (body.name) {
      update.name = body.name;
    }
    if (typeof body.is_active === "boolean") {
      update.is_active = body.is_active;
    }
    await Categories.updateOne({ _id: params.id }, update);
    res.json(Response.successResponse({ message: "update edildi" }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.delete("/:id", async (req, res) => {
  const { params } = req; //req.body
  try {
    if (!params.id)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validation Error!",
        "id field must be filled"
      );

    const result = await Categories.deleteOne({ _id: params.id });
    console.log(result,"result");
    if (result.deletedCount === 0) {
      throw new CustomError(
        Enum.HTTP_CODES.NOT_FOUND,
        "Not Found",
        "Category not found"
      );
    }
    
    res.json(Response.successResponse({ message: "silindi" }));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});
module.exports = router;
