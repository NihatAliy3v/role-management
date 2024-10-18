const moongose = require("mongoose");

const schema = moongose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_active: { type: Boolean, required: true },
    first_name: { type: String, required: true },
    last_name: String,
    phone_number: String,
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

class Users extends mongoose.Model {}
schema.loadClass(Users);
module.exports = mongoose.model("users", schema);
