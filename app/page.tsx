"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../src/lib/supabase";

type Alumno = {
  id: number;
  nombre: string;
  fechaNacimiento: string;
  dni: string;
  domicilio: string;
  edad: string;
  marcasPersonales: string;
  grupo: string;
  prueba: string;
  nivel: string;
};

type Usuario = {
  dni: number;
  nombre: string;
  email: string;
  contrasena: string;
  rol: string;
  grupo: string;
  fechaNacimiento: string;
  edad: string;
  domicilio: string;
};

type PlanSemanal = {
  id: number;
  atleta: string;
  fechaSemana: string;
  contenido: string;
};

type AsistenciaRegistro = {
  id: string;
  fecha: string;
  asistencia: {
    [nombreAtleta: string]: "Sí" | "No" | "";
  };
};

type Carrera = {
  id: number;
  nombre: string;
  fecha: string;
  inscritos: string[];
};

type MarcaRegistro = {
  id: number;
  atleta: string;
  fecha: string;
  carrera: string;
  distancia: string;
  marca: string;
  posicion: string;
};

const alumnosIniciales: Alumno[] = [
  {
    id: 1,
    nombre: "Tomás Vega",
    fechaNacimiento: "2002-05-18",
    dni: "40111222",
    domicilio: "Chivilcoy, Buenos Aires",
    edad: "22",
    marcasPersonales: "10K: 31:12 / 21K: 1:07:17",
    grupo: "Fondo",
    prueba: "10K",
    nivel: "Avanzado",
  },
  {
    id: 2,
    nombre: "Sara Diamante",
    fechaNacimiento: "2005-03-10",
    dni: "45222333",
    domicilio: "Chivilcoy, Buenos Aires",
    edad: "19",
    marcasPersonales: "1500m: 5:01 / 3000m: 10:50",
    grupo: "Medio Fondo",
    prueba: "1500m",
    nivel: "Intermedio",
  },
  {
    id: 3,
    nombre: "Lautaro Molina",
    fechaNacimiento: "2007-08-22",
    dni: "47111444",
    domicilio: "Chivilcoy, Buenos Aires",
    edad: "17",
    marcasPersonales: "Cross 5K: 19:40",
    grupo: "Iniciación",
    prueba: "Cross",
    nivel: "Inicial",
  },
];

const planesIniciales: PlanSemanal[] = [
  {
    id: 1,
    atleta: "Tomás Vega",
    fechaSemana: "2026-03-09",
    contenido: `Lunes: 8 km suaves + movilidad
Martes: 6x1000 en pista
Miércoles: Gimnasio + core
Jueves: 10 km controlados
Viernes: 6 km regenerativos
Sábado: Fondo largo 16 km
Domingo: Descanso`,
  },
  {
    id: 2,
    atleta: "Tomás Vega",
    fechaSemana: "2026-03-02",
    contenido: `Lunes: 10 km suaves
Martes: 4x2000
Miércoles: Core + técnica
Jueves: 12 km progresivos
Viernes: 5 km regenerativos
Sábado: 18 km fondo
Domingo: Descanso`,
  },
  {
    id: 3,
    atleta: "Sara Diamante",
    fechaSemana: "2026-03-09",
    contenido: `Lunes: 40 min suaves + técnica
Martes: 8x400
Miércoles: Core + movilidad
Jueves: Rodaje controlado
Viernes: Descanso activo
Sábado: Pasadas cortas
Domingo: Descanso`,
  },
];

const carrerasIniciales: Carrera[] = [
  {
    id: 1,
    nombre: "Noche de Lobos",
    fecha: "2026-05-18",
    inscritos: ["Tomás Vega", "Sara Diamante"],
  },
  {
    id: 2,
    nombre: "10K Chivilcoy",
    fecha: "2026-06-02",
    inscritos: ["Tomás Vega", "Lautaro Molina"],
  },
];

const marcasIniciales: MarcaRegistro[] = [
  {
    id: 1,
    atleta: "Tomás Vega",
    fecha: "2026-02-15",
    carrera: "10K Rosario",
    distancia: "10K",
    marca: "31:12",
    posicion: "1°",
  },
  {
    id: 2,
    atleta: "Tomás Vega",
    fecha: "2026-01-20",
    carrera: "21K Buenos Aires",
    distancia: "21K",
    marca: "1:07:17",
    posicion: "2°",
  },
  {
    id: 3,
    atleta: "Sara Diamante",
    fecha: "2026-02-02",
    carrera: "Meeting Provincial",
    distancia: "1500m",
    marca: "5:01",
    posicion: "3°",
  },
];

function formatearFecha(fecha: string) {
  if (!fecha) return "-";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

  export default function Home() {
  const [vista, setVista] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("vistaActual") || "inicio";
  }
  return "inicio";
  });

  const calcularEdad = (fecha: string) => {
  if (!fecha) return "";

  const hoy = new Date();
  const nacimiento = new Date(fecha);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad.toString();
};

const calcularCategoria = (edad: string) => {
  const edadNumero = Number(edad);

  if (!edad || isNaN(edadNumero)) return "";

  if (edadNumero <= 16) return "U16";
  if (edadNumero <= 18) return "U18";
  if (edadNumero <= 20) return "U20";
  if (edadNumero <= 23) return "U23";

  return "Mayores";
};

  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const [seccionEntrenador, setSeccionEntrenador] = useState<
  "panel" | "atletas" | "entrenamientos" | "asistencia" | "carreras" | "usuarios"
>(() => {
  if (typeof window !== "undefined") {
    const valorGuardado = localStorage.getItem("seccionEntrenadorActual");

    if (
      valorGuardado === "panel" ||
      valorGuardado === "atletas" ||
      valorGuardado === "entrenamientos" ||
      valorGuardado === "asistencia" ||
      valorGuardado === "carreras" ||
      valorGuardado === "usuarios"
    ) {
      return valorGuardado;
    }
  }

  return "panel";
});

const admins = [
  "germanvega@cach.arg",
  "tomasvega@cach.arg",
  "emirsosa@cach.arg"
];

  const [datosCargados, setDatosCargados] = useState(false);

  const [usuarioAuth, setUsuarioAuth] = useState<any>(null);
  const [nombreUsuario, setNombreUsuario] = useState("");

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupoAsistencia, setGrupoAsistencia] = useState("atletismo");
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [planesSemanales, setPlanesSemanales] = useState<PlanSemanal[]>([]);
  const [registrosAsistencia, setRegistrosAsistencia] = useState<AsistenciaRegistro[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<AsistenciaRegistro | null>(null);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [marcasRegistros, setMarcasRegistros] = useState<MarcaRegistro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [fechaHistorialSeleccionada, setFechaHistorialSeleccionada] = useState("");
  const [registroEditandoId, setRegistroEditandoId] = useState<string | null>(null);
  const [nuevoUsuario, setNuevoUsuario] = useState<Usuario>({
  dni: 0,
  nombre: "",
  email: "",
  contrasena: "",
  rol: "atleta",
  grupo: "",
  fechaNacimiento: "",
  edad: "",
  domicilio: "",
});
  const atletasAtletismo = alumnos.filter(a => a.grupo === "Atletismo").length;
  const atletasRunning = alumnos.filter(a => a.grupo === "Running").length;
  const atletasMini = alumnos.filter(a => a.grupo === "Mini Atletismo").length;
  const [marcaPersonalAtleta, setMarcaPersonalAtleta] = useState("");
  const [guardandoMarca, setGuardandoMarca] = useState(false);
  const [mensajeMarca, setMensajeMarca] = useState("");
  const [nuevoAlumno, setNuevoAlumno] = useState({
    nombre: "",
    fechaNacimiento: "",
    dni: "",
    domicilio: "",
    edad: "",
    marcasPersonales: "",
    grupo: "",
    prueba: "",
    nivel: "",
  });

  const [modoEdicionAlumno, setModoEdicionAlumno] = useState(false);
  const [alumnoEditandoId, setAlumnoEditandoId] = useState<number | null>(null);
  const [alumnoSeleccionadoNombre, setAlumnoSeleccionadoNombre] = useState("");

  const [planEditable, setPlanEditable] = useState({
  atleta: "",
  fechaSemana: "",
  contenido: "",
  });

  const [fechaAsistencia, setFechaAsistencia] = useState("");
  const [asistenciaDia, setAsistenciaDia] = useState<{ [nombreAtleta: string]: "Sí" | "No" | "" }>({});

  const [nuevaCarrera, setNuevaCarrera] = useState({
    nombre: "",
    fecha: "",
  });

  const [carreraSeleccionadaId, setCarreraSeleccionadaId] = useState<number | null>(null);
  const [mostrarFormularioCarrera, setMostrarFormularioCarrera] = useState(false);

  const [nuevoRegistroMarca, setNuevoRegistroMarca] = useState({
    atleta: "",
    fecha: "",
    carrera: "",
    distancia: "",
    marca: "",
    posicion: "",
  });

  const alumnosFiltrados =
  filtroGrupo === "Todos"
    ? alumnos
    : alumnos.filter((alumno) => alumno.grupo === filtroGrupo);

  const cargarAlumnosDesdeSupabase = async () => {
  const { data, error } = await supabase
    .from("alumnos")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error cargando alumnos desde Supabase:", error);
    return;
  }
  if (data) {
    const alumnosFormateados: Alumno[] = data.map((item: any) => ({
      id: item.id,
      nombre: item.nombre ?? "",
      fechaNacimiento: item.fecha_nacimiento ?? "",
      dni: item.dni ?? "",
      domicilio: item.domicilio ?? "",
      edad: item.edad ?? "",
      marcasPersonales: item.marcas_personales ?? "",
      grupo: item.grupo ?? "",
      prueba: item.prueba ?? "",
      nivel: item.nivel ?? "",
    }));

    setAlumnos(alumnosFormateados);
  }
  };

  const cargarUsuarios = async () => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
  console.error("Error al cargar usuarios:", error.message, error.details, error.hint);
  alert(`Error al cargar usuarios: ${error.message}`);
  return;
}

  setUsuarios(data || []);
};
const crearUsuario = async () => {
  if (
    !nuevoUsuario.dni ||
    !nuevoUsuario.nombre ||
    !nuevoUsuario.email ||
    !nuevoUsuario.contrasena ||
    !nuevoUsuario.grupo
  ) {
    alert("Completá los campos obligatorios");
    return;
  }

  try {
    const response = await fetch("/api/crear-usuario", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    adminEmail: usuarioAuth?.email,
    dni: nuevoUsuario.dni,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email,
    password: nuevoUsuario.contrasena,
    grupo: nuevoUsuario.grupo,
    fechaNacimiento: nuevoUsuario.fechaNacimiento,
    edad: nuevoUsuario.edad,
    domicilio: nuevoUsuario.domicilio,
  }),
});

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "No se pudo crear el usuario");
      return;
    }

setNuevoUsuario({
  dni: 0,
  nombre: "",
  email: "",
  contrasena: "",
  rol: "atleta",
  grupo: "",
  fechaNacimiento: "",
  edad: "",
  domicilio: "",
});

cargarUsuarios();
cargarAlumnosDesdeSupabase();
  } catch (error) {
    alert("Error inesperado al crear usuario");
  }
};

 useEffect(() => {
  const cargarSesion = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      setUsuarioAuth(session.user);
    }
  };

  cargarSesion();

  const { data: subscription } =
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuarioAuth(session.user);
      } else {
        setUsuarioAuth(null);
      }
    });

  return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
  cargarAlumnosDesdeSupabase();
  cargarUsuarios();

  const planesGuardados = localStorage.getItem("club_planes");
    const carrerasGuardadas = localStorage.getItem("club_carreras");
    const marcasGuardadas = localStorage.getItem("club_marcas");

    setPlanesSemanales(planesGuardados ? JSON.parse(planesGuardados) : planesIniciales);
    setCarreras(carrerasGuardadas ? JSON.parse(carrerasGuardadas) : carrerasIniciales);
    setMarcasRegistros(marcasGuardadas ? JSON.parse(marcasGuardadas) : marcasIniciales);

    setDatosCargados(true);
  }, []);

  useEffect(() => {
    if (!datosCargados) return;
    localStorage.setItem("club_alumnos", JSON.stringify(alumnos));
  }, [alumnos, datosCargados]);

  useEffect(() => {
    if (!datosCargados) return;
    localStorage.setItem("club_planes", JSON.stringify(planesSemanales));
  }, [planesSemanales, datosCargados]);

  useEffect(() => {
    if (!datosCargados) return;
    localStorage.setItem("club_carreras", JSON.stringify(carreras));
  }, [carreras, datosCargados]);

  useEffect(() => {
    if (!datosCargados) return;
    localStorage.setItem("club_marcas", JSON.stringify(marcasRegistros));
  }, [marcasRegistros, datosCargados]);

const manejarIngreso = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailLogin,
    password: passwordLogin,
  });

  if (error || !data.user) {
    alert("Email o contraseña incorrectos");
    return;
  }

  const { data: usuarioDB, error: rolError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", data.user.id)
    .single();

  if (rolError || !usuarioDB) {
    alert("No se encontró el rol del usuario.");
    await supabase.auth.signOut();
    return;
  }

  setNombreUsuario(usuarioDB.nombre || "");
  localStorage.setItem("nombreUsuarioAppClub", usuarioDB.nombre || "");

  if (usuarioDB.rol === "admin") {
    localStorage.setItem("rolAppClub", "admin");
    localStorage.setItem("vistaActual", "panelEntrenador");
    localStorage.setItem("sesionEntrenadorActiva", "true");
    setVista("panelEntrenador");
    return;
  }

  if (usuarioDB.rol === "atleta") {
    localStorage.setItem("rolAppClub", "atleta");
    localStorage.setItem("vistaActual", "panelAtleta");
    setVista("panelAtleta");
    return;
  }

  alert("Rol de usuario no válido.");
  await supabase.auth.signOut();
};

  useEffect(() => {
  const rolGuardado = localStorage.getItem("rolAppClub");
  const vistaGuardada = localStorage.getItem("vistaActual");
  const sesionEntrenadorActiva = localStorage.getItem("sesionEntrenadorActiva");

  const nombreGuardado = localStorage.getItem("nombreUsuarioAppClub");
if (nombreGuardado) {
  setNombreUsuario(nombreGuardado);
}

  if (rolGuardado === "admin" && sesionEntrenadorActiva === "true") {
    setVista(vistaGuardada || "panelEntrenador");
  }

  if (rolGuardado === "atleta") {
  setVista(vistaGuardada || "panelAtleta");
}
}, []);

  const limpiarFormularioAlumno = () => {
    setNuevoAlumno({
      nombre: "",
      fechaNacimiento: "",
      dni: "",
      domicilio: "",
      edad: "",
      marcasPersonales: "",
      grupo: "",
      prueba: "",
      nivel: "",
    });
    setModoEdicionAlumno(false);
    setAlumnoEditandoId(null);
  };

  const guardarMarcasAtleta = async () => {
  setGuardandoMarca(true);

  const nombreBuscado = nombreUsuario.trim();

  const { data: atletaEncontrado, error: errorBusqueda } = await supabase
    .from("alumnos")
    .select("id, nombre")
    .eq("nombre", nombreBuscado)
    .maybeSingle();

  if (errorBusqueda) {
    setGuardandoMarca(false);
    alert("Error buscando atleta: " + errorBusqueda.message);
    return;
  }

  if (!atletaEncontrado) {
    setGuardandoMarca(false);
    alert("No se encontró ningún atleta con ese nombre: " + nombreUsuario);
    return;
  }

  const { data, error } = await supabase
    .from("alumnos")
    .update({ marcasPersonales: marcaPersonalAtleta })
    .eq("id", atletaEncontrado.id)
    .select();

  setGuardandoMarca(false);

  if (error) {
    alert("Error guardando marca: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Se encontró el atleta, pero Supabase no permitió actualizar la marca.");
    return;
  }

  setMensajeMarca("Marca guardada correctamente.");

setTimeout(() => {
  setMensajeMarca("");
}, 3000);
};

  const guardarAlumno = async () => {
  if (
    !nuevoAlumno.nombre ||
    !nuevoAlumno.fechaNacimiento ||
    !nuevoAlumno.dni ||
    !nuevoAlumno.domicilio ||
    !nuevoAlumno.edad ||
    !nuevoAlumno.marcasPersonales ||
    !nuevoAlumno.grupo ||
    !nuevoAlumno.prueba ||
    !nuevoAlumno.nivel
  ) {
    alert("Completá todos los campos del atleta.");
    return;
  }

  const { data, error } = await supabase
    .from("alumnos")
    .insert([
      {
        nombre: nuevoAlumno.nombre,
        fecha_nacimiento: nuevoAlumno.fechaNacimiento,
        dni: nuevoAlumno.dni,
        domicilio: nuevoAlumno.domicilio,
        edad: nuevoAlumno.edad,
        marcas_personales: nuevoAlumno.marcasPersonales,
        grupo: nuevoAlumno.grupo,
        prueba: nuevoAlumno.prueba,
        nivel: nuevoAlumno.nivel,
      },
    ])
    .select();

  console.log("SUPABASE data:", data);
  console.log("SUPABASE error:", error);

  if (error) {
    alert("Error guardando alumno en Supabase");
    console.error(error);
    return;
  }

  await cargarAlumnosDesdeSupabase();

  if (modoEdicionAlumno && alumnoEditandoId !== null) {
    setAlumnos(
      alumnos.map((alumno) =>
        alumno.id === alumnoEditandoId ? { ...alumno, ...nuevoAlumno } : alumno
      )
    );
    limpiarFormularioAlumno();
    alert("Ficha actualizada.");
    return;
  }

  const alumnoCreado: Alumno = {
    id: Date.now(),
    ...nuevoAlumno,
  };

  setAlumnos([...alumnos, alumnoCreado]);
  limpiarFormularioAlumno();
};
  const editarAlumno = (alumno: Alumno) => {
    setModoEdicionAlumno(true);
    setAlumnoEditandoId(alumno.id);
    setNuevoAlumno({
      nombre: alumno.nombre,
      fechaNacimiento: alumno.fechaNacimiento,
      dni: alumno.dni,
      domicilio: alumno.domicilio,
      edad: alumno.edad,
      marcasPersonales: alumno.marcasPersonales,
      grupo: alumno.grupo,
      prueba: alumno.prueba,
      nivel: alumno.nivel,
    });
  };

  const eliminarAlumno = (id: number) => {
    const alumno = alumnos.find((a) => a.id === id);
    setAlumnos(alumnos.filter((a) => a.id !== id));

    if (alumno) {
      setPlanesSemanales(planesSemanales.filter((p) => p.atleta !== alumno.nombre));
      setRegistrosAsistencia(
        registrosAsistencia.map((registro) => {
          const nuevaAsistencia = { ...registro.asistencia };
          delete nuevaAsistencia[alumno.nombre];
          return { ...registro, asistencia: nuevaAsistencia };
        })
      );
      setCarreras(
        carreras.map((c) => ({
          ...c,
          inscritos: c.inscritos.filter((nombre) => nombre !== alumno.nombre),
        }))
      );
      setMarcasRegistros(marcasRegistros.filter((m) => m.atleta !== alumno.nombre));
      if (alumnoSeleccionadoNombre === alumno.nombre) {
        setAlumnoSeleccionadoNombre("");
      }
    }
  };

  const cargarPlanDeAtleta = (nombreAtleta: string) => {
  const historial = planesSemanales
    .filter((p) => p.atleta === nombreAtleta)
    .sort((a, b) => b.fechaSemana.localeCompare(a.fechaSemana));

  const planMasReciente = historial[0];

  if (planMasReciente) {
    setPlanEditable({
      atleta: nombreAtleta,
      fechaSemana: "",
      contenido: planMasReciente.contenido || "",
    });
  } else {
    setPlanEditable({
      atleta: nombreAtleta,
      fechaSemana: "",
      contenido: "",
    });
  }
};

  const guardarPlanSemanal = () => {
  if (!planEditable.atleta || !planEditable.fechaSemana || !planEditable.contenido.trim()) {
    alert("Seleccioná atleta, fecha de semana y escribí el entrenamiento.");
    return;
  }

  const nuevoPlan: PlanSemanal = {
    id: Date.now(),
    atleta: planEditable.atleta,
    fechaSemana: planEditable.fechaSemana,
    contenido: planEditable.contenido,
  };

  const yaExisteMismaSemana = planesSemanales.find(
    (p) => p.atleta === nuevoPlan.atleta && p.fechaSemana === nuevoPlan.fechaSemana
  );

  if (yaExisteMismaSemana) {
    setPlanesSemanales(
      planesSemanales.map((p) =>
        p.atleta === nuevoPlan.atleta && p.fechaSemana === nuevoPlan.fechaSemana
          ? nuevoPlan
          : p
      )
    );
  } else {
    setPlanesSemanales([...planesSemanales, nuevoPlan]);
  }

  alert("Semana guardada correctamente.");
};

  const cargarAsistenciaPorFecha = (fecha: string) => {
    setFechaAsistencia(fecha);
    const registro = registrosAsistencia.find((r) => r.fecha === fecha);
    if (registro) {
      setAsistenciaDia(registro.asistencia);
    } else {
      setAsistenciaDia({});
    }
  };

  const cargarAsistenciaDesdeHistorial = (fecha: string) => {
  setFechaHistorialSeleccionada(fecha);

  const registro = registrosAsistencia.find((item) => item.fecha === fecha);
  if (!registro) return;

  setFechaAsistencia(registro.fecha);
  setAsistenciaDia({ ...registro.asistencia });

  console.log("Registro seleccionado:", registro);
  console.log("Tipo de id:", typeof registro.id, "Valor:", registro.id);

  setRegistroEditandoId(registro.id);
};

  const guardarAsistencia = async () => {
  if (!fechaAsistencia) {
    alert("Seleccioná una fecha");
    return;
  }

  const nuevoRegistro = {
    fecha: fechaAsistencia,
    asistencia: asistenciaDia,
  };

  if (registroEditandoId !== null) {
    const { error } = await supabase
      .from("asistencias")
      .update(nuevoRegistro)
      .eq("id", registroEditandoId);

    if (error) {
      alert("Error al actualizar en Supabase: " + error.message);
      return;
    }

    setRegistrosAsistencia(
      registrosAsistencia.map((r) =>
        r.id === registroEditandoId
          ? { ...r, fecha: fechaAsistencia, asistencia: asistenciaDia }
          : r
      )
    );

  } else {
    const yaExiste = registrosAsistencia.find(
      (r) => r.fecha === fechaAsistencia
    );

    if (yaExiste) {
      alert("Ya existe una asistencia para esa fecha. Seleccionala desde el historial para editarla.");
      return;
    }

    const { data, error } = await supabase
      .from("asistencias")
      .insert([nuevoRegistro])
      .select();

    if (error) {
      alert("Error al guardar en Supabase: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      setRegistrosAsistencia([
        ...registrosAsistencia,
        data[0],
      ]);
    }

  }

  setAsistenciaDia({});
  setFechaAsistencia("");
  setFechaHistorialSeleccionada("");
  setRegistroEditandoId(null);
};

  const agregarCarrera = () => {
    if (!nuevaCarrera.nombre || !nuevaCarrera.fecha) {
      alert("Completá nombre y fecha de la carrera.");
      return;
    }

    const carreraCreada: Carrera = {
      id: Date.now(),
      nombre: nuevaCarrera.nombre,
      fecha: nuevaCarrera.fecha,
      inscritos: [],
    };

    setCarreras([...carreras, carreraCreada]);
    setNuevaCarrera({ nombre: "", fecha: "" });
    setMostrarFormularioCarrera(false);
  };

  const eliminarCarrera = (id: number) => {
    setCarreras(carreras.filter((c) => c.id !== id));
    if (carreraSeleccionadaId === id) {
      setCarreraSeleccionadaId(null);
    }
  };

  const toggleInscripcionAtleta = (carreraId: number, atleta: string) => {
    setCarreras(
      carreras.map((carrera) => {
        if (carrera.id !== carreraId) return carrera;

        const yaInscripto = carrera.inscritos.includes(atleta);

        return {
          ...carrera,
          inscritos: yaInscripto
            ? carrera.inscritos.filter((nombre) => nombre !== atleta)
            : [...carrera.inscritos, atleta],
        };
      })
    );
  };

  const agregarRegistroMarca = () => {
    if (
      !nuevoRegistroMarca.atleta ||
      !nuevoRegistroMarca.fecha ||
      !nuevoRegistroMarca.carrera ||
      !nuevoRegistroMarca.distancia ||
      !nuevoRegistroMarca.marca
    ) {
      alert("Completá los datos del registro.");
      return;
    }

    const nuevo: MarcaRegistro = {
      id: Date.now(),
      ...nuevoRegistroMarca,
    };

    setMarcasRegistros([...marcasRegistros, nuevo]);
    setNuevoRegistroMarca({
      atleta: "",
      fecha: "",
      carrera: "",
      distancia: "",
      marca: "",
      posicion: "",
    });
  };

  const eliminarRegistroMarca = (id: number) => {
    setMarcasRegistros(marcasRegistros.filter((m) => m.id !== id));
  };

  const resetearDatos = () => {
    const confirmar = confirm("¿Seguro que querés borrar todos los datos guardados?");
    if (!confirmar) return;

    localStorage.removeItem("club_alumnos");
    localStorage.removeItem("club_planes");
    localStorage.removeItem("club_asistencias");
    localStorage.removeItem("club_carreras");
    localStorage.removeItem("club_marcas");

    setAlumnos(alumnosIniciales);
    setPlanesSemanales(planesIniciales);
    setRegistrosAsistencia([]);
    setCarreras(carrerasIniciales);
    setMarcasRegistros(marcasIniciales);
    setAsistenciaDia({});
    setFechaAsistencia("");
    setCarreraSeleccionadaId(null);
    setAlumnoSeleccionadoNombre("");
    limpiarFormularioAlumno();

    alert("Datos reiniciados.");
  };

  const atletaActual = useMemo(() => {
  if (!nombreUsuario) return null;

  const nombreIngresado = nombreUsuario.trim().toLowerCase();

  return (
    alumnos.find(
      (a) =>
        (a.nombre || "").trim().toLowerCase() === nombreIngresado
    ) || null
  );
}, [nombreUsuario, alumnos]);

const edadAtletaActual = atletaActual?.fechaNacimiento
  ? calcularEdad(atletaActual.fechaNacimiento)
  : atletaActual?.edad || "";

const categoriaAtletaActual = edadAtletaActual
  ? calcularCategoria(edadAtletaActual)
  : "";

useEffect(() => {
  const cargarMarcaDelAtleta = async () => {
    if (!atletaActual?.nombre) return;

    const { data, error } = await supabase
      .from("alumnos")
      .select("marcasPersonales")
      .eq("nombre", atletaActual.nombre)
      .single();

    if (!error && data) {
      setMarcaPersonalAtleta(data.marcasPersonales || "");
    }
  };

  cargarMarcaDelAtleta();
}, [atletaActual]);

  const historialAtletaSeleccionado = useMemo(() => {
    if (!alumnoSeleccionadoNombre) return [];
    return planesSemanales
      .filter((p) => p.atleta === alumnoSeleccionadoNombre)
      .sort((a, b) => b.fechaSemana.localeCompare(a.fechaSemana));
  }, [planesSemanales, alumnoSeleccionadoNombre]);
const estadisticasAsistencia = useMemo(() => {
  if (!alumnos.length || !registrosAsistencia.length) return [];

  return alumnos
    .map((alumno) => {
      let presentes = 0;
      let ausentes = 0;
      let totalTomadas = 0;

      registrosAsistencia.forEach((registro) => {
        const estado = registro.asistencia?.[alumno.nombre];

        if (estado === "Sí") {
          presentes += 1;
          totalTomadas += 1;
        } else if (estado === "No") {
          ausentes += 1;
          totalTomadas += 1;
        }
      });

      const porcentaje =
        totalTomadas > 0 ? Math.round((presentes / totalTomadas) * 100) : 0;

      return {
        nombre: alumno.nombre,
        presentes,
        ausentes,
        totalTomadas,
        porcentaje,
      };
    })
    .sort((a, b) => b.porcentaje - a.porcentaje || b.presentes - a.presentes);
}, [alumnos, registrosAsistencia]);
  const planAtleta = useMemo(() => {
    if (!atletaActual) return null;
    return (
      planesSemanales
        .filter((p) => p.atleta === atletaActual.nombre)
        .sort((a, b) => b.fechaSemana.localeCompare(a.fechaSemana))[0] || null
    );
  }, [atletaActual, planesSemanales]);

  const carrerasAtleta = useMemo(() => {
    if (!atletaActual) return [];
    return carreras.filter((c) => c.inscritos.includes(atletaActual.nombre));
  }, [atletaActual, carreras]);

  const convertirFecha = (fecha: string) => {
  if (!fecha) return 0;

  if (fecha.includes("-")) {
    return new Date(fecha + "T00:00:00").getTime();
  }

  if (fecha.includes("/")) {
    const [dia, mes, anio] = fecha.split("/");
    return new Date(Number(anio), Number(mes) - 1, Number(dia)).getTime();
  }

  return 0;
};

const carrerasAtletaOrdenadas = useMemo(() => {
  return [...carrerasAtleta].sort(
    (a, b) => convertirFecha(a.fecha) - convertirFecha(b.fecha)
  );
}, [carrerasAtleta]);

  const carreraSeleccionada = useMemo(() => {
    return carreras.find((c) => c.id === carreraSeleccionadaId) || null;
  }, [carreras, carreraSeleccionadaId]);

  const alumnoSeleccionado = useMemo(() => {
    return alumnos.find((a) => a.nombre === alumnoSeleccionadoNombre) || null;
  }, [alumnos, alumnoSeleccionadoNombre]);

  const alumnosParaAsistencia = alumnos.filter(
  (alumno) =>
    (alumno.grupo || "").trim().toLowerCase() ===
    grupoAsistencia.trim().toLowerCase()
);

  const registrosMarcasAtletaSeleccionado = useMemo(() => {
    if (!alumnoSeleccionadoNombre) return [];
    return marcasRegistros
      .filter((m) => m.atleta === alumnoSeleccionadoNombre)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [marcasRegistros, alumnoSeleccionadoNombre]);

  const registrosMarcasAtletaActual = useMemo(() => {
    if (!atletaActual) return [];
    return marcasRegistros
      .filter((m) => m.atleta === atletaActual.nombre)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [marcasRegistros, atletaActual]);

  const asistenciasAtletaActual = useMemo(() => {
    if (!atletaActual) return [];
    return registrosAsistencia.filter(
      (registro) => registro.asistencia[atletaActual.nombre] === "Sí" || registro.asistencia[atletaActual.nombre] === "No"
    );
  }, [registrosAsistencia, atletaActual]);

  const asistenciasPositivasAtletaActual = useMemo(() => {
    if (!atletaActual) return 0;
    return registrosAsistencia.filter((registro) => registro.asistencia[atletaActual.nombre] === "Sí")
      .length;
  }, [registrosAsistencia, atletaActual]);

  const porcentajeAsistenciaAtletaActual = useMemo(() => {
    if (!atletaActual || asistenciasAtletaActual.length === 0) return 0;
    return Math.round((asistenciasPositivasAtletaActual / asistenciasAtletaActual.length) * 100);
  }, [atletaActual, asistenciasAtletaActual.length, asistenciasPositivasAtletaActual]);

  const botonBase = {
    padding: "14px 28px",
    fontSize: "18px",
    backgroundColor: "white",
    color: "#0a7a2f",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  };

  const inputBase = {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "18px",
  };

  const deleteButtonStyle = {
    padding: "10px 14px",
    backgroundColor: "#d62828",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  };

  const sectionTitleStyle = {
    fontSize: "40px",
    marginBottom: "20px",
  };

  if (!datosCargados) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a7a2f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: "28px",
        }}
      >
        Cargando app...
      </main>
    );
    }

    return (
    <main
    style={{
      backgroundColor:"#0a7a2f",
      minHeight: "100vh",
      color: "white",
      fontFamily: "Arial, sans-serif",
    }}
  >
      {vista === "inicio" && (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        color: "#0a7a2f",
        padding: "40px",
        borderRadius: "24px",
        width: "100%",
        maxWidth: "520px",
        textAlign: "center",
      }}
    >
      <img
        src="/logo.png"
        alt="Logo del club"
        style={{
          width: "130px",
          height: "130px",
          objectFit: "contain",
          marginBottom: "20px",
        }}
      />

      <h2 style={{ marginBottom: "20px", fontSize: "34px" }}>
        Iniciar sesión
      </h2>

      <p style={{ marginBottom: "24px", fontSize: "18px" }}>
        Círculo Atletas de Chivilcoy
      </p>

      <input
        id="emailLogin"
        name="emailLogin"
        type="email"
        placeholder="Correo electrónico"
        value={emailLogin}
        onChange={(e) => setEmailLogin(e.target.value)}
        style={inputBase}
      />

      <input
        id="passwordLogin"
        name="passwordLogin"
        type="password"
        placeholder="Contraseña"
        value={passwordLogin}
        onChange={(e) => setPasswordLogin(e.target.value)}
        style={inputBase}
      />

      <button
        onClick={manejarIngreso}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "18px",
          backgroundColor: "#0a7a2f",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Ingresar
      </button>
    </div>
  </div>
)}
      {vista === "panelEntrenador" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            minHeight: "100vh",
          }}
        >
          <aside
            style={{
              backgroundColor: "#066625",
              padding: "30px 20px",
              borderRight: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <img
                src="/logo.png"
                alt="Logo del club"
                style={{
                  width: "250px",
                  height: "150px",
                  objectFit: "contain",
                  borderRadius: "50%",
                  padding: "10px",
                  marginBottom: "16px",
                }}
              />
              <h2 style={{ fontSize: "22px", margin: 0 }}>Panel Admin</h2>
              <p style={{ marginTop: "8px", opacity: 0.9 }}>
                {nombreUsuario || "Admin"}
              </p>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {(["panel", "atletas", "entrenamientos", "asistencia", "carreras"] as const).map((seccion) => (
                  <button
                    key={seccion}
                    onClick={() => {
                    localStorage.setItem("seccionEntrenadorActual", seccion);
                    setSeccionEntrenador(seccion);
                  }}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                      backgroundColor: seccionEntrenador === seccion ? "white" : "#0a7a2f",
                      color: seccionEntrenador === seccion ? "#0a7a2f" : "white",
                    }}
                  >
                    {seccion}
                  </button>
                )
              )}
              {admins.includes(usuarioAuth?.email || "") && (
  <button
    onClick={() => {
      localStorage.setItem("seccionEntrenadorActual", "usuarios");
      setSeccionEntrenador("usuarios");
    }}
    style={{
      padding: "14px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      textTransform: "capitalize",
      backgroundColor: seccionEntrenador === "usuarios" ? "white" : "#0a7a2f",
      color: seccionEntrenador === "usuarios" ? "#0a7a2f" : "white",
    }}
  >
    usuarios
  </button>
)}
            </div>

            <button
  onClick={async () => {
  await supabase.auth.signOut();

  localStorage.removeItem("rolAppClub");
  localStorage.removeItem("vistaActual");
  localStorage.removeItem("seccionEntrenadorActual");
  localStorage.removeItem("sesionEntrenadorActiva");
  localStorage.removeItem("nombreUsuarioAppClub");

  setNombreUsuario("");
  setVista("inicio");
}}
  style={{
    marginTop: "30px",
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "#ffffff",
    color: "#0a7a2f",
  }}
>
  Cerrar sesión
</button>
          </aside>

          <section
            style={{
              backgroundColor: "#f4f4f4",
              color: "#0a7a2f",
              padding: "40px",
            }}
          >
            {seccionEntrenador === "panel" && (
              <>
              <h1 style={sectionTitleStyle}>Panel del entrenador</h1>
              <p style={{ marginTop: "-10px", color: "#666"}}>

              </p>
              <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
              >
      <div style={cardStyle}>
        <h3>Atletas activos</h3>
        <p style={{ fontSize: "34px", fontWeight: "bold" }}>{alumnos.length}</p>
      </div>

      <div style={cardStyle}>
        <h3>Atletismo</h3>
        <p style={{ fontSize: "34px", fontWeight: "bold" }}>{atletasAtletismo}</p>
      </div>

      <div style={cardStyle}>
        <h3>Running</h3>
        <p style={{ fontSize: "34px", fontWeight: "bold" }}>{atletasRunning}</p>
      </div>

      <div style={cardStyle}>
        <h3>Mini atletismo</h3>
        <p style={{ fontSize: "34px", fontWeight: "bold" }}>{atletasMini}</p>
      </div>
    </div>
  </>
  )}
<div style={{ marginTop: "35px" }}>
    <h2 style={{ marginBottom: "16px", fontSize: "32px", fontWeight: "bold" }}>
  Accesos rápidos
</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
    }}
  >
    <button onClick={() => setSeccionEntrenador("atletas")} style={cardStyle}>
      <h3>ATLETAS👟</h3>
    </button>

    <button onClick={() => setSeccionEntrenador("entrenamientos")} style={cardStyle}>
      <h3>ENTRENAMIENTOS📋</h3>
    </button>

    <button onClick={() => setSeccionEntrenador("asistencia")} style={cardStyle}>
      <h3>ASISTENCIAS🙋🏻‍♂️</h3>
    </button>

    {admins.includes(usuarioAuth?.email || "") && (
  <button onClick={() => setSeccionEntrenador("usuarios")} style={cardStyle}>
    <h3>USUARIOS🏃‍♂️</h3>
  </button>
)}
  </div>
</div>
            {seccionEntrenador === "atletas" && (
              <>
                <h1 style={sectionTitleStyle}>Alumnos</h1>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.3fr",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  <div style={cardStyle}>
                    <h2 style={{ marginTop: 0 }}>
                      {modoEdicionAlumno ? "Editar atleta" : "Agregar alumno de escuelita"}
                    </h2>

                    <input
                      type="text"
                      placeholder="Nombre"
                      value={nuevoAlumno.nombre}
                      onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, nombre: e.target.value })}
                      style={inputBase}
                    />
                    <input
                      type="date"
                      value={nuevoAlumno.fechaNacimiento}
                      onChange={(e) =>
                        setNuevoAlumno({ ...nuevoAlumno, fechaNacimiento: e.target.value })
                      }
                      style={inputBase}
                    />
                    <input
                      type="text"
                      placeholder="DNI"
                      value={nuevoAlumno.dni}
                      onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, dni: e.target.value })}
                      style={inputBase}
                    />
                    <input
                      type="text"
                      placeholder="Domicilio"
                      value={nuevoAlumno.domicilio}
                      onChange={(e) =>
                        setNuevoAlumno({ ...nuevoAlumno, domicilio: e.target.value })
                      }
                      style={inputBase}
                    />
                    <input
                      type="text"
                      placeholder="Edad"
                      value={nuevoAlumno.edad}
                      onChange={(e) => setNuevoAlumno({ ...nuevoAlumno, edad: e.target.value })}
                      style={inputBase}
                    />
                    <select
                     value={nuevoAlumno.grupo}
                      onChange={(e) =>
                        setNuevoAlumno({ ...nuevoAlumno, grupo: e.target.value })
                         }
                         style={inputBase}
                         >
                          <option value="">Seleccionar grupo</option>
                          <option value="Atletismo">Atletismo</option>
                          <option value="Running">Running</option>
                          <option value="Mini atletismo">Mini atletismo</option>
                          </select>

                    <button
                      onClick={guardarAlumno}
                      style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: "16px",
                        backgroundColor: "#0a7a2f",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginBottom: "10px",
                      }}
                    >
                      {modoEdicionAlumno ? "Guardar cambios" : "Guardar alumno"}
                    </button>

                    {modoEdicionAlumno && (
                      <button
                        onClick={limpiarFormularioAlumno}
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "16px",
                          backgroundColor: "#eaeaea",
                          color: "#0a7a2f",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "20px" }}>
                    <div style={cardStyle}>
                      <h2 style={{ marginTop: 0 }}>Lista de atletas</h2>

                      <select
                      value={filtroGrupo}
                      onChange={(e) => setFiltroGrupo(e.target.value)}
                      style={{ ...inputBase, marginBottom: "10px" }}
                      >
                        <option value="Todos">Todos</option>
                         <option value="Atletismo">Atletismo</option>
                          <option value="Running">Running</option>
                            <option value="Mini atletismo">Mini atletismo</option>
                            </select>

                      <div style={{ display: "grid", gap: "14px" }}>
                        {alumnosFiltrados.map((alumno) => (
                          <div
                            key={alumno.id}
                            style={{
                              border: alumnoSeleccionadoNombre === alumno.nombre
                                ? "2px solid #0a7a2f"
                                : "1px solid #d9d9d9",
                              borderRadius: "14px",
                              padding: "16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "14px",
                            }}
                          >
                            <div
                              onClick={() => setAlumnoSeleccionadoNombre(alumno.nombre)}
                              style={{ cursor: "pointer", flex: 1 }}
                            >
                              <strong style={{ fontSize: "18px" }}>{alumno.nombre}</strong>
                              <p style={{ margin: "8px 0 0 0" }}>
                                {alumno.grupo} · {alumno.prueba} · {alumno.nivel}
                              </p>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => editarAlumno(alumno)}
                                style={{
                                  padding: "10px 14px",
                                  backgroundColor: "#0a7a2f",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                Editar
                              </button>
                              <button onClick={() => eliminarAlumno(alumno.id)} style={deleteButtonStyle}>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {alumnoSeleccionado && (
                      <div style={cardStyle}>
                        <h2 style={{ marginTop: 0 }}>Ficha del atleta</h2>
                        <p><strong>Nombre:</strong> {alumnoSeleccionado.nombre}</p>
                        <p><strong>Fecha de nacimiento:</strong> {formatearFecha(alumnoSeleccionado.fechaNacimiento)}</p>
                        <p><strong>DNI:</strong> {alumnoSeleccionado.dni}</p>
                        <p><strong>Domicilio:</strong> {alumnoSeleccionado.domicilio}</p>
                        <p><strong>Edad:</strong> {alumnoSeleccionado.edad}</p>
                        <p><strong>Grupo:</strong> {alumnoSeleccionado.grupo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {seccionEntrenador === "entrenamientos" && (
              <>
                <h1 style={sectionTitleStyle}>Entrenamientos semanales</h1>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.1fr",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  <div style={cardStyle}>
                    <h2 style={{ marginTop: 0 }}>Cargar semana completa</h2>

                    <select
                      value={planEditable.atleta}
                      onChange={(e) => cargarPlanDeAtleta(e.target.value)}
                      style={inputBase}
                    >
                      <option value="">Seleccionar atleta</option>
                      {alumnos.map((alumno) => (
                        <option key={alumno.id} value={alumno.nombre}>
                          {alumno.nombre}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={planEditable.fechaSemana}
                      onChange={(e) =>
                        setPlanEditable({ ...planEditable, fechaSemana: e.target.value })
                      }
                      style={inputBase}
                    />

                      <textarea
                            placeholder={`Escribí o pegá acá el entrenamiento completo de la semana.

                          Ejemplo:
                          Lunes: 10 km suaves + técnica
                          Martes: 6x800
                          Miércoles: 8 km regenerativos
                          Jueves: tempo 20'
                          Viernes: gimnasio
                          Sábado: fondo 16 km
                          Domingo: descanso`}
                            value={planEditable.contenido}
                            onChange={(e) =>
                              setPlanEditable({ ...planEditable, contenido: e.target.value })
                            }
                            style={{
                              ...inputBase,
                              minHeight: "260px",
                              resize: "vertical",
                              fontFamily: "inherit",
                              lineHeight: "1.6",
                            }}
                          />
                    <button
                      onClick={guardarPlanSemanal}
                      style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: "16px",
                        backgroundColor: "#0a7a2f",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Guardar semana
                    </button>
                  </div>

                  <div style={cardStyle}>
                    <h2 style={{ marginTop: 0 }}>Historial por atleta</h2>

                    <select
                      value={alumnoSeleccionadoNombre}
                      onChange={(e) => setAlumnoSeleccionadoNombre(e.target.value)}
                      style={inputBase}
                    >
                      <option value="">Seleccionar atleta</option>
                      {alumnos.map((alumno) => (
                        <option key={alumno.id} value={alumno.nombre}>
                          {alumno.nombre}
                        </option>
                      ))}
                    </select>

                    {historialAtletaSeleccionado.length === 0 ? (
                      <p>No hay semanas cargadas para este atleta.</p>
                    ) : (
                      <div style={{ display: "grid", gap: "14px" }}>
                        {historialAtletaSeleccionado.map((plan) => (
                          <div
                            key={plan.id}
                            style={{
                              border: "1px solid #d9d9d9",
                              borderRadius: "14px",
                              padding: "16px",
                            }}
                          >
                            <strong style={{ fontSize: "18px" }}>
                              Semana del {formatearFecha(plan.fechaSemana)}
                            </strong>
                            <div
                            style={{
                              marginTop: "12px",
                              whiteSpace: "pre-wrap",
                              lineHeight: "1.8",
                              backgroundColor: "#f8f8f8",
                              padding: "14px",
                              borderRadius: "10px",
                            }}
                          >
                            {plan.contenido || "-"}
                          </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

{seccionEntrenador === "asistencia" && (
  <>
    <h1 style={sectionTitleStyle}>Asistencia</h1>

    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Asistencias por grupos</h2>
      <div style={{ marginBottom: "12px" }}>
        <select
          value={grupoAsistencia}
          onChange={(e) => setGrupoAsistencia(e.target.value)}
        >
          <option value="Atletismo">Atletismo</option>
          <option value="Running">Running</option>
          <option value="Mini Atletismo">Mini Atletismo</option>
        </select>
      </div>

      <h2 style={{ marginTop: 0 }}>Historial</h2>

<div style={{ marginBottom: "20px" }}>
  <h3 style={{ marginBottom: "10px", color: "#0a7a2f" }}>
  </h3>

  <select
    value={fechaHistorialSeleccionada}
    onChange={(e) => cargarAsistenciaDesdeHistorial(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      minWidth: "260px",
      fontSize: "16px",
    }}
  >
    <option value="">Fechas anteriores</option>

    {registrosAsistencia
      .slice()
      .sort(
        (a, b) =>
          new Date(b.fecha + "T00:00:00").getTime() -
          new Date(a.fecha + "T00:00:00").getTime()
      )
      .map((registro) => (
        <option key={registro.id} value={registro.fecha}>
          {new Date(registro.fecha + "T00:00:00").toLocaleDateString("es-AR")}
        </option>
      ))}
  </select>
</div>

      <input
        type="date"
        value={fechaAsistencia}
        onChange={(e) => cargarAsistenciaPorFecha(e.target.value)}
        style={{ ...inputBase, maxWidth: "300px" }}
      />

      {registroEditandoId !== null && (
  <button
    onClick={() => {
      setRegistroEditandoId(null);
      setFechaHistorialSeleccionada("");
      setFechaAsistencia("");
      setAsistenciaDia({});
    }}
    style={{
      marginTop: "12px",
      padding: "10px 16px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#999",
      color: "white",
      cursor: "pointer",
    }}
  >
    Cancelar edición
  </button>
)}

      {fechaAsistencia && (
        <p style={{ marginTop: 0, marginBottom: "15px" }}>
          <strong>Fecha seleccionada:</strong> {formatearFecha(fechaAsistencia)}
        </p>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        {alumnosParaAsistencia.map((alumno) => {
  const estado = asistenciaDia[alumno.nombre];

  return (
    <div
      key={alumno.id}
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 150px 150px",
        alignItems: "center",
        gap: "12px",
        borderRadius: "12px",
        padding: "14px",
        backgroundColor:
          estado === "Sí"
            ? "#d4edda"
            : estado === "No"
            ? "#f8d7da"
            : "white",
        border:
          estado === "Sí"
            ? "1px solid #28a745"
            : estado === "No"
            ? "1px solid #dc3545"
            : "1px solid #e4e4e4",
      }}
    >
            <strong>{alumno.nombre}</strong>

            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="radio"
                name={`asistencia-${fechaAsistencia}-${alumno.id}`}
                checked={asistenciaDia[alumno.nombre] === "Sí"}
                onChange={() =>
                  setAsistenciaDia({ ...asistenciaDia, [alumno.nombre]: "Sí" })
                }
              />
              Sí asistió
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="radio"
                name={`asistencia-${fechaAsistencia}-${alumno.id}`}
                checked={asistenciaDia[alumno.nombre] === "No"}
                onChange={() =>
                  setAsistenciaDia({ ...asistenciaDia, [alumno.nombre]: "No" })
                }
              />
              No asistió
            </label>
              </div>
  );
})}
      </div>

      <button
        onClick={guardarAsistencia}
        style={{
          marginTop: "18px",
          padding: "14px 22px",
          fontSize: "16px",
          backgroundColor: "#0a7a2f",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {registroEditandoId !== null
  ? "Actualizar asistencia"
  : "Guardar asistencia"}
      </button>
    </div>

    <div style={{ ...cardStyle, marginTop: "20px" }}>
      <h2 style={{ marginTop: 0 }}>Estadísticas generales de asistencia</h2>

      {estadisticasAsistencia.length === 0 ? (
        <p>No hay estadísticas disponibles todavía.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {estadisticasAsistencia.map((item) => (
            <div
              key={item.nombre}
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                {item.nombre}
              </div>

              <div style={{ marginBottom: "6px" }}>
                Porcentaje de asistencia:{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: item.porcentaje >= 80 ? "#4caf50" : "#ff5252",
                  }}
                >
                  {item.porcentaje}%
                </span>
              </div>

              <div style={{ marginBottom: "6px" }}>
                Presentes: {item.presentes}
              </div>

              <div>
                Ausentes: {item.ausentes}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
)}
            {seccionEntrenador === "carreras" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <h1 style={{ ...sectionTitleStyle, marginBottom: 0 }}>Carreras</h1>

                  <button
                    onClick={() => setMostrarFormularioCarrera(!mostrarFormularioCarrera)}
                    style={{
                      padding: "14px 22px",
                      backgroundColor: "#0a7a2f",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Agregar carrera
                  </button>
                </div>

                {mostrarFormularioCarrera && (
                  <div style={{ ...cardStyle, marginBottom: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Nueva carrera</h2>

                    <input
                      type="text"
                      placeholder="Nombre de la carrera"
                      value={nuevaCarrera.nombre}
                      onChange={(e) =>
                        setNuevaCarrera({ ...nuevaCarrera, nombre: e.target.value })
                      }
                      style={inputBase}
                    />

                    <input
                      type="date"
                      value={nuevaCarrera.fecha}
                      onChange={(e) =>
                        setNuevaCarrera({ ...nuevaCarrera, fecha: e.target.value })
                      }
                      style={inputBase}
                    />

                    <button
                      onClick={agregarCarrera}
                      style={{
                        padding: "14px 22px",
                        backgroundColor: "#0a7a2f",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Guardar carrera
                    </button>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.1fr",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  <div style={cardStyle}>
                    <h2 style={{ marginTop: 0 }}>Calendario de carreras</h2>

                    <div style={{ display: "grid", gap: "12px" }}>
                      {carreras.map((carrera) => (
                        <div
                          key={carrera.id}
                          onClick={() => setCarreraSeleccionadaId(carrera.id)}
                          style={{
                            border:
                              carreraSeleccionadaId === carrera.id
                                ? "2px solid #0a7a2f"
                                : "1px solid #d9d9d9",
                            borderRadius: "14px",
                            padding: "16px",
                            cursor: "pointer",
                            backgroundColor:
                              carreraSeleccionadaId === carrera.id ? "#eef9f0" : "white",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "18px" }}>{carrera.nombre}</strong>
                              <p style={{ margin: "8px 0 0 0" }}>{formatearFecha(carrera.fecha)}</p>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarCarrera(carrera.id);
                              }}
                              style={deleteButtonStyle}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <h2 style={{ marginTop: 0 }}>
                      {carreraSeleccionada
                        ? `Inscribir atletas en ${carreraSeleccionada.nombre}`
                        : "Seleccioná una carrera"}
                    </h2>

                    {carreraSeleccionada ? (
                      <div style={{ display: "grid", gap: "12px" }}>
                        {alumnos.map((alumno) => {
                          const estaAnotado = carreraSeleccionada.inscritos.includes(alumno.nombre);

                          return (
                            <div
                              key={alumno.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                border: "1px solid #e4e4e4",
                                borderRadius: "12px",
                                padding: "14px",
                              }}
                            >
                              <span>{alumno.nombre}</span>

                              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="checkbox"
                                  checked={estaAnotado}
                                  onChange={() =>
                                    toggleInscripcionAtleta(carreraSeleccionada.id, alumno.nombre)
                                  }
                                />
                                Anotar
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>Elegí una carrera del calendario para ver los atletas.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {seccionEntrenador === "usuarios" && admins.includes(usuarioAuth?.email || "") && (
<>
    <h1 style={sectionTitleStyle}>Usuarios</h1>

    <div style={cardStyle}>
      <h2>Crear usuario</h2>

      <input
        type="number"
        placeholder="DNI"
        value={nuevoUsuario.dni || ""}
        onChange={(e) =>
          setNuevoUsuario({ ...nuevoUsuario, dni: Number(e.target.value) })
        }
        style={inputBase}
      />

      <input
        type="text"
        placeholder="Nombre completo"
        value={nuevoUsuario.nombre}
        onChange={(e) =>
          setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
        }
        style={inputBase}
      />

      <input
  type="text"
  placeholder="Email (ej: atleta1@cach.arg)"
  value={nuevoUsuario.email}
  onChange={(e) =>
    setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
  }
  style={inputBase}
/>

      <input
        type="text"
        placeholder="Contraseña"
        value={nuevoUsuario.contrasena}
        onChange={(e) =>
          setNuevoUsuario({ ...nuevoUsuario, contrasena: e.target.value })
        }
        style={inputBase}
      />

      <input
        type="text"
        placeholder="Grupo"
        value={nuevoUsuario.grupo}
        onChange={(e) =>
          setNuevoUsuario({ ...nuevoUsuario, grupo: e.target.value })
        }
        style={inputBase}
      />

      <input
  type="date"
  value={nuevoUsuario.fechaNacimiento}
  onChange={(e) => {
  const fecha = e.target.value;

  setNuevoUsuario((prev) => ({
    ...prev,
    fechaNacimiento: fecha,
    edad: calcularEdad(fecha),
  }));
}}
  style={inputBase}
/>

{nuevoUsuario.edad && (
  <div style={{ marginTop: "8px", color: "#555" }}>
    <p style={{ margin: 0 }}>Edad: {nuevoUsuario.edad} años</p>
    <p style={{ margin: "4px 0 0 0" }}>
      Categoría: {calcularCategoria(nuevoUsuario.edad)}
    </p>
  </div>
)}

<input
  type="text"
  placeholder="Domicilio"
  value={nuevoUsuario.domicilio}
  onChange={(e) =>
    setNuevoUsuario({ ...nuevoUsuario, domicilio: e.target.value })
  }
  style={inputBase}
/>

      <button
  onClick={crearUsuario}
  style={{
    padding: "14px 22px",
    backgroundColor: "#0a7a2f",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Crear usuario
</button>
    </div>

    <div style={cardStyle}>
      <h2>Usuarios creados</h2>

      {usuarios.map((u) => (
        <div key={u.dni} style={{ marginBottom: "10px" }}>
          <strong>{u.nombre}</strong> — {u.email} — {u.rol}
        </div>
      ))}
   </div>

  </>
)}

          </section>
        </div>
      )}

      {vista === "panelAtleta" && (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f4f4f4",
            color: "#0a7a2f",
            padding: "40px",
          }}
        >
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "24px",
                padding: "30px",
                marginBottom: "25px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <img
                src="/logo.png"
                alt="Logo del club"
                style={{ width: "110px", height: "110px", objectFit: "contain" }}
              />

              <div>
                <h1 style={{ margin: 0, fontSize: "38px" }}>Panel del Atleta</h1>
                <p style={{ marginTop: "8px" }}>
                  Bienvenido, {nombreUsuario || "Atleta"}
                </p>
              </div>
            </div>

            {atletaActual && (
  <div style={{ ...cardStyle, marginBottom: "25px" }}>
    <h2>Mi ficha</h2>
    <p>
      <strong>Fecha de nacimiento:</strong>{" "}
      {formatearFecha(atletaActual.fechaNacimiento)}
    </p>
    <p><strong>DNI:</strong> {atletaActual.dni}</p>
    <p><strong>Domicilio:</strong> {atletaActual.domicilio}</p>
    <p><strong>Edad:</strong> {edadAtletaActual || "-"}</p>
    <p><strong>Categoría:</strong> {categoriaAtletaActual || "-"}</p>
    <p><strong>Grupo:</strong> {atletaActual.grupo}</p>
  </div>
)}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              <div style={cardStyle}>
                <h3>Asistencia semanal</h3>
                <p style={{ fontSize: "32px", fontWeight: "bold" }}>
                  {porcentajeAsistenciaAtletaActual}%
                </p>
                <p style={{ marginTop: "10px" }}>
                  {asistenciasPositivasAtletaActual} de {asistenciasAtletaActual.length} días asistidos
                </p>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>
                  Competencias anotadas
                </h3>

                {carrerasAtleta.length === 0 ? (
                  <p>No estás anotado en ninguna competencia.</p>
                ) : (
                  <ul style={{ marginTop: "10px", paddingLeft: "18px" }}>
                    {carrerasAtletaOrdenadas.map((carrera) => (
                      <li key={carrera.id}>
                        <strong>{carrera.nombre}</strong> - {formatearFecha(carrera.fecha)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={cardStyle}>
                <h3>Mis marcas personales</h3>

                <textarea
                  value={marcaPersonalAtleta}
                  onChange={(e) => setMarcaPersonalAtleta(e.target.value)}
                  placeholder={`Ejemplo:
1500m - 4:05
3000m - 8:45
5000m - 15:10
10K - 31:40
21K - 1:07:17`}
                  style={{
                    width: "100%",
                    minHeight: "140px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                  }}
                />

                <button
                  onClick={guardarMarcasAtleta}
                  disabled={guardandoMarca}
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#0a7a2f",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {guardandoMarca ? "Guardando..." : "Guardar marcas"}
                </button>
              </div>
            </div>

            {mensajeMarca && (
              <p
                style={{
                  color: "#0a7a2f",
                  marginTop: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                ✅ {mensajeMarca}
              </p>
            )}

            <div style={{ ...cardStyle, marginTop: "25px" }}>
              <h2>Mi semana de entrenamiento</h2>

              {planAtleta ? (
                <>
                  <p><strong>Semana del:</strong> {formatearFecha(planAtleta.fechaSemana)}</p>

                  <div
                    style={{
                      marginTop: "10px",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.9",
                      backgroundColor: "#f8f8f8",
                      padding: "16px",
                      borderRadius: "10px",
                    }}
                  >
                    {planAtleta.contenido || "-"}
                  </div>
                </>
              ) : (
                <p>No hay plan semanal cargado para este atleta.</p>
              )}
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                  localStorage.removeItem("rolAppClub");
                    localStorage.removeItem("vistaActual");
                      localStorage.removeItem("nombreUsuarioAppClub");
                        setNombreUsuario("");
                          setVista("inicio");
                        }}

              style={{
                marginTop: "25px",
                padding: "14px 24px",
                backgroundColor: "#0a7a2f",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </main>
  );
}