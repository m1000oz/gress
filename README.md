# 🍓 Study Nook — para Grecia

Una web de una sola página para que mi hermana estudie mejor mientras postula a la universidad:
pomodoro, frases de motivación, gatitos en los breaks y **premios canjeables en la vida real**.

Al presionar *empezar*, la pantalla se convierte en **solo el timer** y esconde todo lo demás.

---

## Cómo está armado

| Pieza | Para qué |
|---|---|
| `index.html` · `styles.css` · `app.js` | La web. Vanilla, sin frameworks, sin build. |
| `api/state.js` | Guarda y lee sus datos. Habla con Supabase desde el servidor. |
| `api/keepalive.js` | Un ping diario para que Supabase no pause el proyecto. |
| `supabase-setup.sql` | Crea la tabla. Se pega una vez y se olvida. |
| `dev-server.js` | Solo para probar en tu PC. No se despliega. |

**Los datos viven en Supabase, no en el navegador.** Grecia puede limpiar la caché, cambiar de Safari a
Chrome o entrar desde el iPhone: sus tareas, su racha y sus premios siguen ahí.

---

## Desplegarlo (una sola vez, ~15 minutos)

### 1 · Crear la base en Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor**, pega todo `supabase-setup.sql` y dale *Run*.
3. La última línea te devuelve un UUID. **Cópialo**: es tu `STATE_ROW_ID`.

### 2 · Conseguir la llave correcta ⚠️

Ve a **Project Settings → API Keys** y copia la llave **`service_role`** (o la que empieza con
`sb_secret_` en los proyectos nuevos).

> **No confundir con la llave `anon`.** Es el error fácil de cometer: se parecen y están una al lado de
> la otra. La `anon` no sirve acá — el `supabase-setup.sql` deja Row Level Security activo sin políticas
> justamente para que la llave pública no pueda tocar la tabla. Si pegas la `anon`, la API responde
> `permission denied for table study_state`.
>
> La `service_role` salta RLS por diseño, y por eso **solo puede vivir en el servidor**. Nunca la pongas
> en `app.js` ni en ningún archivo que llegue al navegador.

### 3 · Probarlo en tu PC (opcional pero recomendado)

Necesitas Node 18+ solo en **tu** máquina, no en la de ella.

```bash
# rellena los cuatro valores en .env.local, y:
node dev-server.js
# -> http://localhost:3000
```

Si la consola dice `✓ Credenciales de Supabase cargadas` y la web **no** muestra el cartelito
`✿ modo local`, está guardando en Supabase de verdad.

### 4 · Subirlo a Vercel

```bash
npm i -g vercel
vercel          # sigue las preguntas
vercel --prod
```

Después, en **Project Settings → Environment Variables**, carga las mismas cuatro:

| Variable | De dónde sale |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → Data API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → `service_role` |
| `STATE_ROW_ID` | El UUID del paso 1 |
| `CRON_SECRET` | Invéntate una cadena larga y aleatoria |

Y vuelve a desplegar (`vercel --prod`) para que las tome.

### 5 · Pasarle el link a Grecia

Mándale la URL y dile que la **agregue al Dock** (Safari → Archivo → *Añadir al Dock*) o a la pantalla
de inicio en el iPhone (Compartir → *Añadir a pantalla de inicio*).

No es solo por comodidad: Safari borra el almacenamiento de un sitio tras 7 días sin visitarlo, y las
web apps instaladas están exentas. Sus datos ya están a salvo en Supabase, pero así el modo sin conexión
también aguanta.

---

## Lo que hay que saber para que no se caiga

**Supabase pausa los proyectos gratis tras 7 días de inactividad.** Es justo el escenario que queremos
evitar: si Grecia se toma una semana libre, el proyecto se dormiría. Por eso `vercel.json` incluye un cron
diario que llama a `/api/keepalive`. **No lo borres.** El plan Hobby de Vercel permite exactamente una
ejecución al día, que es lo que necesitamos.

Si aun así el proyecto se pausa alguna vez, se despierta con un clic desde el dashboard de Supabase.

---

## Personalizarlo

Todo lo editable está arriba de `app.js`, en el bloque `CONFIG`. No hace falta tocar nada más.

**Premios** — cambia montos, emojis o textos:

```js
REWARDS: [
  { threshold: 6,  emoji: '🧋', label: 'Un bubble tea de tu sabor', code: 'BBT' },
  { threshold: 15, emoji: '👗', label: 'Carrito de Shein',          code: 'SHN' },
  ...
]
```

`threshold` son pomodoros **acumulados en total**, no por día. `code` son las 3 letras del vale
(`VALE-BBT-7F3K`).

**Frases** — agrega las tuyas al array `QUOTES`. `{name}` se reemplaza por su nombre.

**Minutos** — `DEFAULT_DURATIONS` es solo el valor inicial; ella los cambia desde el ⚙ sin tocar código.

**Su nombre y su meta** — vienen con "Grecia" y un texto genérico. Se editan desde el ⚙.

---

## Detalles que quizá no se notan

- **El timer va anclado a un timestamp**, no a contar ticks. Si minimiza la ventana o bloquea el teléfono
  media hora, al volver el tiempo restante es el correcto.
- **El título de la pestaña es el reloj** (`24:31 🍓 foco`), así sirve aunque esté en otra pestaña.
- **Los gatitos van en cascada**: TheCatAPI → cataas → gatitas pixel art dibujadas a mano. Sin internet
  la web sigue siendo linda. El siguiente gif se precarga durante la sesión de foco, así el break nunca
  muestra un spinner.
- **Saltar un pomodoro no lo cuenta.** Solo terminarlo suma a los premios.
- **Si el servidor no responde**, la app sigue funcionando con una copia en el navegador y muestra
  `✿ modo local`. Cuando vuelve la conexión, sube los cambios.
- **Todo el pixel art está dibujado a mano** en `SPRITES`, como texto. Cada letra es un color. Si quieres
  cambiarle la cara a la gatita, edita los caracteres.

---

hecho con ♡
