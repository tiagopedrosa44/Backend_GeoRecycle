module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            morada: { type: String, required: true },
            coordenadas: { type: Object, required: true },
            utilizacoes: { type: Number, default: 0 },
            vezesRegistado: { type: Number, default: 0 },
            dataCriacao: { type: Date },
            foto: { type: String, required: true },
            vistoAdmin: { type: Boolean, default: false },
            ecopontoAprovado: { type: Boolean, default: false }
        },
        { timestamps: false }
    );
    const Ecoponto = mongoose.model("Ecoponto", schema);
    return Ecoponto;
};


