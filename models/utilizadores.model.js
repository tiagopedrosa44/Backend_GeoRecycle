module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      tipo: { type: String, default: "user" },
      nome: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      pontos: { type: Number, default: 0 },
      nivel: { type: Number, default: 0 },
      moedas: { type: Number, default: 0 },
      utilizacoes: { type: Number, default: 0 },
      ecopontosRegistados: { type: Number, default: 0 },
      biografia: String,
      badges: [],
      referral: String,
    },
    { timestamps: false }
  );
  const User = mongoose.model("User", schema);
  return User;
};
