const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


const PORT = 3000;
const PATH_PRODUCTOS = path.join(__dirname, "productos.json");


// funcion 
const leerProducto =()=>{
    //1 lee el archivo plano
    const datos = fs.readFileSync(PATH_PRODUCTOS, "utf-8");
    //2 Convertir el texto en Array
    return JSON.parse(datos);
};
const guardarProducto = (lista) =>{
    fs.writeFileSync(PATH_PRODUCTOS, JSON.stringify(lista, null, 2));
};
// Ruta Raiz
app.get("/",(req, res) =>{
    res.send("Servidor Funcionando");
});

// Datos de todos los productos
app.get("/productos",(req, res)=>{
    res.json(leerProducto());
});

// Productos por ID
app.get("/productos/:id",(req, res)=>{
    const id = parseInt(req.params.id);
    const listaProductos = leerProducto(); 
    const producto = listaProductos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            error: "Producto no Encontrado"
        });
    }
    res.json(producto);
});

// Productos por Precio
app.get("/productos/buscar/:precio",(req,res) => {
    const precioBusqueda = parseInt(req.params.precio);
    const listaProductos = leerProducto();

    // filtro para todo lo que consida
    const resultado = listaProductos.filter(p => p.precio === precioBusqueda);

    if (resultado.length === 0) {
    return res.status(404).json({
         error: `No Conside precio del Producto: ${precioBusqueda}`
        });
    }
    res.json(resultado);
});
//ruta ventas
app.get(`/ventas`,(req,res) =>{
    try {
        const data =fs.readFileSync(`ventas.json`,`utf-8`);
        res.json(JSON.parse(data));
    } catch (error){
        res.json([]);
    }
});

// ruta POST
app.post("/productos",(req, res)=>{

    // datos de la peticion
    const { nombre, precio } = req.body;

    // datos in correctos, error 400
    if (!nombre || !precio)
        return res.status(400).json({error: "faltan datos" });

    const listaProductos = leerProducto();

    // nuevo objeto ID automatico
    const nuevoProducto = {
        id:listaProductos.length > 0 ? listaProductos[
            listaProductos.length - 1].id + 1 : 1,
        nombre,
        precio
    };
    // Solicitud correcta (codigo 201: creado)
    listaProductos.push(nuevoProducto);
    guardarProducto(listaProductos);
    res.status(201).json(nuevoProducto);
    
});
//ruta de borrado ID
app.delete("/productos/:id",(req, res)=>{
    const id = parseInt(req.params.id);
    const listaProductos = leerProducto();
    // filtra; lista donde no exista ID
    const nuevaLista = listaProductos.filter(p => p.id !== id);
    // Si no se borra nada avisar
    if(listaProductos.length === nuevaLista.length){
        return res.status(404).json({error: "No existe el producto"});
    }
    // limpeza; guardar nueva lista
    guardarProducto(nuevaLista);
    res.json({ mesaje: `Productos con ID ${id} borrado exitosamente`});
});

//ruta actualizacion de producto por ID
app.put("/productos/:id",(req, res) =>{
    const id = parseInt(req.params.id);
    const {nombre, precio} = req.body;
    const listaProductos = leerProducto();

    const indice = listaProductos.findIndex(p => p.id === id);
    if (indice === -1){
        return res.status(404).json({ error: "Producto no Encontrado"});
    }
    if (nombre)listaProductos[indice].nombre = nombre;
    if (precio)listaProductos[indice].precio = precio;

    guardarProducto(listaProductos);

    res.json({
        mesaje: "Producto actulizado con éxito",
        producto: listaProductos[indice]
    });
});

// ruta ventas 
const PATH_VENTAS = path.join(__dirname, "ventas.json");

app.post("/ventas", (req, res) => {
    const nuevaVenta = req.body; // Recibe { items: [...], total: 1000 }
    let ventas = [];

    // Si ya existen ventas, las leemos primero
    if (fs.existsSync(PATH_VENTAS)) {
        ventas = JSON.parse(fs.readFileSync(PATH_VENTAS, "utf-8"));
    }

    // Agregamos la nueva con la fecha actual
    ventas.push({
        id: ventas.length + 1,
        fecha: new Date().toLocaleString(),
        ...nuevaVenta
    });

    fs.writeFileSync(PATH_VENTAS, JSON.stringify(ventas, null, 2));
    res.json({ mensaje: "Venta guardada con éxito" });
});


app.listen(PORT,() =>{
    console.log("Servidos Corriendo en el Puerto " + `${PORT}`);
});
