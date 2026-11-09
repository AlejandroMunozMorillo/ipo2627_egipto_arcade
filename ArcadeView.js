export class ArcadeView {
    constructor() {
        this.canvas = document.getElementById("canvas-juego");
        this.ctx = this.canvas.getContext("2d");

        this.dificultad = document.getElementById("dificultad");
        this.botonIniciar = document.getElementById("boton-iniciar");
        this.botonPausa = document.getElementById("boton-pausa");
        this.botonFinalizar = document.getElementById("boton-finalizar");
        this.puntuacion = document.getElementById("puntuacion");
        this.vidas = document.getElementById("vidas");
        this.estado = document.getElementById("estado");
        this.botonAyuda = document.getElementById("boton-ayuda");
        this.panelAyuda = document.getElementById("panel-ayuda");

        this.estrellas = this.crearEstrellas(75);
    }

    obtenerDificultad() {
        return this.dificultad.value;
    }

    crearEstrellas(cantidad) {
        const estrellas = [];
        for (let i = 0; i < cantidad; i++) {
            estrellas.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radio: Math.random() * 1.5 + 0.4
            });
        }
        return estrellas;
    }

    actualizar(estado) {
        this.renderizar(estado);
        this.actualizarInformacion(estado);
        this.actualizarControles(estado);
    }

    renderizar(estado) {
        this.limpiarCanvas();
        this.dibujarFondo();

        estado.enemigos.forEach((enemigo) => this.dibujarEnemigo(enemigo));
        estado.balas.forEach((bala) => this.dibujarBala(bala));
        this.dibujarJugador(estado.jugador);

        if (estado.estado === "idle") {
            this.dibujarMensajeCentral("ARCADE ESPACIAL", "Pulsa comenzar para jugar");
        }
        if (estado.estado === "paused") {
            this.dibujarMensajeCentral("PAUSA", "Pulsa continuar para seguir");
        }
        if (estado.estado === "ended") {
            this.dibujarMensajeCentral("FIN DE LA PARTIDA", `Puntuación: ${estado.puntuacion}`);
        }
    }

    limpiarCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    dibujarFondo() {
        this.ctx.fillStyle = "hsl(228, 52%, 5%)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "hsl(210, 30%, 88%)";
        this.ctx.beginPath();
        this.estrellas.forEach((estrella) => {
            this.ctx.moveTo(estrella.x + estrella.radio, estrella.y);
            this.ctx.arc(estrella.x, estrella.y, estrella.radio, 0, Math.PI * 2);
        });
        this.ctx.fill();
    }

    dibujarJugador(jugador) {
        const centroX = jugador.x + jugador.ancho / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centroX, jugador.y);
        this.ctx.lineTo(jugador.x + jugador.ancho, jugador.y + jugador.alto);
        this.ctx.lineTo(centroX, jugador.y + jugador.alto * 0.75);
        this.ctx.lineTo(jugador.x, jugador.y + jugador.alto);
        this.ctx.closePath();

        this.ctx.fillStyle = "hsl(190, 80%, 55%)";
        this.ctx.fill();
        this.ctx.strokeStyle = "hsl(190, 90%, 80%)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = "hsl(45, 100%, 60%)";
        this.ctx.fillRect(centroX - 5, jugador.y + jugador.alto, 10, 10);
    }

    dibujarBala(bala) {
        this.ctx.fillStyle = "hsl(55, 100%, 60%)";
        this.ctx.fillRect(bala.x, bala.y, bala.ancho, bala.alto);
    }

    dibujarEnemigo(enemigo) {
        const colores = ["hsl(350, 75%, 55%)", "hsl(285, 65%, 58%)", "hsl(25, 90%, 55%)"];
        this.ctx.fillStyle = colores[enemigo.tipo];

        if (enemigo.tipo === 0) {
            this.ctx.beginPath();
            this.ctx.arc(enemigo.x + enemigo.ancho / 2, enemigo.y + enemigo.alto / 2, enemigo.ancho / 2, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        }
        if (enemigo.tipo === 1) {
            this.ctx.fillRect(enemigo.x, enemigo.y, enemigo.ancho, enemigo.alto);
            return;
        }

        const centroX = enemigo.x + enemigo.ancho / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centroX, enemigo.y);
        this.ctx.lineTo(enemigo.x + enemigo.ancho, enemigo.y + enemigo.alto);
        this.ctx.lineTo(enemigo.x, enemigo.y + enemigo.alto);
        this.ctx.closePath();
        this.ctx.fill();
    }

    dibujarMensajeCentral(titulo, texto) {
        this.ctx.fillStyle = "hsla(228, 55%, 3%, 0.76)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "hsl(190, 80%, 65%)";
        this.ctx.font = "bold 40px Arial";
        this.ctx.fillText(titulo, this.canvas.width / 2, this.canvas.height / 2 - 15);

        this.ctx.fillStyle = "hsl(210, 20%, 90%)";
        this.ctx.font = "19px Arial";
        this.ctx.fillText(texto, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    obtenerMensajeEstado(estado) {
        if (estado.estado === "idle") return "Pulsa comenzar para jugar";
        if (estado.estado === "running") return "Partida en curso";
        if (estado.estado === "paused") return "Partida pausada";
        if (estado.estado === "ended" && estado.motivoFin === "sinVidas") return "Fin de la partida: te has quedado sin vidas";
        if (estado.estado === "ended" && estado.motivoFin === "manual") return "Partida finalizada por el jugador";
        return "";
    }

    actualizarInformacion(estado) {
        this.puntuacion.textContent = estado.puntuacion;
        this.vidas.textContent = estado.vidas;
        this.estado.textContent = this.obtenerMensajeEstado(estado);
    }

    actualizarControles(estado) {
        const jugando = estado.estado === "running";
        const pausado = estado.estado === "paused";

        this.botonPausa.disabled = !jugando && !pausado;
        this.botonFinalizar.disabled = !jugando && !pausado;
        this.botonPausa.textContent = pausado ? "Continuar" : "Pausar";
        this.dificultad.disabled = jugando || pausado;
        this.botonIniciar.textContent = estado.estado === "idle" ? "Comenzar partida" : "Nueva partida";
    }

    enlazarInicio(manejador) { this.botonIniciar.addEventListener("click", manejador); }
    enlazarPausa(manejador) { this.botonPausa.addEventListener("click", manejador); }
    enlazarFinalizar(manejador) { this.botonFinalizar.addEventListener("click", manejador); }

    enlazarTeclado(manejador) {
        const teclasJuego = ["ArrowLeft", "ArrowRight", "KeyA", "KeyD", "Space"];

        document.addEventListener("keydown", (evento) => {
            if (teclasJuego.includes(evento.code)) evento.preventDefault();
            manejador(evento.code, true);
        });

        document.addEventListener("keyup", (evento) => {
            if (teclasJuego.includes(evento.code)) evento.preventDefault();
            manejador(evento.code, false);
        });
    }

    enlazarAyuda() {
        this.botonAyuda.addEventListener("click", () => this.alternarAyuda());
        
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && !this.panelAyuda.hidden) {
                this.cerrarAyuda();
            }
        });

        document.addEventListener("click", (evento) => {
            const ayuda = this.botonAyuda.closest(".ayuda");
            if (!this.panelAyuda.hidden && !ayuda.contains(evento.target)) {
                this.cerrarAyuda();
            }
        });
    }

    alternarAyuda() {
        const abierto = !this.panelAyuda.hidden;
        this.panelAyuda.hidden = abierto;
        this.botonAyuda.setAttribute("aria-expanded", String(!abierto));
    }

    cerrarAyuda() {
        this.panelAyuda.hidden = true;
        this.botonAyuda.setAttribute("aria-expanded", "false");
    }
}