
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

console.log('--- VERIFICACIÓN MANUAL DOCENA 1 (1-12) ---');
console.log('| Num | Color | Paridad | Tipo |');
console.log('|:---:|:---:|:---:|:---:|');

let rOdd = 0, rEven = 0, bOdd = 0, bEven = 0;

for (let i = 1; i <= 12; i++) {
    const color = REDS.includes(i) ? 'ROJO' : 'NEGRO';
    const parity = (i % 2 === 0) ? 'PAR' : 'IMPAR';

    console.log(`| ${i} | ${color} | ${parity} | ${color} ${parity} |`);

    if (color === 'ROJO') {
        if (parity === 'IMPAR') rOdd++; else rEven++;
    } else {
        if (parity === 'IMPAR') bOdd++; else bEven++;
    }
}

console.log('\n--- RESUMEN FINAL ---');
console.log(`ROJOS: ${rOdd} Impares vs ${rEven} Pares`);
console.log(`NEGROS: ${bOdd} Impares vs ${bEven} Pares`);
