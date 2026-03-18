import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

const ADMINS = [
  "germanvega@cach.arg",
  "tomasvega@cach.arg",
  "emirsosa@cach.arg",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
  adminEmail,
  dni,
  nombre,
  email,
  password,
  grupo,
  fechaNacimiento,
  edad,
  domicilio,
} = body;

    if (!ADMINS.includes(String(adminEmail).toLowerCase().trim())) {
      return NextResponse.json(
        { error: "No autorizado para crear usuarios." },
        { status: 403 }
      );
    }

    if (!dni || !nombre || !email || !password || !grupo || !fechaNacimiento || !edad || !domicilio) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const emailLimpio = String(email).toLowerCase().trim();
    const nombreLimpio = String(nombre).trim();
    const grupoLimpio = String(grupo).trim();

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: emailLimpio,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          nombre: nombreLimpio,
          grupo: grupoLimpio,
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const authUserId = authData.user.id;

    const { error: usuariosError } = await supabaseAdmin.from("usuarios").insert({
  auth_id: authUserId,
  dni: Number(dni),
  nombre: nombreLimpio,
  email: emailLimpio,
  contrasena: String(password),
  grupo: grupoLimpio,
  rol: "atleta",
});

    if (usuariosError) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        { error: usuariosError.message },
        { status: 400 }
      );
    }

    const { error: alumnosError } = await supabaseAdmin.from("alumnos").insert({
  auth_id: authUserId,
  dni: Number(dni),
  nombre: nombreLimpio,
  grupo: grupoLimpio,
  fecha_nacimiento: fechaNacimiento || null,
  domicilio: domicilio ? String(domicilio).trim() : "",
  edad: edad ? String(edad).trim() : "",
});

    if (alumnosError) {
      await supabaseAdmin.from("usuarios").delete().eq("auth_id", authUserId);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);

      return NextResponse.json(
        { error: alumnosError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Usuario creado correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error inesperado al crear usuario." },
      { status: 500 }
    );
  }
}