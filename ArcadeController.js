export class ArcadeController {
    constructor(modelo, vista) {
        this.modelo = modelo;
        this.vista = vista;
        this.teclas = { izquierda: false, derecha: false, disparo: false };
        this.animacion = null;
        this.ultimoTiempo = null;
    }

    iniciar() {
        this.vista.enlazarInicio(() => this.comenzarPartida());
        this.vista.enlazarPausa(() => this.alternarPausa());
        this.vista.enlazarFinalizar(() => this.finalizarPartida());
        this.vista.enlazarTeclado((codigo, pulsada) => this.gestionarTecla(codigo, pulsada));
        this.vista.enlazarAyuda();
        this.vista.actualizar(this.modelo.obtenerEstado());
    }

    comenzarPartida() {
        this.detenerAnimacion();
        this.limpiarTeclas();
        this.modelo.comenzar(this.vista.obtenerDificultad());
        this.ultimoTiempo = null;
        this.vista.actualizar(this.modelo.obtenerEstado());
        this.iniciarAnimacion();
    }

    iniciarAnimacion() {
        if (this.animacion !== null) return;
        this.animacion = requestAnimationFrame((tiempo) => this.bucle(tiempo));
    }

    detenerAnimacion() {
        if (this.animacion === null) return;
        cancelAnimationFrame(this.animacion);
        this.animacion = null;
    }

    bucle(tiempoActual) {
        this.animacion = null;

        if (this.ultimoTiempo === null) {
            this.ultimoTiempo = tiempoActual;
        }

        let delta = (tiempoActual - this.ultimoTiempo) / 1000;
        this.ultimoTiempo = tiempoActual;
        delta = Math.min(delta, 0.033);

        const entrada = {
            izquierda: this.teclas.izquierda,
            derecha: this.teclas.derecha,
            disparo: this.teclas.disparo
        };

        this.modelo.actualizar(delta, entrada);
        const estado = this.modelo.obtenerEstado();
        this.vista.actualizar(estado);

        if (estado.estado !== "running") return;

        this.iniciarAnimacion();
    }

    alternarPausa() {
        if (this.modelo.estado === "running") {
            this.modelo.pausar();
            this.limpiarTeclas();
            this.detenerAnimacion();
        } else if (this.modelo.estado === "paused") {
            this.modelo.continuar();
            this.ultimoTiempo = null;
            this.iniciarAnimacion();
        }

        this.vista.actualizar(this.modelo.obtenerEstado());
    }

    finalizarPartida() {
        this.modelo.finalizar("manual");
        this.limpiarTeclas();
        this.detenerAnimacion();
        this.vista.actualizar(this.modelo.obtenerEstado());
    }

    gestionarTecla(codigo, pulsada) {
        if (codigo === "ArrowLeft" || codigo === "KeyA") this.teclas.izquierda = pulsada;
        if (codigo === "ArrowRight" || codigo === "KeyD") this.teclas.derecha = pulsada;
        if (codigo === "Space") this.teclas.disparo = pulsada;
    }

    limpiarTeclas() {
        this.teclas.izquierda = false;
        this.teclas.derecha = false;
        this.teclas.disparo = false;
    }
}