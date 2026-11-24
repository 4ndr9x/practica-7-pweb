const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre del producto es obligatorio."],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, "La descripcion es obligatoria."],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, "El precio es obligatorio."],
        min: [0, "El precio no puede ser negativo."]
    },
    creadoEn: {
        type: Date,
        default: Date.now
    }
});

const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;