const express = require("express");
const Response = require("../lib/Response");
const moment = require("moment");
const router = express.Router();
const AuditLogs = require("../db/models/AuditLogs");
router.post("/", async (req, res) => {
  try {
    let body = req.body;
    let query = {};
    let limit = body.limit;
    let skip = body.skip;

    if (body.begin_data && body.end_date) {
      query.created_at = {
        $gte: moment(body.begin_data),
        $lte: moment(body.end_date),
      };
    } else {
      query.created_at = {
        $gte: moment().subtract(1, "day").startOf("day"),
        $lte: moment(),
      };
    }

    if (typeof body.skip !== "number") {
      skip = 0;
    }
    if (typeof body.limit !== "number" || body.limit > 500) {
      limit = 500;
    }
    let auditlogs = await AuditLogs.find(query).sort({create_at:-1}).limit(limit).skip(skip);
    res.json(Response.successResponse(auditlogs));
  } catch (err) {
    const errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
