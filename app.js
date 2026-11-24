require('dotenv').config()

const express = require('express')
const app = express()

// ============================================================
// PRÁCTICA 7
// ============================================================

// Exportaciones y conexiones
const mongoose = require('mongoose');
const Producto = require('./models/Producto');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {console.log("Conexion con MongoDB exitosa.")})
    .catch((error) => {console.error("La conexion con MongoDB a fallado. Revise su cadena de conexion.\n")});

app.use(express.json())

// "Middleware" para extraer el ID

function ValidarId(req, res, next) {

    const id = req.params.id;
    
    if (!mongoose.isObjectIdOrHexString(id)) { // Validamos que la ID sea de un formato valido.

        return res.status(400).json({ mensaje: 'El ID del producto es invalido.' })
    }

    next(); // Dejamos que express siga su curso
}

// GET - Listar todos los productos
app.get('/productos', async (req, res) => {

    try {

        const productos = await Producto.find().sort({creadoEn: -1}); // Ordenamos los productos buscados de manera descendente (En base al campo de la fecha)
        
        res.json(productos);

    } catch (error) {

        console.error(error)
        return res.status(500).json({mensaje: "Sucedio un error en el servidor."})

    }
})

// GET - Obtener un producto por id
app.get('/productos/:id', ValidarId, async (req, res) => {
    
    const id = req.params.id; // La validacion la se la delegamos al middleware

    try {
        
        const producto = await Producto.findById(id);

        if (!producto) { // Verificamos que el producto si se haya encontrado
            return res.status(404).json({ mensaje: 'Producto no encontrado' })
        }

        res.json(producto); // Lo devolvemos

    } catch (error) {

        console.error(error)
        return res.status(500).json({ mensaje: 'Ha ocurrido un problema en el servidor.' })
    } 
})

// POST /productos - Crear nuevo producto
app.post('/productos', async (req, res) => {
    const {nombre, descripcion, precio} = req.body ?? {};

    const detallesErrores = []; // Arreglo en donde se guardaran los errores que sucedan en la validacion de los datos
    const precioFaltante = precio === undefined || precio === null || precio === ''; // Filtros dento de una variable para no escribir lo mismo varias veces

    if (!nombre || !descripcion || precioFaltante) {

        detallesErrores.push("Todos los campos son obligatorios.")
    }

    if (detallesErrores.length > 0) { // Condicional disparadora del codigo HTTP 400 para hacerlo una sola vez con todos los detalles
        return res.status(400).json({mensaje: "Existen algunos errores en tu peticion.", detallesErrores});
    }   

    // Creamos el objeto con todos sus campos.
    const productoNuevo = {nombre, descripcion, precio};

    try {
        // Mandamos a mongoose a crear un documento con el objeto que habiamos creado
        const productoCreado = await Producto.create(productoNuevo);
        res.status(201).json(productoCreado);

    } catch (error) {

        if (error instanceof mongoose.Error.ValidationError) { // Mostramos en caso de que suceda algun error en la DB, que errores ocurrieron
            Object.values(error.errors).forEach(detalleError => {
                detallesErrores.push(detalleError.message);
            });

            return res.status(400).json({mensaje: "Existen algunos errores en tu peticion.", detallesErrores});

        } else {

            console.error(error)
            return res.status(500).json({ mensaje: 'Ha ocurrido un problema en el servidor.' })
            
        }
    }

})

// PUT /productos/:id - Actualizar producto

app.put('/productos/:id', ValidarId, async (req, res) => {

    const id = req.params.id; // La validacion la se la delegamos al middleware

    const {nombre, descripcion, precio} = req.body ?? {};
    const detallesErrores = []; // Arreglo en donde se guardaran los errores que sucedan en la validacion de los datos
    const precioFaltante = precio === undefined || precio === null || precio === ''; // Filtros dento de una variable para no escribir lo mismo varias veces

    if (!nombre || !descripcion || precioFaltante) {

        detallesErrores.push("Todos los campos son obligatorios.")
    }

    if (detallesErrores.length > 0) { // Metodo disparador del codigo HTTP 400 para hacerlo una sola vez con todos los detalles
        return res.status(400).json({mensaje: "Existen algunos errores en tu peticion.", detallesErrores});
    }

    try {

        const producto = await Producto.findByIdAndUpdate( // Usamos el metodo para hacer Update de una vez
            id, 
            {nombre, descripcion, precio}, 
            {returnDocument: 'after', runValidators: true});

        if (!producto) { // Al especificar el returnDocument en after, debe de devolvernos el documento que actualizamos. Y con el validamos
            return res.status(404).json({ mensaje: 'El producto que has intentado modificar no existe.' })
        }

        res.status(200).json(producto);

    } catch (error) {

        if (error instanceof mongoose.Error.ValidationError) { // Mostramos en caso de que suceda algun error en la DB, que errores ocurrieron

            Object.values(error.errors).forEach(detalleError => {
                detallesErrores.push(detalleError.message);
            });

        } else if (error instanceof mongoose.Error.CastError) { // Este es en caso de que suceda algun error con el ID al buscar en la DB

            detallesErrores.push(error.message)
            
        } else {

            console.error(error)
            return res.status(500).json({ mensaje: 'Ha ocurrido un problema en el servidor.' })
            
        }

        return res.status(400).json({mensaje: "Existen algunos errores en tu peticion.", detallesErrores});
    }

})

// DELETE /productos/:id - Eliminar producto
app.delete('/productos/:id', ValidarId, async (req, res) => {

    const id = req.params.id; // La validacion la se la delegamos al middleware

    try {

        const productoEliminado = await Producto.findByIdAndDelete(id); // Pasamos el ID ya validado al metodo

        if (!productoEliminado) { // Nos retorna el producto eliminado y ese mismo lo usamos para validar si se realizo la operacion
            return res.status(404).json({ mensaje: 'El producto que has intentado eliminar no existe.' })
        }

        res.status(200).json({mensaje: "El producto ha sido eliminado correctamente.", producto: productoEliminado}); // Mensaje de respuesta con el producto

    } catch (error) {
        console.error(error) // En caso de que suceda un error interno, printea al servidor y muestra un mensaje controlado
        res.status(500).json({mensaje: "Ha ocurrido un problema en el servidor."})
    }

})

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000')
})
