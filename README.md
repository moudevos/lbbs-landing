# LBBS Landing v2

Aplicacion Next.js independiente para el landing publico y el flujo de reservas de La Bajadita Barber Studio.

Incluye:

- Landing publico `/`.
- Reserva publica `/reservar`.
- Agenda publica `/agenda`.
- Consulta de asistencias y envio de resenas del cliente.
- Rutas `api/public` necesarias para el landing y las reservas.
- Integracion con Supabase, Google Analytics, Vercel Analytics y Speed Insights.

No incluye dashboard interno, caja, atenciones operativas, dispositivos, rewards, liquidaciones, cron ni hotspot.

## Arranque

1. Copia `.env.example` como `.env.local`.
2. Completa las credenciales de Supabase de forma local. `SUPABASE_SERVICE_ROLE_KEY` solo se usa en rutas de servidor y no debe publicarse.
3. Instala dependencias con `npm ci`.
4. Ejecuta `npm run dev`.

La aplicacion usa las tablas y Storage existentes del proyecto Supabase principal; no contiene ni ejecuta migraciones.
