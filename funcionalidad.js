// Estado de la calculadora
const estado = {
    operandoA: '',
    operandoB: '',
    operacion: null,
    historial: [],
    resultado: null,
    displayCompleto: ''
};

// Configuración
const CONFIG = {
    MAX_DIGITOS: 12,
    MAX_HISTORIAL: 10,
    SIMBOLOS_OPERACION: {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    }
};

function init() {
    // Elementos del DOM
    const elementos = {
        resultado: document.getElementById("resultado"),
        numeros: Array.from(Array(10).keys()).reduce((acc, num) => {
            acc[num] = document.getElementById(numeroATexto(num));
            return acc;
        }, {}),
        operadores: {
            suma: document.getElementById("suma"),
            resta: document.getElementById("resta"),
            multiplicacion: document.getElementById("multiplicacion"),
            division: document.getElementById("division"),
            igual: document.getElementById("igual"),
            reset: document.getElementById("reset")
        }
    };

    // Agregar listeners para números
    Object.entries(elementos.numeros).forEach(([numero, elemento]) => {
        elemento.onclick = () => agregarDigito(numero);
    });

    // Agregar listeners para operadores
    elementos.operadores.suma.onclick = () => setOperacion('+');
    elementos.operadores.resta.onclick = () => setOperacion('-');
    elementos.operadores.multiplicacion.onclick = () => setOperacion('*');
    elementos.operadores.division.onclick = () => setOperacion('/');
    elementos.operadores.igual.onclick = calcularResultado;
    elementos.operadores.reset.onclick = resetear;

    // Agregar soporte para teclado
    document.addEventListener('keydown', manejarTeclado);

    // Inicializar display
    actualizarDisplay();
}

function numeroATexto(numero) {
    const nombres = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    return nombres[numero];
}

function agregarDigito(digito) {
    const display = document.getElementById("resultado");
    if ((estado.operacion === null && estado.operandoA.length >= CONFIG.MAX_DIGITOS) ||
        (estado.operacion !== null && estado.operandoB.length >= CONFIG.MAX_DIGITOS)) return;

    if (estado.operacion === null) {
        estado.operandoA = `${estado.operandoA}${digito}`;
    } else {
        estado.operandoB = `${estado.operandoB}${digito}`;
    }
    actualizarDisplay();
}

function setOperacion(op) {
    if (estado.operandoA === '') return;
    
    if (estado.operandoB !== '') {
        calcularResultado();
    }
    
    estado.operacion = op;
    actualizarDisplay();
}

function calcularResultado() {
    if (estado.operandoA === '' || estado.operandoB === '' || estado.operacion === null) return;

    let resultado;
    const a = parseFloat(estado.operandoA);
    const b = parseFloat(estado.operandoB);

    try {
        switch(estado.operacion) {
            case '+':
                resultado = a + b;
                break;
            case '-':
                resultado = a - b;
                break;
            case '*':
                resultado = a * b;
                break;
            case '/':
                if (b === 0) throw new Error('División por cero');
                resultado = a / b;
                break;
            default:
                throw new Error('Operación inválida');
        }

        // Redondear para evitar errores de punto flotante
        resultado = Math.round(resultado * 1000000) / 1000000;

        // Agregar al historial
        agregarAlHistorial(a, estado.operacion, b, resultado);

        // Actualizar estado
        estado.operandoA = resultado.toString();
        estado.operandoB = '';
        estado.operacion = null;
        estado.resultado = resultado;

        actualizarDisplay();
    } catch (error) {
        mostrarError(error.message);
    }
}

function agregarAlHistorial(a, op, b, resultado) {
    const operacion = {
        expresion: `${a} ${CONFIG.SIMBOLOS_OPERACION[op]} ${b} = ${resultado}`,
        timestamp: new Date()
    };

    estado.historial.unshift(operacion);
    if (estado.historial.length > CONFIG.MAX_HISTORIAL) {
        estado.historial.pop();
    }

    actualizarHistorialUI();
}

function actualizarHistorialUI() {
    const historialLista = document.getElementById('historial-lista');
    historialLista.innerHTML = '';

    if (estado.historial.length === 0) {
        const mensajeVacio = document.createElement('div');
        mensajeVacio.className = 'historial-vacio';
        mensajeVacio.innerHTML = `
            <div>Sin operaciones recientes</div>
            <div style="font-size: 0.8rem; margin-top: 0.5rem;">Los cálculos aparecerán aquí</div>
        `;
        historialLista.appendChild(mensajeVacio);
        return;
    }

    estado.historial.forEach((operacion) => {
        const item = document.createElement('div');
        item.className = 'historial-item';
        
        const expresion = document.createElement('div');
        expresion.textContent = operacion.expresion;
        
        const tiempo = document.createElement('div');
        tiempo.className = 'tiempo';
        tiempo.textContent = formatearTiempo(operacion.timestamp);
        
        item.appendChild(expresion);
        item.appendChild(tiempo);
        historialLista.appendChild(item);
    });
}

function formatearTiempo(fecha) {
    const ahora = new Date();
    const diferencia = ahora - fecha;
    
    // Menos de un minuto
    if (diferencia < 60000) {
        return 'Hace unos segundos';
    }
    // Menos de una hora
    else if (diferencia < 3600000) {
        const minutos = Math.floor(diferencia / 60000);
        return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }
    // Menos de un día
    else if (diferencia < 86400000) {
        const horas = Math.floor(diferencia / 3600000);
        return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    // Más de un día
    else {
        return fecha.toLocaleString();
    }
}

function resetear() {
    estado.operandoA = '';
    estado.operandoB = '';
    estado.operacion = null;
    estado.resultado = null;
    actualizarDisplay();
}

function actualizarDisplay() {
    const display = document.getElementById("resultado");
    let textoDisplay = '';

    if (estado.operandoA !== '') {
        textoDisplay = estado.operandoA;
        
        if (estado.operacion !== null) {
            textoDisplay += ` ${CONFIG.SIMBOLOS_OPERACION[estado.operacion]} `;
            if (estado.operandoB !== '') {
                textoDisplay += estado.operandoB;
            }
        }
    } else {
        textoDisplay = '0';
    }

    display.textContent = textoDisplay;
}

function mostrarError(mensaje) {
    const display = document.getElementById("resultado");
    display.textContent = 'Error';
    console.error(mensaje);
    setTimeout(() => {
        resetear();
    }, 1500);
}

function manejarTeclado(event) {
    const tecla = event.key;

    // Prevenir comportamiento por defecto
    if (tecla.match(/[0-9]|[\+\-\*\/=]|Enter|Escape|Backspace/)) {
        event.preventDefault();
    }

    // Números
    if (tecla.match(/[0-9]/)) {
        agregarDigito(parseInt(tecla));
    }

    // Operadores
    switch (tecla) {
        case '+':
            setOperacion('+');
            break;
        case '-':
            setOperacion('-');
            break;
        case '*':
            setOperacion('*');
            break;
        case '/':
            setOperacion('/');
                    break;
        case '=':
        case 'Enter':
            calcularResultado();
                   break;
        case 'Escape':
            resetear();
                   break;
        case 'Backspace':
            borrarUltimoDigito();
                   break;   
           }
}

function borrarUltimoDigito() {
    if (estado.operacion === null) {
        estado.operandoA = estado.operandoA.slice(0, -1);
    } else {
        estado.operandoB = estado.operandoB.slice(0, -1);
    }
    actualizarDisplay();
}

// Inicializar la calculadora
document.addEventListener('DOMContentLoaded', init);