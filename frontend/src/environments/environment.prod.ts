/**
 * Configuracion usada en produccion (ng build --configuration production).
 *
 * Cambia `api` por la URL que Render te asigna, por ejemplo:
 *   https://mi-cacharrito-backend.onrender.com
 *
 * Recuerda agregar tambien esa URL al backend en la propiedad
 * app.cors.origins (variable de entorno APP_CORS_ORIGINS en Render).
 */
export const environment = {
  production: true,
  api: 'https://mi-cacharrito-backend.onrender.com'
};
