module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      nome: { type: String, required: true },
      preço: { type: Number, required: true },
      foto: { type: String, required: true },
      stock: { type: Number, required: true },
    },
    { timestamps: false }
  );
  const Item = mongoose.model("Item", schema);
  return Item;
};
