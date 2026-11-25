import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ==========================================
// PALETA DE COLORES SHOPGLOW & TEMAS (HU33)
// ==========================================
const COLORES_BASE = {
  lila: "#B67DE8",
  lilaOscuro: "#7B42AE",
  lilaClaro: "#F0E5FA",
  verde: "#AFE87D",
  verdeOscuro: "#4D821E",
  verdeTextoBoton: "#1E380A",
  fondo: "#F8F5FB",
  tarjeta: "#FFFFFF",
  texto: "#30283A",
  textoSecundario: "#6E6776",
  borde: "#E8E0EF",
  blanco: "#FFFFFF",
  rojo: "#C8282A",
  rojoClaro: "#FDE8E8",
  amarillo: "#B45309",
  amarilloClaro: "#FEF7E0",
  azul: "#1D4ED8",
  azulClaro: "#E6F0FD",
  estrella: "#E7B94B",
};

const COLORES_OSCURO = {
  lila: "#A86AD9",
  lilaOscuro: "#D8B8F8",
  lilaClaro: "#352647",
  verde: "#9CE063",
  verdeOscuro: "#A9E872",
  verdeTextoBoton: "#162B06",
  fondo: "#16121D",
  tarjeta: "#231D2D",
  texto: "#F5F2F9",
  textoSecundario: "#C2BACC",
  borde: "#3F354D",
  blanco: "#FFFFFF",
  rojo: "#FCA5A5",
  rojoClaro: "#482326",
  amarillo: "#FCD34D",
  amarilloClaro: "#3E3012",
  azul: "#93C5FD",
  azulClaro: "#1E2B45",
  estrella: "#FBBF24",
};

// ==========================================
// TARIFAS Y TIEMPOS DE ENVÍO POR MUNICIPIO (HU26)
// ==========================================
const TARIFAS_ENVIO = {
  Mosquera: {
    estandar: { costo: 6000, plazo: "1 a 2 días hábiles" },
    expres: { costo: 10000, plazo: "1 a 2 días hábiles (prioritario)" },
  },
  Funza: {
    estandar: { costo: 8000, plazo: "1 a 2 días hábiles" },
    expres: { costo: 12000, plazo: "1 a 2 días hábiles (prioritario)" },
  },
  Madrid: {
    estandar: { costo: 10000, plazo: "1 a 2 días hábiles" },
    expres: { costo: 14000, plazo: "1 a 2 días hábiles (prioritario)" },
  },
  Otros: {
    estandar: null,
    expres: null,
  },
};

const MUNICIPIOS_DISPONIBLES = ["Mosquera", "Funza", "Madrid", "Otros"];
const CATEGORIAS = ["Todas", "Moda", "Belleza", "Papelería", "Manualidades"];
const MARCAS = [
  "Todas",
  "GlowWear",
  "Urbania",
  "Luna Accesorios",
  "BellaSkin",
  "PapelArte",
  "CreaMás",
];

const PRECIO_ABSOLUTO_MIN = 0;
const PRECIO_ABSOLUTO_MAX = 200000;
const PRECIO_PASO = 5000;

// ==========================================
// CATÁLOGO INICIAL CON VARIANTES E INVENTARIO (HU21)
// ==========================================
const PRODUCTOS_INICIALES = [
  {
    id: "PROD-001",
    marca: "GlowWear",
    nombre: "Camiseta básica",
    categoria: "Moda",
    precio: 35000,
    descripcion: "Camiseta cómoda de algodón suave para usar todos los días con estilo.",
    imagen: require("./assets/productos/camiseta_basica.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Talla S - Blanco", precioFinal: 35000, stock: 5 },
      { id: "V2", etiqueta: "Talla M - Blanco", precioFinal: 35000, stock: 4 },
      { id: "V3", etiqueta: "Talla L - Negro", precioFinal: 37000, stock: 3 },
    ],
    preguntas: [
      {
        id: "Q1",
        pregunta: "¿La tela encoge con el primer lavado?",
        respuesta:
          "[Respuesta simulada de demostración]: La tela es 100% algodón prelavado, no encoge con lavado en frío.",
        fecha: "20/11/2026",
        estado: "Respondido",
      },
    ],
    valoraciones: [5, 4, 5],
  },
  {
    id: "PROD-002",
    marca: "Urbania",
    nombre: "Bolso casual",
    categoria: "Moda",
    precio: 68000,
    descripcion: "Bolso práctico con múltiples compartimentos para llevar tus objetos personales.",
    imagen: require("./assets/productos/bolso_casual.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Café Clásico", precioFinal: 68000, stock: 4 },
      { id: "V2", etiqueta: "Negro Elegante", precioFinal: 70000, stock: 3 },
    ],
    preguntas: [
      {
        id: "Q2",
        pregunta: "¿Cabe una libreta o tablet pequeña?",
        respuesta:
          "[Respuesta simulada de demostración]: Sí, entran libretas medianas y tablets de hasta 10 pulgadas.",
        fecha: "21/11/2026",
        estado: "Respondido",
      },
    ],
    valoraciones: [5],
  },
  {
    id: "PROD-003",
    marca: "Luna Accesorios",
    nombre: "Aretes delicados",
    categoria: "Moda",
    precio: 22000,
    descripcion: "Aretes sencillos y elegantes con baño resistente para complementar cualquier look.",
    imagen: require("./assets/productos/aretes_delicados.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Tono Dorado", precioFinal: 22000, stock: 8 },
      { id: "V2", etiqueta: "Tono Plateado", precioFinal: 22000, stock: 7 },
    ],
    preguntas: [],
    valoraciones: [4, 4],
  },
  {
    id: "PROD-004",
    marca: "BellaSkin",
    nombre: "Kit de cuidado facial",
    categoria: "Belleza",
    precio: 59000,
    descripcion: "Kit completo para tu rutina de día y noche: limpiador, tónico e hidratante.",
    imagen: require("./assets/productos/kit_cuidado_facial.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Piel Normal / Mixta", precioFinal: 59000, stock: 5 },
      { id: "V2", etiqueta: "Piel Seca / Sensible", precioFinal: 62000, stock: 3 },
    ],
    preguntas: [],
    valoraciones: [5, 5],
  },
  {
    id: "PROD-005",
    marca: "BellaSkin",
    nombre: "Brillo labial",
    categoria: "Belleza",
    precio: 18000,
    descripcion: "Brillo labial hidratante con fórmula ligera no pegajosa y aroma sutil.",
    imagen: require("./assets/productos/brillo_labial.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Tono Rosa Glaze", precioFinal: 18000, stock: 6 },
      { id: "V2", etiqueta: "Tono Cristal Transparente", precioFinal: 18000, stock: 0 },
    ],
    preguntas: [],
    valoraciones: [5, 4],
  },
  {
    id: "PROD-006",
    marca: "BellaSkin",
    nombre: "Espejo compacto",
    categoria: "Belleza",
    precio: 15000,
    descripcion: "Espejo de doble aumento, ultraligero y fácil de llevar en cualquier cartera.",
    imagen: require("./assets/productos/espejo_compacto.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Edición Rosa Pastel", precioFinal: 15000, stock: 6 },
      { id: "V2", etiqueta: "Edición Lila Glow", precioFinal: 15000, stock: 4 },
    ],
    preguntas: [],
    valoraciones: [4],
  },
  {
    id: "PROD-007",
    marca: "PapelArte",
    nombre: "Agenda floral",
    categoria: "Papelería",
    precio: 25000,
    descripcion: "Agenda anual con diseño botánico exclusivo, organizador semanal y stickers.",
    imagen: require("./assets/productos/agenda_floral.jpg"),
    variantes: [{ id: "V1", etiqueta: "Flores Silvestres", precioFinal: 25000, stock: 9 }],
    preguntas: [],
    valoraciones: [5],
  },
  {
    id: "PROD-008",
    marca: "PapelArte",
    nombre: "Resaltadores x6",
    categoria: "Papelería",
    precio: 16000,
    descripcion: "Set de 6 resaltadores con punta biselada en tonos armónicos de secado rápido.",
    imagen: require("./assets/productos/resaltadores.png"),
    variantes: [
      { id: "V1", etiqueta: "Gama Tonos Pastel", precioFinal: 16000, stock: 10 },
      { id: "V2", etiqueta: "Gama Tonos Vintage", precioFinal: 17000, stock: 8 },
    ],
    preguntas: [],
    valoraciones: [5, 4, 5],
  },
  {
    id: "PROD-009",
    marca: "PapelArte",
    nombre: "Cuaderno creativo",
    categoria: "Papelería",
    precio: 14000,
    descripcion: "Cuaderno cosido de 100 hojas de alto gramaje para escribir o ilustrar sin traspaso.",
    imagen: require("./assets/productos/cuaderno.avif"),
    variantes: [
      { id: "V1", etiqueta: "Hojas Cuadriculadas", precioFinal: 14000, stock: 8 },
      { id: "V2", etiqueta: "Hojas Punteadas (Bullet)", precioFinal: 14000, stock: 6 },
    ],
    preguntas: [],
    valoraciones: [],
  },
  {
    id: "PROD-010",
    marca: "CreaMás",
    nombre: "Kit de crochet",
    categoria: "Manualidades",
    precio: 42000,
    descripcion: "Materiales completos: 3 ovillos de lana, agujas ergonómicas y guía de puntos.",
    imagen: require("./assets/productos/kit_crochet.webp"),
    variantes: [
      { id: "V1", etiqueta: "Nivel Principiante (Guía Básica)", precioFinal: 42000, stock: 3 },
      { id: "V2", etiqueta: "Nivel Intermedio (Amigurumis)", precioFinal: 46000, stock: 3 },
    ],
    preguntas: [],
    valoraciones: [5],
  },
  {
    id: "PROD-011",
    marca: "CreaMás",
    nombre: "Llavero tejido",
    categoria: "Manualidades",
    precio: 12000,
    descripcion: "Llavero artesanal tejido en punto minucioso con argolla de acero inoxidable.",
    imagen: require("./assets/productos/llavero.webp"),
    variantes: [
      { id: "V1", etiqueta: "Diseño Flor Lila", precioFinal: 12000, stock: 6 },
      { id: "V2", etiqueta: "Diseño Corazón Rosa", precioFinal: 12000, stock: 5 },
    ],
    preguntas: [],
    valoraciones: [],
  },
  {
    id: "PROD-012",
    marca: "CreaMás",
    nombre: "Hilo de algodón",
    categoria: "Manualidades",
    precio: 9000,
    descripcion: "Ovillo de 100g de hilo peinado, suave y resistente para tejidos y macramé.",
    imagen: require("./assets/productos/hilo.jpg"),
    variantes: [
      { id: "V1", etiqueta: "Color Crudo Natural", precioFinal: 9000, stock: 15 },
      { id: "V2", etiqueta: "Color Lavanda Suave", precioFinal: 9000, stock: 10 },
    ],
    preguntas: [],
    valoraciones: [4],
  },
];

const DIRECCIONES_INICIALES = [
  {
    id: "DIR-001",
    alias: "Casa Familiar",
    municipio: "Mosquera",
    descripcion: "Calle 3 # 12-45, Barrio El Trébol (Casa blanca frente al parque)",
    principal: true,
  },
  {
    id: "DIR-002",
    alias: "Oficina Centro",
    municipio: "Funza",
    descripcion: "Carrera 9 # 14-20, Piso 2, Oficina 204",
    principal: false,
  },
];

const PEDIDOS_INICIALES = [
  {
    id: "SG-202601",
    fecha: "23/11/2026, 10:30 a. m.",
    estado: "Confirmado",
    comprador: {
      nombre: "Karol Velasco",
      telefono: "3104567890",
      aliasDireccion: "Casa Familiar",
      municipio: "Mosquera",
      descripcionDireccion: "Calle 3 # 12-45, Barrio El Trébol",
    },
    modalidadEnvio: "estandar",
    costoEnvio: 6000,
    plazoEnvio: "1 a 2 días hábiles",
    subtotal: 57000,
    descuento: 0,
    total: 63000,
    items: [
      {
        productoId: "PROD-001",
        varianteId: "V1",
        nombre: "Camiseta básica",
        varianteEtiqueta: "Talla S - Blanco",
        precioUnitario: 35000,
        cantidad: 1,
      },
      {
        productoId: "PROD-003",
        varianteId: "V1",
        nombre: "Aretes delicados",
        varianteEtiqueta: "Tono Dorado",
        precioUnitario: 22000,
        cantidad: 1,
      },
    ],
    transiciones: [
      { estado: "Confirmado", fecha: "23/11/2026, 10:30 a. m.", nota: "Pedido recibido y verificado." },
    ],
    cancelado: false,
  },
  {
    id: "SG-202598",
    fecha: "22/11/2026, 4:15 p. m.",
    estado: "Entregado",
    comprador: {
      nombre: "Valentina Gómez",
      telefono: "3158901234",
      aliasDireccion: "Oficina Centro",
      municipio: "Funza",
      descripcionDireccion: "Carrera 9 # 14-20, Piso 2",
    },
    modalidadEnvio: "expres",
    costoEnvio: 12000,
    plazoEnvio: "1 a 2 días hábiles (prioritario)",
    subtotal: 59000,
    descuento: 5900,
    total: 65100,
    items: [
      {
        productoId: "PROD-004",
        varianteId: "V1",
        nombre: "Kit de cuidado facial",
        varianteEtiqueta: "Piel Normal / Mixta",
        precioUnitario: 59000,
        cantidad: 1,
      },
    ],
    transiciones: [
      { estado: "Confirmado", fecha: "22/11/2026, 4:15 p. m.", nota: "Pago verificado en simulación." },
      { estado: "Preparando", fecha: "22/11/2026, 5:00 p. m.", nota: "Empacado con sello ShopGlow." },
      { estado: "En camino", fecha: "23/11/2026, 8:30 a. m.", nota: "Mensajería en ruta hacia Funza." },
      { estado: "Entregado", fecha: "23/11/2026, 11:20 a. m.", nota: "Entrega completada exitosamente." },
    ],
    cancelado: false,
  },
];

const NOTIFICACIONES_INICIALES = [
  {
    id: "NOTIF-001",
    eventoKey: "sistema-bienvenida",
    tipo: "pedido",
    titulo: "Bienvenida a ShopGlow 2.0",
    mensaje:
      "Tu catálogo ahora cuenta con variantes, comparador de productos y seguimiento en tiempo real.",
    fecha: "24/11/2026, 8:00 a. m.",
    leida: false,
    referencia: "SISTEMA",
  },
  {
    id: "NOTIF-002",
    eventoKey: "pedido-SG-202598-Entregado",
    tipo: "pedido",
    titulo: "Pedido SG-202598 Entregado",
    mensaje: "El pedido fue entregado en Funza. Esperamos que disfrutes tus productos.",
    fecha: "23/11/2026, 11:20 a. m.",
    leida: true,
    referencia: "SG-202598",
  },
];

const TICKETS_INICIALES = [
  {
    id: "CASO-8012",
    pedidoId: "SG-202601",
    motivo: "Entrega",
    descripcion: "Quisiera solicitar que la entrega sea preferiblemente en horario de la tarde.",
    estado: "Abierto",
    respuesta: null,
    fecha: "23/11/2026, 11:00 a. m.",
  },
];

// Utilidades puras
const formatearDinero = (val) => "$" + Number(val || 0).toLocaleString("es-CO");

const redondearAPaso = (valor, paso = PRECIO_PASO) =>
  Math.round(valor / paso) * paso;

const calcularStockTotal = (prod) =>
  (prod?.variantes || []).reduce((acc, v) => acc + Number(v.stock || 0), 0);

const promedioValoracion = (prod) => {
  const notas = prod?.valoraciones || [];
  if (notas.length === 0) return "Sin calificaciones";
  const suma = notas.reduce((acc, n) => acc + n, 0);
  return (suma / notas.length).toFixed(1) + " / 5";
};

// ==========================================
// COMPONENTES REUTILIZABLES DE INTERFAZ
// ==========================================
function Boton({
  texto,
  onPress,
  tipo = "lila",
  pequeno = false,
  desactivado = false,
  icono = null,
  estiloExtra = null,
  tema = COLORES_BASE,
  escalaTexto = 1,
}) {
  let fondo = tema.lila;
  let bordeColor = "transparent";
  let bordeWidth = 0;
  let colorTexto = "#FFFFFF";

  if (tipo === "verde") {
    fondo = tema.verde;
    colorTexto = tema.verdeTextoBoton;
  } else if (tipo === "claro") {
    fondo = tema.tarjeta;
    bordeColor = tema.borde;
    bordeWidth = 1;
    colorTexto = tema.texto;
  } else if (tipo === "peligro") {
    fondo = tema.rojoClaro;
    bordeColor = tema.rojo;
    bordeWidth = 1;
    colorTexto = tema.rojo;
  } else if (tipo === "oscuro") {
    fondo = tema.lilaClaro;
    bordeColor = tema.lila;
    bordeWidth = 1;
    colorTexto = tema.texto;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={desactivado}
      style={({ pressed }) => [
        estilos.botonBase,
        { backgroundColor: fondo, borderColor: bordeColor, borderWidth: bordeWidth },
        pequeno && estilos.botonPequeno,
        desactivado && estilos.botonDesactivado,
        pressed && !desactivado && { opacity: 0.8 },
        estiloExtra,
      ]}
    >
      <View style={estilos.filaCentrada}>
        {icono ? (
          <Text style={[estilos.iconoBoton, { color: colorTexto, fontSize: 13 * escalaTexto }]}>
            {icono}{" "}
          </Text>
        ) : null}
        <Text
          style={[
            estilos.textoBoton,
            {
              color: colorTexto,
              fontSize: (pequeno ? 11 : 13) * escalaTexto,
            },
          ]}
        >
          {texto}
        </Text>
      </View>
    </Pressable>
  );
}

function CampoTexto({
  titulo,
  valor,
  cambiar,
  ayuda,
  teclado = "default",
  multiline = false,
  editable = true,
  tema = COLORES_BASE,
  escalaTexto = 1,
}) {
  return (
    <View style={estilos.contenedorCampo}>
      <Text style={[estilos.etiquetaCampo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
        {titulo}
      </Text>
      <TextInput
        value={valor}
        onChangeText={cambiar}
        placeholder={ayuda || titulo}
        placeholderTextColor={tema.textoSecundario}
        keyboardType={teclado}
        multiline={multiline}
        editable={editable}
        style={[
          estilos.entradaTexto,
          {
            backgroundColor: editable ? tema.tarjeta : tema.lilaClaro,
            borderColor: tema.borde,
            color: editable ? tema.texto : tema.textoSecundario,
            fontSize: 13 * escalaTexto,
          },
          multiline && { minHeight: 80 * escalaTexto, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}

function EstadoBadge({ estado, escalaTexto = 1 }) {
  let fondo = "#E8E0EF";
  let texto = "#4E3E61";

  if (estado === "Confirmado") {
    fondo = "#E6F0FD";
    texto = "#1D4ED8";
  } else if (estado === "Preparando") {
    fondo = "#FEF7E0";
    texto = "#B45309";
  } else if (estado === "En camino") {
    fondo = "#F3E8FF";
    texto = "#7E22CE";
  } else if (estado === "Entregado") {
    fondo = "#DCFCE7";
    texto = "#15803D";
  } else if (estado === "Cancelado") {
    fondo = "#FEE2E2";
    texto = "#B91C1C";
  } else if (estado === "Abierto") {
    fondo = "#FEF3C7";
    texto = "#92400E";
  } else if (estado === "Respondido") {
    fondo = "#E0F2FE";
    texto = "#0369A1";
  }

  return (
    <View style={[estilos.badge, { backgroundColor: fondo }]}>
      <Text style={[estilos.textoBadge, { color: texto, fontSize: 11 * escalaTexto }]}>{estado}</Text>
    </View>
  );
}

// Control deslizable real con arrastre táctil/mouse + botones de ajuste fino
function SliderRangoPrecio({
  etiqueta,
  valor,
  minPermitido,
  maxPermitido,
  onChange,
  colorRelleno,
  tema,
  escalaTexto,
}) {
  const anchoPistaRef = useRef(1);
  const valorRef = useRef(valor);
  const minRef = useRef(minPermitido);
  const maxRef = useRef(maxPermitido);
  const onChangeRef = useRef(onChange);

  valorRef.current = valor;
  minRef.current = minPermitido;
  maxRef.current = maxPermitido;
  onChangeRef.current = onChange;

  const calcularDesdeX = (xLocal) => {
    const ancho = Math.max(1, anchoPistaRef.current);
    const ratio = Math.max(0, Math.min(1, xLocal / ancho));
    const bruto = PRECIO_ABSOLUTO_MIN + ratio * (PRECIO_ABSOLUTO_MAX - PRECIO_ABSOLUTO_MIN);
    const escalonado = redondearAPaso(bruto, PRECIO_PASO);
    const acotado = Math.max(minRef.current, Math.min(maxRef.current, escalonado));
    onChangeRef.current(acotado);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        calcularDesdeX(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        calcularDesdeX(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const porcentaje = Math.max(
    0,
    Math.min(
      100,
      ((valor - PRECIO_ABSOLUTO_MIN) / (PRECIO_ABSOLUTO_MAX - PRECIO_ABSOLUTO_MIN)) * 100
    )
  );

  return (
    <View style={estilos.sliderBloque}>
      <View style={estilos.filaEspacio}>
        <Text style={[estilos.sliderEtiqueta, { color: tema.textoSecundario, fontSize: 11 * escalaTexto }]}>
          {etiqueta}
        </Text>
        <Text style={[estilos.sliderValor, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
          {formatearDinero(valor)}
        </Text>
      </View>

      <View style={estilos.sliderFila}>
        <Pressable
          onPress={() => onChange(Math.max(minPermitido, valor - PRECIO_PASO))}
          disabled={valor <= minPermitido}
          style={[
            estilos.sliderBtn,
            {
              backgroundColor: tema.lilaClaro,
              borderColor: tema.lila,
              opacity: valor <= minPermitido ? 0.4 : 1,
            },
          ]}
          accessibilityLabel={`Disminuir ${etiqueta}`}
        >
          <Text style={{ color: tema.lilaOscuro, fontWeight: "900", fontSize: 15 }}>-</Text>
        </Pressable>

        <View
          style={estilos.sliderZonaArrastre}
          onLayout={(e) => {
            anchoPistaRef.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <View style={[estilos.sliderPista, { backgroundColor: tema.borde }]}>
            <View
              style={[
                estilos.sliderRelleno,
                {
                  backgroundColor: colorRelleno,
                  width: `${porcentaje}%`,
                },
              ]}
            />
          </View>
          <View
            style={[
              estilos.sliderPulgar,
              {
                left: `${porcentaje}%`,
                backgroundColor: tema.tarjeta,
                borderColor: colorRelleno,
              },
            ]}
          />
        </View>

        <Pressable
          onPress={() => onChange(Math.min(maxPermitido, valor + PRECIO_PASO))}
          disabled={valor >= maxPermitido}
          style={[
            estilos.sliderBtn,
            {
              backgroundColor: tema.lilaClaro,
              borderColor: tema.lila,
              opacity: valor >= maxPermitido ? 0.4 : 1,
            },
          ]}
          accessibilityLabel={`Aumentar ${etiqueta}`}
        >
          <Text style={{ color: tema.lilaOscuro, fontWeight: "900", fontSize: 15 }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL APP
// ==========================================
export default function App() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [carrito, setCarrito] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [pedidos, setPedidos] = useState(PEDIDOS_INICIALES);
  const [direcciones, setDirecciones] = useState(DIRECCIONES_INICIALES);
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_INICIALES);
  const [tickets, setTickets] = useState(TICKETS_INICIALES);
  const [compararIds, setCompararIds] = useState([]);
  const [suscripcionesStock, setSuscripcionesStock] = useState([]);

  const [pantalla, setPantalla] = useState("Catalogo");
  const [productoDetalleId, setProductoDetalleId] = useState(null);
  const [pedidoDetalleId, setPedidoDetalleId] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [letraGrande, setLetraGrande] = useState(false);
  const [cargandoStorage, setCargandoStorage] = useState(true);

  const [modalConfirmacion, setModalConfirmacion] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    textoConfirmar: "Confirmar",
    onConfirmar: null,
  });

  // Estados de Detalle de Producto
  const [varianteSeleccionadaId, setVarianteSeleccionadaId] = useState(null);
  const [cantidadDetalle, setCantidadDetalle] = useState("1");
  const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState("");
  const [errorDetalle, setErrorDetalle] = useState("");
  const [errorPregunta, setErrorPregunta] = useState("");

  // Estados de Filtros Combinados (HU23)
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroMarca, setFiltroMarca] = useState("Todas");
  const [precioMin, setPrecioMin] = useState(PRECIO_ABSOLUTO_MIN);
  const [precioMax, setPrecioMax] = useState(PRECIO_ABSOLUTO_MAX);
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("Todos");
  const [orden, setOrden] = useState("normal");
  const [errorRangoPrecio, setErrorRangoPrecio] = useState("");

  // Estados de Checkout y Envíos
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState("DIR-001");
  const [modalidadEnvio, setModalidadEnvio] = useState("estandar");
  const [compradorNombre, setCompradorNombre] = useState("Karol Velasco");
  const [compradorTelefono, setCompradorTelefono] = useState("3104567890");
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState("");

  // Estados de Libreta de Direcciones
  const [aliasDir, setAliasDir] = useState("");
  const [municipioDir, setMunicipioDir] = useState("Mosquera");
  const [detalleDir, setDetalleDir] = useState("");
  const [idEditandoDir, setIdEditandoDir] = useState(null);
  const [errorDireccion, setErrorDireccion] = useState("");

  // Estados de Centro de Ayuda
  const [ticketPedidoId, setTicketPedidoId] = useState("");
  const [ticketMotivo, setTicketMotivo] = useState("Entrega");
  const [ticketDescripcion, setTicketDescripcion] = useState("");
  const [errorTicket, setErrorTicket] = useState("");

  // Estados de Panel de Vendedor / Simulación
  const [tabAdmin, setTabAdmin] = useState("Simulacion");
  const [idProdEditando, setIdProdEditando] = useState(null);
  const [nombreProdForm, setNombreProdForm] = useState("");
  const [marcaProdForm, setMarcaProdForm] = useState("GlowWear");
  const [categoriaProdForm, setCategoriaProdForm] = useState("Moda");
  const [precioProdForm, setPrecioProdForm] = useState("");
  const [stockProdForm, setStockProdForm] = useState("");
  const [varianteEtiquetaForm, setVarianteEtiquetaForm] = useState("Presentación Estándar");
  const [descripcionProdForm, setDescripcionProdForm] = useState("");
  const [errorVendedor, setErrorVendedor] = useState("");

  const tema = modoOscuro ? COLORES_OSCURO : COLORES_BASE;
  const escalaTexto = letraGrande ? 1.18 : 1.0;

  // ------------------------------------------
  // CARGA Y PERSISTENCIA (AsyncStorage)
  // ------------------------------------------
  useEffect(() => {
    async function inicializar() {
      try {
        const raw = await AsyncStorage.getItem("shopglow_taller5_db");
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data.productos)) setProductos(data.productos);
          if (Array.isArray(data.carrito)) setCarrito(data.carrito);
          if (Array.isArray(data.favoritos)) setFavoritos(data.favoritos);
          if (Array.isArray(data.pedidos)) setPedidos(data.pedidos);
          if (Array.isArray(data.direcciones)) setDirecciones(data.direcciones);
          if (Array.isArray(data.notificaciones)) setNotificaciones(data.notificaciones);
          if (Array.isArray(data.tickets)) setTickets(data.tickets);
          if (Array.isArray(data.suscripcionesStock)) setSuscripcionesStock(data.suscripcionesStock);
          if (typeof data.modoOscuro === "boolean") setModoOscuro(data.modoOscuro);
          if (typeof data.letraGrande === "boolean") setLetraGrande(data.letraGrande);
        }
      } catch (e) {
        // Conserva datos iniciales ante error de lectura
      } finally {
        setCargandoStorage(false);
      }
    }
    inicializar();
  }, []);

  useEffect(() => {
    if (!cargandoStorage) {
      AsyncStorage.setItem(
        "shopglow_taller5_db",
        JSON.stringify({
          productos,
          carrito,
          favoritos,
          pedidos,
          direcciones,
          notificaciones,
          tickets,
          suscripcionesStock,
          modoOscuro,
          letraGrande,
        })
      ).catch(() => {});
    }
  }, [
    productos,
    carrito,
    favoritos,
    pedidos,
    direcciones,
    notificaciones,
    tickets,
    suscripcionesStock,
    modoOscuro,
    letraGrande,
    cargandoStorage,
  ]);

  const notificarAlerta = (mensaje) => {
    setMensajeAlerta(mensaje);
  };

  const irA = (pantallaDestino, limpiarAlerta = true) => {
    setPantalla(pantallaDestino);
    if (limpiarAlerta) setMensajeAlerta("");
    setErrorDetalle("");
    setErrorPregunta("");
    setErrorCheckout("");
    setErrorDireccion("");
    setErrorTicket("");
    setErrorVendedor("");
  };

  const abrirConfirmacionModal = ({ titulo, mensaje, textoConfirmar, onConfirmar }) => {
    setModalConfirmacion({
      visible: true,
      titulo,
      mensaje,
      textoConfirmar: textoConfirmar || "Confirmar",
      onConfirmar,
    });
  };

  const cerrarConfirmacionModal = () => {
    setModalConfirmacion({
      visible: false,
      titulo: "",
      mensaje: "",
      textoConfirmar: "Confirmar",
      onConfirmar: null,
    });
  };

  const agregarNotificacion = (tipo, titulo, mensaje, referencia = null, eventoKey = null) => {
    setNotificaciones((prev) => {
      if (eventoKey && prev.some((n) => n.eventoKey === eventoKey)) {
        return prev;
      }
      const nueva = {
        id: "NOTIF-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        eventoKey,
        tipo,
        titulo,
        mensaje,
        fecha: new Date().toLocaleString("es-CO"),
        leida: false,
        referencia,
      };
      return [nueva, ...prev];
    });
  };

  // ------------------------------------------
  // LOGICA: FILTROS COMBINADOS (HU23)
  // ------------------------------------------
  const cambiarPrecioMinimo = (nuevoMin) => {
    const limpio = Math.max(PRECIO_ABSOLUTO_MIN, Math.min(PRECIO_ABSOLUTO_MAX, redondearAPaso(nuevoMin)));
    if (limpio > precioMax) {
      setPrecioMin(precioMax);
      setErrorRangoPrecio("El precio mínimo se ajustó al máximo actual.");
    } else {
      setPrecioMin(limpio);
      setErrorRangoPrecio("");
    }
  };

  const cambiarPrecioMaximo = (nuevoMax) => {
    const limpio = Math.max(PRECIO_ABSOLUTO_MIN, Math.min(PRECIO_ABSOLUTO_MAX, redondearAPaso(nuevoMax)));
    if (limpio < precioMin) {
      setPrecioMax(precioMin);
      setErrorRangoPrecio("El precio máximo se ajustó al mínimo actual.");
    } else {
      setPrecioMax(limpio);
      setErrorRangoPrecio("");
    }
  };

  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p) => {
        const matchBusqueda =
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.marca.toLowerCase().includes(busqueda.toLowerCase());

        const matchCategoria = filtroCategoria === "Todas" || p.categoria === filtroCategoria;
        const matchMarca = filtroMarca === "Todas" || p.marca === filtroMarca;

        const totalDisp = calcularStockTotal(p);
        const matchDisp =
          filtroDisponibilidad === "Todos" ||
          (filtroDisponibilidad === "Disponibles" && totalDisp > 0) ||
          (filtroDisponibilidad === "Agotados" && totalDisp === 0);

        const matchPrecio = p.precio >= precioMin && p.precio <= precioMax;

        return matchBusqueda && matchCategoria && matchMarca && matchDisp && matchPrecio;
      })
      .sort((a, b) => {
        if (orden === "menor") return a.precio - b.precio;
        if (orden === "mayor") return b.precio - a.precio;
        return 0;
      });
  }, [productos, busqueda, filtroCategoria, filtroMarca, precioMin, precioMax, filtroDisponibilidad, orden]);

  const restablecerFiltros = () => {
    setBusqueda("");
    setFiltroCategoria("Todas");
    setFiltroMarca("Todas");
    setPrecioMin(PRECIO_ABSOLUTO_MIN);
    setPrecioMax(PRECIO_ABSOLUTO_MAX);
    setFiltroDisponibilidad("Todos");
    setOrden("normal");
    setErrorRangoPrecio("");
    notificarAlerta("Filtros restablecidos al estado inicial.");
  };

  // ------------------------------------------
  // LOGICA: FAVORITOS Y VALORACIONES
  // ------------------------------------------
  const alternarFavorito = (prodId) => {
    if (favoritos.includes(prodId)) {
      setFavoritos((prev) => prev.filter((id) => id !== prodId));
      notificarAlerta("Producto eliminado de favoritos.");
    } else {
      setFavoritos((prev) => [...prev, prodId]);
      notificarAlerta("Producto agregado a favoritos.");
    }
  };

  const calificarProducto = (prodId, nota) => {
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) return;
    setProductos((prev) =>
      prev.map((p) =>
        p.id === prodId ? { ...p, valoraciones: [...(p.valoraciones || []), nota] } : p
      )
    );
    notificarAlerta(`Gracias por tu calificación de ${nota} estrella(s).`);
  };

  // ------------------------------------------
  // LOGICA: COMPARADOR DE PRODUCTOS (HU22)
  // ------------------------------------------
  const alternarComparacion = (prodId) => {
    if (compararIds.includes(prodId)) {
      setCompararIds((prev) => prev.filter((id) => id !== prodId));
      notificarAlerta("Producto retirado del comparador sin modificar favoritos ni carrito.");
    } else {
      if (compararIds.length >= 3) {
        notificarAlerta(
          "Límite alcanzado: solo puedes comparar máximo 3 productos al mismo tiempo. Retira uno primero."
        );
        return;
      }
      const nuevoTotal = compararIds.length + 1;
      setCompararIds((prev) => [...prev, prodId]);
      notificarAlerta(`Producto añadido al comparador (${nuevoTotal}/3).`);
    }
  };

  // ------------------------------------------
  // LOGICA: VARIANTES Y CARRITO (HU21)
  // ------------------------------------------
  const productoActual = useMemo(
    () => productos.find((p) => p.id === productoDetalleId),
    [productos, productoDetalleId]
  );

  const varianteActual = useMemo(() => {
    if (!productoActual || !varianteSeleccionadaId) return null;
    return productoActual.variantes.find((v) => v.id === varianteSeleccionadaId) || null;
  }, [productoActual, varianteSeleccionadaId]);

  const abrirDetalleProducto = (prod) => {
    setProductoDetalleId(prod.id);
    if (prod.variantes && prod.variantes.length === 1) {
      setVarianteSeleccionadaId(prod.variantes[0].id);
    } else {
      setVarianteSeleccionadaId(null);
    }
    setCantidadDetalle("1");
    setNuevaPreguntaTexto("");
    setErrorDetalle("");
    setErrorPregunta("");
    irA("Detalle");
  };

  const agregarAlCarritoDesdeDetalle = () => {
    if (!productoActual) return;
    setErrorDetalle("");

    if (!varianteSeleccionadaId || !varianteActual) {
      const msg = "Por favor selecciona una variante (talla, color o presentación) antes de agregar al carrito.";
      setErrorDetalle(msg);
      notificarAlerta(msg);
      return;
    }

    if (varianteActual.stock <= 0) {
      const msg = "Esta variante está agotada y no puede comprarse. Puedes solicitar aviso de reposición.";
      setErrorDetalle(msg);
      notificarAlerta(msg);
      return;
    }

    if (!/^\d+$/.test(cantidadDetalle.trim())) {
      const msg = "Ingresa una cantidad entera válida (mínimo 1).";
      setErrorDetalle(msg);
      notificarAlerta(msg);
      return;
    }

    const cantNum = parseInt(cantidadDetalle.trim(), 10);
    if (cantNum < 1) {
      const msg = "La cantidad mínima es 1 unidad.";
      setErrorDetalle(msg);
      notificarAlerta(msg);
      return;
    }

    const enCarrito = carrito
      .filter((item) => item.productoId === productoActual.id && item.varianteId === varianteActual.id)
      .reduce((sum, item) => sum + item.cantidad, 0);

    if (cantNum + enCarrito > varianteActual.stock) {
      const maximoPosible = Math.max(0, varianteActual.stock - enCarrito);
      const msg = `Stock insuficiente para "${varianteActual.etiqueta}". Disponibles: ${varianteActual.stock} (${enCarrito} en carrito). Máximo permitido a agregar: ${maximoPosible}.`;
      setErrorDetalle(msg);
      notificarAlerta(msg);
      return;
    }

    setCarrito((prev) => {
      const index = prev.findIndex(
        (it) => it.productoId === productoActual.id && it.varianteId === varianteActual.id
      );
      if (index >= 0) {
        const clon = [...prev];
        clon[index] = { ...clon[index], cantidad: clon[index].cantidad + cantNum };
        return clon;
      }
      return [
        ...prev,
        {
          id: `${productoActual.id}-${varianteActual.id}`,
          productoId: productoActual.id,
          varianteId: varianteActual.id,
          nombre: productoActual.nombre,
          varianteEtiqueta: varianteActual.etiqueta,
          precioUnitario: varianteActual.precioFinal || productoActual.precio,
          cantidad: cantNum,
          imagen: productoActual.imagen,
        },
      ];
    });

    notificarAlerta(`${cantNum} unidad(es) de "${varianteActual.etiqueta}" agregada(s) al carrito.`);
  };

  const modificarCantidadCarrito = (itemCarrito, delta) => {
    const prod = productos.find((p) => p.id === itemCarrito.productoId);
    const v = prod?.variantes.find((varItem) => varItem.id === itemCarrito.varianteId);
    const nuevaCant = itemCarrito.cantidad + delta;

    if (nuevaCant <= 0) {
      eliminarDelCarrito(itemCarrito.id);
      return;
    }

    if (v && nuevaCant > v.stock) {
      notificarAlerta(`No puedes superar el stock de esta variante (${v.stock} disponibles).`);
      return;
    }

    setCarrito((prev) =>
      prev.map((it) => (it.id === itemCarrito.id ? { ...it, cantidad: nuevaCant } : it))
    );
  };

  const eliminarDelCarrito = (itemId) => {
    setCarrito((prev) => prev.filter((it) => it.id !== itemId));
    notificarAlerta("Producto eliminado del carrito.");
  };

  // ------------------------------------------
  // LOGICA: ESTIMADOR DE COSTO Y PLAZO DE ENVÍO
  // ------------------------------------------
  const direccionSeleccionada = useMemo(() => {
    if (!direccionSeleccionadaId) return null;
    return direcciones.find((d) => d.id === direccionSeleccionadaId) || null;
  }, [direcciones, direccionSeleccionadaId]);

  const calculoEnvio = useMemo(() => {
    if (!direccionSeleccionada) {
      return { costo: 0, plazo: "Selecciona una dirección de entrega.", disponible: false };
    }
    if (!modalidadEnvio) {
      return { costo: 0, plazo: "Selecciona una modalidad de envío (Estándar o Exprés).", disponible: false };
    }
    const mun = direccionSeleccionada.municipio;
    const regla = TARIFAS_ENVIO[mun];
    if (!regla) {
      return {
        costo: 0,
        plazo: "Municipio sin cobertura automática. Solicita ajuste manual de envío.",
        disponible: false,
      };
    }
    const tarifa = regla[modalidadEnvio];
    if (!tarifa) {
      return {
        costo: 0,
        plazo: "Para otros municipios se requiere ajuste manual (no hay envío automático).",
        disponible: false,
      };
    }
    return { costo: tarifa.costo, plazo: tarifa.plazo, disponible: true };
  }, [direccionSeleccionada, modalidadEnvio]);

  const subtotalCarrito = useMemo(
    () => carrito.reduce((sum, it) => sum + it.precioUnitario * it.cantidad, 0),
    [carrito]
  );
  const descuentoCarrito = cuponAplicado ? Math.round(subtotalCarrito * 0.1) : 0;
  const costoEnvioFinal = carrito.length > 0 && calculoEnvio.disponible ? calculoEnvio.costo : 0;
  const totalPedidoFinal = Math.max(0, subtotalCarrito - descuentoCarrito) + costoEnvioFinal;
  const cantidadTotalArticulos = carrito.reduce((sum, it) => sum + it.cantidad, 0);

  // ------------------------------------------
  // LOGICA: CONFIRMACIÓN DE COMPRA INMUTABLE
  // ------------------------------------------
  const confirmarCompraPedido = () => {
    setErrorCheckout("");

    if (carrito.length === 0) {
      notificarAlerta("Tu carrito está vacío.");
      return;
    }

    if (!direccionSeleccionada) {
      const msg = "Debes elegir o registrar una dirección de entrega antes de confirmar el pedido.";
      setErrorCheckout(msg);
      notificarAlerta(msg);
      return;
    }

    if (!modalidadEnvio || !calculoEnvio.disponible) {
      const msg = calculoEnvio.plazo || "Completa la modalidad de envío para continuar.";
      setErrorCheckout(msg);
      notificarAlerta(msg);
      return;
    }

    if (!compradorNombre.trim() || !compradorTelefono.trim()) {
      const msg = "Por favor completa tu nombre y teléfono de contacto.";
      setErrorCheckout(msg);
      notificarAlerta(msg);
      return;
    }

    for (const item of carrito) {
      const prod = productos.find((p) => p.id === item.productoId);
      const v = prod?.variantes.find((x) => x.id === item.varianteId);
      if (!v || v.stock < item.cantidad) {
        const msg = `Stock insuficiente para "${item.nombre} (${item.varianteEtiqueta})". Revisa tu carrito.`;
        setErrorCheckout(msg);
        notificarAlerta(msg);
        return;
      }
    }

    const nuevoCodigo = "SG-" + Date.now().toString().slice(-6);
    const fechaActual = new Date().toLocaleString("es-CO");

    const nuevoPedido = {
      id: nuevoCodigo,
      fecha: fechaActual,
      estado: "Confirmado",
      comprador: {
        nombre: compradorNombre.trim(),
        telefono: compradorTelefono.trim(),
        aliasDireccion: direccionSeleccionada.alias,
        municipio: direccionSeleccionada.municipio,
        descripcionDireccion: direccionSeleccionada.descripcion,
      },
      modalidadEnvio,
      costoEnvio: costoEnvioFinal,
      plazoEnvio: calculoEnvio.plazo,
      subtotal: subtotalCarrito,
      descuento: descuentoCarrito,
      total: totalPedidoFinal,
      items: carrito.map((it) => ({ ...it })),
      transiciones: [
        {
          estado: "Confirmado",
          fecha: fechaActual,
          nota: `Pedido confirmado para entrega en ${direccionSeleccionada.municipio} (${calculoEnvio.plazo}).`,
        },
      ],
      cancelado: false,
    };

    setProductos((prevProds) =>
      prevProds.map((p) => ({
        ...p,
        variantes: p.variantes.map((v) => {
          const comprado = carrito.find(
            (c) => c.productoId === p.id && c.varianteId === v.id
          );
          return comprado ? { ...v, stock: Math.max(0, v.stock - comprado.cantidad) } : v;
        }),
      }))
    );

    setPedidos((prev) => [nuevoPedido, ...prev]);
    setCarrito([]);
    setCuponAplicado(false);
    setCodigoCupon("");
    setPedidoDetalleId(nuevoCodigo);

    agregarNotificacion(
      "pedido",
      `Pedido Confirmado: ${nuevoCodigo}`,
      `Tu compra por ${formatearDinero(totalPedidoFinal)} fue confirmada. Municipio: ${direccionSeleccionada.municipio}.`,
      nuevoCodigo,
      `pedido-${nuevoCodigo}-Confirmado`
    );

    irA("Confirmacion");
  };

  // ------------------------------------------
  // LOGICA: SEGUIMIENTO DE PEDIDOS
  // ------------------------------------------
  const avanzarEstadoEntrega = (pedidoObj) => {
    const ordenEstados = ["Confirmado", "Preparando", "En camino", "Entregado"];
    const indiceActual = ordenEstados.indexOf(pedidoObj.estado);

    if (pedidoObj.estado === "Cancelado") {
      notificarAlerta("Un pedido cancelado no puede avanzar ni entregarse.");
      return;
    }
    if (pedidoObj.estado === "Entregado" || indiceActual >= ordenEstados.length - 1) {
      notificarAlerta("Este pedido ya fue entregado y no admite más transiciones.");
      return;
    }

    const proximoEstado = ordenEstados[indiceActual + 1];
    const fechaHora = new Date().toLocaleString("es-CO");
    let nota = "";
    if (proximoEstado === "Preparando") nota = "Productos seleccionados y empacados en bodega.";
    if (proximoEstado === "En camino") nota = "En ruta hacia " + pedidoObj.comprador.municipio + ".";
    if (proximoEstado === "Entregado") nota = "Entregado a conformidad en la dirección registrada.";

    setPedidos((prev) =>
      prev.map((ped) =>
        ped.id === pedidoObj.id
          ? {
              ...ped,
              estado: proximoEstado,
              transiciones: [...ped.transiciones, { estado: proximoEstado, fecha: fechaHora, nota }],
            }
          : ped
      )
    );

    agregarNotificacion(
      "pedido",
      `Avance de entrega: ${pedidoObj.id}`,
      `Tu pedido ${pedidoObj.id} ahora se encuentra en estado: ${proximoEstado}.`,
      pedidoObj.id,
      `pedido-${pedidoObj.id}-${proximoEstado}`
    );

    notificarAlerta(`Pedido ${pedidoObj.id} actualizado a: ${proximoEstado} (Simulación).`);
  };

  // ------------------------------------------
  // LOGICA: CANCELACIÓN Y REINTEGRO DE STOCK
  // ------------------------------------------
  const ejecutarCancelacionPedido = (pedidoId) => {
    const pedidoObjetivo = pedidos.find((p) => p.id === pedidoId);
    if (!pedidoObjetivo || pedidoObjetivo.cancelado || pedidoObjetivo.estado === "Cancelado") {
      notificarAlerta("Este pedido ya fue cancelado previamente; no se realizan nuevos reintegros.");
      return;
    }
    if (pedidoObjetivo.estado === "En camino" || pedidoObjetivo.estado === "Entregado") {
      notificarAlerta(
        `No es posible cancelar el pedido ${pedidoObjetivo.id} porque ya está "${pedidoObjetivo.estado}".`
      );
      return;
    }

    const fechaHora = new Date().toLocaleString("es-CO");

    setProductos((prevProds) =>
      prevProds.map((p) => ({
        ...p,
        variantes: p.variantes.map((v) => {
          const comprado = pedidoObjetivo.items.find(
            (it) => it.productoId === p.id && it.varianteId === v.id
          );
          return comprado ? { ...v, stock: v.stock + comprado.cantidad } : v;
        }),
      }))
    );

    setPedidos((prev) =>
      prev.map((ped) =>
        ped.id === pedidoObjetivo.id
          ? {
              ...ped,
              estado: "Cancelado",
              cancelado: true,
              transiciones: [
                ...ped.transiciones,
                {
                  estado: "Cancelado",
                  fecha: fechaHora,
                  nota: "Cancelado por el comprador. Inventario restituido.",
                },
              ],
            }
          : ped
      )
    );

    agregarNotificacion(
      "cancelacion",
      `Pedido Cancelado: ${pedidoObjetivo.id}`,
      `El pedido ${pedidoObjetivo.id} fue cancelado exitosamente y sus unidades se reintegraron al inventario.`,
      pedidoObjetivo.id,
      `cancelacion-${pedidoObjetivo.id}`
    );

    notificarAlerta(`Pedido ${pedidoObjetivo.id} cancelado y stock restituido.`);
  };

  const cancelarPedidoCompra = (pedidoObj) => {
    if (pedidoObj.cancelado || pedidoObj.estado === "Cancelado") {
      notificarAlerta("Este pedido ya está Cancelado. No se permiten nuevos reintegros.");
      return;
    }

    if (pedidoObj.estado === "En camino" || pedidoObj.estado === "Entregado") {
      notificarAlerta(
        `No se puede cancelar el pedido ${pedidoObj.id}: ya se encuentra "${pedidoObj.estado}". Solo se cancela en Confirmado o Preparando.`
      );
      return;
    }

    abrirConfirmacionModal({
      titulo: "Confirmar cancelación",
      mensaje: `¿Deseas cancelar el pedido ${pedidoObj.id}? Se restituirán exactamente las unidades originales a cada variante.`,
      textoConfirmar: "Sí, cancelar pedido",
      onConfirmar: () => ejecutarCancelacionPedido(pedidoObj.id),
    });
  };

  // ------------------------------------------
  // LOGICA: LIBRETA DE DIRECCIONES
  // ------------------------------------------
  const guardarDireccionLibreta = () => {
    setErrorDireccion("");
    if (!aliasDir.trim() || !detalleDir.trim()) {
      const msg = "Ingresa un alias (ej. Casa) y la referencia/dirección de entrega.";
      setErrorDireccion(msg);
      notificarAlerta(msg);
      return;
    }

    if (idEditandoDir) {
      setDirecciones((prev) =>
        prev.map((d) =>
          d.id === idEditandoDir
            ? { ...d, alias: aliasDir.trim(), municipio: municipioDir, descripcion: detalleDir.trim() }
            : d
        )
      );
      setIdEditandoDir(null);
      notificarAlerta("Dirección actualizada correctamente.");
    } else {
      const nuevaId = "DIR-" + Date.now().toString().slice(-5);
      const nueva = {
        id: nuevaId,
        alias: aliasDir.trim(),
        municipio: municipioDir,
        descripcion: detalleDir.trim(),
        principal: direcciones.length === 0,
      };
      setDirecciones((prev) => [...prev, nueva]);
      if (!direccionSeleccionadaId) {
        setDireccionSeleccionadaId(nuevaId);
      }
      notificarAlerta("Dirección guardada en tu libreta.");
    }

    setAliasDir("");
    setDetalleDir("");
  };

  const seleccionarComoPrincipal = (dirId) => {
    setDirecciones((prev) => prev.map((d) => ({ ...d, principal: d.id === dirId })));
    setDireccionSeleccionadaId(dirId);
    notificarAlerta("Dirección principal actualizada.");
  };

  const iniciarEdicionDireccion = (d) => {
    setErrorDireccion("");
    setIdEditandoDir(d.id);
    setAliasDir(d.alias);
    setMunicipioDir(d.municipio);
    setDetalleDir(d.descripcion);
  };

  const eliminarDireccion = (dirId) => {
    setDirecciones((prev) => prev.filter((x) => x.id !== dirId));
    if (direccionSeleccionadaId === dirId) {
      setDireccionSeleccionadaId(null);
    }
    if (idEditandoDir === dirId) {
      setIdEditandoDir(null);
      setAliasDir("");
      setDetalleDir("");
    }
    notificarAlerta("Dirección eliminada de tu libreta.");
  };

  // ------------------------------------------
  // LOGICA: PREGUNTAS Y RESPUESTAS
  // ------------------------------------------
  const enviarPreguntaProducto = () => {
    if (!productoActual) return;
    setErrorPregunta("");
    const txt = nuevaPreguntaTexto.trim();

    if (txt.length < 10) {
      const msg = "Escribe una consulta de al menos 10 caracteres antes de enviar.";
      setErrorPregunta(msg);
      notificarAlerta(msg);
      return;
    }

    const nuevaQ = {
      id: "Q-" + Date.now(),
      pregunta: txt,
      respuesta: null,
      fecha: new Date().toLocaleDateString("es-CO"),
      estado: "Pendiente",
    };

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoActual.id ? { ...p, preguntas: [...(p.preguntas || []), nuevaQ] } : p
      )
    );

    setNuevaPreguntaTexto("");
    notificarAlerta('Pregunta registrada con estado "Pendiente".');
  };

  const simularRespuestaPregunta = (preguntaId) => {
    const respuestasEjemplo = [
      "[Respuesta automática de demostración]: Sí, cuenta con garantía de 30 días en modo simulación.",
      "[Respuesta automática de demostración]: Los materiales están pensados para uso diario y fácil cuidado.",
      "[Respuesta automática de demostración]: Despachamos en empaque protegido según el municipio elegido.",
    ];
    const respuestaElegida =
      respuestasEjemplo[Math.floor(Math.random() * respuestasEjemplo.length)];

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoActual.id
          ? {
              ...p,
              preguntas: (p.preguntas || []).map((q) =>
                q.id === preguntaId ? { ...q, estado: "Respondido", respuesta: respuestaElegida } : q
              ),
            }
          : p
      )
    );

    notificarAlerta("Se simuló una respuesta de demostración.");
  };

  // ------------------------------------------
  // LOGICA: AVISOS DE REPOSICIÓN
  // ------------------------------------------
  const claveSuscripcion = (prodId, varId) => `${prodId}-${varId}`;

  const alternarSuscripcionReposicion = (prodId, varId) => {
    const clave = claveSuscripcion(prodId, varId);
    if (suscripcionesStock.includes(clave)) {
      setSuscripcionesStock((prev) => prev.filter((k) => k !== clave));
      notificarAlerta("Suscripción de aviso de stock cancelada.");
    } else {
      setSuscripcionesStock((prev) => (prev.includes(clave) ? prev : [...prev, clave]));
      notificarAlerta("Listo. Te avisaremos por notificación interna cuando haya stock.");
    }
  };

  const simularReposicionVariante = (prodId, varId, unidades = 5) => {
    const prod = productos.find((p) => p.id === prodId);
    const v = prod?.variantes.find((x) => x.id === varId);
    if (!prod || !v) return;

    const clave = claveSuscripcion(prodId, varId);
    const estaSuscrito = suscripcionesStock.includes(clave);
    const nuevoStock = v.stock + unidades;

    setProductos((prevProds) =>
      prevProds.map((p) =>
        p.id === prodId
          ? {
              ...p,
              variantes: p.variantes.map((varItem) =>
                varItem.id === varId ? { ...varItem, stock: nuevoStock } : varItem
              ),
            }
          : p
      )
    );

    if (estaSuscrito) {
      agregarNotificacion(
        "reposicion",
        `Stock disponible en ${prod.nombre}`,
        `La variante "${v.etiqueta}" ya cuenta con ${nuevoStock} unidades disponibles para compra.`,
        prodId,
        `reposicion-${prodId}-${varId}-${nuevoStock}`
      );
      setSuscripcionesStock((prev) => prev.filter((k) => k !== clave));
    }

    notificarAlerta(`Simulación: se repusieron ${unidades} unidades de "${v.etiqueta}".`);
  };

  // ------------------------------------------
  // LOGICA: CENTRO DE AYUDA Y SOPORTE
  // ------------------------------------------
  const enviarTicketSoporte = () => {
    setErrorTicket("");
    if (!ticketPedidoId) {
      const msg = "Debes seleccionar un pedido de tu historial para vincular la solicitud.";
      setErrorTicket(msg);
      notificarAlerta(msg);
      return;
    }
    if (ticketDescripcion.trim().length < 15) {
      const msg = "La descripción del inconveniente debe tener al menos 15 caracteres.";
      setErrorTicket(msg);
      notificarAlerta(msg);
      return;
    }

    const nuevoCaso = {
      id: "CASO-" + Math.floor(1000 + Math.random() * 9000),
      pedidoId: ticketPedidoId,
      motivo: ticketMotivo,
      descripcion: ticketDescripcion.trim(),
      estado: "Abierto",
      respuesta: null,
      fecha: new Date().toLocaleString("es-CO"),
    };

    setTickets((prev) => [nuevoCaso, ...prev]);
    setTicketDescripcion("");

    agregarNotificacion(
      "soporte",
      `Ticket creado: ${nuevoCaso.id}`,
      `Tu solicitud para el pedido ${ticketPedidoId} está en estado "Abierto".`,
      nuevoCaso.id,
      `ticket-${nuevoCaso.id}`
    );

    notificarAlerta(`Caso ${nuevoCaso.id} abierto correctamente.`);
  };

  const simularRespuestaSoporte = (casoId) => {
    const respuestas = [
      "[Respuesta ficticia de soporte]: Hemos revisado tu reporte y priorizamos el seguimiento de tu envío.",
      "[Respuesta ficticia de soporte]: Verificamos tu caso; nuestro equipo registró la novedad en el pedido.",
      "[Respuesta ficticia de soporte]: Tu solicitud fue atendida en simulación y queda registrada como resuelta.",
    ];
    const r = respuestas[Math.floor(Math.random() * respuestas.length)];

    setTickets((prev) =>
      prev.map((t) => (t.id === casoId ? { ...t, estado: "Respondido", respuesta: r } : t))
    );

    agregarNotificacion(
      "soporte",
      `Respuesta recibida en ${casoId}`,
      "El centro de ayuda simulado respondió a tu caso.",
      casoId,
      `ticket-resp-${casoId}`
    );

    notificarAlerta(`Caso ${casoId} marcado como Respondido.`);
  };

  // ------------------------------------------
  // LOGICA: PANEL VENDEDOR
  // ------------------------------------------
  const limpiarFormularioVendedor = () => {
    setIdProdEditando(null);
    setNombreProdForm("");
    setMarcaProdForm("GlowWear");
    setCategoriaProdForm("Moda");
    setPrecioProdForm("");
    setStockProdForm("");
    setVarianteEtiquetaForm("Presentación Estándar");
    setDescripcionProdForm("");
    setErrorVendedor("");
  };

  const iniciarEdicionProducto = (prod) => {
    setErrorVendedor("");
    setIdProdEditando(prod.id);
    setNombreProdForm(prod.nombre);
    setMarcaProdForm(prod.marca);
    setCategoriaProdForm(prod.categoria);
    setPrecioProdForm(String(prod.precio));
    setStockProdForm(String(prod.variantes?.[0]?.stock ?? 0));
    setVarianteEtiquetaForm(prod.variantes?.[0]?.etiqueta || "Presentación Estándar");
    setDescripcionProdForm(prod.descripcion);
    notificarAlerta(`Editando producto: ${prod.nombre}`);
  };

  const guardarProductoVendedor = () => {
    setErrorVendedor("");
    const precioNum = Number(precioProdForm);
    const stockNum = Number(stockProdForm);

    if (!nombreProdForm.trim() || descripcionProdForm.trim().length < 15) {
      setErrorVendedor("Escribe el nombre y una descripción de mínimo 15 caracteres.");
      return;
    }
    if (!Number.isInteger(precioNum) || precioNum <= 0) {
      setErrorVendedor("El precio debe ser un número entero mayor que cero.");
      return;
    }
    if (stockProdForm.trim() === "" || !Number.isInteger(stockNum) || stockNum < 0) {
      setErrorVendedor("El stock debe ser un número entero igual o mayor que cero.");
      return;
    }

    if (idProdEditando) {
      setProductos((prev) =>
        prev.map((p) => {
          if (p.id !== idProdEditando) return p;
          const variantesActualizadas = (p.variantes || []).map((v, idx) =>
            idx === 0
              ? {
                  ...v,
                  etiqueta: varianteEtiquetaForm.trim() || v.etiqueta,
                  precioFinal: precioNum,
                  stock: stockNum,
                }
              : v
          );
          return {
            ...p,
            nombre: nombreProdForm.trim(),
            marca: marcaProdForm.trim() || "ShopGlow",
            categoria: categoriaProdForm,
            precio: precioNum,
            descripcion: descripcionProdForm.trim(),
            variantes: variantesActualizadas,
          };
        })
      );
      notificarAlerta("Producto actualizado en el catálogo (pedidos anteriores intactos).");
    } else {
      const nuevoProd = {
        id: "PROD-" + Date.now().toString().slice(-5),
        marca: marcaProdForm.trim() || "ShopGlow",
        nombre: nombreProdForm.trim(),
        categoria: categoriaProdForm,
        precio: precioNum,
        descripcion: descripcionProdForm.trim(),
        imagen: null,
        variantes: [
          {
            id: "V1",
            etiqueta: varianteEtiquetaForm.trim() || "Presentación Estándar",
            precioFinal: precioNum,
            stock: stockNum,
          },
        ],
        preguntas: [],
        valoraciones: [],
      };
      setProductos((prev) => [...prev, nuevoProd]);
      notificarAlerta("Nuevo producto creado en el catálogo.");
    }

    limpiarFormularioVendedor();
  };

  // ------------------------------------------
  // RENDER: TARJETA REUTILIZABLE DE PRODUCTO
  // ------------------------------------------
  function renderTarjetaProducto(prod) {
    const stock = calcularStockTotal(prod);
    const enComparador = compararIds.includes(prod.id);
    const esFavorito = favoritos.includes(prod.id);

    return (
      <View
        key={prod.id}
        style={[estilos.tarjetaGrid, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}
      >
        <Pressable onPress={() => abrirDetalleProducto(prod)}>
          <View style={[estilos.fotoContenedor, { backgroundColor: tema.lilaClaro }]}>
            {prod.imagen ? (
              <Image source={prod.imagen} style={estilos.fotoProducto} resizeMode="cover" />
            ) : (
              <View style={estilos.placeholderImagen}>
                <Text style={[estilos.inicialProducto, { color: tema.lilaOscuro }]}>
                  {prod.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Pressable
              style={[
                estilos.botonCorazonFlotante,
                {
                  backgroundColor: tema.tarjeta,
                  borderColor: esFavorito ? tema.rojo : tema.borde,
                  borderWidth: 1,
                },
              ]}
              onPress={() => alternarFavorito(prod.id)}
              accessibilityLabel="Alternar favorito"
            >
              <MaterialCommunityIcons
                name={esFavorito ? "heart" : "heart-outline"}
                size={17 * escalaTexto}
                color={esFavorito ? tema.rojo : tema.textoSecundario}
              />
            </Pressable>
          </View>
          <Text style={[estilos.marcaPill, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
            {prod.marca} · {prod.categoria}
          </Text>
          <Text
            numberOfLines={2}
            style={[estilos.nombreProducto, { color: tema.texto, fontSize: 14 * escalaTexto }]}
          >
            {prod.nombre}
          </Text>
          <Text style={[estilos.precioProducto, { color: tema.lilaOscuro, fontSize: 15 * escalaTexto }]}>
            {formatearDinero(prod.precio)}
          </Text>
          <Text
            style={[
              estilos.stockIndicador,
              { color: stock > 0 ? tema.verdeOscuro : tema.rojo, fontSize: 11 * escalaTexto },
            ]}
          >
            {stock > 0 ? `${stock} disp. (${prod.variantes.length} var.)` : "Agotado"}
          </Text>
        </Pressable>

        <View style={estilos.filaBotonesCard}>
          <Boton
            texto="Ver detalle"
            pequeno
            tipo="lila"
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => abrirDetalleProducto(prod)}
            estiloExtra={{ flex: 1, marginRight: 4 }}
          />
          <Boton
            texto={enComparador ? "En comparación" : "Comparar"}
            pequeno
            tipo={enComparador ? "verde" : "claro"}
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => alternarComparacion(prod.id)}
            estiloExtra={{ flex: 1 }}
          />
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA INICIO / CATÁLOGO
  // ------------------------------------------
  function renderCatalogo() {
    return (
      <View>
        {/* Barra de Búsqueda */}
        <CampoTexto
          titulo="Buscar en catálogo"
          valor={busqueda}
          cambiar={setBusqueda}
          ayuda="Nombre, descripción o marca..."
          tema={tema}
          escalaTexto={escalaTexto}
        />

        {/* Carrusel de Categorías */}
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
          Categorías
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.carruselCategorias}>
          {CATEGORIAS.map((cat) => (
            <Boton
              key={cat}
              texto={cat}
              pequeno
              tipo={filtroCategoria === cat ? "lila" : "claro"}
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => setFiltroCategoria(cat)}
              estiloExtra={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>

        {/* Panel de Filtros Combinados (HU23) */}
        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <View style={estilos.filaEspacioWrap}>
            <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
              Filtros Combinados de Catálogo
            </Text>
            <Boton
              texto="Restablecer"
              pequeno
              tipo="claro"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={restablecerFiltros}
            />
          </View>

          {/* Filtro por Marca */}
          <Text style={[estilos.etiquetaPequena, { color: tema.textoSecundario, fontSize: 12 * escalaTexto }]}>
            Marca:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
            {MARCAS.map((m) => (
              <Boton
                key={m}
                texto={m}
                pequeno
                tipo={filtroMarca === m ? "lila" : "claro"}
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setFiltroMarca(m)}
                estiloExtra={{ marginRight: 6 }}
              />
            ))}
          </ScrollView>

          {/* Rango de Precios Corregido con Sliders */}
          <Text
            style={[
              estilos.etiquetaPequena,
              { color: tema.textoSecundario, marginTop: 8, fontSize: 12 * escalaTexto },
            ]}
          >
            Rango de Precios ({formatearDinero(precioMin)} - {formatearDinero(precioMax)}):
          </Text>

          <SliderRangoPrecio
            etiqueta="Precio mínimo"
            valor={precioMin}
            minPermitido={PRECIO_ABSOLUTO_MIN}
            maxPermitido={precioMax}
            onChange={cambiarPrecioMinimo}
            colorRelleno={tema.lila}
            tema={tema}
            escalaTexto={escalaTexto}
          />

          <SliderRangoPrecio
            etiqueta="Precio máximo"
            valor={precioMax}
            minPermitido={precioMin}
            maxPermitido={PRECIO_ABSOLUTO_MAX}
            onChange={cambiarPrecioMaximo}
            colorRelleno={tema.verdeOscuro}
            tema={tema}
            escalaTexto={escalaTexto}
          />

          {errorRangoPrecio ? (
            <Text style={[estilos.textoErrorValidacion, { color: tema.rojo, fontSize: 11 * escalaTexto }]}>
              {errorRangoPrecio}
            </Text>
          ) : null}

          {/* Filtro por Disponibilidad */}
          <Text
            style={[
              estilos.etiquetaPequena,
              { color: tema.textoSecundario, marginTop: 8, fontSize: 12 * escalaTexto },
            ]}
          >
            Disponibilidad:
          </Text>
          <View style={estilos.filaWrap}>
            {["Todos", "Disponibles", "Agotados"].map((d) => (
              <Boton
                key={d}
                texto={d}
                pequeno
                tipo={filtroDisponibilidad === d ? "verde" : "claro"}
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setFiltroDisponibilidad(d)}
                estiloExtra={{ marginRight: 6, marginBottom: 4 }}
              />
            ))}
          </View>

          {/* Ordenamiento */}
          <View style={[estilos.filaEspacioWrap, { marginTop: 8 }]}>
            <Text style={[estilos.etiquetaPequena, { color: tema.textoSecundario, fontSize: 12 * escalaTexto }]}>
              Ordenar por:
            </Text>
            <View style={estilos.filaWrap}>
              <Boton
                texto="Menor $"
                pequeno
                tipo={orden === "menor" ? "lila" : "claro"}
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setOrden(orden === "menor" ? "normal" : "menor")}
                estiloExtra={{ marginRight: 4 }}
              />
              <Boton
                texto="Mayor $"
                pequeno
                tipo={orden === "mayor" ? "lila" : "claro"}
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setOrden(orden === "mayor" ? "normal" : "mayor")}
              />
            </View>
          </View>
        </View>

        {/* Acceso rápido a Comparador si hay seleccionados */}
        {compararIds.length > 0 ? (
          <View style={[estilos.bannerComparador, { backgroundColor: tema.lilaClaro, borderColor: tema.lila }]}>
            <Text style={[estilos.textoComparadorBanner, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
              Comparador: {compararIds.length} producto(s) seleccionado(s)
            </Text>
            <Boton
              texto="Ver Comparador"
              pequeno
              tipo="lila"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => irA("Comparador")}
            />
          </View>
        ) : null}

        {/* Lista de Productos del Catálogo */}
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
          Productos ({productosFiltrados.length})
        </Text>

        {productosFiltrados.length === 0 ? (
          <View style={[estilos.cajaVacia, { backgroundColor: tema.tarjeta, borderColor: tema.borde, borderWidth: 1 }]}>
            <MaterialCommunityIcons name="magnify" size={38} color={tema.lilaOscuro} />
            <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
              No se encontraron productos
            </Text>
            <Text style={[estilos.textoVacio, { color: tema.textoSecundario, fontSize: 13 * escalaTexto }]}>
              Ningún artículo coincide con los filtros aplicados. Prueba ajustando el rango de precios, la marca o la búsqueda.
            </Text>
            <Boton
              texto="Restablecer filtros"
              tipo="lila"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={restablecerFiltros}
              estiloExtra={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={estilos.grillaProductos}>{productosFiltrados.map(renderTarjetaProducto)}</View>
        )}
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA FAVORITOS
  // ------------------------------------------
  function renderFavoritos() {
    const productosFavoritos = productos.filter((p) => favoritos.includes(p.id));
    return (
      <View>
        <Boton
          texto="Volver al catálogo"
          tipo="claro"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => irA("Catalogo")}
          estiloExtra={{ marginBottom: 12 }}
        />
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="heart-outline" size={20} color={tema.rojo} /> Mis Favoritos ({productosFavoritos.length})
        </Text>
        <Text style={[estilos.etiquetaPequena, { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto }]}>
          Los productos que guardaste para revisar más tarde.
        </Text>

        {productosFavoritos.length === 0 ? (
          <View style={[estilos.cajaVacia, { backgroundColor: tema.tarjeta, borderColor: tema.borde, borderWidth: 1 }]}>
            <MaterialCommunityIcons name="heart-outline" size={38} color={tema.lilaOscuro} />
            <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
              Aún no tienes favoritos
            </Text>
            <Text style={[estilos.textoVacio, { color: tema.textoSecundario, fontSize: 13 * escalaTexto }]}>
              Explora el catálogo y marca el ícono de favorito en los productos que te gusten.
            </Text>
            <Boton
              texto="Ir al catálogo"
              tipo="lila"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => irA("Catalogo")}
              estiloExtra={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={estilos.grillaProductos}>{productosFavoritos.map(renderTarjetaProducto)}</View>
        )}
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA DETALLE DE PRODUCTO
  // ------------------------------------------
  function renderDetalle() {
    if (!productoActual) return null;

    const estaSuscrito = varianteActual
      ? suscripcionesStock.includes(claveSuscripcion(productoActual.id, varianteActual.id))
      : false;
    const esFavorito = favoritos.includes(productoActual.id);
    const notas = productoActual.valoraciones || [];
    const varianteAgotada = Boolean(varianteActual && varianteActual.stock === 0);

    const recomendaciones = productos
      .filter(
        (p) =>
          p.categoria === productoActual.categoria &&
          p.id !== productoActual.id &&
          calcularStockTotal(p) > 0
      )
      .slice(0, 4);

    return (
      <View>
        <Boton
          texto="Volver al catálogo"
          tipo="claro"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => irA("Catalogo")}
          estiloExtra={{ marginBottom: 12 }}
        />

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <View style={[estilos.fotoGrandeContenedor, { backgroundColor: tema.lilaClaro }]}>
            {productoActual.imagen ? (
              <Image source={productoActual.imagen} style={estilos.fotoGrande} resizeMode="contain" />
            ) : (
              <View style={estilos.placeholderImagen}>
                <Text style={[estilos.inicialDetalle, { color: tema.lilaOscuro }]}>
                  {productoActual.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={estilos.filaEspacio}>
            <View style={{ flex: 1 }}>
              <Text style={[estilos.marcaPill, { color: tema.textoSecundario, fontSize: 11 * escalaTexto }]}>
                {productoActual.marca} · {productoActual.categoria}
              </Text>
              <Text style={[estilos.tituloDetalle, { color: tema.texto, fontSize: 22 * escalaTexto }]}>
                {productoActual.nombre}
              </Text>
            </View>
            <Pressable
              style={estilos.iconoAccion}
              onPress={() => alternarFavorito(productoActual.id)}
              accessibilityLabel="Alternar favorito"
            >
              <MaterialCommunityIcons
                name={esFavorito ? "heart" : "heart-outline"}
                size={25 * escalaTexto}
                color={esFavorito ? tema.rojo : tema.textoSecundario}
              />
            </Pressable>
          </View>

          <Text style={[estilos.precioDetalle, { color: tema.lilaOscuro, fontSize: 22 * escalaTexto }]}>
            {varianteActual
              ? formatearDinero(varianteActual.precioFinal)
              : formatearDinero(productoActual.precio)}
          </Text>

          {varianteActual ? (
            <Text
              style={{
                color: varianteActual.stock > 0 ? tema.verdeOscuro : tema.rojo,
                fontWeight: "700",
                fontSize: 12 * escalaTexto,
                marginBottom: 4,
              }}
            >
              Variante seleccionada: {varianteActual.etiqueta} ·{" "}
              {varianteActual.stock > 0 ? `${varianteActual.stock} unidades disponibles` : "Agotada"}
            </Text>
          ) : null}

          <Text style={[estilos.descripcionDetalle, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
            {productoActual.descripcion}
          </Text>

          <View style={[estilos.divisor, { backgroundColor: tema.borde }]} />
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
            <MaterialCommunityIcons name="star-outline" size={18} color={tema.estrella} /> Valoración del producto
          </Text>
          <Text style={[estilos.etiquetaPequena, { color: tema.textoSecundario, fontSize: 12 * escalaTexto }]}>
            {promedioValoracion(productoActual)} · {notas.length} valoración(es)
          </Text>
          <View style={estilos.filaEstrellas}>
            {[1, 2, 3, 4, 5].map((nota) => (
              <Pressable
                key={nota}
                onPress={() => calificarProducto(productoActual.id, nota)}
                style={estilos.botonEstrella}
              >
                <MaterialCommunityIcons name="star" size={23 * escalaTexto} color={tema.estrella} />
                <Text style={[estilos.numeroEstrella, { color: tema.textoSecundario, fontSize: 11 * escalaTexto }]}>
                  {nota}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[estilos.divisor, { backgroundColor: tema.borde }]} />
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
            1. Elige una variante (Talla, Color o Presentación) *
          </Text>

          {productoActual.variantes.map((v) => {
            const seleccionada = varianteSeleccionadaId === v.id;
            return (
              <Pressable
                key={v.id}
                onPress={() => {
                  setVarianteSeleccionadaId(v.id);
                  setErrorDetalle("");
                }}
                style={[
                  estilos.opcionVariante,
                  {
                    borderColor: seleccionada ? tema.lila : tema.borde,
                    backgroundColor: seleccionada ? tema.lilaClaro : tema.tarjeta,
                  },
                ]}
              >
                <View style={estilos.filaEspacio}>
                  <View style={{ flex: 1 }}>
                    <Text style={[estilos.textoVarianteNombre, { color: tema.texto, fontSize: 14 * escalaTexto }]}>
                      {v.etiqueta}
                    </Text>
                    <Text
                      style={[
                        estilos.textoVariantePrecio,
                        { color: v.stock > 0 ? tema.lilaOscuro : tema.rojo, fontSize: 12 * escalaTexto },
                      ]}
                    >
                      {formatearDinero(v.precioFinal)} · {v.stock > 0 ? `${v.stock} disponibles` : "AGOTADO"}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={seleccionada ? "radiobox-marked" : "radiobox-blank"}
                    size={21 * escalaTexto}
                    color={seleccionada ? tema.lilaOscuro : tema.textoSecundario}
                  />
                </View>
              </Pressable>
            );
          })}

          {varianteActual && varianteActual.stock === 0 ? (
            <View style={[estilos.bannerReposicion, { backgroundColor: tema.amarilloClaro }]}>
              <Text style={[estilos.textoReposicion, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
                ! Esta variante se encuentra actualmente agotada.
              </Text>
              <Boton
                texto={estaSuscrito ? "Suscrito a reposición (Cancelar)" : "Avisarme cuando haya stock"}
                tipo={estaSuscrito ? "claro" : "lila"}
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => alternarSuscripcionReposicion(productoActual.id, varianteActual.id)}
                estiloExtra={{ marginTop: 6 }}
              />
              <Boton
                texto="Simular reposición (+5 unidades)"
                tipo="verde"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => simularReposicionVariante(productoActual.id, varianteActual.id, 5)}
                estiloExtra={{ marginTop: 6 }}
              />
            </View>
          ) : null}

          <View style={{ marginTop: 12 }}>
            <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
              2. Cantidad a comprar:
            </Text>
            <View style={[estilos.fila, { marginTop: 6 }]}>
              <TextInput
                value={cantidadDetalle}
                onChangeText={setCantidadDetalle}
                keyboardType="numeric"
                style={[
                  estilos.inputPequeno,
                  {
                    width: 85,
                    textAlign: "center",
                    marginRight: 10,
                    backgroundColor: tema.tarjeta,
                    borderColor: tema.borde,
                    color: tema.texto,
                    fontSize: 14 * escalaTexto,
                  },
                ]}
              />
              <Boton
                texto={varianteAgotada ? "Variante agotada" : "Agregar al Carrito"}
                tipo="verde"
                tema={tema}
                escalaTexto={escalaTexto}
                desactivado={varianteAgotada}
                onPress={agregarAlCarritoDesdeDetalle}
                estiloExtra={{ flex: 1 }}
              />
            </View>
            {!varianteSeleccionadaId ? (
              <Text style={[estilos.ayudaAlerta, { color: tema.lilaOscuro, fontSize: 11 * escalaTexto }]}>
                * Elige una variante arriba antes de agregar al carrito.
              </Text>
            ) : null}
            {errorDetalle ? (
              <Text style={[estilos.textoErrorValidacion, { color: tema.rojo, fontSize: 12 * escalaTexto }]}>
                ! {errorDetalle}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 14 }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
            <MaterialCommunityIcons name="comment-question-outline" size={18} color={tema.lilaOscuro} /> Preguntas del Producto ({productoActual.preguntas?.length || 0})
          </Text>
          <Text
            style={[
              estilos.etiquetaPequena,
              { color: tema.textoSecundario, marginBottom: 8, fontSize: 12 * escalaTexto },
            ]}
          >
            Formula dudas sobre talla, materiales o cuidados.
          </Text>

          <CampoTexto
            titulo="Escribe tu consulta (mín. 10 caracteres):"
            valor={nuevaPreguntaTexto}
            cambiar={setNuevaPreguntaTexto}
            ayuda="Ej: ¿El color es idéntico a la fotografía?"
            tema={tema}
            escalaTexto={escalaTexto}
          />
          {errorPregunta ? (
            <Text
              style={[
                estilos.textoErrorValidacion,
                { color: tema.rojo, marginBottom: 8, fontSize: 12 * escalaTexto },
              ]}
            >
              ! {errorPregunta}
            </Text>
          ) : null}
          <Boton
            texto="Enviar Pregunta"
            tipo="lila"
            pequeno
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={enviarPreguntaProducto}
            estiloExtra={{ alignSelf: "flex-end", marginBottom: 12 }}
          />

          {!productoActual.preguntas || productoActual.preguntas.length === 0 ? (
            <Text style={[estilos.parrafoVacio, { color: tema.textoSecundario, fontSize: 12 * escalaTexto }]}>
              Aún no hay preguntas formuladas para este artículo. Sé la primera persona en consultar.
            </Text>
          ) : (
            productoActual.preguntas.map((q) => (
              <View key={q.id} style={[estilos.cajaPreguntaItem, { borderColor: tema.borde }]}>
                <View style={estilos.filaEspacio}>
                  <Text style={[estilos.preguntaTexto, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
                    P: {q.pregunta}
                  </Text>
                  <EstadoBadge estado={q.estado} escalaTexto={escalaTexto} />
                </View>
                <Text style={[estilos.fechaPequena, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                  Fecha: {q.fecha}
                </Text>

                {q.respuesta ? (
                  <View style={[estilos.cajaRespuesta, { backgroundColor: tema.lilaClaro }]}>
                    <Text style={[estilos.respuestaTexto, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
                      {q.respuesta}
                    </Text>
                  </View>
                ) : (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontStyle: "italic", color: tema.textoSecundario, fontSize: 12 * escalaTexto }}>
                      Estado Pendiente · Modo demostración:
                    </Text>
                    <Boton
                      texto="Simular respuesta de demostración"
                      tipo="claro"
                      pequeno
                      tema={tema}
                      escalaTexto={escalaTexto}
                      onPress={() => simularRespuestaPregunta(q.id)}
                      estiloExtra={{ marginTop: 6 }}
                    />
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 14 }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
            <MaterialCommunityIcons name="shopping-outline" size={18} color={tema.lilaOscuro} /> Productos Relacionados ({productoActual.categoria})
          </Text>
          {recomendaciones.length === 0 ? (
            <View style={{ paddingVertical: 12 }}>
              <Text style={[estilos.parrafoVacio, { color: tema.textoSecundario, fontSize: 12 * escalaTexto }]}>
                No hay más productos disponibles en esta categoría actualmente.
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {recomendaciones.map((rec) => {
                const stockRec = calcularStockTotal(rec);
                return (
                  <Pressable
                    key={rec.id}
                    onPress={() => abrirDetalleProducto(rec)}
                    style={[estilos.tarjetaRecomendado, { borderColor: tema.borde, backgroundColor: tema.tarjeta }]}
                  >
                    {rec.imagen ? (
                      <Image
                        source={rec.imagen}
                        style={[estilos.fotoRecomendado, { backgroundColor: tema.lilaClaro }]}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[estilos.fotoRecomendado, styles.placeholderImagen, { backgroundColor: tema.lilaClaro }]}>
                        <Text style={{ color: tema.lilaOscuro, fontWeight: "800" }}>{rec.nombre.charAt(0)}</Text>
                      </View>
                    )}
                    <Text
                      numberOfLines={2}
                      style={[estilos.nombreRecomendado, { color: tema.texto, fontSize: 11 * escalaTexto }]}
                    >
                      {rec.nombre}
                    </Text>
                    <Text style={[estilos.precioRecomendado, { color: tema.lilaOscuro, fontSize: 11 * escalaTexto }]}>
                      {formatearDinero(rec.precio)}
                    </Text>
                    <Text style={[estilos.stockPequeno, { color: tema.verdeOscuro, fontSize: 10 * escalaTexto }]}>
                      {stockRec} disp.
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA COMPARADOR
  // ------------------------------------------
  function renderComparador() {
    const productosComparados = productos.filter((p) => compararIds.includes(p.id));

    return (
      <View>
        <Boton
          texto="Volver al catálogo"
          tipo="claro"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => irA("Catalogo")}
          estiloExtra={{ marginBottom: 12 }}
        />

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <View style={estilos.filaEspacioWrap}>
            <Text style={[estilos.tituloDetalle, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
              <MaterialCommunityIcons name="compare-horizontal" size={20} color={tema.lilaOscuro} /> Comparador de Productos
            </Text>
            {compararIds.length > 0 ? (
              <Boton
                texto="Limpiar todo"
                pequeno
                tipo="claro"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setCompararIds([])}
              />
            ) : null}
          </View>
          <Text
            style={[
              estilos.etiquetaPequena,
              { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto },
            ]}
          >
            Compara simultáneamente nombre, marca, precio y disponibilidad de entre 2 y 3 productos.
          </Text>

          {productosComparados.length === 1 ? (
            <View style={[estilos.bannerComparador, { backgroundColor: tema.lilaClaro, borderColor: tema.lila }]}>
              <Text style={{ color: tema.texto, fontSize: 12 * escalaTexto, flex: 1 }}>
                Tienes 1 producto seleccionado. Selecciona 1 o 2 productos más en el catálogo para compararlos en columnas.
              </Text>
            </View>
          ) : null}

          {productosComparados.length === 0 ? (
            <View style={estilos.cajaVacia}>
              <MaterialCommunityIcons name="compare-horizontal" size={38} color={tema.lilaOscuro} />
              <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
                No hay productos para comparar
              </Text>
              <Text style={[estilos.textoVacio, { color: tema.textoSecundario, fontSize: 13 * escalaTexto }]}>
                Ve al catálogo y pulsa "+ Comparar" en los productos que desees evaluar (mínimo 2, máximo 3).
              </Text>
              <Boton
                texto="Ir al Catálogo"
                tipo="lila"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => irA("Catalogo")}
                estiloExtra={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={estilos.tablaComparador}>
                {productosComparados.map((p) => {
                  const stockTotal = calcularStockTotal(p);
                  return (
                    <View
                      key={p.id}
                      style={[estilos.columnaComparador, { borderColor: tema.borde, backgroundColor: tema.tarjeta }]}
                    >
                      {p.imagen ? (
                        <Image
                          source={p.imagen}
                          style={[estilos.fotoComparador, { backgroundColor: tema.lilaClaro }]}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={[estilos.fotoComparador, styles.placeholderImagen, { backgroundColor: tema.lilaClaro }]}>
                          <Text style={[estilos.inicialProducto, { color: tema.lilaOscuro }]}>
                            {p.nombre.charAt(0)}
                          </Text>
                        </View>
                      )}
                      <Text style={[estilos.etiquetaAtributo, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                        Nombre
                      </Text>
                      <Text style={[estilos.valorAtributo, { color: tema.texto, fontWeight: "bold", fontSize: 12 * escalaTexto }]}>
                        {p.nombre}
                      </Text>

                      <Text style={[estilos.etiquetaAtributo, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                        Marca
                      </Text>
                      <Text style={[estilos.valorAtributo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>{p.marca}</Text>

                      <Text style={[estilos.etiquetaAtributo, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                        Precio Base
                      </Text>
                      <Text
                        style={[estilos.valorAtributo, { color: tema.lilaOscuro, fontWeight: "bold", fontSize: 12 * escalaTexto }]}
                      >
                        {formatearDinero(p.precio)}
                      </Text>

                      <Text style={[estilos.etiquetaAtributo, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                        Disponibilidad
                      </Text>
                      <Text
                        style={[
                          estilos.valorAtributo,
                          {
                            color: stockTotal > 0 ? tema.verdeOscuro : tema.rojo,
                            fontWeight: "bold",
                            fontSize: 12 * escalaTexto,
                          },
                        ]}
                      >
                        {stockTotal > 0 ? `${stockTotal} unidades` : "Agotado"}
                      </Text>

                      <Text style={[estilos.etiquetaAtributo, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                        Categoría
                      </Text>
                      <Text style={[estilos.valorAtributo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
                        {p.categoria}
                      </Text>

                      <Text style={[estilos.etiquetaAtributo, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                        Variantes
                      </Text>
                      <Text style={[estilos.valorAtributo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
                        {p.variantes.map((v) => v.etiqueta).join(", ")}
                      </Text>

                      <View style={{ marginTop: 12 }}>
                        <Boton
                          texto="Ver detalle"
                          pequeno
                          tipo="lila"
                          tema={tema}
                          escalaTexto={escalaTexto}
                          onPress={() => abrirDetalleProducto(p)}
                          estiloExtra={{ marginBottom: 6 }}
                        />
                        <Boton
                          texto="Retirar"
                          pequeno
                          tipo="peligro"
                          tema={tema}
                          escalaTexto={escalaTexto}
                          onPress={() => alternarComparacion(p.id)}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA CARRITO
  // ------------------------------------------
  function renderCarrito() {
    return (
      <View>
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="cart-outline" size={20} color={tema.lilaOscuro} /> Carrito de Compras ({cantidadTotalArticulos} artículos)
        </Text>

        {carrito.length === 0 ? (
          <View style={[estilos.cajaVacia, { backgroundColor: tema.tarjeta, borderColor: tema.borde, borderWidth: 1 }]}>
            <MaterialCommunityIcons name="cart-outline" size={38} color={tema.lilaOscuro} />
            <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
              Tu carrito está vacío
            </Text>
            <Text style={[estilos.textoVacio, { color: tema.textoSecundario, fontSize: 13 * escalaTexto }]}>
              Explora nuestros productos y agrega tus artículos preferidos con su talla o color favorito.
            </Text>
            <Boton
              texto="Ir a la tienda"
              tipo="lila"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => irA("Catalogo")}
              estiloExtra={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View>
            {carrito.map((item) => (
              <View
                key={item.id}
                style={[estilos.tarjetaItemCarrito, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}
              >
                {item.imagen ? (
                  <Image
                    source={item.imagen}
                    style={[estilos.fotoMiniCarrito, { backgroundColor: tema.lilaClaro }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[estilos.fotoMiniCarrito, styles.placeholderImagen, { backgroundColor: tema.lilaClaro }]}>
                    <Text style={{ color: tema.lilaOscuro, fontWeight: "800" }}>{item.nombre.charAt(0)}</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={[estilos.nombreCarrito, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
                    {item.nombre}
                  </Text>
                  <Text style={[estilos.varianteCarrito, { color: tema.lilaOscuro, fontSize: 11 * escalaTexto }]}>
                    Variante: {item.varianteEtiqueta}
                  </Text>
                  <Text style={[estilos.precioCarrito, { color: tema.lilaOscuro, fontSize: 13 * escalaTexto }]}>
                    {formatearDinero(item.precioUnitario)} c/u · Total:{" "}
                    {formatearDinero(item.precioUnitario * item.cantidad)}
                  </Text>
                </View>

                <View style={[estilos.controlesCantidad, { backgroundColor: tema.lilaClaro }]}>
                  <Pressable style={estilos.btnCant} onPress={() => modificarCantidadCarrito(item, -1)}>
                    <Text style={[estilos.txtCant, { color: tema.lilaOscuro, fontSize: 16 * escalaTexto }]}>-</Text>
                  </Pressable>
                  <Text style={[estilos.numCant, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
                    {item.cantidad}
                  </Text>
                  <Pressable style={estilos.btnCant} onPress={() => modificarCantidadCarrito(item, +1)}>
                    <Text style={[estilos.txtCant, { color: tema.lilaOscuro, fontSize: 16 * escalaTexto }]}>+</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => eliminarDelCarrito(item.id)} style={{ padding: 6, marginLeft: 4 }}>
                  <MaterialCommunityIcons name="close" size={18 * escalaTexto} color={tema.rojo} />
                </Pressable>
              </View>
            ))}

            <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 10 }]}>
              <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
                Cupón de descuento
              </Text>
              <View style={[estilos.fila, { marginTop: 6 }]}>
                <TextInput
                  value={codigoCupon}
                  onChangeText={setCodigoCupon}
                  placeholder="Ej: BIENVENIDO10"
                  placeholderTextColor={tema.textoSecundario}
                  autoCapitalize="characters"
                  style={[
                    estilos.entradaTexto,
                    {
                      flex: 1,
                      marginRight: 8,
                      backgroundColor: tema.tarjeta,
                      borderColor: tema.borde,
                      color: tema.texto,
                      fontSize: 13 * escalaTexto,
                    },
                  ]}
                />
                <Boton
                  texto="Aplicar"
                  pequeno
                  tipo="lila"
                  tema={tema}
                  escalaTexto={escalaTexto}
                  onPress={() => {
                    if (codigoCupon.trim().toUpperCase() === "BIENVENIDO10" && carrito.length > 0) {
                      setCuponAplicado(true);
                      notificarAlerta("Cupón aplicado: 10% de descuento en tu compra.");
                    } else {
                      setCuponAplicado(false);
                      notificarAlerta("Cupón no válido o carrito vacío.");
                    }
                  }}
                />
              </View>
              {cuponAplicado ? (
                <Text
                  style={{
                    color: tema.verdeOscuro,
                    fontSize: 12 * escalaTexto,
                    marginTop: 4,
                    fontWeight: "bold",
                  }}
                >
                  Descuento del 10% activado
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 10 }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
            Resumen de compra
          </Text>

          <View style={estilos.filaResumen}>
            <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>Subtotal:</Text>
            <Text style={{ color: tema.texto, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
              {formatearDinero(subtotalCarrito)}
            </Text>
          </View>

          {cuponAplicado ? (
            <View style={estilos.filaResumen}>
              <Text style={{ color: tema.verdeOscuro, fontSize: 13 * escalaTexto }}>Descuento 10%:</Text>
              <Text style={{ color: tema.verdeOscuro, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                -{formatearDinero(descuentoCarrito)}
              </Text>
            </View>
          ) : null}

          <View style={estilos.filaResumen}>
            <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
              Envío estimado ({direccionSeleccionada?.municipio || "Sin dirección"}):
            </Text>
            <Text style={{ color: tema.texto, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
              {carrito.length === 0 ? formatearDinero(0) : formatearDinero(costoEnvioFinal)}
            </Text>
          </View>

          <View style={[estilos.filaResumen, { borderTopWidth: 1, borderTopColor: tema.borde, paddingTop: 6, marginTop: 4 }]}>
            <Text style={{ color: tema.texto, fontWeight: "bold", fontSize: 15 * escalaTexto }}>Total estimado:</Text>
            <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 16 * escalaTexto }}>
              {carrito.length === 0 ? formatearDinero(0) : formatearDinero(totalPedidoFinal)}
            </Text>
          </View>

          {carrito.length > 0 ? (
            <Boton
              texto="Continuar a Entrega y Pago"
              tipo="verde"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => irA("Checkout")}
              estiloExtra={{ marginTop: 14 }}
            />
          ) : null}
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA CHECKOUT Y ESTIMADOR ENVÍO
  // ------------------------------------------
  function renderCheckout() {
    const tarifaMun = direccionSeleccionada ? TARIFAS_ENVIO[direccionSeleccionada.municipio] : null;

    return (
      <View>
        <Boton
          texto="Volver al carrito"
          tipo="claro"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => irA("Carrito")}
          estiloExtra={{ marginBottom: 12 }}
        />

        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={tema.lilaOscuro} /> Confirmación de Entrega y Envío
        </Text>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <View style={estilos.filaEspacioWrap}>
            <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
              1. Dirección de entrega *
            </Text>
            <View style={estilos.fila}>
              {direccionSeleccionada ? (
                <Boton
                  texto="Quitar selección"
                  pequeno
                  tipo="claro"
                  tema={tema}
                  escalaTexto={escalaTexto}
                  onPress={() => setDireccionSeleccionadaId(null)}
                  estiloExtra={{ marginRight: 6 }}
                />
              ) : null}
              <Boton
                texto="Gestionar"
                pequeno
                tipo="claro"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => irA("Direcciones")}
              />
            </View>
          </View>

          {direcciones.length === 0 ? (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ color: tema.rojo, fontSize: 13 * escalaTexto }}>
                No tienes direcciones registradas.
              </Text>
              <Boton
                texto="+ Agregar Dirección"
                tipo="lila"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => irA("Direcciones")}
                estiloExtra={{ marginTop: 6 }}
              />
            </View>
          ) : (
            direcciones.map((d) => {
              const elegida = direccionSeleccionada?.id === d.id;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => {
                    setDireccionSeleccionadaId(elegida ? null : d.id);
                    setErrorCheckout("");
                  }}
                  style={[
                    estilos.opcionDireccion,
                    {
                      borderColor: elegida ? tema.lila : tema.borde,
                      backgroundColor: elegida ? tema.lilaClaro : tema.tarjeta,
                    },
                  ]}
                >
                  <View style={estilos.filaEspacio}>
                    <View style={{ flex: 1 }}>
                      <Text style={[estilos.aliasDireccion, { color: tema.texto, fontSize: 14 * escalaTexto }]}>
                        {d.alias} {d.principal ? " (Principal)" : ""}
                      </Text>
                      <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                        Municipio: {d.municipio}
                      </Text>
                      <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto }}>
                        {d.descripcion}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={elegida ? "radiobox-marked" : "radiobox-blank"}
                      size={21 * escalaTexto}
                      color={elegida ? tema.lilaOscuro : tema.textoSecundario}
                    />
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 12 }]}>
          <View style={estilos.filaEspacioWrap}>
            <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
              2. Modalidad y Costo de Envío *
            </Text>
            {modalidadEnvio ? (
              <Boton
                texto="Limpiar"
                pequeno
                tipo="claro"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setModalidadEnvio(null)}
              />
            ) : null}
          </View>
          <Text style={[estilos.etiquetaPequena, { color: tema.textoSecundario, fontSize: 12 * escalaTexto }]}>
            Mosquera ($6.000 / $10.000), Funza ($8.000 / $12.000), Madrid ($10.000 / $14.000).
          </Text>

          <View style={estilos.filaModalidad}>
            <Pressable
              onPress={() => {
                setModalidadEnvio(modalidadEnvio === "estandar" ? null : "estandar");
                setErrorCheckout("");
              }}
              style={[
                estilos.tarjetaModalidad,
                {
                  borderColor: modalidadEnvio === "estandar" ? tema.lila : tema.borde,
                  backgroundColor: modalidadEnvio === "estandar" ? tema.lilaClaro : tema.tarjeta,
                },
              ]}
            >
              <Text style={[estilos.tituloModalidad, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
                Envío Estándar
              </Text>
              <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                {tarifaMun?.estandar ? formatearDinero(tarifaMun.estandar.costo) : "Ajuste manual"}
              </Text>
              <Text style={{ fontSize: 11 * escalaTexto, color: tema.textoSecundario }}>
                {tarifaMun?.estandar ? tarifaMun.estandar.plazo : "No automático"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setModalidadEnvio(modalidadEnvio === "expres" ? null : "expres");
                setErrorCheckout("");
              }}
              style={[
                estilos.tarjetaModalidad,
                {
                  borderColor: modalidadEnvio === "expres" ? tema.lila : tema.borde,
                  backgroundColor: modalidadEnvio === "expres" ? tema.lilaClaro : tema.tarjeta,
                  marginRight: 0,
                },
              ]}
            >
              <Text style={[estilos.tituloModalidad, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
                Envío Exprés
              </Text>
              <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                {tarifaMun?.expres ? formatearDinero(tarifaMun.expres.costo) : "Ajuste manual"}
              </Text>
              <Text style={{ fontSize: 11 * escalaTexto, color: tema.textoSecundario }}>
                {tarifaMun?.expres ? tarifaMun.expres.plazo : "No disponible"}
              </Text>
            </Pressable>
          </View>

          <View style={[estilos.cajaPlazo, { backgroundColor: tema.azulClaro }]}>
            <Text style={{ color: tema.azul, fontWeight: "bold", fontSize: 12 * escalaTexto }}>
              Plazo estimado ({direccionSeleccionada?.municipio || "Sin dirección"}):
            </Text>
            <Text style={{ color: tema.texto, marginTop: 2, fontSize: 12 * escalaTexto }}>
              {calculoEnvio.plazo}
            </Text>
          </View>
        </View>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 12 }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginBottom: 8, fontSize: 15 * escalaTexto }]}>
            3. Datos de contacto para la entrega
          </Text>
          <CampoTexto
            titulo="Nombre Completo *"
            valor={compradorNombre}
            cambiar={setCompradorNombre}
            tema={tema}
            escalaTexto={escalaTexto}
          />
          <CampoTexto
            titulo="Teléfono Celular *"
            valor={compradorTelefono}
            cambiar={setCompradorTelefono}
            teclado="phone-pad"
            tema={tema}
            escalaTexto={escalaTexto}
          />
        </View>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 12 }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
            Total a Pagar
          </Text>
          <View style={estilos.filaResumen}>
            <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
              Subtotal ({cantidadTotalArticulos} art.):
            </Text>
            <Text style={{ color: tema.texto, fontSize: 13 * escalaTexto }}>
              {formatearDinero(subtotalCarrito)}
            </Text>
          </View>
          {cuponAplicado ? (
            <View style={estilos.filaResumen}>
              <Text style={{ color: tema.verdeOscuro, fontSize: 13 * escalaTexto }}>Descuento 10%:</Text>
              <Text style={{ color: tema.verdeOscuro, fontSize: 13 * escalaTexto }}>
                -{formatearDinero(descuentoCarrito)}
              </Text>
            </View>
          ) : null}
          <View style={estilos.filaResumen}>
            <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
              Costo de Envío ({modalidadEnvio || "sin elegir"}):
            </Text>
            <Text style={{ color: tema.texto, fontSize: 13 * escalaTexto }}>
              {formatearDinero(costoEnvioFinal)}
            </Text>
          </View>
          <View style={[estilos.filaResumen, { borderTopWidth: 1, borderTopColor: tema.borde, paddingTop: 6, marginTop: 4 }]}>
            <Text style={{ color: tema.texto, fontWeight: "bold", fontSize: 16 * escalaTexto }}>
              TOTAL SIMULADO:
            </Text>
            <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 18 * escalaTexto }}>
              {formatearDinero(totalPedidoFinal)}
            </Text>
          </View>

          {errorCheckout ? (
            <Text style={[estilos.textoErrorValidacion, { color: tema.rojo, fontSize: 12 * escalaTexto }]}>
              ! {errorCheckout}
            </Text>
          ) : null}

          <Boton
            texto="Confirmar Compra Simulada"
            tipo="verde"
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={confirmarCompraPedido}
            estiloExtra={{ marginTop: 12 }}
          />
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA CONFIRMACIÓN
  // ------------------------------------------
  function renderConfirmacion() {
    const pedidoReciente = pedidos.find((p) => p.id === pedidoDetalleId) || pedidos[0];

    return (
      <View style={{ alignItems: "center", paddingVertical: 18 }}>
        <View
          style={[
            estilos.circuloConfirmacion,
            { backgroundColor: tema.lilaClaro, borderColor: tema.lila },
          ]}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={38} color={tema.lilaOscuro} />
        </View>
        <Text
          style={[
            estilos.bannerTitulo,
            { color: tema.lilaOscuro, fontSize: 24 * escalaTexto, textAlign: "center", marginTop: 10 },
          ]}
        >
          ¡Compra Confirmada!
        </Text>
        <Text style={{ color: tema.textoSecundario, textAlign: "center", marginTop: 4, fontSize: 13 * escalaTexto }}>
          Código único de pedido:
        </Text>
        <Text style={[estilos.codigoDestacado, { color: tema.texto, fontSize: 18 * escalaTexto }]}>
          {pedidoReciente?.id}
        </Text>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, width: "100%", marginTop: 16 }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
            Detalles de la compra
          </Text>
          <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
            Fecha: {pedidoReciente?.fecha}
          </Text>
          <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
            Destinatario: {pedidoReciente?.comprador.nombre}
          </Text>
          <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
            Municipio: {pedidoReciente?.comprador.municipio} ({pedidoReciente?.plazoEnvio})
          </Text>
          <Text style={{ color: tema.texto, fontWeight: "bold", marginTop: 6, fontSize: 14 * escalaTexto }}>
            Total Pagado: {formatearDinero(pedidoReciente?.total)}
          </Text>
        </View>

        <Boton
          texto="Rastrear y Gestionar Pedido"
          tipo="lila"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => {
            setPedidoDetalleId(pedidoReciente?.id);
            irA("Seguimiento");
          }}
          estiloExtra={{ width: "100%", marginTop: 14 }}
        />
        <Boton
          texto="Volver al Catálogo"
          tipo="claro"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => irA("Catalogo")}
          estiloExtra={{ width: "100%", marginTop: 8 }}
        />
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA SEGUIMIENTO Y GESTIÓN DE PEDIDO
  // ------------------------------------------
  function renderSeguimiento() {
    const ped = pedidos.find((p) => p.id === pedidoDetalleId);
    if (!ped) {
      return (
        <View style={[estilos.cajaVacia, { backgroundColor: tema.tarjeta, borderColor: tema.borde, borderWidth: 1 }]}>
          <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
            Pedido no encontrado
          </Text>
          <Boton
            texto="Ver mis pedidos"
            tipo="lila"
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => irA("Pedidos")}
            estiloExtra={{ marginTop: 10 }}
          />
        </View>
      );
    }

    const puedeCancelar = ped.estado === "Confirmado" || ped.estado === "Preparando";

    return (
      <View>
        <Boton
          texto="Volver a mis pedidos"
          tipo="claro"
          tema={tema}
          escalaTexto={escalaTexto}
          onPress={() => irA("Pedidos")}
          estiloExtra={{ marginBottom: 12 }}
        />

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <View style={estilos.filaEspacio}>
            <View>
              <Text style={[estilos.codigoDestacado, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
                {ped.id}
              </Text>
              <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto }}>{ped.fecha}</Text>
            </View>
            <EstadoBadge estado={ped.estado} escalaTexto={escalaTexto} />
          </View>

          <View style={[estilos.cajaControlSimulacion, { backgroundColor: tema.lilaClaro, borderColor: tema.lila }]}>
            <Text style={[estilos.subtituloNegrita, { color: tema.lilaOscuro, fontSize: 15 * escalaTexto }]}>
              Control de Simulación de Estados
            </Text>
            <Text style={{ color: tema.texto, fontSize: 12 * escalaTexto, marginBottom: 8 }}>
              Avanza secuencialmente por los estados: Confirmado, Preparando, En camino y Entregado.
            </Text>
            <Boton
              texto="Simular avance de entrega"
              tipo="lila"
              tema={tema}
              escalaTexto={escalaTexto}
              desactivado={ped.estado === "Entregado" || ped.estado === "Cancelado"}
              onPress={() => avanzarEstadoEntrega(ped)}
            />
            {ped.estado === "Entregado" ? (
              <Text style={{ color: tema.verdeOscuro, fontSize: 12 * escalaTexto, marginTop: 6, fontWeight: "bold" }}>
                <MaterialCommunityIcons name="check-circle-outline" size={15} color={tema.verdeOscuro} /> Pedido entregado con éxito. Ciclo finalizado.
              </Text>
            ) : null}
            {ped.estado === "Cancelado" ? (
              <Text style={{ color: tema.rojo, fontSize: 12 * escalaTexto, marginTop: 6, fontWeight: "bold" }}>
                <MaterialCommunityIcons name="close-circle-outline" size={15} color={tema.rojo} /> Pedido cancelado. No admite más avances ni puede entregarse.
              </Text>
            ) : null}
          </View>

          <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginTop: 14, fontSize: 15 * escalaTexto }]}>
            Historial cronológico de estados
          </Text>
          <View style={[estilos.lineaTiempo, { borderLeftColor: tema.lila }]}>
            {ped.transiciones.map((tr, index) => (
              <View key={index} style={estilos.itemLineaTiempo}>
                <View style={[estilos.puntoLineaTiempo, { backgroundColor: tema.lilaOscuro }]} />
                <View style={{ flex: 1 }}>
                  <View style={estilos.filaWrap}>
                    <Text style={[estilos.estadoTiempo, { color: tema.texto, fontSize: 13 * escalaTexto }]}>
                      {tr.estado}
                    </Text>
                    <Text style={[estilos.fechaTiempo, { color: tema.textoSecundario, fontSize: 11 * escalaTexto }]}>
                      {" "}· {tr.fecha}
                    </Text>
                  </View>
                  <Text style={[estilos.notaTiempo, { color: tema.textoSecundario, fontSize: 11 * escalaTexto }]}>
                    {tr.nota}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginTop: 14, fontSize: 15 * escalaTexto }]}>
            Artículos del pedido
          </Text>
          {ped.items.map((it, idx) => (
            <View key={idx} style={estilos.filaResumen}>
              <Text style={{ color: tema.texto, flex: 1, marginRight: 8, fontSize: 13 * escalaTexto }}>
                {it.cantidad}x {it.nombre} ({it.varianteEtiqueta})
              </Text>
              <Text style={{ color: tema.texto, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                {formatearDinero(it.precioUnitario * it.cantidad)}
              </Text>
            </View>
          ))}
          <View style={[estilos.filaResumen, { marginTop: 4 }]}>
            <Text style={{ color: tema.textoSecundario, fontSize: 13 * escalaTexto }}>
              Envío ({ped.modalidadEnvio}):
            </Text>
            <Text style={{ color: tema.texto, fontSize: 13 * escalaTexto }}>
              {formatearDinero(ped.costoEnvio)}
            </Text>
          </View>
          {ped.descuento > 0 ? (
            <View style={estilos.filaResumen}>
              <Text style={{ color: tema.verdeOscuro, fontSize: 13 * escalaTexto }}>Descuento:</Text>
              <Text style={{ color: tema.verdeOscuro, fontSize: 13 * escalaTexto }}>
                -{formatearDinero(ped.descuento)}
              </Text>
            </View>
          ) : null}
          <View style={[estilos.filaResumen, { borderTopWidth: 1, borderTopColor: tema.borde, paddingTop: 6 }]}>
            <Text style={{ fontWeight: "bold", color: tema.texto, fontSize: 14 * escalaTexto }}>Total:</Text>
            <Text style={{ fontWeight: "bold", color: tema.lilaOscuro, fontSize: 15 * escalaTexto }}>
              {formatearDinero(ped.total)}
            </Text>
          </View>

          <View style={[estilos.divisor, { backgroundColor: tema.borde }]} />
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginBottom: 8, fontSize: 15 * escalaTexto }]}>
            Acciones sobre el pedido
          </Text>

          <Boton
            texto="Cancelar Pedido"
            tipo={puedeCancelar ? "peligro" : "claro"}
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => cancelarPedidoCompra(ped)}
          />

          {!puedeCancelar ? (
            <Text style={[estilos.ayudaAlerta, { color: tema.rojo, marginTop: 6, fontSize: 12 * escalaTexto }]}>
              {ped.estado === "Cancelado"
                ? "* Este pedido ya se encuentra cancelado; no se reintegra stock nuevamente."
                : `* No es posible cancelar porque el pedido está "${ped.estado}". Solo se cancela antes del despacho.`}
            </Text>
          ) : null}

          <Boton
            texto="Reportar problema a Soporte"
            tipo="claro"
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => {
              setTicketPedidoId(ped.id);
              irA("Ayuda");
            }}
            estiloExtra={{ marginTop: 8 }}
          />
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA HISTORIAL DE PEDIDOS
  // ------------------------------------------
  function renderPedidos() {
    return (
      <View>
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="package-variant-closed" size={20} color={tema.lilaOscuro} /> Mis Pedidos ({pedidos.length})
        </Text>
        <Text
          style={[
            estilos.etiquetaPequena,
            { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto },
          ]}
        >
          Consulta tus pedidos, haz seguimiento a la entrega o cancela si no ha sido despachado.
        </Text>

        {pedidos.length === 0 ? (
          <View style={[estilos.cajaVacia, { backgroundColor: tema.tarjeta, borderColor: tema.borde, borderWidth: 1 }]}>
            <MaterialCommunityIcons name="package-variant-closed" size={38} color={tema.lilaOscuro} />
            <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
              No tienes pedidos registrados
            </Text>
            <Text style={[estilos.textoVacio, { color: tema.textoSecundario, fontSize: 13 * escalaTexto }]}>
              Realiza una compra simulada en el catálogo para ver aquí tu pedido.
            </Text>
            <Boton
              texto="Ir al Catálogo"
              tipo="lila"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => irA("Catalogo")}
              estiloExtra={{ marginTop: 12 }}
            />
          </View>
        ) : (
          pedidos.map((ped) => (
            <Pressable
              key={ped.id}
              onPress={() => {
                setPedidoDetalleId(ped.id);
                irA("Seguimiento");
              }}
              style={[estilos.tarjetaPedidoItem, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}
            >
              <View style={estilos.filaEspacio}>
                <Text style={[estilos.codigoDestacado, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
                  {ped.id}
                </Text>
                <EstadoBadge estado={ped.estado} escalaTexto={escalaTexto} />
              </View>
              <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto }}>{ped.fecha}</Text>
              <Text style={{ color: tema.texto, marginTop: 4, fontSize: 13 * escalaTexto }}>
                {ped.items.length} producto(s) · {ped.comprador.municipio}
              </Text>
              <View style={[estilos.filaEspacio, { marginTop: 6 }]}>
                <Text style={{ fontWeight: "bold", color: tema.lilaOscuro, fontSize: 14 * escalaTexto }}>
                  {formatearDinero(ped.total)}
                </Text>
                <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                  Ver seguimiento
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA LIBRETA DE DIRECCIONES
  // ------------------------------------------
  function renderDirecciones() {
    return (
      <View>
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color={tema.lilaOscuro} /> Libreta de Direcciones
        </Text>
        <Text
          style={[
            estilos.etiquetaPequena,
            { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto },
          ]}
        >
          Registra ubicaciones ficticias para calcular tarifas en Mosquera, Funza, Madrid u otros.
        </Text>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginBottom: 8, fontSize: 15 * escalaTexto }]}>
            {idEditandoDir ? "Editar Dirección Existente" : "Registrar Nueva Dirección"}
          </Text>

          <CampoTexto
            titulo="Alias de la dirección *"
            valor={aliasDir}
            cambiar={setAliasDir}
            ayuda="Ej: Casa, Oficina, Universidad"
            tema={tema}
            escalaTexto={escalaTexto}
          />

          <Text style={[estilos.etiquetaCampo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
            Municipio de entrega:
          </Text>
          <View style={[estilos.filaWrap, { marginBottom: 8 }]}>
            {MUNICIPIOS_DISPONIBLES.map((mun) => (
              <Boton
                key={mun}
                texto={mun}
                pequeno
                tipo={municipioDir === mun ? "lila" : "claro"}
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setMunicipioDir(mun)}
                estiloExtra={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>

          <CampoTexto
            titulo="Dirección y referencia de entrega *"
            valor={detalleDir}
            cambiar={setDetalleDir}
            ayuda="Ej: Calle 3 # 12-45, Barrio El Trébol"
            multiline
            tema={tema}
            escalaTexto={escalaTexto}
          />

          {errorDireccion ? (
            <Text style={[estilos.textoErrorValidacion, { color: tema.rojo, marginBottom: 8, fontSize: 12 * escalaTexto }]}>
              ! {errorDireccion}
            </Text>
          ) : null}

          <View style={estilos.fila}>
            <Boton
              texto={idEditandoDir ? "Guardar Cambios" : "Guardar Dirección"}
              tipo="lila"
              pequeno
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={guardarDireccionLibreta}
              estiloExtra={{ flex: 1, marginRight: idEditandoDir ? 6 : 0 }}
            />
            {idEditandoDir ? (
              <Boton
                texto="Cancelar"
                tipo="claro"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => {
                  setIdEditandoDir(null);
                  setAliasDir("");
                  setDetalleDir("");
                  setErrorDireccion("");
                }}
              />
            ) : null}
          </View>
        </View>

        <Text
          style={[
            estilos.subtituloNegrita,
            { color: tema.texto, marginTop: 14, marginBottom: 8, fontSize: 15 * escalaTexto },
          ]}
        >
          Direcciones guardadas ({direcciones.length})
        </Text>

        {direcciones.map((d) => (
          <View
            key={d.id}
            style={[
              estilos.cajaCard,
              {
                backgroundColor: tema.tarjeta,
                borderColor: d.principal ? tema.lila : tema.borde,
                marginBottom: 10,
              },
            ]}
          >
            <View style={estilos.filaEspacio}>
              <View style={{ flex: 1 }}>
                <View style={estilos.filaWrap}>
                  <Text style={[estilos.aliasDireccion, { color: tema.texto, fontSize: 14 * escalaTexto }]}>
                    {d.alias}
                  </Text>
                  {d.principal ? (
                    <View style={[estilos.badge, { backgroundColor: tema.lilaClaro, marginLeft: 8 }]}>
                      <Text style={[estilos.textoBadge, { color: tema.lilaOscuro, fontSize: 11 * escalaTexto }]}>
                        Principal
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ color: tema.lilaOscuro, fontWeight: "bold", fontSize: 13 * escalaTexto }}>
                  Municipio: {d.municipio}
                </Text>
                <Text style={{ color: tema.textoSecundario, marginTop: 2, fontSize: 12 * escalaTexto }}>
                  {d.descripcion}
                </Text>
              </View>
            </View>

            <View style={[estilos.filaWrap, { marginTop: 10 }]}>
              {!d.principal ? (
                <Boton
                  texto="Marcar Principal"
                  pequeno
                  tipo="verde"
                  tema={tema}
                  escalaTexto={escalaTexto}
                  onPress={() => seleccionarComoPrincipal(d.id)}
                  estiloExtra={{ marginRight: 6, marginBottom: 4 }}
                />
              ) : null}
              <Boton
                texto="Editar"
                pequeno
                tipo="claro"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => iniciarEdicionDireccion(d)}
                estiloExtra={{ marginRight: 6, marginBottom: 4 }}
              />
              <Boton
                texto="Eliminar"
                pequeno
                tipo="peligro"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => eliminarDireccion(d.id)}
                estiloExtra={{ marginBottom: 4 }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA CENTRO DE NOTIFICACIONES
  // ------------------------------------------
  function renderNotificaciones() {
    const noLeidas = notificaciones.filter((n) => !n.leida).length;

    return (
      <View>
        <View style={estilos.filaEspacioWrap}>
          <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
            <MaterialCommunityIcons name="bell-outline" size={20} color={tema.lilaOscuro} /> Centro de Notificaciones
          </Text>
          {noLeidas > 0 ? (
            <Boton
              texto="Marcar todas leídas"
              pequeno
              tipo="claro"
              tema={tema}
              escalaTexto={escalaTexto}
              onPress={() => {
                setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
                notificarAlerta("Todas las notificaciones marcadas como leídas.");
              }}
            />
          ) : null}
        </View>
        <Text
          style={[
            estilos.etiquetaPequena,
            { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto },
          ]}
        >
          Avisos internos en la app sobre cambios de estado, reposición de stock y soporte.
        </Text>

        {notificaciones.length === 0 ? (
          <View style={[estilos.cajaVacia, { backgroundColor: tema.tarjeta, borderColor: tema.borde, borderWidth: 1 }]}>
            <MaterialCommunityIcons name="bell-outline" size={38} color={tema.lilaOscuro} />
            <Text style={[estilos.tituloVacio, { color: tema.texto, fontSize: 17 * escalaTexto }]}>
              No tienes notificaciones
            </Text>
            <Text style={[estilos.textoVacio, { color: tema.textoSecundario, fontSize: 13 * escalaTexto }]}>
              Aquí aparecerán los avisos cuando tus pedidos cambien de estado o cuando se reponga stock.
            </Text>
          </View>
        ) : (
          notificaciones.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => {
                setNotificaciones((prev) =>
                  prev.map((item) => (item.id === n.id ? { ...item, leida: true } : item))
                );
              }}
              style={[
                estilos.tarjetaNotifItem,
                {
                  backgroundColor: n.leida ? tema.tarjeta : tema.lilaClaro,
                  borderColor: n.leida ? tema.borde : tema.lila,
                },
              ]}
            >
              <View style={estilos.filaEspacio}>
                <Text
                  style={[
                    estilos.tituloNotif,
                    { color: tema.texto, fontWeight: n.leida ? "600" : "bold", fontSize: 14 * escalaTexto, flex: 1 },
                  ]}
                >
                  {n.titulo}
                </Text>
                {!n.leida ? (
                  <View style={[estilos.badge, { backgroundColor: tema.lila, marginLeft: 8 }]}>
                    <Text style={{ color: "#fff", fontSize: 10 * escalaTexto, fontWeight: "bold" }}>Nueva</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[estilos.mensajeNotif, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
                {n.mensaje}
              </Text>
              <Text style={[estilos.fechaPequena, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
                {n.fecha}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA CENTRO DE AYUDA Y SOLICITUDES
  // ------------------------------------------
  function renderAyuda() {
    return (
      <View>
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="lifebuoy" size={20} color={tema.lilaOscuro} /> Centro de Ayuda y Soporte
        </Text>
        <Text
          style={[
            estilos.etiquetaPequena,
            { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto },
          ]}
        >
          Registra consultas vinculadas a tus pedidos para dejar constancia y consultar su estado.
        </Text>

        <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
          <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginBottom: 8, fontSize: 15 * escalaTexto }]}>
            Radicar nueva solicitud
          </Text>

          <Text style={[estilos.etiquetaCampo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
            Selecciona el pedido relacionado *
          </Text>
          {pedidos.length === 0 ? (
            <Text style={{ color: tema.rojo, fontSize: 12 * escalaTexto }}>
              Debes tener pedidos en tu historial para abrir un caso.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {pedidos.map((p) => (
                <Boton
                  key={p.id}
                  texto={p.id}
                  pequeno
                  tipo={ticketPedidoId === p.id ? "lila" : "claro"}
                  tema={tema}
                  escalaTexto={escalaTexto}
                  onPress={() => {
                    setTicketPedidoId(p.id);
                    setErrorTicket("");
                  }}
                  estiloExtra={{ marginRight: 6 }}
                />
              ))}
            </ScrollView>
          )}

          <Text style={[estilos.etiquetaCampo, { color: tema.texto, marginTop: 8, fontSize: 12 * escalaTexto }]}>
            Motivo de la solicitud *
          </Text>
          <View style={[estilos.filaWrap, { marginBottom: 10 }]}>
            {["Entrega", "Producto", "Otro"].map((m) => (
              <Boton
                key={m}
                texto={m}
                pequeno
                tipo={ticketMotivo === m ? "lila" : "claro"}
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => setTicketMotivo(m)}
                estiloExtra={{ marginRight: 6, marginBottom: 4 }}
              />
            ))}
          </View>

          <CampoTexto
            titulo="Descripción del inconveniente (mín. 15 caracteres) *"
            valor={ticketDescripcion}
            cambiar={setTicketDescripcion}
            ayuda="Ej: Quisiera saber a qué hora aproximada llegará mi paquete..."
            multiline
            tema={tema}
            escalaTexto={escalaTexto}
          />

          {errorTicket ? (
            <Text style={[estilos.textoErrorValidacion, { color: tema.rojo, marginBottom: 8, fontSize: 12 * escalaTexto }]}>
              ! {errorTicket}
            </Text>
          ) : null}

          <Boton
            texto="Enviar Solicitud"
            tipo="lila"
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={enviarTicketSoporte}
            estiloExtra={{ marginTop: 4 }}
          />
        </View>

        <Text
          style={[
            estilos.subtituloNegrita,
            { color: tema.texto, marginTop: 14, marginBottom: 8, fontSize: 15 * escalaTexto },
          ]}
        >
          Tus solicitudes registradas ({tickets.length})
        </Text>

        {tickets.map((tk) => (
          <View
            key={tk.id}
            style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginBottom: 10 }]}
          >
            <View style={estilos.filaEspacio}>
              <View style={{ flex: 1 }}>
                <Text style={[estilos.codigoDestacado, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
                  {tk.id}
                </Text>
                <Text style={{ color: tema.lilaOscuro, fontSize: 12 * escalaTexto, fontWeight: "bold" }}>
                  Pedido: {tk.pedidoId} · Motivo: {tk.motivo}
                </Text>
              </View>
              <EstadoBadge estado={tk.estado} escalaTexto={escalaTexto} />
            </View>

            <Text style={[estilos.descripcionDetalle, { color: tema.texto, marginVertical: 6, fontSize: 13 * escalaTexto }]}>
              "{tk.descripcion}"
            </Text>
            <Text style={[estilos.fechaPequena, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
              {tk.fecha}
            </Text>

            {tk.respuesta ? (
              <View style={[estilos.cajaRespuesta, { backgroundColor: tema.azulClaro, marginTop: 8 }]}>
                <Text style={{ fontWeight: "bold", color: tema.azul, fontSize: 12 * escalaTexto }}>
                  Respuesta de Soporte (Simulada):
                </Text>
                <Text style={{ color: tema.texto, marginTop: 2, fontSize: 12 * escalaTexto }}>{tk.respuesta}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Boton
                  texto="Simular respuesta"
                  tipo="verde"
                  pequeno
                  tema={tema}
                  escalaTexto={escalaTexto}
                  onPress={() => simularRespuestaSoporte(tk.id)}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }

  // ------------------------------------------
  // RENDER: PANTALLA DEMO & PANEL VENDEDOR
  // ------------------------------------------
  function renderDemoAdmin() {
    const variantesAgotadas = [];
    productos.forEach((p) => {
      (p.variantes || []).forEach((v) => {
        if (v.stock === 0) {
          variantesAgotadas.push({ producto: p, variante: v });
        }
      });
    });

    return (
      <View>
        <Text style={[estilos.seccionTitulo, { color: tema.texto, fontSize: 20 * escalaTexto }]}>
          <MaterialCommunityIcons name="cog-outline" size={20} color={tema.lilaOscuro} /> Gestión y Simulación
        </Text>
        <Text
          style={[
            estilos.etiquetaPequena,
            { color: tema.textoSecundario, marginBottom: 12, fontSize: 12 * escalaTexto },
          ]}
        >
          Alterna entre las herramientas de demostración del Taller 5 y el Panel de Vendedor heredado del Taller 4.
        </Text>

        <View style={[estilos.fila, { marginBottom: 12 }]}>
          <Boton
            texto="Simulación Taller 5"
            pequeno
            tipo={tabAdmin === "Simulacion" ? "lila" : "claro"}
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => setTabAdmin("Simulacion")}
            estiloExtra={{ flex: 1, marginRight: 6 }}
          />
          <Boton
            texto="Panel Vendedor (v1)"
            pequeno
            tipo={tabAdmin === "Vendedor" ? "lila" : "claro"}
            tema={tema}
            escalaTexto={escalaTexto}
            onPress={() => setTabAdmin("Vendedor")}
            estiloExtra={{ flex: 1 }}
          />
        </View>

        {tabAdmin === "Simulacion" ? (
          <View>
            <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
              <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
                Simular Reposición de Inventario (HU30)
              </Text>
              <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto, marginBottom: 8 }}>
                Agrega unidades en modo demostración a variantes agotadas para disparar avisos de reposición.
              </Text>

              {variantesAgotadas.length > 0 ? (
                variantesAgotadas.map(({ producto, variante }) => (
                  <Boton
                    key={`${producto.id}-${variante.id}`}
                    texto={`Reponer ${producto.nombre} (${variante.etiqueta}) +5`}
                    tipo="verde"
                    pequeno
                    tema={tema}
                    escalaTexto={escalaTexto}
                    onPress={() => simularReposicionVariante(producto.id, variante.id, 5)}
                    estiloExtra={{ marginBottom: 6 }}
                  />
                ))
              ) : (
                <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto, marginBottom: 8 }}>
                  No hay variantes con stock en 0 en este momento.
                </Text>
              )}

              <Boton
                texto="Reponer Camiseta Básica (Talla S) +5"
                tipo="claro"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => simularReposicionVariante("PROD-001", "V1", 5)}
              />
            </View>

            <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginTop: 12 }]}>
              <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 15 * escalaTexto }]}>
                Restablecer Datos Iniciales
              </Text>
              <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto, marginBottom: 8 }}>
                Reinicia pedidos, inventario, direcciones, notificaciones y favoritos a los valores de fábrica.
              </Text>
              <Boton
                texto="Restablecer Todos los Datos Iniciales"
                tipo="peligro"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() =>
                  abrirConfirmacionModal({
                    titulo: "Restablecer datos",
                    mensaje: "¿Deseas restaurar el catálogo, pedidos, direcciones y notificaciones a sus valores iniciales?",
                    textoConfirmar: "Sí, restablecer",
                    onConfirmar: async () => {
                      await AsyncStorage.removeItem("shopglow_taller5_db");
                      setProductos(PRODUCTOS_INICIALES);
                      setCarrito([]);
                      setFavoritos([]);
                      setPedidos(PEDIDOS_INICIALES);
                      setDirecciones(DIRECCIONES_INICIALES);
                      setNotificaciones(NOTIFICACIONES_INICIALES);
                      setTickets(TICKETS_INICIALES);
                      setCompararIds([]);
                      setSuscripcionesStock([]);
                      setDireccionSeleccionadaId("DIR-001");
                      setModalidadEnvio("estandar");
                      notificarAlerta("Datos reiniciados correctamente.");
                    },
                  })
                }
              />
            </View>
          </View>
        ) : (
          <View>
            <View style={[estilos.cajaCard, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
              <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginBottom: 8, fontSize: 15 * escalaTexto }]}>
                {idProdEditando ? "Editar Producto del Catálogo" : "Nuevo Producto"}
              </Text>

              <CampoTexto
                titulo="Nombre del producto *"
                valor={nombreProdForm}
                cambiar={setNombreProdForm}
                tema={tema}
                escalaTexto={escalaTexto}
              />
              <CampoTexto
                titulo="Marca"
                valor={marcaProdForm}
                cambiar={setMarcaProdForm}
                tema={tema}
                escalaTexto={escalaTexto}
              />

              <Text style={[estilos.etiquetaCampo, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
                Categoría:
              </Text>
              <View style={[estilos.filaWrap, { marginBottom: 10 }]}>
                {CATEGORIAS.filter((c) => c !== "Todas").map((cat) => (
                  <Boton
                    key={cat}
                    texto={cat}
                    pequeno
                    tipo={categoriaProdForm === cat ? "lila" : "claro"}
                    tema={tema}
                    escalaTexto={escalaTexto}
                    onPress={() => setCategoriaProdForm(cat)}
                    estiloExtra={{ marginRight: 6, marginBottom: 4 }}
                  />
                ))}
              </View>

              <CampoTexto
                titulo="Etiqueta de variante principal"
                valor={varianteEtiquetaForm}
                cambiar={setVarianteEtiquetaForm}
                tema={tema}
                escalaTexto={escalaTexto}
              />
              <CampoTexto
                titulo="Precio en pesos *"
                valor={precioProdForm}
                cambiar={setPrecioProdForm}
                teclado="numeric"
                tema={tema}
                escalaTexto={escalaTexto}
              />
              <CampoTexto
                titulo="Stock variante principal *"
                valor={stockProdForm}
                cambiar={setStockProdForm}
                teclado="numeric"
                tema={tema}
                escalaTexto={escalaTexto}
              />
              <CampoTexto
                titulo="Descripción (mínimo 15 caracteres) *"
                valor={descripcionProdForm}
                cambiar={setDescripcionProdForm}
                multiline
                tema={tema}
                escalaTexto={escalaTexto}
              />

              {errorVendedor ? (
                <Text style={[estilos.textoErrorValidacion, { color: tema.rojo, marginBottom: 8, fontSize: 12 * escalaTexto }]}>
                  ! {errorVendedor}
                </Text>
              ) : null}

              <Boton
                texto={idProdEditando ? "Guardar cambios" : "Crear producto"}
                tipo="verde"
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={guardarProductoVendedor}
              />
              {idProdEditando ? (
                <Boton
                  texto="Cancelar edición"
                  tipo="claro"
                  tema={tema}
                  escalaTexto={escalaTexto}
                  onPress={limpiarFormularioVendedor}
                  estiloExtra={{ marginTop: 6 }}
                />
              ) : null}
            </View>

            <Text style={[estilos.subtituloNegrita, { color: tema.texto, marginBottom: 8, fontSize: 15 * escalaTexto }]}>
              Productos registrados ({productos.length})
            </Text>
            {productos.map((p) => (
              <View
                key={p.id}
                style={[
                  estilos.cajaCard,
                  { backgroundColor: tema.tarjeta, borderColor: tema.borde, marginBottom: 8 },
                ]}
              >
                <View style={estilos.filaEspacio}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: tema.texto, fontWeight: "bold", fontSize: 14 * escalaTexto }}>
                      {p.nombre}
                    </Text>
                    <Text style={{ color: tema.textoSecundario, fontSize: 12 * escalaTexto }}>
                      {p.categoria} · {p.marca} · {formatearDinero(p.precio)} · Stock: {calcularStockTotal(p)}
                    </Text>
                  </View>
                  <Boton
                    texto="Editar"
                    pequeno
                    tipo="claro"
                    tema={tema}
                    escalaTexto={escalaTexto}
                    onPress={() => iniciarEdicionProducto(p)}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // ------------------------------------------
  // BARRA DE NAVEGACIÓN INFERIOR
  // ------------------------------------------
  const itemsNavegacion = [
    { id: "Catalogo", icono: "storefront-outline", titulo: "Tienda" },
    { id: "Comparador", icono: "compare-horizontal", titulo: "Comparar", badge: compararIds.length },
    { id: "Carrito", icono: "cart-outline", titulo: "Carrito", badge: cantidadTotalArticulos },
    { id: "Pedidos", icono: "package-variant-closed", titulo: "Pedidos" },
    {
      id: "Notificaciones",
      icono: "bell-outline",
      titulo: "Avisos",
      badge: notificaciones.filter((n) => !n.leida).length,
    },
    { id: "Direcciones", icono: "map-marker-outline", titulo: "Direcciones" },
    { id: "Ayuda", icono: "lifebuoy", titulo: "Ayuda" },
  ];

  return (
    <SafeAreaView style={[estilos.contenedorPrincipal, { backgroundColor: tema.fondo }]}>
      <StatusBar barStyle={modoOscuro ? "light-content" : "dark-content"} />

      {/* Barra Superior Header */}
      <View style={[estilos.barraSuperior, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
        <Pressable onPress={() => irA("Catalogo")} style={estilos.fila}>
          <View style={[estilos.logoIcono, { backgroundColor: tema.lila }]}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>SG</Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={[estilos.logoTexto, { color: tema.texto, fontSize: 18 * escalaTexto }]}>
              ShopGlow
            </Text>
            <Text style={[estilos.logoEslogan, { color: tema.textoSecundario, fontSize: 10 * escalaTexto }]}>
              Marketplace 2.0
            </Text>
          </View>
        </Pressable>

        <View style={estilos.fila}>
          {/* Favoritos */}
          <Pressable
            style={estilos.btnHeaderIcono}
            onPress={() => irA("Favoritos")}
            accessibilityLabel="Ver Favoritos"
          >
            <View style={estilos.fila}>
              <MaterialCommunityIcons
                name={favoritos.length > 0 ? "heart" : "heart-outline"}
                size={19 * escalaTexto}
                color={favoritos.length > 0 ? tema.rojo : tema.texto}
              />
              {favoritos.length > 0 ? (
                <Text style={{ color: tema.texto, fontSize: 11 * escalaTexto, marginLeft: 3 }}>
                  {favoritos.length}
                </Text>
              ) : null}
            </View>
          </Pressable>

          {/* Modo Oscuro */}
          <Pressable
            style={estilos.btnHeaderIcono}
            onPress={() => setModoOscuro((prev) => !prev)}
            accessibilityLabel="Alternar Modo Oscuro"
          >
            <MaterialCommunityIcons
              name={modoOscuro ? "weather-night" : "white-balance-sunny"}
              size={19 * escalaTexto}
              color={tema.texto}
            />
          </Pressable>

          {/* Tamaño de Letra Accesible */}
          <Pressable
            style={estilos.btnHeaderIcono}
            onPress={() => setLetraGrande((prev) => !prev)}
            accessibilityLabel="Alternar Tamaño de Texto"
          >
            <Text style={{ fontSize: 13 * escalaTexto, fontWeight: "bold", color: tema.texto }}>
              {letraGrande ? "A-" : "A+"}
            </Text>
          </Pressable>

          {/* Panel de Simulación / Vendedor */}
          <Pressable
            style={estilos.btnHeaderIcono}
            onPress={() => irA("DemoAdmin")}
            accessibilityLabel="Panel de Pruebas y Vendedor"
          >
            <MaterialCommunityIcons name="cog-outline" size={20 * escalaTexto} color={tema.lilaOscuro} />
          </Pressable>
        </View>
      </View>

      {/* Alerta flotante de retroalimentación */}
      {mensajeAlerta ? (
        <View style={[estilos.bannerMensaje, { backgroundColor: tema.lilaClaro, borderColor: tema.lila }]}>
          <Text style={[estilos.textoMensajeAlerta, { color: tema.texto, fontSize: 12 * escalaTexto }]}>
            <MaterialCommunityIcons name="information-outline" size={15} color={tema.lilaOscuro} /> {mensajeAlerta}
          </Text>
        </View>
      ) : null}

      {/* Contenido según Pantalla Seleccionada */}
      <ScrollView contentContainerStyle={estilos.scrollContenido} keyboardShouldPersistTaps="handled">
        {pantalla === "Catalogo" && renderCatalogo()}
        {pantalla === "Favoritos" && renderFavoritos()}
        {pantalla === "Detalle" && renderDetalle()}
        {pantalla === "Comparador" && renderComparador()}
        {pantalla === "Carrito" && renderCarrito()}
        {pantalla === "Checkout" && renderCheckout()}
        {pantalla === "Confirmacion" && renderConfirmacion()}
        {pantalla === "Seguimiento" && renderSeguimiento()}
        {pantalla === "Pedidos" && renderPedidos()}
        {pantalla === "Direcciones" && renderDirecciones()}
        {pantalla === "Notificaciones" && renderNotificaciones()}
        {pantalla === "Ayuda" && renderAyuda()}
        {pantalla === "DemoAdmin" && renderDemoAdmin()}
      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <View style={[estilos.barraNavegacion, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
        {itemsNavegacion.map((item) => {
          const activa = pantalla === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => irA(item.id)}
              style={[estilos.itemNav, activa && { borderTopWidth: 2, borderTopColor: tema.lila }]}
            >
              <View>
                <MaterialCommunityIcons
                  name={item.icono}
                  size={21}
                  color={activa ? tema.lilaOscuro : tema.textoSecundario}
                />
                {item.badge && item.badge > 0 ? (
                  <View style={estilos.badgeNav}>
                    <Text style={estilos.txtBadgeNav}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  estilos.textoNav,
                  {
                    color: activa ? tema.lilaOscuro : tema.textoSecundario,
                    fontWeight: activa ? "bold" : "normal",
                    fontSize: 9 * (letraGrande ? 1.1 : 1),
                  },
                ]}
              >
                {item.titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Modal de Confirmación Multiplataforma */}
      <Modal
        visible={modalConfirmacion.visible}
        transparent
        animationType="fade"
        onRequestClose={cerrarConfirmacionModal}
      >
        <View style={estilos.modalFondo}>
          <View style={[estilos.modalTarjeta, { backgroundColor: tema.tarjeta, borderColor: tema.borde }]}>
            <Text style={[estilos.subtituloNegrita, { color: tema.texto, fontSize: 16 * escalaTexto }]}>
              {modalConfirmacion.titulo}
            </Text>
            <Text
              style={{
                color: tema.textoSecundario,
                marginVertical: 10,
                lineHeight: 20,
                fontSize: 13 * escalaTexto,
              }}
            >
              {modalConfirmacion.mensaje}
            </Text>
            <View style={estilos.fila}>
              <Boton
                texto="Cancelar"
                tipo="claro"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={cerrarConfirmacionModal}
                estiloExtra={{ flex: 1, marginRight: 8 }}
              />
              <Boton
                texto={modalConfirmacion.textoConfirmar}
                tipo="peligro"
                pequeno
                tema={tema}
                escalaTexto={escalaTexto}
                onPress={() => {
                  const accion = modalConfirmacion.onConfirmar;
                  cerrarConfirmacionModal();
                  if (accion) accion();
                }}
                estiloExtra={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// ESTILOS DE LA APLICACIÓN
// ==========================================
const estilos = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
  },
  scrollContenido: {
    padding: 14,
    paddingBottom: 78,
  },
  barraSuperior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  logoIcono: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTexto: {
    fontWeight: "900",
  },
  logoEslogan: {
    marginTop: 1,
  },
  btnHeaderIcono: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 4,
    borderRadius: 8,
  },
  bannerTitulo: {
    fontWeight: "900",
    color: "#FFFFFF",
  },
  seccionTitulo: {
    fontWeight: "800",
    marginVertical: 10,
  },
  carruselCategorias: {
    flexDirection: "row",
    marginBottom: 12,
  },
  cajaCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  filaEspacio: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filaEspacioWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  subtituloNegrita: {
    fontWeight: "800",
  },
  etiquetaPequena: {
    marginTop: 4,
  },
  sliderBloque: {
    marginTop: 8,
  },
  sliderEtiqueta: {
    fontWeight: "600",
  },
  sliderValor: {
    fontWeight: "800",
  },
  sliderFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sliderBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderZonaArrastre: {
    flex: 1,
    height: 28,
    marginHorizontal: 8,
    justifyContent: "center",
    position: "relative",
  },
  sliderPista: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  sliderRelleno: {
    height: "100%",
    borderRadius: 4,
  },
  sliderPulgar: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    marginLeft: -9,
    top: 5,
  },
  inputPequeno: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  textoErrorValidacion: {
    fontWeight: "bold",
    marginTop: 6,
  },
  filaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
  },
  filaCentrada: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerComparador: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  textoComparadorBanner: {
    fontWeight: "bold",
    flex: 1,
  },
  grillaProductos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tarjetaGrid: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  fotoContenedor: {
    width: "100%",
    height: 125,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  fotoProducto: {
    width: "100%",
    height: "100%",
  },
  placeholderImagen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  inicialProducto: {
    fontSize: 32,
    fontWeight: "800",
  },
  inicialDetalle: {
    fontSize: 60,
    fontWeight: "800",
  },
  botonCorazonFlotante: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.95,
  },
  marcaPill: {
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 5,
  },
  nombreProducto: {
    fontWeight: "800",
    marginTop: 2,
  },
  precioProducto: {
    fontWeight: "900",
    marginTop: 2,
  },
  stockIndicador: {
    fontWeight: "600",
    marginTop: 2,
  },
  filaBotonesCard: {
    flexDirection: "row",
    marginTop: 8,
  },
  cajaVacia: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginVertical: 12,
  },
  iconoVacio: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 8,
  },
  tituloVacio: {
    fontWeight: "800",
    textAlign: "center",
  },
  textoVacio: {
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  circuloConfirmacion: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  // Detalle
  fotoGrandeContenedor: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  fotoGrande: {
    width: "100%",
    height: "100%",
  },
  tituloDetalle: {
    fontWeight: "900",
  },
  precioDetalle: {
    fontWeight: "900",
    marginVertical: 4,
  },
  descripcionDetalle: {
    lineHeight: 19,
    marginVertical: 4,
  },
  iconoAccion: {
    padding: 6,
    marginLeft: 6,
  },
  divisor: {
    height: 1,
    marginVertical: 12,
  },
  filaEstrellas: {
    flexDirection: "row",
    gap: 14,
    marginVertical: 8,
  },
  botonEstrella: {
    alignItems: "center",
  },
  estrella: {
    fontWeight: "800",
  },
  numeroEstrella: {
    textAlign: "center",
  },
  opcionVariante: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  textoVarianteNombre: {
    fontWeight: "700",
  },
  textoVariantePrecio: {
    marginTop: 2,
    fontWeight: "600",
  },
  bannerReposicion: {
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  textoReposicion: {
    fontWeight: "700",
  },
  ayudaAlerta: {
    marginTop: 6,
    fontStyle: "italic",
  },
  // Preguntas
  cajaPreguntaItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
  },
  preguntaTexto: {
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  fechaPequena: {
    marginTop: 2,
  },
  cajaRespuesta: {
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  respuestaTexto: {
    lineHeight: 17,
  },
  parrafoVacio: {
    fontStyle: "italic",
  },
  // Recomendados
  tarjetaRecomendado: {
    width: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
    marginRight: 10,
  },
  fotoRecomendado: {
    width: "100%",
    height: 80,
    borderRadius: 6,
  },
  nombreRecomendado: {
    fontWeight: "700",
    marginTop: 4,
  },
  precioRecomendado: {
    fontWeight: "800",
    marginTop: 2,
  },
  stockPequeno: {
    fontWeight: "bold",
    marginTop: 2,
  },
  // Comparador
  tablaComparador: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  columnaComparador: {
    width: 175,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
  },
  fotoComparador: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  etiquetaAtributo: {
    fontWeight: "700",
    marginTop: 6,
    textTransform: "uppercase",
  },
  valorAtributo: {
    marginTop: 1,
  },
  // Carrito
  tarjetaItemCarrito: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  fotoMiniCarrito: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  nombreCarrito: {
    fontWeight: "800",
  },
  varianteCarrito: {
    marginTop: 2,
    fontWeight: "600",
  },
  precioCarrito: {
    fontWeight: "800",
    marginTop: 2,
  },
  controlesCantidad: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 2,
  },
  btnCant: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  txtCant: {
    fontWeight: "bold",
  },
  numCant: {
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  filaResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  // Checkout
  opcionDireccion: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  aliasDireccion: {
    fontWeight: "800",
  },
  filaModalidad: {
    flexDirection: "row",
    marginTop: 8,
  },
  tarjetaModalidad: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 10,
    marginRight: 6,
  },
  tituloModalidad: {
    fontWeight: "800",
  },
  cajaPlazo: {
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  codigoDestacado: {
    fontWeight: "900",
  },
  // Seguimiento
  cajaControlSimulacion: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
  },
  lineaTiempo: {
    borderLeftWidth: 2,
    marginLeft: 8,
    paddingLeft: 12,
    marginVertical: 8,
  },
  itemLineaTiempo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    position: "relative",
  },
  puntoLineaTiempo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    left: -18,
    top: 4,
  },
  estadoTiempo: {
    fontWeight: "800",
  },
  fechaTiempo: {},
  notaTiempo: {
    marginTop: 2,
  },
  tarjetaPedidoItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  // Notificaciones
  tarjetaNotifItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  tituloNotif: {},
  mensajeNotif: {
    marginTop: 3,
    lineHeight: 17,
  },
  // Botones y Campos
  botonBase: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  botonPequeno: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  botonDesactivado: {
    opacity: 0.45,
  },
  textoBoton: {
    fontWeight: "700",
    textAlign: "center",
  },
  iconoBoton: {},
  contenedorCampo: {
    marginBottom: 10,
  },
  etiquetaCampo: {
    fontWeight: "700",
    marginBottom: 4,
  },
  entradaTexto: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  textoBadge: {
    fontWeight: "800",
  },
  bannerMensaje: {
    padding: 10,
    borderWidth: 1,
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: 8,
  },
  textoMensajeAlerta: {
    fontWeight: "bold",
  },
  // Barra de navegación
  barraNavegacion: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingVertical: 6,
  },
  itemNav: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2,
    position: "relative",
  },
  textoNav: {
    marginTop: 2,
  },
  badgeNav: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#D9383A",
    borderRadius: 9,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  txtBadgeNav: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  // Modal confirmación
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalTarjeta: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
});