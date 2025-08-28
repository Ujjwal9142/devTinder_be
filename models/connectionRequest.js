const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const con = require("../constants/index");

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          con.requestManagement.STATUS_IGNORED,
          con.requestManagement.STATUS_INTERESTED,
          con.requestManagement.STATUS_ACCEPTED,
          con.requestManagement.STATUS_REJECTED,
        ],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
// A compound index is an index on multiple fields of a document.
// Instead of indexing just one field (like fromUserId), MongoDB creates an index structure that covers two or more fields together.
