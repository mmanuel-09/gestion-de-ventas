# Punto de Venta

**Demo web de un sistema de punto de venta para pequeños comercios.**

LOGU es una aplicación de demostración que reproduce la interfaz y las principales operaciones de un sistema de punto de venta, con una experiencia visual adaptada a navegadores web.

## Características

- **Ventas y cobros:** catálogo de productos, carrito, selección de medios de pago y cálculo de vuelto.
- **Productos y stock:** creación, edición, eliminación, búsqueda y actualización de existencias.
- **Caja diaria:** apertura, ingresos, retiros, cierre y arqueo de efectivo.
- **Historial y reportes:** consulta de ventas, indicadores, filtros por fechas y productos más vendidos.
- **Comprobantes:** generación de tickets de demostración mediante la impresión del navegador.
- **Configuración:** información sobre las funciones de copias de seguridad disponibles en la aplicación de escritorio.

## Tecnologías

- React
- JavaScript
- Vite
- CSS
- ESLint

## Instalación y ejecución

Clonar el repositorio:

```bash
git clone https://github.com/mmanuel-09/punto-venta-web.git
cd punto-venta-web
```

Instalar dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Comandos disponibles

```bash
npm run dev
npm run lint
npm run build
```

## Alcance de la demostración

Esta versión web funciona exclusivamente en el navegador y utiliza datos de prueba en memoria.

- Las ventas, productos, existencias y movimientos de caja no se guardan permanentemente.
- Al recargar la página, los datos de demostración vuelven a su estado inicial.
- No utiliza una base de datos ni un servidor backend.
- Las copias de seguridad y su restauración requieren la aplicación de escritorio.
- Los tickets generados son demostrativos y no tienen validez fiscal.



---

