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
        // Usamos comillas invertidas `` y nos aseguramos de que los strings vayan entre comillas simples ''
        div.innerHTML += `
           <div class="col-md-4 mb-3">
                <div class="card h-100 text-center p-3 shadow-sm border-0" 
                     style="cursor:pointer; background-color: #FFE0B2;" 
                     onclick="agregarAlCarrito('${p.nombre}', ${p.precio})">
                    <div class="fw-bold" style="color: #5D4037;">${p.nombre}</div>
                    <div class="badge bg-white text-dark mt-2">$${p.precio}</div>
                    <div class="small text-muted mt-2">🛒 Agregar</div>
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
    const total = carrito.reduce((s, i) => s + i.precio, 0);

    await fetch(`${API_URL}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: carrito, total })
    });

    alert("¡Venta Exitosa!");
    carrito = [];
    dibujarCarrito();
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

// Modifica el DOMContentLoaded para que también cargue ventas
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    cargarVentas(); 
});
