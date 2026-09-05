import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["user", "citizen", "inspector", "admin"],
      default: "user",
    },
    // Only meaningful for self-registered inspectors: they can log in
    // immediately, but the inspector dashboard stays gated until a govt
    // admin approves them. Every other role defaults to "approved".
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    // Only relevant for inspectors: the base city/state they operate from
    baseLocation: {
      city: String,
      state: String,
      lat: Number,
      lng: Number,
    },
    // Required only for self-registered inspectors: a photo/scan of their
    // government-issued inspector ID, reviewed by an admin before approval.
    govtIdDocument: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
