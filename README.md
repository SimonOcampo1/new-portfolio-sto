# Portafolio de Simon Ocampo

Sitio web personal para mostrar proyectos, publicaciones y habilidades con contenido bilingue, CRUD administrativo y galerias multimedia.

## Proposito

Este repositorio alimenta un portafolio profesional pensado para presentar el trabajo de forma clara y permitir actualizaciones rapidas sin necesidad de redeploys. Incluye contenido bilingue (EN/ES), galerias con imagenes y videos, y un flujo de administracion exclusivo.

## Funcionalidades

- Contenido bilingue (Ingles / Espanol) para proyectos y UI
- Proyectos con descripcion completa, stack tecnologico y carrusel multimedia
- Visor fullscreen del carrusel con navegacion
- CRUD admin para proyectos, publicaciones y habilidades
- Subida de imagenes y videos a Supabase Storage
- Filtrado automatico de media segun `-en` / `-es`
- Diseño responsive optimizado para desktop y mobile

## Stack Tecnologico

- Next.js 16 (App Router, React 19)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Storage)
- Framer Motion

## Desarrollo Local

1. Instalar dependencias:

```bash
npm install
```

2. Configurar `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://qwvebfqkokjufvdnaybw.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<tu-anon-key>"
SUPABASE_STORAGE_BUCKET="portfolio-media"
```

3. Levantar el servidor:

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Configuracion Supabase

Ejecutar en Supabase SQL editor:

- `supabase/schema.sql`
- `supabase/rls.sql`
- `supabase/storage.sql`

Habilitar Google OAuth en Supabase Auth y agregar los redirect URLs:

```
http://localhost:3000/auth/callback
https://<tu-dominio-vercel>/auth/callback
```

Agregar tambien el callback en Google Cloud OAuth:

```
https://qwvebfqkokjufvdnaybw.supabase.co/auth/v1/callback
```

## Deploy (Vercel)

Variables requeridas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_STORAGE_BUCKET`

Si se usa el formulario de contacto:

- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `CONTACT_FROM`
- `CONTACT_HONEYPOT_MESSAGE`

## Acceso Admin

Solo la cuenta de Google `ocamposimon1@gmail.com` puede iniciar sesion y administrar contenido. Esto se valida en API routes y en politicas RLS.

## Filtrado de Media por Idioma

Si un asset termina con `-en` o `-es` (antes de la extension), solo se muestra en ese idioma. Si no tiene sufijo, se muestra en ambos.

Ejemplos:

- `project-banner-en.png` → Ingles
- `project-banner-es.png` → Espanol
- `project-banner.png` → ambos

## Licencia

Todos los derechos reservados.
