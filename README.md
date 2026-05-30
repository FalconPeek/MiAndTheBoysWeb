# Pick'Em Mundial LosguRise 🏆

Bienvenido a la plataforma definitiva para el Mundial 2026, diseñada exclusivamente para la banda de **LosguRise**. 

Esta aplicación combina predicciones del mundial, un sistema de economía interna, votaciones tipo FIFA para los miembros, y un tribunal de justicia para mantener el orden (o el caos).

## 🚀 Características Principales

1.  **Pick'Em Mundial**: Predice los resultados de los partidos y subí en el ranking global.
2.  **Sistema de Cartas FIFA**: Votá los atributos de tus amigos (Pace, Shot, Dribbling, etc.) y generá cartas dinámicas.
3.  **GuriBets (Casino)**: Apostá GuriCoins en eventos deportivos o sociales de la vida real.
4.  **GuriShop**: Gastá tus ganancias en items exclusivos o pedí un "Rescate" si te quedaste en cero.
5.  **Tribunal de Faltas**: Denunciá a ese amigo que siempre llega tarde y hacé que el grupo vote su culpabilidad.
6.  **Salón de la Fama**: Los líderes en cada categoría quedan inmortalizados para la posteridad.

## 🛠️ Tecnologías

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS
- **Iconos**: Lucide React
- **Lenguaje**: TypeScript

## 📦 Instalación y Setup Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/vuestro-usuario/PickEmMundialLosguRise.git
    cd PickEmMundialLosguRise
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` en la raíz con tus credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
    ```

4.  **Preparar la Base de Datos**:
    Ejecuta los archivos SQL en la carpeta `supabase/migrations/` en el SQL Editor de tu proyecto de Supabase (en orden cronológico).

5.  **Correr en modo desarrollo**:
    ```bash
    npm run dev
    ```

## 🌐 Despliegue en Vercel

1.  Sube tu código a un repositorio de GitHub.
2.  Conecta tu cuenta de GitHub en [Vercel](https://vercel.com/).
3.  Importa el proyecto y configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4.  ¡Listo! Vercel se encargará del build y el despliegue automático.

## ⚖️ Reglas del Tribunal

- Cualquier miembro puede denunciar a otro.
- Las denuncias tienen una validez de **24 horas**.
- Si la mayoría vota "Culpable", el sistema debita automáticamente la multa al usuario.
- Los fondos de las multas se acumulan en el **Pozo Grupal**.

---
*Desarrollado con ❤️ para LosguRise.*
