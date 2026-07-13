@import "tailwindcss";
@import "leaflet/dist/leaflet.css";

@theme {
  --color-primary: oklch(0.28 0.08 250);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-accent: oklch(0.65 0.19 55);
  --color-accent-foreground: oklch(0.15 0 0);
  --color-secondary: oklch(0.96 0.005 250);
  --color-secondary-foreground: oklch(0.28 0.08 250);
  --color-destructive: oklch(0.58 0.22 25);
  --color-destructive-foreground: oklch(0.98 0 0);
  --color-success: oklch(0.60 0.17 150);
  --color-success-foreground: oklch(0.98 0 0);
  --color-muted: oklch(0.96 0.005 250);
  --color-muted-foreground: oklch(0.50 0.02 250);
  --color-background: oklch(0.98 0.002 250);
  --color-foreground: oklch(0.15 0.05 250);
  --color-surface: oklch(1 0 0);
  --color-border: oklch(0.90 0.005 250);
  --color-ring: oklch(0.28 0.08 250);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0.05 250);
  --color-input: oklch(0.90 0.005 250);

  --font-sans: "Inter", system-ui, sans-serif;

  --radius: 0.625rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.875rem;
}

@layer base {
  * {
    box-sizing: border-box;
    /* Sin el recuadro azul/gris translúcido al tocar (el "tell" más obvio de web). */
    -webkit-tap-highlight-color: transparent;
  }

  /* Red de seguridad móvil: evita que cualquier elemento que se salga del ancho
     de la pantalla haga que el navegador encoja toda la página (el efecto
     "modo escritorio diminuto"). `clip` no crea contenedor de scroll, así que
     NO rompe el `position: sticky` del navbar. No afecta el diseño de escritorio. */
  html,
  body {
    min-height: 100%;
    max-width: 100%;
    overflow-x: clip;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    overscroll-behavior: none;
    touch-action: pan-x pan-y;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    overscroll-behavior-y: none;
    padding-bottom: env(safe-area-inset-bottom);
    min-height: 100dvh;
  }

  @media (max-width: 767px) {
    .admin-mobile-shell {
      font-family: var(--font-admin-mobile), system-ui, sans-serif;
      -webkit-touch-callout: none;
    }

    .admin-mobile-shell main > div {
      padding-bottom: calc(6rem + env(safe-area-inset-bottom));
    }

    /* --- Sensación de app nativa --------------------------------------- */

    /* Controles y "chrome" no se seleccionan ni muestran menú de long-press.
       El texto de contenido (párrafos, celdas, etc.) SÍ se puede seleccionar
       para poder copiar datos como teléfonos o IDs. */
    .admin-mobile-shell a,
    .admin-mobile-shell button,
    .admin-mobile-shell [role="button"],
    .admin-mobile-shell nav,
    .admin-mobile-shell header,
    .admin-mobile-shell h1,
    .admin-mobile-shell h2,
    .admin-mobile-shell label,
    .admin-mobile-shell img,
    .admin-mobile-shell svg {
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      -webkit-user-drag: none;
    }

    /* Feedback táctil: el control se hunde un poco y se atenúa al presionar. */
    .admin-mobile-shell a,
    .admin-mobile-shell button,
    .admin-mobile-shell [role="button"] {
      transition: transform 0.12s ease, opacity 0.12s ease;
    }

    .admin-mobile-shell a:active,
    .admin-mobile-shell button:active,
    .admin-mobile-shell [role="button"]:active {
      transform: scale(0.97);
      opacity: 0.85;
    }

    /* La barra de pestañas no se encoge al tocar; solo atenúa (como iOS/Android). */
    .admin-mobile-shell nav a:active {
      transform: none;
      opacity: 0.55;
    }

    /* Los inputs siempre se pueden seleccionar y pegar. */
    .admin-mobile-shell input,
    .admin-mobile-shell textarea,
    .admin-mobile-shell [contenteditable] {
      -webkit-user-select: text;
      user-select: text;
      -webkit-touch-callout: default;
    }

    /* Scroll con inercia y sin barra visible, como una app. */
    .admin-mobile-shell main {
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .admin-mobile-shell main::-webkit-scrollbar {
      display: none;
    }
  }
}
