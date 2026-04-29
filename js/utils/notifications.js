export const notificationManager = {
  /**
   * Solicita permiso al usuario para mostrar notificaciones.
   */
  requestPermission() {
    if (!("Notification" in window)) {
      console.warn("Este navegador no soporta notificaciones de escritorio.");
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  },

  /**
   * Muestra una notificación del sistema.
   */
  show(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: "favicon.ico", // Asegúrate de que la ruta al icono sea correcta
    });

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      notification.close();
    };
  },
};