require('dotenv').config()

const express = require('express')
const app = express()

// Exportaciones y conexiones
const mongoose = require('mongoose');
const Producto = require('./models/Producto');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {console.log("Conexion con MongoDB exitosa.")})
    .catch((error) => {console.error("La conexion con MongoDB a fallado. Revise su cadena de conexion.\n")});

app.use(express.json())

const productos = [
    {
        id: 1,
        nombre: 'Teclado inalambrico',
        descripcion: 'Teclado 101 teclas idioma ingles',
        precio: 1500.00
    },
    {
        id: 2,
        nombre: 'Mouse inalambrico',
        descripcion: 'Mouse optico inalambrico.',
        precio: 600.00
    },
    {
        id: 3,
        nombre: 'Monitor 23.5 pulgadas full hd',
        descripcion: 'Monitor Full HD panel IPS',
        precio: 6500.00
    }
]

// GET - Listar todos los productos
app.get('/productos', (req, res) => {
    res.json(productos)
})

// GET - Obtener un producto por id
app.get('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const producto = productos.find(p => p.id === id)

    if (!producto) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' })
    }

    res.json(producto)
})


// ============================================================
// PRÁCTICA 7
// ============================================================

// POST /productos - Crear nuevo producto
app.post('/productos', (req, res) => {
    const {nombre, descripcion, precio} = req.body;

    const detallesErrores = []; // Arreglo en donde se guardaran los errores que sucedan en la validacion de los datos
    const precioFaltante = precio === undefined || precio === null || precio === ''; // Filtros dento de una variable para no escribir lo mismo varias veces

    if (!nombre || !descripcion || precioFaltante) {

        detallesErrores.push("Todos los campos son obligatorios.")
    }

    const precioSanitizado = parseFloat(precio);

    if (!precioFaltante) { // Bucle if para que dependiendo de que suceda, coloque un mensaje u otro.
        if (Number.isNaN(precioSanitizado)) {
            detallesErrores.push("Debe introducir un precio valido.");
        } else if (precioSanitizado <= 0) {
            detallesErrores.push("El precio debe ser mayor a cero.");
        }
    }

    if (detallesErrores.length > 0) { // Metodo disparador del codigo HTTP 400 para hacerlo una sola vez con todos los detalles.
        return res.status(400).json({mensaje: "Existen algunos errores en tu peticion.", detallesErrores});
    }   

    const idNuevo = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1; // Asignacion automatica del ID en base a la lista para el nuevo producto.
    const nombreSanitizado = nombre.trim();

    // Creamos el objeto con todos sus campos.
    const productoNuevo = {id: idNuevo, nombre: nombreSanitizado, descripcion: descripcion, precio: precioSanitizado}

    productos.push(productoNuevo);
    res.status(201).json(productoNuevo);

})

// PUT /productos/:id - Actualizar producto

app.put('/productos/:id', (req, res) => {

    const id = parseInt(req.params.id)
    const indiceEncontrado = productos.findIndex(p => p.id === id);

    if (indiceEncontrado === -1) {
        return res.status(404).json({ mensaje: 'El producto que has intentado modificar no existe.' })
    }

    const {nombre, descripcion, precio} = req.body;
    const detallesErrores = []; // Arreglo en donde se guardaran los errores que sucedan en la validacion de los datos
    const precioFaltante = precio === undefined || precio === null || precio === ''; // Filtros dento de una variable para no escribir lo mismo varias veces.

    if (!nombre || !descripcion || precioFaltante) {

        detallesErrores.push("Todos los campos son obligatorios.")
    }

    const precioSanitizado = parseFloat(precio);

    if (!precioFaltante) { // Bucle if para que dependiendo de que suceda, coloque un mensaje u otro.
        if (Number.isNaN(precioSanitizado)) {
            detallesErrores.push("Debe introducir un precio valido.");
        } else if (precioSanitizado <= 0) {
            detallesErrores.push("El precio debe ser mayor a cero.");
        }
    }

    if (detallesErrores.length > 0) { // Metodo disparador del codigo HTTP 400 para hacerlo una sola vez con todos los detalles.
        return res.status(400).json({mensaje: "Existen algunos errores en tu peticion.", detallesErrores});
    }   

    const nombreSanitizado = nombre.trim();

    // Mantenemos el mismo ID al ingresar la nueva informacion del producto.
    productos[indiceEncontrado] = {id: productos[indiceEncontrado].id, nombre: nombreSanitizado, descripcion: descripcion, precio: precioSanitizado};

    res.status(200).json(productos[indiceEncontrado]);
})


// DELETE /productos/:id - Eliminar producto
app.delete('/productos/:id', (req, res) => {

    const id = parseInt(req.params.id)
    const indiceEncontrado = productos.findIndex(p => p.id === id);

    if (indiceEncontrado === -1) {
        return res.status(404).json({ mensaje: 'El producto que has intentado eliminar no existe.' })
    }

    const productoEliminado = productos.splice(indiceEncontrado, 1)[0]; // Al splice devolver un arreglo, obtengo el unico elemento eliminado.
    res.status(200).json({mensaje: "El producto ha sido eliminado correctamente.", producto: productoEliminado}); // Mensaje de respuesta con el producto.

})

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000')
})
