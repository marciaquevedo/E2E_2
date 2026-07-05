# RUMBO — Frontend (CS2031 Week 14 E2E)

Frontend en React + TypeScript + Vite que consume el backend "Uber Clone" (Spring Boot).
Cubre las 7 pantallas y los 12 endpoints del rubric (20 pts).

## Cómo correrlo

1. Backend primero (en otra terminal, desde la carpeta del backend):
   ```bash
   ./mvnw spring-boot:run
   ```
   Debe quedar corriendo en `http://localhost:8080`.

2. Este frontend:
   ```bash
   npm install
   npm run dev
   ```
   Se abre en `http://localhost:5173`.

El archivo `.env` ya apunta a `VITE_API_URL=http://localhost:8080`. Si tu backend corre en otro puerto, cámbialo ahí.

## Usuarios de prueba (seed data del backend)

| Email | Password | Rol |
|---|---|---|
| carlos@uber.com | pass123 | DRIVER (disponible) |
| lucia@uber.com | pass123 | DRIVER (ocupada, viaje activo) |
| pedro@uber.com | pass123 | DRIVER (disponible) |
| ana@uber.com | pass123 | PASSENGER |
| mario@uber.com | pass123 | PASSENGER |
| sofia@uber.com | pass123 | PASSENGER |

## Estructura

```
src/
├── api/          # cliente axios (interceptor JWT + manejo de 401) y tipos TS
├── auth/          # AuthContext (login/register/logout/me) y ProtectedRoute
├── components/    # Layout, StatusBadge, RouteLine, RatingStars, TripCard, ui.module.css
└── pages/
    ├── LoginPage.tsx           # Pantalla 1: login/registro con selector de rol
    ├── PassengerDashboard.tsx  # Pantalla 2
    ├── RequestTripPage.tsx     # Pantalla 3: conductores disponibles + formulario
    ├── TripDetailPage.tsx      # Pantallas 4 y 6: detalle (pasajero y conductor), polling, rating, completar
    ├── DriverDashboard.tsx     # Pantalla 5
    └── HistoryPage.tsx         # Pantalla 7: historial con filtro de estado
```

`TripDetailPage` sirve tanto para pasajero como conductor: detecta el rol desde `useAuth()`
y muestra el botón de "Aceptar/Completar" o el formulario de calificación según corresponda.

## Notas de implementación

- El JWT se guarda en `localStorage` y se agrega automáticamente a cada request vía interceptor de Axios.
- Un 401 limpia el token y redirige a `/login`.
- `TripDetailPage` hace polling a `GET /trips/{id}` cada 4s mientras el estado sea `PENDING` o `IN_PROGRESS`.
- Los campos opcionales (`driver`, `acceptedAt`, `completedAt`, `passengerRating`) se manejan con `?.` y checks explícitos de `null`.
- Los errores del backend (`{ "error": "..." }` o `{ "campo": "..." }`) se parsean en `extractErrorMessage` (`src/api/client.ts`).
