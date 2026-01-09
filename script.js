const API_URL = 'http://localhost:3000';
let carrito = [];

// Carga inicial de datos
async function cargarDatos() {
    try {
        const res = await fetch(`${API_URL}/productos`);
        const productos = await res.json();
        if(document.getElementById(`lista-maestra`)){
            dibujarListaMaestra(productos);
        }
        if(document.getElementById(`zona-ventas`)){
            dibujarZonaVentas(productos);
        }
        
    
    } catch (error) {
        console.error("Error conectando al servidor:", error);
    }
}

//  Gestión de Inventario (inventario.html)
function dibujarListaMaestra(productos) {
    const div = document.getElementById('lista-maestra');
    if (!div) return; // Si no existe el div, no hace nada y no da error
    
    div.innerHTML = '';
    productos.forEach(p => {
        div.innerHTML += `
            <div class="item-producto p-2 d-flex justify-content-between align-items-center mb-2 border rounded bg-white">
                <span>${p.nombre} - <b>$${p.precio}</b></span>
                <button class="btn btn-sm btn-link text-danger" onclick="borrarProducto(${p.id})">🗑️</button>
            </div>`;
    });
}

// Función para el Módulo de Historial 
async function cargarVentas() {
    const tabla = document.getElementById('tabla-ventas');
    const granTotalDiv = document.getElementById('gran-total');
    
    if (!tabla) return; // Si no estás en historial.html, se detiene aquí pacíficamente

    try {
        const res = await fetch(`${API_URL}/ventas`);
        const ventas = await res.json();
        
        tabla.innerHTML = '';
        let sumaVentas = 0;

        ventas.forEach((v, index) => {
            sumaVentas += v.total;
            const nombres = v.productos.map(p => p.nombre).join(', ');
            tabla.innerHTML += `
                <tr>
                    <td>#${index + 1}</td>
                    <td>${nombres}</td>
                    <td class="fw-bold text-success">$${v.total}</td>
                </tr>`;
        });
        if(granTotalDiv) granTotalDiv.innerText = `$${sumaVentas}`;
    } catch (e) { console.error("Error en historial:", e); }
}

//  Punto de Venta (Botones grandes para pedidos)
function dibujarZonaVentas(productos) {
    const div = document.getElementById('zona-ventas');
    if (!div) return; 
    div.innerHTML = '';
    
    productos.forEach(p => {
        div.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card h-100 text-center p-3 shadow-sm border-0" style="background-color: #fff9db; border-left: 5px solid #fab005 !important;">
                    <div class="fw-bold" style="color: #5D4037;">${p.nombre}</div>
                    <div class="badge bg-white text-dark mt-2 border">$${p.precio}</div>
                    <button class="btn btn-sm btn-warning mt-3 fw-bold" 
                            onclick="agregarAlCarrito('${p.nombre}', ${p.precio})">
                        🛒 Agregar
                    </button>
                </div>
            </div>`;
    });
}

// Funciones de Carrito
function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    dibujarCarrito();
}

function dibujarCarrito() {
    const div = document.getElementById('detalle-carrito');
    const totalDiv = document.getElementById('total-container');
    const countBadge = document.getElementById('items-count');
    
    // Si no estamos en la página de pedidos, estos elementos no existen, así que salimos
    if (!div || !totalDiv || !countBadge) return;

    div.innerHTML = carrito.length === 0 ? '<p class="text-center m-0">Pedido vacío</p>' : '';
    let total = 0;

    carrito.forEach((item, index) => {
        total += item.precio;
        div.innerHTML += `<div class="small d-flex justify-content-between">
                            <span>${index + 1}. ${item.nombre}</span>
                            <span>$${item.precio}</span>
                          </div>`;
    });

    totalDiv.innerText = `Total: $${total}`;
    countBadge.innerText = `${carrito.length}`;
}

// Acciones con el Servidor (POST, DELETE)
async function crearProducto() {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;

    if (!nombre || !precio) return alert("Faltan datos");

    await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio: parseInt(precio) })
    });

    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    cargarDatos();
}

async function borrarProducto(id) {
    if (confirm("¿Eliminar producto?")) {
        await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
        cargarDatos();
    }
}

async function finalizarPedido() {
    if (carrito.length === 0) return alert("Agrega productos");
    const nombreCliente = prompt("Ingrese el Nombre del Cliente" || "Consumidor Final");
    const total = carrito.reduce((s, i) => s + i.precio, 0);

    try {
        //  Intentamos guardar en el servidor
        const res = await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productos: carrito, total })
        });

        //  Verificamos si la respuesta fue exitosa
        if (res.ok) {
            // Preparamos los datos para la factura
            const datosParaFactura = {
                productos: [...carrito], // Copia del carrito actual
                total: total
            };
            //  ¡GENERAMOS LA FACTURA! 
            generarFactura(datosParaFactura, nombreCliente);
                   
            alert("¡Venta Exitosa y Factura Generada!");

            //  Limpiamos todo
            carrito = [];
            dibujarCarrito();
        } else {
            alert("Hubo un error al procesar la venta en el servidor.");
        }

    } catch (error) {
        console.error("Error en finalizarPedido:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

function cargarParaEditar(nombre, precio) {
    document.getElementById('nombre').value = nombre;
    document.getElementById('precio').value = precio;
}
document.addEventListener(`DOMContentLoaded`,() =>{
cargarDatos();
});

// Función para cargar las ventas desde el servidor
async function cargarVentas() {
    const tabla = document.getElementById('tabla-ventas');
    const granTotalDiv = document.getElementById('gran-total');
    if (!tabla) return; // Solo funciona si estamos en historial.html

    try {
        const res = await fetch(`${API_URL}/ventas`);
        const ventas = await res.json();
        
        tabla.innerHTML = '';
        let sumaVentas = 0;

        ventas.forEach((v, index) => {
            sumaVentas += v.total;
            // Creamos una lista de nombres de productos para la tabla
            const nombresProductos = v.productos.map(p => p.nombre).join(', ');
            
            tabla.innerHTML += `
                <tr>
                    <td>#${index + 1}</td>
                    <td>${nombresProductos}</td>
                    <td class="fw-bold text-success">$${v.total}</td>
                </tr>`;
        });

        granTotalDiv.innerText = `$${sumaVentas}`;
    } catch (error) {
        console.error("Error cargando ventas:", error);
    }
}
function generarFactura(datosVenta, nombreCliente) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Estética de cabecera
    doc.setFillColor(250, 176, 5); // Color naranja/amarillo de tu marca
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MI PANADERÍA ARTESANAL", 105, 25, { align: "center" });

    // Información del Cliente y Venta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE:", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(nombreCliente.toUpperCase(), 45, 55);
    
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 55);
    doc.line(20, 60, 190, 60); 

    // Tabla de productos
    doc.setFont("helvetica", "bold");
    doc.text("Cant.", 20, 70);
    doc.text("Producto", 40, 70);
    doc.text("Subtotal", 170, 70, { align: "right" });
    doc.line(20, 72, 190, 72);

    let y = 80;
    doc.setFont("helvetica", "normal");
    
    datosVenta.productos.forEach((p, index) => {
        doc.text("1", 20, y);
        doc.text(p.nombre, 40, y);
        doc.text(`$${p.precio.toLocaleString()}`, 170, y, { align: "right" });
        y += 10;
    });

    // Total Final
    doc.line(20, y, 190, y);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", 120, y + 15);
    doc.setTextColor(34, 139, 34); // Verde éxito
    doc.text(`$${datosVenta.total.toLocaleString()}`, 170, y + 15, { align: "right" });

    // Pie de página
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text("Gracias por apoyar lo artesanal. ¡Vuelva pronto!", 105, 280, { align: "center" });

    doc.save(`Factura_${nombreCliente.replace(/\s+/g, '_')}.pdf`);
}

// Modifica el DOMContentLoaded para que también cargue ventas
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    cargarVentas(); 
});
