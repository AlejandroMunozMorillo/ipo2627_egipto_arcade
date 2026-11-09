export class ArcadeModel {
    constructor(ancho = 760, alto = 520) {
        this.ancho = ancho;
        this.alto = alto;

        this.dificultades = {
            facil: { velocidadEnemigo: 100, intervaloEnemigo: 1.3, vidas: 5 },
            normal: { velocidadEnemigo: 145, intervaloEnemigo: 0.9, vidas: 3 },
            dificil: { velocidadEnemigo: 180, intervaloEnemigo: 0.6, vidas: 2 }
        };

        this.estado = "idle";
        this.motivoFin = null;
        this.puntuacion = 0;
        this.vidas = 3;
        this.enemigos = [];
        this.balas = [];
        this.tiempoEnemigo = 0;
        this.tiempoDisparo = 0;
        this.jugador = this.crearJugador();
    }

    crearJugador() {
        const ancho = 50;
        const alto = 38;
        return {
            x: (this.ancho - ancho) / 2,
            y: this.alto - alto - 25,
            ancho,
            alto,
            velocidad: 330
        };
    }

    comenzar(dificultad = "normal") {
        this.dificultad = dificultad;
        this.configuracion = this.dificultades[dificultad] ?? this.dificultades.normal;

        this.estado = "running";
        this.motivoFin = null;
        this.puntuacion = 0;
        this.vidas = this.configuracion.vidas;
        this.enemigos = [];
        this.balas = [];
        this.tiempoEnemigo = 0;
        this.tiempoDisparo = 0;
        this.jugador = this.crearJugador();
    }

    actualizar(delta, entrada) {
        if (this.estado !== "running") return;

        this.actualizarJugador(delta, entrada);
        this.actualizarDisparo(delta, entrada);
        this.actualizarBalas(delta);
        this.actualizarEnemigos(delta);

        if (this.estado !== "running") return;

        this.generarEnemigos(delta);
        this.detectarColisiones();
    }

    actualizarJugador(delta, entrada) {
        let direccion = 0;
        if (entrada.izquierda) direccion -= 1;
        if (entrada.derecha) direccion += 1;

        this.jugador.x += direccion * this.jugador.velocidad * delta;
        const limite = this.ancho - this.jugador.ancho;

        if (this.jugador.x < 0) this.jugador.x = 0;
        if (this.jugador.x > limite) this.jugador.x = limite;
    }

    actualizarDisparo(delta, entrada) {
        this.tiempoDisparo -= delta;
        if (entrada.disparo && this.tiempoDisparo <= 0) {
            this.disparar();
            this.tiempoDisparo = 0.22;
        }
    }

    disparar() {
        const ancho = 6;
        const alto = 18;
        this.balas.push({
            x: this.jugador.x + this.jugador.ancho / 2 - ancho / 2,
            y: this.jugador.y - alto,
            ancho,
            alto,
            velocidad: 470
        });
    }

    actualizarBalas(delta) {
        this.balas.forEach((bala) => { bala.y -= bala.velocidad * delta; });
        this.balas = this.balas.filter((bala) => bala.y + bala.alto > 0);
    }

    generarEnemigos(delta) {
        this.tiempoEnemigo += delta;
        if (this.tiempoEnemigo < this.configuracion.intervaloEnemigo) return;

        this.tiempoEnemigo = 0;
        const ancho = 42;
        const alto = 34;
        const x = Math.random() * (this.ancho - ancho);

        this.enemigos.push({
            x,
            y: -alto,
            ancho,
            alto,
            velocidadY: this.configuracion.velocidadEnemigo * (0.85 + Math.random() * 0.3),
            velocidadX: (Math.random() - 0.5) * 90,
            tipo: Math.floor(Math.random() * 3)
        });
    }

    actualizarEnemigos(delta) {
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            const enemigo = this.enemigos[i];
            enemigo.x += enemigo.velocidadX * delta;
            enemigo.y += enemigo.velocidadY * delta;

            if (enemigo.x <= 0) {
                enemigo.x = 0;
                enemigo.velocidadX *= -1;
            }

            if (enemigo.x + enemigo.ancho >= this.ancho) {
                enemigo.x = this.ancho - enemigo.ancho;
                enemigo.velocidadX *= -1;
            }

            if (enemigo.y > this.alto) {
                this.enemigos.splice(i, 1);
                this.perderVida();
            }
        }
    }

    detectarColisiones() {
        this.detectarImpactosBalas();
        if (this.estado === "running") {
            this.detectarImpactosJugador();
        }
    }

    detectarImpactosBalas() {
        for (let i = this.balas.length - 1; i >= 0; i--) {
            for (let j = this.enemigos.length - 1; j >= 0; j--) {
                if (this.colision(this.balas[i], this.enemigos[j])) {
                    this.balas.splice(i, 1);
                    this.enemigos.splice(j, 1);
                    this.puntuacion += 100;
                    break;
                }
            }
        }
    }

    detectarImpactosJugador() {
        for (let i = this.enemigos.length - 1; i >= 0; i--) {
            if (this.colision(this.jugador, this.enemigos[i])) {
                this.enemigos.splice(i, 1);
                this.perderVida();
            }
        }
    }

    colision(a, b) {
        return (a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y);
    }

    perderVida() {
        if (this.estado !== "running") return;
        this.vidas--;

        if (this.vidas <= 0) {
            this.vidas = 0;
            this.finalizar("sinVidas");
        }
    }

    pausar() {
        if (this.estado !== "running") return;
        this.estado = "paused";
    }

    continuar() {
        if (this.estado !== "paused") return;
        this.estado = "running";
    }

    finalizar(motivo = "manual") {
        this.estado = "ended";
        this.motivoFin = motivo;
    }

    obtenerEstado() {
        return {
            estado: this.estado,
            motivoFin: this.motivoFin,
            puntuacion: this.puntuacion,
            vidas: this.vidas,
            jugador: { ...this.jugador },
            balas: this.balas.map((bala) => ({ ...bala })),
            enemigos: this.enemigos.map((enemigo) => ({ ...enemigo }))
        };
    }
}