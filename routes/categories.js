const express = require("express");
const router = express.Router();
const Categories = require("../db/models/Caregories");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
router.get("/", async (req, res, next) => {
  try {
    let categories = await Categories.find({});
    res.json(Response.successResponse(categories));
  } catch (err) {
    res.json(Response.errorResponse(err));
  }
});
router.post("/", async (req, res) => {
  const body = req.body;
  try {
    res.json(Response.successResponse());
    if (!body.name)
      throw new CustomError(
        Enum.HTTP_CODES.BAD_REQUEST,
        "Validddtion Error!",
        "name field must be filled"
      );
    const category = new Categories({
      name: body.name,
      is_active: true,
    });
    category.save();
  } catch (err) {
    res.json(new CustomError(err));
  }
});

module.exports = router;
