const grid = document.getElementById("grid");
let tablero = [];
let esPrimerClick = true;
let juegoTerminado = false;

function generarTablero(filas, columnas, minas) {
    tablero = [];
    grid.innerHTML = '';
    const table = document.createElement("table");

    // Inicializar el tablero con celdas vacías
    for (let i = 0; i < filas; i++) {
        const row = document.createElement("tr");
        tablero.push([]);
        for (let j = 0; j < columnas; j++) {
            const cell = document.createElement("td");
            cell.addEventListener("click", () => manejarClick(i, j));
            cell.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                ponerBandera(i, j);
            });
            tablero[i].push({ cell, esMina: false, estaRevelada: false, tieneBandera: false, minasAlrededor: 0 });
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    grid.appendChild(table);
    colocarMinas(filas, columnas, minas);
}

function colocarMinas(filas, columnas, minas) {
    let minasColocadas = 0;

    // Colocar minas de manera aleatoria
    while (minasColocadas < minas) {
        const fila = Math.floor(Math.random() * filas);
        const columna = Math.floor(Math.random() * columnas);
        if (!tablero[fila][columna].esMina) {
            tablero[fila][columna].esMina = true;
            minasColocadas++;
        }
    }

    // Contador de minas alrededor de cada celda
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            if (!tablero[i][j].esMina) {
                tablero[i][j].minasAlrededor = contarMinasAlrededor(i, j);
            }
        }
    }
}

function contarMinasAlrededor(fila, columna) {
    let conteo = 0;
    const direcciones = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of direcciones) {
        const nuevaFila = fila + dx;
        const nuevaColumna = columna + dy;
        if (nuevaFila >= 0 && nuevaFila < tablero.length && nuevaColumna >= 0 && nuevaColumna < tablero[0].length && tablero[nuevaFila][nuevaColumna].esMina) {
            conteo++;
        }
    }
    return conteo;
}

function manejarClick(fila, columna) {
    if (juegoTerminado || tablero[fila][columna].estaRevelada || tablero[fila][columna].tieneBandera) return;

    if (esPrimerClick && tablero[fila][columna].esMina) {
        // Recolocar minas si se hace clic en una mina en el primer turno
        do {
            colocarMinas(tablero.length, tablero[0].length, contarMinasAlrededor(fila, columna));
        } while (tablero[fila][columna].esMina);
    }

    esPrimerClick = false;
    revelarCelda(fila, columna);
    verificarVictoria();
}

function revelarCelda(fila, columna) {
    if (tablero[fila][columna].estaRevelada || tablero[fila][columna].tieneBandera) return;

    tablero[fila][columna].estaRevelada = true;
    tablero[fila][columna].cell.classList.add("revealed");

    if (tablero[fila][columna].esMina) {
        tablero[fila][columna].cell.classList.add("mine");
        tablero[fila][columna].cell.textContent = "💣";

        alert("¡Boom! Has perdido.");
        juegoTerminado = true;
    } else if (tablero[fila][columna].minasAlrededor > 0) {
        tablero[fila][columna].cell.textContent = tablero[fila][columna].minasAlrededor;
    } else {
        // Si no hay minas alrededor, revelar celdas adyacentes
        const direcciones = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],         [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        for (let [dx, dy] of direcciones) {
            const nuevaFila = fila + dx;
            const nuevaColumna = columna + dy;
            if (nuevaFila >= 0 && nuevaFila < tablero.length && nuevaColumna >= 0 && nuevaColumna < tablero[0].length) {
                revelarCelda(nuevaFila, nuevaColumna);
            }
        }
    }
}

function ponerBandera(fila, columna) {
    if (tablero[fila][columna].estaRevelada) return;

    tablero[fila][columna].tieneBandera = !tablero[fila][columna].tieneBandera;
    if (tablero[fila][columna].tieneBandera) {
        tablero[fila][columna].cell.classList.add("flag");
        tablero[fila][columna].cell.textContent = "🚩";
    } else {
        tablero[fila][columna].cell.classList.remove("flag");
        tablero[fila][columna].cell.textContent = "";
    }
}

function verificarVictoria() {
    let celdasReveladas = 0;
    for (let fila of tablero) {
        for (let celda of fila) {
            if (celda.estaRevelada && !celda.esMina) {
                celdasReveladas++;
            }
        }
    }

    if (celdasReveladas === tablero.length * tablero[0].length - contarMinas(tablero)) {
        alert("¡Felicidades! Has ganado.");
        juegoTerminado = true;
    }
}

function contarMinas(tablero) {
    let conteoMinas = 0;
    for (let fila of tablero) {
        for (let celda of fila) {
            if (celda.esMina) {
                conteoMinas++;
            }
        }
    }
    return conteoMinas;
}

function reiniciarJuego() {
    const filas = obtenerDimension("Ingrese el número de filas:", 5);
    const columnas = obtenerDimension("Ingrese el número de columnas:", 5);
    const minas = obtenerDimension("Ingrese el número de minas:", 5);
    esPrimerClick = true;
    juegoTerminado = false;
    generarTablero(filas, columnas, minas);
}

function obtenerDimension(mensaje, valorPorDefecto) {
    let valor = parseInt(prompt(mensaje), 10);
    if (isNaN(valor) || valor < 5) {
        alert(`Valor no válido. Se usará ${valorPorDefecto} por defecto.`);
        valor = valorPorDefecto;
    }
    return valor;
}

function seleccionarNivel(nivel) {
    const niveles = {
        facil: { filas: 5, columnas: 5, minas: 5 },/**puse el minimo ya que no supe si ese era un nivel o una condicion */
        medio: { filas: 10, columnas: 10, minas: 15 },
        dificil: { filas: 15, columnas: 15, minas: 30 },
        muyDificil: { filas: 20, columnas: 20, minas: 40 },
        hardcore: { filas: 25, columnas: 25, minas: 60 },
        leyenda: { filas: 30, columnas: 30, minas: 80 }
    };

    const { filas, columnas, minas } = niveles[nivel];
    esPrimerClick = true;
    juegoTerminado = false;
    generarTablero(filas, columnas, minas);
}
