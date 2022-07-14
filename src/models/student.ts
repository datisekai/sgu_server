import mongoose from "mongoose";
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
  {
    mssv: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    diemtb: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("students", StudentSchema);
