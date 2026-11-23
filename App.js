
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Image,
  Pressable,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Colores de ShopGlow
const COLORES = {
  lila: "#B67DE8",
  verde: "#AFE87D",
  fondo: "#F8F5FB",
  texto: "#30283A",
  gris: "#77717E",
  blanco: "#FFFFFF",
  borde: "#E8E0EF",
  lilaClaro: "#F0E5FA",
};
// Productos iniciales de la tienda
const PRODUCTOS_INICIALES = [
  { id: "PROD-001", nombre: "Camiseta básica", categoria: "Moda", precio: 35000, stock: 12, descripcion: "Camiseta cómoda para usar todos los días.", imagen: require("./assets/productos/camiseta_basica.jpg"), valoraciones: [] },
  { id: "PROD-002", nombre: "Bolso casual", categoria: "Moda", precio: 68000, stock: 7, descripcion: "Bolso práctico para llevar tus objetos personales.", imagen: require("./assets/productos/bolso_casual.jpg"), valoraciones: [] },
  { id: "PROD-003", nombre: "Aretes delicados", categoria: "Moda", precio: 22000, stock: 15, descripcion: "Aretes sencillos para complementar tu estilo.", imagen: require("./assets/productos/aretes_delicados.jpg"), valoraciones: [] },
  { id: "PROD-004", nombre: "Kit de cuidado facial", categoria: "Belleza", precio: 59000, stock: 8, descripcion: "Kit básico para complementar tu rutina facial.", imagen: require("./assets/productos/kit_cuidado_facial.jpg"), valoraciones: [] },
  { id: "PROD-005", nombre: "Brillo labial", categoria: "Belleza", precio: 18000, stock: 20, descripcion: "Brillo labial para dar un toque de color.", imagen: require("./assets/productos/brillo_labial.jpg"), valoraciones: [] },
  { id: "PROD-006", nombre: "Espejo compacto", categoria: "Belleza", precio: 15000, stock: 10, descripcion: "Espejo pequeño y práctico para llevar contigo.", imagen: require("./assets/productos/espejo_compacto.jpg"), valoraciones: [] },
  { id: "PROD-007", nombre: "Agenda floral", categoria: "Papelería", precio: 25000, stock: 9, descripcion: "Agenda para organizar tus actividades y apuntes.", imagen: require("./assets/productos/agenda_floral.jpg"), valoraciones: [] },
  { id: "PROD-008", nombre: "Resaltadores x6", categoria: "Papelería", precio: 16000, stock: 18, descripcion: "Seis resaltadores de diferentes colores.", imagen: require("./assets/productos/resaltadores.png"), valoraciones: [] },
  { id: "PROD-009", nombre: "Cuaderno creativo", categoria: "Papelería", precio: 14000, stock: 14, descripcion: "Cuaderno para escribir, dibujar y tomar notas.", imagen: require("./assets/productos/cuaderno.avif"), valoraciones: [] },
  { id: "PROD-010", nombre: "Kit de crochet", categoria: "Manualidades", precio: 42000, stock: 6, descripcion: "Materiales básicos para comenzar un proyecto de crochet.", imagen: require("./assets/productos/kit_crochet.webp"), valoraciones: [] },
  { id: "PROD-011", nombre: "Llavero tejido", categoria: "Manualidades", precio: 12000, stock: 11, descripcion: "Llavero tejido a mano para decorar tus llaves.", imagen: require("./assets/productos/llavero.webp"), valoraciones: [] },
  { id: "PROD-012", nombre: "Hilo de algodón", categoria: "Manualidades", precio: 9000, stock: 25, descripcion: "Hilo de algodón para realizar diferentes manualidades.", imagen: require("./assets/productos/hilo.jpg"), valoraciones: [] },
];
const CATEGORIAS = ["Todas", "Moda", "Belleza", "Papelería", "Manualidades"];
function dinero(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CO");
}
// Componente para crear botones
function Boton({ texto, onPress, tipo = "lila", pequeno = false, desactivado = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactivado}
      style={[
        estilos.boton,
        tipo === "verde" && estilos.botonVerde,
        tipo === "claro" && estilos.botonClaro,
        pequeno && estilos.botonPequeno,
        desactivado && estilos.botonDesactivado,
      ]}
    >
      <Text style={[estilos.textoBoton, tipo === "claro" && estilos.textoBotonClaro]}>
        {texto}
      </Text>
    </Pressable>
  );
}
// Componente para crear campos de texto
function Campo({ titulo, valor, cambiar, ayuda, teclado = "default" }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{titulo}</Text>
      <TextInput
        value={valor}
        onChangeText={cambiar}
        placeholder={ayuda || titulo}
        placeholderTextColor="#A49BAA"
        keyboardType={teclado}
        style={estilos.entrada}
      />
    </View>
  );
}
export default function App() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [favoritos, setFavoritos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pantalla, setPantalla] = useState("Inicio");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("normal");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  // Datos del comprador
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [direccion, setDireccion] = useState("");
  // Cupón de descuento
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(false);
  // Datos para crear o editar productos
  const [idEditando, setIdEditando] = useState(null);
  const [nombreProducto, setNombreProducto] = useState("");
  const [categoriaProducto, setCategoriaProducto] = useState("Moda");
  const [precioProducto, setPrecioProducto] = useState("");
  const [stockProducto, setStockProducto] = useState("");
  const [descripcionProducto, setDescripcionProducto] = useState("");
  // Recuperar carrito y favoritos guardados
  useEffect(() => {
    async function cargarDatos() {
      try {
        const guardado = await AsyncStorage.getItem("shopglow_datos");
        if (guardado) {
          const datos = JSON.parse(guardado);
          if (Array.isArray(datos.carrito)) {
            const carritoSeguro = datos.carrito.filter((item) => {
              const producto = PRODUCTOS_INICIALES.find((p) => p.id === item.id);
              return producto &&
                Number.isInteger(item.cantidad) &&
                item.cantidad > 0 &&
                item.cantidad <= producto.stock;
            });
            setCarrito(carritoSeguro);
          }
          if (Array.isArray(datos.favoritos)) {
            const favoritosSeguros = datos.favoritos.filter((id) =>
              PRODUCTOS_INICIALES.some((producto) => producto.id === id)
            );
            setFavoritos(favoritosSeguros);
          }
        }
      } catch (error) {
        setCarrito([]);
        setFavoritos([]);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);
  // Guardar cambios del carrito y favoritos
  useEffect(() => {
    if (!cargando) {
      AsyncStorage.setItem(
        "shopglow_datos",
        JSON.stringify({ carrito, favoritos })
      ).catch(() => {});
    }
  }, [carrito, favoritos, cargando]);
  // Filtrar y ordenar los productos
  const productosVisibles = productos
    .filter((producto) => {
      const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoria === "Todas" || producto.categoria === categoria;
      return coincideNombre && coincideCategoria;
    })
    .sort((a, b) => {
      if (orden === "menor") return a.precio - b.precio;
      if (orden === "mayor") return b.precio - a.precio;
      return 0;
    });
  // Calcular los valores del carrito
  const subtotal = carrito.reduce(
    (total, item) => total + item.cantidad * item.precio, 0
  );
  const descuento = cuponAplicado ? Math.round(subtotal * 0.10) : 0;
  const subtotalConDescuento = Math.max(0, subtotal - descuento);
  const envio = carrito.length === 0 ? 0 : subtotal >= 150000 ? 0 : 8000;
  const total = subtotalConDescuento + envio;
  const cantidadCarrito = carrito.reduce(
    (totalItems, item) => totalItems + item.cantidad, 0
  );
  function mostrarMensaje(texto) {
    setMensaje(texto);
  }
  function cambiarPantalla(nombrePantalla) {
    setProductoSeleccionado(null);
    setPedidoSeleccionado(null);
    setMensaje("");
    setPantalla(nombrePantalla);
  }
  // Agregar o quitar favoritos
  function alternarFavorito(id) {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter((favorito) => favorito !== id));
      mostrarMensaje("Producto eliminado de favoritos.");
    } else {
      setFavoritos([...favoritos, id]);
      mostrarMensaje("Producto agregado a favoritos.");
    }
  }
  // Agregar productos al carrito
  function agregarAlCarrito(producto) {
    if (producto.stock <= 0) {
      mostrarMensaje("Este producto está agotado.");
      return;
    }
    const linea = carrito.find((item) => item.id === producto.id);
    const cantidadActual = linea ? linea.cantidad : 0;
    if (cantidadActual >= producto.stock) {
      mostrarMensaje("No hay más unidades disponibles.");
      return;
    }
    if (linea) {
      setCarrito(carrito.map((item) =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
      }]);
    }
    mostrarMensaje("Producto agregado al carrito.");
  }
  // Cambiar la cantidad de productos
  function cambiarCantidad(id, cambio) {
    const linea = carrito.find((item) => item.id === id);
    const producto = productos.find((item) => item.id === id);
    if (!linea || !producto) return;
    const nuevaCantidad = linea.cantidad + cambio;
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    if (nuevaCantidad > producto.stock) {
      mostrarMensaje("No puedes superar las existencias disponibles.");
      return;
    }
    setCarrito(carrito.map((item) =>
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    ));
  }
  // Eliminar productos del carrito
  function eliminarDelCarrito(id) {
    setCarrito(carrito.filter((item) => item.id !== id));
    mostrarMensaje("Producto eliminado del carrito.");
  }
  // Aplicar el cupón de descuento
  function aplicarCupon() {
    if (codigoCupon.trim().toUpperCase() === "BIENVENIDO10" && carrito.length > 0) {
      setCuponAplicado(true);
      mostrarMensaje("Cupón aplicado: tienes 10 % de descuento.");
    } else {
      setCuponAplicado(false);
      mostrarMensaje("El cupón no es válido o el carrito está vacío.");
    }
  }
  // Continuar al formulario de compra
  function abrirFormularioCompra() {
    if (carrito.length === 0) {
      mostrarMensaje("Agrega productos antes de continuar.");
      return;
    }
    setPantalla("Datos");
    setMensaje("");
  }
  // Confirmar una compra
  function confirmarCompra() {
    if (!nombre.trim()) {
      mostrarMensaje("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!telefono.trim()) {
      mostrarMensaje("Por favor ingresa tu número de contacto.");
      return;
    }
    if (!municipio.trim()) {
      mostrarMensaje("Por favor ingresa tu municipio.");
      return;
    }
    if (!direccion.trim()) {
      mostrarMensaje("Por favor ingresa tu dirección de entrega.");
      return;
    }
    // Revisar que exista suficiente stock
    for (const item of carrito) {
      const productoActual = productos.find((producto) => producto.id === item.id);
      if (!productoActual || productoActual.stock < item.cantidad) {
        mostrarMensaje("No hay stock suficiente para " + item.nombre + ". Revisa el carrito.");
        return;
      }
    }
    const codigo = "SG-" + Date.now().toString().slice(-7);
    const fecha = new Date().toLocaleString("es-CO");
    const nuevoPedido = {
      codigo,
      fecha,
      comprador: {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        municipio: municipio.trim(),
        direccion: direccion.trim(),
      },
      productos: carrito.map((item) => ({ ...item })),
      subtotal,
      descuento,
      envio,
      total,
    };
    // Descontar las unidades compradas del inventario
    setProductos(productos.map((producto) => {
      const comprado = carrito.find((item) => item.id === producto.id);
      return comprado
        ? { ...producto, stock: producto.stock - comprado.cantidad }
        : producto;
    }));
    setPedidos([nuevoPedido, ...pedidos]);
    setCarrito([]);
    setCuponAplicado(false);
    setCodigoCupon("");
    setNombre("");
    setTelefono("");
    setMunicipio("");
    setDireccion("");
    setPedidoSeleccionado(nuevoPedido);
    setPantalla("Confirmacion");
    setMensaje("");
  }
  // Limpiar el formulario de productos
  function limpiarFormularioProducto() {
    setIdEditando(null);
    setNombreProducto("");
    setCategoriaProducto("Moda");
    setPrecioProducto("");
    setStockProducto("");
    setDescripcionProducto("");
  }
  // Crear o actualizar un producto
  function guardarProducto() {
    const precio = Number(precioProducto);
    const stock = Number(stockProducto);
    if (!nombreProducto.trim() || !descripcionProducto.trim() || descripcionProducto.trim().length < 15) {
      mostrarMensaje("Escribe el nombre y una descripción de mínimo 15 caracteres.");
      return;
    }
    if (!Number.isInteger(precio) || precio <= 0) {
      mostrarMensaje("El precio debe ser un número entero mayor que cero.");
      return;
    }
    if (stockProducto.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      mostrarMensaje("El stock debe ser un número entero igual o mayor que cero.");
      return;
    }
    if (idEditando) {
      setProductos(productos.map((producto) =>
        producto.id === idEditando
          ? {
              ...producto,
              nombre: nombreProducto.trim(),
              categoria: categoriaProducto,
              precio,
              stock,
              descripcion: descripcionProducto.trim(),
            }
          : producto
      ));
      mostrarMensaje("Producto actualizado.");
    } else {
      const nuevoProducto = {
        id: "PROD-" + Date.now(),
        nombre: nombreProducto.trim(),
        categoria: categoriaProducto,
        precio,
        stock,
        descripcion: descripcionProducto.trim(),
        valoraciones: [],
      };
      setProductos([...productos, nuevoProducto]);
      mostrarMensaje("Producto creado correctamente.");
    }
    limpiarFormularioProducto();
  }
  function editarProducto(producto) {
    setIdEditando(producto.id);
    setNombreProducto(producto.nombre);
    setCategoriaProducto(producto.categoria);
    setPrecioProducto(String(producto.precio));
    setStockProducto(String(producto.stock));
    setDescripcionProducto(producto.descripcion);
    setMensaje("Editando: " + producto.nombre);
  }
  // Calificar un producto
  function calificarProducto(producto, nota) {
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      mostrarMensaje("La calificación debe estar entre 1 y 5.");
      return;
    }
    setProductos(productos.map((item) =>
      item.id === producto.id
        ? { ...item, valoraciones: [...(item.valoraciones || []), nota] }
        : item
    ));
    const actualizado = {
      ...producto,
      valoraciones: [...(producto.valoraciones || []), nota],
    };
    setProductoSeleccionado(actualizado);
    mostrarMensaje("Gracias por tu calificación.");
  }
  // Calcular promedio de las calificaciones
  function promedio(producto) {
    const notas = producto.valoraciones || [];
    if (notas.length === 0) return "Sin calificaciones";
    const suma = notas.reduce((totalNotas, nota) => totalNotas + nota, 0);
    return (suma / notas.length).toFixed(1) + " / 5";
  }
  function titulo(texto, subtitulo) {
    return (
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>{texto}</Text>
        {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      </View>
    );
  }
  function mensajeEstado() {
    return mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null;
  }
function tarjetaProducto(producto) {
  const esFavorito = favoritos.includes(producto.id);
  return (
    <View key={producto.id} style={estilos.tarjetaProducto}>
      <Pressable
        onPress={() => {
          setProductoSeleccionado(producto);
          setPantalla("Detalle");
          setMensaje("");
        }}
      >
        <View style={estilos.imagenProducto}>
          {producto.imagen ? (
            <Image
              source={producto.imagen}
              style={estilos.imagenProductoFoto}
              resizeMode="cover"
            />
          ) : (
            <Text style={estilos.inicialProducto}>
              {producto.nombre.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={estilos.categoriaPequena}>
          {producto.categoria.toUpperCase()}
        </Text>
        <Text style={estilos.nombreProducto}>
          {producto.nombre}
        </Text>
        <Text style={estilos.precio}>
          {dinero(producto.precio)}
        </Text>
        <Text style={estilos.disponibilidad}>
          {producto.stock > 0
            ? producto.stock + " disponibles"
            : "Agotado"}
        </Text>
      </Pressable>
      <View style={estilos.filaBotones}>
        <Pressable onPress={() => alternarFavorito(producto.id)}>
          <Text style={estilos.corazon}>
            {esFavorito ? "♥" : "♡"}
          </Text>
        </Pressable>
        <Boton
          texto="Agregar"
          pequeno
          onPress={() => agregarAlCarrito(producto)}
          desactivado={producto.stock === 0}
        />
      </View>
    </View>
  );
}
function pantallaInicio() {
  return (
    <>
      {titulo("ShopGlow", "Todo lo que te inspira en un solo lugar")}
      <View style={estilos.bloqueMarca}>
        <Text style={estilos.marcaIniciales}>SG</Text>
        <View style={{ flex: 1 }}>
          <Text style={estilos.marcaTexto}>
            Descubre algo que te guste
          </Text>
          <Text style={estilos.marcaSubtexto}>
            Moda, belleza, papelería y manualidades.
          </Text>
        </View>
      </View>
      <Campo
        titulo="Buscar productos"
        valor={busqueda}
        cambiar={setBusqueda}
        ayuda="¿Qué estás buscando?"
      />
      <Text style={estilos.seccionTitulo}>Categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={estilos.categorias}
      >
        {CATEGORIAS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategoria(item)}
            style={[
              estilos.chip,
              categoria === item && estilos.chipActivo
            ]}
          >
            <Text
              style={[
                estilos.chipTexto,
                categoria === item && estilos.chipTextoActivo
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={estilos.filaEntre}>
        <Text style={estilos.seccionTitulo}>Productos</Text>
        <View style={estilos.ordenes}>
          <Pressable onPress={() => setOrden("menor")}>
            <Text style={estilos.textoOrden}>Menor precio</Text>
          </Pressable>
          <Pressable onPress={() => setOrden("mayor")}>
            <Text style={estilos.textoOrden}>Mayor precio</Text>
          </Pressable>
          <Pressable onPress={() => setOrden("normal")}>
            <Text style={estilos.textoOrden}>Normal</Text>
          </Pressable>
        </View>
      </View>
      {productosVisibles.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={estilos.vacioTitulo}>
            No encontramos productos
          </Text>
          <Text style={estilos.vacioTexto}>
            Prueba con otra palabra o categoría.
          </Text>
          <Boton
            texto="Ver todos"
            tipo="claro"
            onPress={() => {
              setBusqueda("");
              setCategoria("Todas");
            }}
          />
        </View>
      ) : (
        <View style={estilos.listaProductos}>
          {productosVisibles.map(tarjetaProducto)}
        </View>
      )}
    </>
  );
}
function pantallaDetalle() {
  const producto = productos.find(
    (item) =>
      item.id === (productoSeleccionado && productoSeleccionado.id)
  );
  if (!producto) {
    return <Text>El producto ya no está disponible.</Text>;
  }
  const notas = producto.valoraciones || [];
  return (
    <>
      <Boton
        texto="← Volver al catálogo"
        tipo="claro"
        onPress={() => cambiarPantalla("Inicio")}
      />
      <View style={estilos.detalleImagen}>
        {producto.imagen ? (
          <Image
            source={producto.imagen}
            style={estilos.detalleImagenFoto}
            resizeMode="cover"
          />
        ) : (
          <Text style={estilos.inicialDetalle}>
            {producto.nombre.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text style={estilos.categoriaPequena}>
        {producto.categoria.toUpperCase()}
      </Text>
      <Text style={estilos.detalleNombre}>
        {producto.nombre}
      </Text>
      <Text style={estilos.detallePrecio}>
        {dinero(producto.precio)}
      </Text>
      <Text style={estilos.seccionTitulo}>Descripción</Text>
      <Text style={estilos.parrafo}>
        {producto.descripcion}
      </Text>
      <Text style={estilos.disponibilidadGrande}>
        {producto.stock > 0
          ? producto.stock + " unidades disponibles"
          : "Producto agotado"}
      </Text>
      <Text style={estilos.seccionTitulo}>Valoración</Text>
      <Text style={estilos.parrafo}>
        {promedio(producto)} · {notas.length} valoración(es)
      </Text>
      <View style={estilos.filaEstrellas}>
        {[1, 2, 3, 4, 5].map((nota) => (
          <Pressable
            key={nota}
            onPress={() => calificarProducto(producto, nota)}
          >
            <Text style={estilos.estrella}>★</Text>
            <Text style={estilos.numeroEstrella}>{nota}</Text>
          </Pressable>
        ))}
      </View>
      <Boton
        texto={producto.stock === 0 ? "Producto agotado" : "Agregar al carrito"}
        tipo="verde"
        onPress={() => agregarAlCarrito(producto)}
        desactivado={producto.stock === 0}
      />
      <Boton
        texto={
          favoritos.includes(producto.id)
            ? "Quitar de favoritos"
            : "Agregar a favoritos"
        }
        tipo="claro"
        onPress={() => alternarFavorito(producto.id)}
      />
    </>
  );
}
function pantallaFavoritos() {
  const guardados = productos.filter(
    (producto) => favoritos.includes(producto.id)
  );
  return (
    <>
      {titulo("Mis favoritos", "Los productos que quieres guardar.")}
      {guardados.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={estilos.vacioTitulo}>
            Aún no tienes favoritos
          </Text>
          <Text style={estilos.vacioTexto}>
            Explora el catálogo y guarda los productos que te gusten.
          </Text>
          <Boton
            texto="Ir al catálogo"
            onPress={() => cambiarPantalla("Inicio")}
          />
        </View>
      ) : (
        <View style={estilos.listaProductos}>
          {guardados.map(tarjetaProducto)}
        </View>
      )}
    </>
  );
}

function FilaResumen({ texto, valor, destacado }) {
  return (
    <View style={estilos.filaResumen}>
      <Text
        style={[
          estilos.textoResumen,
          destacado && estilos.totalTexto
        ]}
      >
        {texto}
      </Text>
      <Text
        style={[
          estilos.textoResumen,
          destacado && estilos.totalTexto
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}
function pantallaCarrito() {
  return (
    <>
      {titulo("Mi carrito", "Revisa los productos que seleccionaste.")}
      {carrito.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={estilos.vacioTitulo}>
            Tu carrito está vacío
          </Text>
          <Text style={estilos.vacioTexto}>
            Cuando agregues productos, aparecerán aquí.
          </Text>
          <Boton
            texto="Ver catálogo"
            onPress={() => cambiarPantalla("Inicio")}
          />
        </View>
      ) : (
        carrito.map((item) => (
          <View key={item.id} style={estilos.lineaCarrito}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nombreProducto}>
                {item.nombre}
              </Text>
              <Text style={estilos.precio}>
                {dinero(item.precio)}
              </Text>
              <Text style={estilos.parrafo}>
                Total: {dinero(item.precio * item.cantidad)}
              </Text>
              <View style={estilos.controlesCantidad}>
                <Pressable
                  style={estilos.control}
                  onPress={() => cambiarCantidad(item.id, -1)}
                >
                  <Text style={estilos.controlTexto}>−</Text>
                </Pressable>
                <Text style={estilos.cantidad}>
                  {item.cantidad}
                </Text>
                <Pressable
                  style={estilos.control}
                  onPress={() => cambiarCantidad(item.id, 1)}
                >
                  <Text style={estilos.controlTexto}>+</Text>
                </Pressable>
                <Pressable
                  onPress={() => eliminarDelCarrito(item.id)}
                >
                  <Text style={estilos.eliminar}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Resumen siempre visible para cumplir HU11 · CA04 incluso con carrito vacío */}
      <View style={estilos.resumen}>
        <Text style={estilos.seccionTitulo}>
          Resumen de compra
        </Text>
        <FilaResumen
          texto="Subtotal"
          valor={dinero(subtotal)}
        />
        {descuento > 0 ? (
          <FilaResumen
            texto="Descuento"
            valor={"-" + dinero(descuento)}
          />
        ) : null}
        <FilaResumen
          texto="Envío"
          valor={
            carrito.length === 0
              ? dinero(0)
              : envio === 0
              ? "Gratis"
              : dinero(envio)
          }
        />
        <View style={estilos.divisor} />
        <FilaResumen
          texto="Total"
          valor={dinero(total)}
          destacado
        />
        <Text style={estilos.nota}>
          {carrito.length === 0
            ? "No se cobra envío cuando el carrito está vacío."
            : "El envío cuesta $8.000 si el subtotal es menor a $150.000. Desde ese valor es gratis."}
        </Text>
      </View>

      {carrito.length > 0 ? (
        <>
          <Text style={estilos.seccionTitulo}>
            Cupón de descuento
          </Text>
          <Campo
            titulo="Código"
            valor={codigoCupon}
            cambiar={setCodigoCupon}
            ayuda="BIENVENIDO10"
          />
          <Boton
            texto="Aplicar cupón"
            tipo="claro"
            onPress={aplicarCupon}
          />
          <Boton
            texto="Continuar con la compra"
            tipo="verde"
            onPress={abrirFormularioCompra}
          />
        </>
      ) : null}
    </>
  );
}
function pantallaDatos() {
  return (
    <>
      {titulo(
        "Datos de entrega",
        "Ingresa tus datos para completar el pedido."
      )}
      <Campo
        titulo="Nombre"
        valor={nombre}
        cambiar={setNombre}
        ayuda="Tu nombre"
      />
      <Campo
        titulo="Teléfono"
        valor={telefono}
        cambiar={setTelefono}
        ayuda="Número de contacto"
        teclado="phone-pad"
      />
      <Campo
        titulo="Municipio"
        valor={municipio}
        cambiar={setMunicipio}
        ayuda="Ej. Mosquera"
      />
      <Campo
        titulo="Dirección"
        valor={direccion}
        cambiar={setDireccion}
        ayuda="Dirección de entrega"
      />
      <View style={estilos.resumen}>
        <Text style={estilos.seccionTitulo}>Resumen</Text>
        <FilaResumen
          texto="Productos"
          valor={String(cantidadCarrito)}
        />
        <FilaResumen
          texto="Total estimado"
          valor={dinero(total)}
          destacado
        />
      </View>
<Boton
        texto="Confirmar compra"
        tipo="verde"
        onPress={confirmarCompra}
      />
      <Boton
        texto="Volver al carrito"
        tipo="claro"
        onPress={() => cambiarPantalla("Carrito")}
      />
    </>
  );
}
function pantallaConfirmacion() {
  if (!pedidoSeleccionado) {
    return null;
  }
  return (
    <View style={estilos.confirmacion}>
      <Text style={estilos.iconoExito}>✓</Text>
      <Text style={estilos.detalleNombre}>
        ¡Pedido confirmado!
      </Text>
      <Text style={estilos.parrafo}>
        Tu compra se registró correctamente.
      </Text>
      <View style={estilos.resumen}>
        <FilaResumen
          texto="Código"
          valor={pedidoSeleccionado.codigo}
        />
        <FilaResumen
          texto="Fecha"
          valor={pedidoSeleccionado.fecha}
        />
        <FilaResumen
          texto="Total"
          valor={dinero(pedidoSeleccionado.total)}
          destacado
        />
      </View>
      <Text style={estilos.nota}>
        No se realizó ningún cobro real.
      </Text>
      <Boton
        texto="Ver mis pedidos"
        onPress={() => cambiarPantalla("Historial")}
      />
      <Boton
        texto="Seguir comprando"
        tipo="claro"
        onPress={() => cambiarPantalla("Inicio")}
      />
    </View>
  );
}
function pantallaHistorial() {
  if (
    pedidoSeleccionado &&
    pedidoSeleccionado.codigo &&
    pantalla === "DetallePedido"
  ) {
    return (
      <>
        <Boton
          texto="← Volver al historial"
          tipo="claro"
          onPress={() => {
            setPedidoSeleccionado(null);
            setPantalla("Historial");
          }}
        />
        {titulo("Detalle del pedido", pedidoSeleccionado.codigo)}
        {pedidoSeleccionado.comprador ? (
          <View style={estilos.resumen}>
            <Text style={estilos.seccionTitulo}>Datos del comprador</Text>
            <Text style={estilos.parrafo}>
              Nombre: {pedidoSeleccionado.comprador.nombre}
            </Text>
            <Text style={estilos.parrafo}>
              Teléfono: {pedidoSeleccionado.comprador.telefono}
            </Text>
            <Text style={estilos.parrafo}>
              Municipio: {pedidoSeleccionado.comprador.municipio}
            </Text>
            <Text style={estilos.parrafo}>
              Dirección: {pedidoSeleccionado.comprador.direccion}
            </Text>
            <Text style={estilos.parrafo}>
              Fecha: {pedidoSeleccionado.fecha}
            </Text>
          </View>
        ) : null}
        <Text style={estilos.seccionTitulo}>Artículos comprados</Text>
        {pedidoSeleccionado.productos.map((item, indice) => (
          <View key={indice} style={estilos.lineaCarrito}>
            <Text style={estilos.nombreProducto}>
              {item.nombre}
            </Text>
            <Text style={estilos.parrafo}>
              {item.cantidad} x {dinero(item.precio)}
            </Text>
            <Text style={estilos.precio}>
              {dinero(item.cantidad * item.precio)}
            </Text>
          </View>
        ))}
        <View style={estilos.resumen}>
          <FilaResumen
            texto="Subtotal"
            valor={dinero(pedidoSeleccionado.subtotal)}
          />
          <FilaResumen
            texto="Descuento"
            valor={"-" + dinero(pedidoSeleccionado.descuento)}
          />
          <FilaResumen
            texto="Envío"
            valor={
              pedidoSeleccionado.envio === 0
                ? "Gratis"
                : dinero(pedidoSeleccionado.envio)
            }
          />
          <FilaResumen
            texto="Total"
            valor={dinero(pedidoSeleccionado.total)}
            destacado
          />
        </View>
      </>
    );
  }
  return (
    <>
      {titulo(
        "Historial de pedidos",
        "Consulta tus pedidos y revisa su información."
      )}
      {pedidos.length === 0 ? (
        <View style={estilos.vacio}>
          <Text style={estilos.vacioTitulo}>
            Todavía no tienes pedidos
          </Text>
          <Text style={estilos.vacioTexto}>
            Cuando confirmes una compra, aparecerá aquí.
          </Text>
          <Boton
            texto="Ir al catálogo"
            onPress={() => cambiarPantalla("Inicio")}
          />
        </View>
      ) : (
        pedidos.map((pedido) => (
          <Pressable
            key={pedido.codigo}
            style={estilos.tarjetaPedido}
            onPress={() => {
              setPedidoSeleccionado(pedido);
              setPantalla("DetallePedido");
            }}
          >
            <Text style={estilos.nombreProducto}>
              {pedido.codigo}
            </Text>
            <Text style={estilos.parrafo}>
              {pedido.fecha}
            </Text>
            <Text style={estilos.precio}>
              {dinero(pedido.total)}
            </Text>
            <Text style={estilos.enlace}>
              Ver detalle →
            </Text>
          </Pressable>
        ))
      )}
    </>
  );
}
function pantallaVendedor() {
  return (
    <>
      {titulo(
        "Panel de vendedor",
        "Administra los productos de ShopGlow."
      )}
      <Text style={estilos.seccionTitulo}>
        {idEditando ? "Editar producto" : "Nuevo producto"}
      </Text>
      <Campo
        titulo="Nombre del producto"
        valor={nombreProducto}
        cambiar={setNombreProducto}
      />
      <Text style={estilos.etiqueta}>Categoría</Text>
      <View style={estilos.categoriasFormulario}>
        {CATEGORIAS.filter((item) => item !== "Todas").map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategoriaProducto(item)}
            style={[
              estilos.chip,
              categoriaProducto === item && estilos.chipActivo
            ]}
          >
            <Text
              style={[
                estilos.chipTexto,
                categoriaProducto === item && estilos.chipTextoActivo
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <Campo
        titulo="Precio en pesos"
        valor={precioProducto}
        cambiar={setPrecioProducto}
        teclado="numeric"
      />
      <Campo
        titulo="Stock"
        valor={stockProducto}
        cambiar={setStockProducto}
        teclado="numeric"
      />
      <Campo
        titulo="Descripción (mínimo 15 caracteres)"
        valor={descripcionProducto}
        cambiar={setDescripcionProducto}
      />
      <Boton
        texto={idEditando ? "Guardar cambios" : "Crear producto"}
        tipo="verde"
        onPress={guardarProducto}
      />
      {idEditando ? (
        <Boton
          texto="Cancelar edición"
          tipo="claro"
          onPress={limpiarFormularioProducto}
        />
      ) : null}
      <Text style={estilos.seccionTitulo}>
        Productos registrados
      </Text>
      {productos.map((producto) => (
        <View key={producto.id} style={estilos.lineaVendedor}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nombreProducto}>
              {producto.nombre}
            </Text>
            <Text style={estilos.parrafo}>
              {producto.categoria} · {dinero(producto.precio)} ·
              Stock: {producto.stock}
            </Text>
          </View>
          <Boton
            texto="Editar"
            pequeno
            tipo="claro"
            onPress={() => editarProducto(producto)}
          />
        </View>
      ))}
    </>
  );
}
function contenidoPantalla() {
  if (pantalla === "Inicio") return pantallaInicio();
  if (pantalla === "Detalle") return pantallaDetalle();
  if (pantalla === "Favoritos") return pantallaFavoritos();
  if (pantalla === "Carrito") return pantallaCarrito();
  if (pantalla === "Datos") return pantallaDatos();
  if (pantalla === "Confirmacion") return pantallaConfirmacion();
  if (pantalla === "Historial" || pantalla === "DetallePedido") {
    return pantallaHistorial();
  }
  if (pantalla === "Vendedor") return pantallaVendedor();
  return pantallaInicio();
}
if (cargando) {
  return (
    <SafeAreaView style={estilos.contenedor}>
      <Text style={estilos.titulo}>ShopGlow</Text>
      <Text style={estilos.parrafo}>Cargando tu tienda...</Text>
    </SafeAreaView>
  );
}
return (
  <SafeAreaView style={estilos.contenedor}>
    <StatusBar
      barStyle="dark-content"
      backgroundColor={COLORES.fondo}
    />
    <ScrollView
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
    >
      {contenidoPantalla()}
      {mensajeEstado()}
    </ScrollView>
    {pantalla !== "Detalle" &&
    pantalla !== "Datos" &&
    pantalla !== "Confirmacion" &&
    pantalla !== "DetallePedido" ? (
      <View style={estilos.navegacion}>
        <Boton
          texto="Inicio"
          tipo={pantalla === "Inicio" ? "lila" : "claro"}
          pequeno
          onPress={() => cambiarPantalla("Inicio")}
        />
        <Boton
          texto="♡"
          tipo={pantalla === "Favoritos" ? "lila" : "claro"}
          pequeno
          onPress={() => cambiarPantalla("Favoritos")}
        />
        <Boton
          texto={"Carrito (" + cantidadCarrito + ")"}
          tipo={pantalla === "Carrito" ? "lila" : "claro"}
          pequeno
          onPress={() => cambiarPantalla("Carrito")}
        />
        <Boton
          texto="Historial"
          tipo={pantalla === "Historial" ? "lila" : "claro"}
          pequeno
          onPress={() => cambiarPantalla("Historial")}
        />
        <Boton
          texto="Vender"
          tipo={pantalla === "Vendedor" ? "lila" : "claro"}
          pequeno
          onPress={() => cambiarPantalla("Vendedor")}
        />
      </View>
    ) : null}
  </SafeAreaView>
);
}
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  contenido: {
    padding: 18,
    paddingBottom: 30
  },
  encabezado: {
    marginBottom: 18
  },
  titulo: {
    fontSize: 29,
    fontWeight: "800",
    color: COLORES.texto
  },
  subtitulo: {
    fontSize: 14,
    color: COLORES.gris,
    marginTop: 4
  },
  bloqueMarca: {
    backgroundColor: COLORES.lilaClaro,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18
  },
  marcaIniciales: {
    backgroundColor: COLORES.lila,
    color: COLORES.blanco,
    fontSize: 25,
    fontWeight: "800",
    padding: 13,
    borderRadius: 13,
    marginRight: 12
  },
  marcaTexto: {
    color: COLORES.texto,
    fontSize: 16,
    fontWeight: "700"
  },
  marcaSubtexto: {
    color: COLORES.gris,
    fontSize: 12,
    marginTop: 4
  },
  campo: {
    marginBottom: 12
  },
  etiqueta: {
    color: COLORES.texto,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6
  },
  entrada: {
    backgroundColor: COLORES.blanco,
    borderColor: COLORES.borde,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: COLORES.texto
  },
  seccionTitulo: {
    color: COLORES.texto,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 10
  },
  categorias: {
    flexGrow: 0,
    marginBottom: 12
  },
  chip: {
    backgroundColor: COLORES.blanco,
    borderColor: COLORES.borde,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 20,
    marginRight: 7,
    marginBottom: 5
  },
  chipActivo: {
    backgroundColor: COLORES.lila,
    borderColor: COLORES.lila
  },
  chipTexto: {
    color: COLORES.texto,
    fontSize: 12,
    fontWeight: "600"
  },
  chipTextoActivo: {
    color: COLORES.blanco
  },
  filaEntre: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap"
  },
  ordenes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  textoOrden: {
    color: "#8755B1",
    fontSize: 11,
    fontWeight: "700"
  },
  listaProductos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  tarjetaProducto: {
    width: "48%",
    backgroundColor: COLORES.blanco,
    borderRadius: 16,
    padding: 10,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORES.borde
  },
  imagenProducto: {
    height: 105,
    borderRadius: 12,
    backgroundColor: COLORES.lilaClaro,
    marginBottom: 9,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  inicialProducto: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORES.lila
  },

  imagenProductoFoto: {
    width: "100%",
    height: "100%",
    borderRadius: 12
  },
  categoriaPequena: {
    color: "#9162B8",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4
  },
  nombreProducto: {
    color: COLORES.texto,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3
  },
  precio: {
    color: COLORES.texto,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5
  },
  disponibilidad: {
    color: "#668D48",
    fontSize: 11,
    marginTop: 4
  },
  filaBotones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9
  },
  corazon: {
    color: COLORES.lila,
    fontSize: 25
  },
  boton: {
    backgroundColor: COLORES.lila,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8
  },
  botonVerde: {
    backgroundColor: COLORES.verde
  },
  botonClaro: {
    backgroundColor: COLORES.lilaClaro,
    borderWidth: 1,
    borderColor: COLORES.borde
  },
  botonPequeno: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 0
  },
  botonDesactivado: {
    opacity: 0.4
  },
  textoBoton: {
    color: COLORES.texto,
    fontWeight: "800",
    fontSize: 13
  },
  textoBotonClaro: {
    color: "#8051A5"
  },
  vacio: {
    backgroundColor: COLORES.blanco,
    padding: 22,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    borderColor: COLORES.borde,
    borderWidth: 1
  },
  vacioTitulo: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORES.texto,
    textAlign: "center"
  },
  vacioTexto: {
    color: COLORES.gris,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 8,
    lineHeight: 20
  },
  mensaje: {
    color: "#6B438D",
    backgroundColor: COLORES.lilaClaro,
    padding: 11,
    borderRadius: 10,
    marginTop: 12,
    fontWeight: "600"
  },
  detalleImagen: {
    height: 190,
    backgroundColor: COLORES.lilaClaro,
    borderRadius: 18,
    marginVertical: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  inicialDetalle: {
    fontSize: 64,
    fontWeight: "800",
    color: COLORES.lila
  },

  detalleImagenFoto: {
    width: "100%",
    height: "100%"
  },
  detalleNombre: {
    color: COLORES.texto,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 5
  },
  detallePrecio: {
    color: "#8051A5",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6
  },
  parrafo: {
    color: COLORES.gris,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5
  },
  disponibilidadGrande: {
    color: "#668D48",
    fontWeight: "700",
    marginTop: 12
  },
  filaEstrellas: {
    flexDirection: "row",
    gap: 14,
    marginVertical: 10
  },
  estrella: {
    fontSize: 25,
    color: "#E7B94B"
  },
  numeroEstrella: {
    textAlign: "center",
    color: COLORES.gris,
    fontSize: 11
  },
  lineaCarrito: {
    backgroundColor: COLORES.blanco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
    padding: 14,
    marginBottom: 10
  },
  controlesCantidad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10
  },
  control: {
    backgroundColor: COLORES.lilaClaro,
    borderRadius: 9,
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center"
  },
  controlTexto: {
    color: "#8051A5",
    fontSize: 20,
    fontWeight: "700"
  },
  cantidad: {
    color: COLORES.texto,
    fontWeight: "800"
  },
  eliminar: {
    color: "#B34D66",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 5
  },
  resumen: {
    backgroundColor: COLORES.blanco,
    padding: 15,
    borderRadius: 15,
    borderColor: COLORES.borde,
    borderWidth: 1,
    marginVertical: 12
  },
  filaResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6
  },
  textoResumen: {
    color: COLORES.gris,
    fontSize: 14
  },
  totalTexto: {
    color: COLORES.texto,
    fontWeight: "800",
    fontSize: 16
  },
  divisor: {
    height: 1,
    backgroundColor: COLORES.borde,
    marginVertical: 7
  },
  nota: {
    color: COLORES.gris,
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 8
  },
  confirmacion: {
    alignItems: "center",
    paddingTop: 25
  },
  iconoExito: {
    backgroundColor: COLORES.verde,
    color: COLORES.texto,
    fontSize: 35,
    fontWeight: "800",
    width: 70,
    height: 70,
    borderRadius: 35,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    marginBottom: 12
  },
  tarjetaPedido: {
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10
  },
  enlace: {
    color: "#8755B1",
    fontWeight: "700",
    marginTop: 7
  },
  categoriasFormulario: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },
  lineaVendedor: {
    backgroundColor: COLORES.blanco,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  navegacion: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 5,
    paddingVertical: 9,
    backgroundColor: COLORES.blanco,
    borderTopWidth: 1,
    borderColor: COLORES.borde,
    gap: 4
  }
});
