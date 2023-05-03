module.exports = (mongoose) => {
  const userSchema = mongoose.Schema(
    {
      
    },
    { timestamps: true }
  );

  const User = mongoose.model("User", userSchema);
  return User;
};
