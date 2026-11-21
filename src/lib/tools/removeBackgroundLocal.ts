import type { Config } from "@imgly/background-removal";

/**
 * Quitar fondo con el modelo y el runtime alojados en el propio dominio
 * (public/imgly/, generado con `npm run models:tools`).
 *
 * @imgly/background-removal baja el modelo de un CDN (la CSP del sitio no lo permite) y,
 * ademas, convierte los archivos de onnxruntime en blob: URLs para cargarlos como <script>
 * y con fetch, lo que exigiria agregar blob: a script-src y a connect-src de TODO el sitio.
 *
 * Para no relajar la CSP: publicPath apunta al modelo local y se fija wasmPaths de
 * onnxruntime-web a archivos del mismo origen. La libreria reasigna wasmPaths con blob: URLs
 * en cada sesion, asi que se deja la propiedad con setter que ignora esa reasignacion.
 * (resources.json trae para esos dos archivos un stub de 1 byte, para que no baje 12 MB
 * que no va a usar.) Depende de onnxruntime-web 1.21.0, fijado en package.json.
 */
export async function removeBackgroundLocal(
  image: Blob,
  options: Pick<Config, "progress" | "output"> = {}
): Promise<Blob> {
  const origin = window.location.origin;
  const ort = (await import("onnxruntime-web")).default;
  const paths = {
    mjs: `${origin}/imgly/ort/ort-wasm-simd-threaded.mjs`,
    wasm: `${origin}/imgly/ort/ort-wasm-simd-threaded.wasm`,
  };
  Object.defineProperty(ort.env.wasm, "wasmPaths", {
    configurable: true,
    enumerable: true,
    get: () => paths,
    set: () => {
      /* ignorado a proposito: ver comentario de la funcion */
    },
  });

  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(image, {
    model: "isnet_quint8",
    publicPath: `${origin}/imgly/`,
    ...options,
  });
}
