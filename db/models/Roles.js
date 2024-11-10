const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");

const schema = mongoose.Schema(
  {
    role_name: { type: String, required: true,unique:true },
    is_active: { type: Boolean, default: true },
    created_by: { type: mongoose.SchemaTypes.ObjectId, required: false },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

class Roles extends mongoose.Model {
  static async deleteOne(query) {
    const rolePriv = await RolePrivileges.deleteMany({ role_id: query._id });
    const result = await super.deleteOne(query);
    console.log("rolePriv",rolePriv);
    console.log("result",result);
    return result;
  }
}
schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema);
