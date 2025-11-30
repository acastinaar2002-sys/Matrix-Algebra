
import { Matrix, OperationType, CalculationStep } from '../types';

// --- Basic Utilities ---

export const createEmptyMatrix = (rows: number, cols: number): number[][] => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

export const createIdentityMatrix = (size: number): number[][] => {
  return Array.from({ length: size }, (_, i) => 
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
};

export const generateRandomMatrixData = (rows: number, cols: number): number[][] => {
  return Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => Math.floor(Math.random() * 20) - 10)
  );
};

export const cloneMatrixData = (data: number[][]): number[][] => {
  return data.map(row => [...row]);
};

// Helper to clean floats (e.g. 2.000000001 -> 2)
const cleanFloat = (num: number): number => {
  const precision = 1e-10;
  if (Math.abs(num - Math.round(num)) < precision) return Math.round(num);
  return parseFloat(num.toFixed(4));
};

// --- Core Matrix Operations with Steps ---

const addMatricesWithSteps = (a: number[][], b: number[][]): { result: number[][], steps: CalculationStep[] } => {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error("Dimensiones incompatibles para suma");
  
  const result = a.map((row, i) => row.map((val, j) => cleanFloat(val + b[i][j])));
  const symbolicData = a.map((row, i) => row.map((val, j) => `${val} + ${b[i][j] >= 0 ? b[i][j] : `(${b[i][j]})`}`));

  return {
      result,
      steps: [
          { type: 'text', value: `Suma de matrices ${a.length}x${a[0].length}:` },
          { type: 'matrix', title: 'Operación', data: symbolicData },
          { type: 'matrix', title: 'Resultado Suma', data: result }
      ]
  };
};

const subtractMatricesWithSteps = (a: number[][], b: number[][]): { result: number[][], steps: CalculationStep[] } => {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error("Dimensiones incompatibles para resta");
  
  const result = a.map((row, i) => row.map((val, j) => cleanFloat(val - b[i][j])));
  // Create "6 - 0", "27 - 6" style strings
  const symbolicData = a.map((row, i) => row.map((val, j) => `${val} - ${b[i][j] >= 0 ? b[i][j] : `(${b[i][j]})`}`));

  return {
      result,
      steps: [
          { type: 'text', value: `Resta de matrices ${a.length}x${a[0].length}:` },
          { type: 'matrix', title: 'Operación', data: symbolicData },
          { type: 'matrix', title: 'Resultado Resta', data: result }
      ]
  };
};

const multiplyMatrixWithSteps = (a: number[][], b: number[][]): { result: number[][], steps: CalculationStep[] } => {
  const r1 = a.length;
  const c1 = a[0].length;
  const r2 = b.length;
  const c2 = b[0].length;
  if (c1 !== r2) throw new Error(`Dimensiones incompatibles: ${r1}x${c1} vs ${r2}x${c2}`);
  
  const result = createEmptyMatrix(r1, c2);
  let exampleCalc = "";
  
  for (let i = 0; i < r1; i++) {
    for (let j = 0; j < c2; j++) {
      let sum = 0;
      let stepParts: string[] = [];
      for (let k = 0; k < c1; k++) {
        const valA = a[i][k];
        const valB = b[k][j];
        sum += valA * valB;
        if (i === 0 && j === 0) {
            stepParts.push(`(${valA}·${valB})`);
        }
      }
      result[i][j] = cleanFloat(sum);
      if (i === 0 && j === 0) {
          exampleCalc = `Ejemplo C[1,1] = Fila 1 · Col 1 = ${stepParts.join(" + ")} = ${cleanFloat(sum)}`;
      }
    }
  }
  
  return { 
      result, 
      steps: [
          { type: 'text', value: `Multiplicación: (${r1}x${c1}) · (${r2}x${c2}) -> (${r1}x${c2})` },
          { type: 'text', value: exampleCalc }
      ]
  };
};

const multiplyScalarWithSteps = (matrix: number[][], scalar: number): { result: number[][], steps: CalculationStep[] } => {
  const result = matrix.map(row => row.map(val => cleanFloat(val * scalar)));
  // Optional: Symbolic step for scalar? Maybe too verbose. Let's keep it simple.
  return {
      result,
      steps: [
          { type: 'text', value: `Multiplicamos cada elemento por ${scalar}:` },
          { type: 'matrix', title: `Escalar ${scalar}`, data: result }
      ]
  };
};

const transposeMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

export const getDeterminantWithSteps = (matrix: number[][]): { result: number, steps: string[] } => {
  const n = matrix.length;
  if (n !== matrix[0].length) throw new Error("El determinante requiere matriz cuadrada");
  const steps: string[] = [`Cálculo de determinante ${n}x${n}.`];

  if (n === 1) {
      return { result: matrix[0][0], steps };
  }
  if (n === 2) {
      const val = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      steps.push(`Fórmula ad - bc: (${matrix[0][0]}·${matrix[1][1]}) - (${matrix[0][1]}·${matrix[1][0]})`);
      return { result: cleanFloat(val), steps };
  }

  const m = cloneMatrixData(matrix);
  let det = 1;
  let swaps = 0;
  
  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(m[pivot][i]) < 1e-10) pivot++;
    
    if (pivot === n) return { result: 0, steps: [...steps, "Determinante es 0 (columna nula)."] };
    
    if (pivot !== i) {
      [m[i], m[pivot]] = [m[pivot], m[i]];
      det *= -1;
      swaps++;
    }
    
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(m[j][i]) > 1e-10) {
          const factor = m[j][i] / m[i][i];
          for (let k = i; k < n; k++) m[j][k] -= factor * m[i][k];
      }
    }
  }
  
  let diagProd = 1;
  for(let i=0; i<n; i++) diagProd *= m[i][i];
  return { result: cleanFloat(diagProd * Math.pow(-1, swaps)), steps: [...steps, `Triangularización completa. Det = ${cleanFloat(diagProd * Math.pow(-1, swaps))}`] };
};

export const getInverseWithSteps = (matrix: number[][]): { result: number[][], steps: string[] } => {
  const n = matrix.length;
  if (n !== matrix[0].length) throw new Error("Requiere matriz cuadrada");
  
  const steps: string[] = [`Método Gauss-Jordan para Inversa.`];
  const m = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))]);

  for (let i = 0; i < n; i++) {
    let pivot = i;
    while (pivot < n && Math.abs(m[pivot][i]) < 1e-10) pivot++;
    if (pivot === n) throw new Error("La matriz es singular y no tiene inversa.");

    if (pivot !== i) {
        [m[i], m[pivot]] = [m[pivot], m[i]];
        steps.push(`Pivoteo: Intercambio F${i+1} <-> F${pivot+1}`);
    }

    const pivotVal = m[i][i];
    if (Math.abs(pivotVal - 1) > 1e-10) {
        for (let j = 0; j < 2 * n; j++) m[i][j] /= pivotVal;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i && Math.abs(m[k][i]) > 1e-10) {
        const factor = m[k][i];
        for (let j = 0; j < 2 * n; j++) m[k][j] -= factor * m[i][j];
      }
    }
  }

  const res = m.map(row => row.slice(n).map(v => cleanFloat(v)));
  return { result: res, steps };
};

export const getRankWithSteps = (matrix: number[][]): { result: number, steps: string[] } => {
  const steps: string[] = ["Cálculo de Rango (Gauss)."];
  const m = cloneMatrixData(matrix);
  const R = m.length;
  const C = m[0].length;
  let rank = 0;
  const visitedCols = Array(C).fill(false);

  for (let r = 0; r < R; r++) {
    let pivotCol = -1;
    for (let c = 0; c < C; c++) {
      if (!visitedCols[c] && Math.abs(m[r][c]) > 1e-10) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol === -1) continue;
    visitedCols[pivotCol] = true;
    rank++;
    const pivotVal = m[r][pivotCol];
    for (let c = 0; c < C; c++) m[r][c] /= pivotVal;
    for (let i = 0; i < R; i++) {
      if (i !== r) {
        const factor = m[i][pivotCol];
        for (let c = 0; c < C; c++) m[i][c] -= factor * m[r][c];
      }
    }
  }
  return { result: rank, steps };
};

const matrixPowerWithSteps = (matrix: number[][], power: number): { result: number[][], steps: CalculationStep[] } => {
    if (matrix.length !== matrix[0].length) throw new Error("Potencia requiere matriz cuadrada");
    if (!Number.isInteger(power) || power < 1) throw new Error("Potencia debe ser entero positivo");
    
    const steps: CalculationStep[] = [{ type: 'text', value: `Calculando Potencia ^${power}` }];
    let res: number[][] = createIdentityMatrix(matrix.length);
    let base = cloneMatrixData(matrix);
    let p = power;
    
    // Binary exponentiation
    // Note: We are strictly creating new matrices in multiply, so 'base' update is safe.
    while (p > 0) {
        if (p % 2 === 1) res = multiplyMatrixWithSteps(res, base).result;
        if (p > 1) base = multiplyMatrixWithSteps(base, base).result;
        p = Math.floor(p / 2);
    }
    
    steps.push({ type: 'matrix', title: `Resultado Potencia ^${power}`, data: res });
    return { result: res, steps };
};

// --- Equation Solver ---
export const solveEquation = (M: Matrix, N: Matrix, P: Matrix): { result: number[][], steps: CalculationStep[] } => {
    const steps: CalculationStep[] = [];
    
    steps.push({ type: 'text', value: `Objetivo: Resolver X en ${M.name}·X + ${N.name} = ${P.name}` });
    steps.push({ type: 'text', value: `Despeje: X = (${M.name})⁻¹ · (${P.name} - ${N.name})` });

    // 1. Calculate RHS = P - N
    let RHS: number[][];
    try {
        const subOp = subtractMatricesWithSteps(P.data, N.data);
        RHS = subOp.result;
        steps.push({ type: 'text', value: `1. Calculamos R = ${P.name} - ${N.name}` });
        steps.push(...subOp.steps);
    } catch (e) {
        throw new Error(`Error en P - N: Dimensiones incompatibles`);
    }

    // 2. Calculate Inverse M
    let invM: number[][];
    try {
        const invOp = getInverseWithSteps(M.data);
        invM = invOp.result;
        steps.push({ type: 'text', value: `2. Calculamos Inversa de ${M.name}` });
        steps.push({ type: 'matrix', title: `Inversa (${M.name})⁻¹`, data: invM });
    } catch (e) {
        throw new Error(`La matriz ${M.name} no tiene inversa.`);
    }

    // 3. Multiply
    let X: number[][];
    try {
        const multOp = multiplyMatrixWithSteps(invM, RHS);
        X = multOp.result;
        steps.push({ type: 'text', value: `3. Multiplicamos (${M.name})⁻¹ · R` });
        steps.push({ type: 'matrix', title: 'Resultado X', data: multOp.result });
    } catch (e) {
        throw new Error(`Error en multiplicación final.`);
    }
    
    return { result: X, steps };
};


// --- Expression Parser Logic ---

type Token = 
  | { type: 'NUMBER', value: number }
  | { type: 'IDENTIFIER', value: string }
  | { type: 'OPERATOR', value: string }
  | { type: 'LPAREN' }
  | { type: 'RPAREN' };

const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (/[0-9]/.test(char)) {
      let numStr = char;
      while (i + 1 < expr.length && /[0-9.]/.test(expr[i + 1])) {
        numStr += expr[++i];
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
      
      let j = i + 1;
      while(j < expr.length && /\s/.test(expr[j])) j++;
      if (j < expr.length && (/[a-zA-Z]/.test(expr[j]) || expr[j] === '(')) {
          tokens.push({ type: 'OPERATOR', value: '*' });
      }

    } else if (/[a-zA-Z]/.test(char)) {
      let id = char;
      while (i + 1 < expr.length && /[a-zA-Z0-9_]/.test(expr[i + 1])) {
        id += expr[++i];
      }
      tokens.push({ type: 'IDENTIFIER', value: id });
    } else if (char === '·' || char === '.') {
      tokens.push({ type: 'OPERATOR', value: '*' });
    } else if (['+', '-', '*', '/'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
    } else if (char === '^') {
      let nextIdx = i + 1;
      while(nextIdx < expr.length && /\s/.test(expr[nextIdx])) nextIdx++;
      
      if (nextIdx < expr.length && (expr[nextIdx] === 't' || expr[nextIdx] === 'T')) {
          tokens.push({ type: 'OPERATOR', value: "'" });
          i = nextIdx;
      } else {
          tokens.push({ type: 'OPERATOR', value: '^' });
      }
    } else if (char === '(') {
      tokens.push({ type: 'LPAREN' });
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN' });
    } else if (char === "'") {
       tokens.push({ type: 'OPERATOR', value: "'" });
    } else {
      throw new Error(`Carácter inesperado: ${char}`);
    }
    i++;
  }
  return tokens;
};

const shuntingYard = (tokens: Token[]): Token[] => {
  const output: Token[] = [];
  const operators: Token[] = [];
  
  const precedence: Record<string, number> = {
    '+': 1, '-': 1,
    '*': 2, '/': 2,
    '^': 3, "'": 4
  };

  tokens.forEach(token => {
    if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
      output.push(token);
    } else if (token.type === 'OPERATOR') {
      while (
        operators.length > 0 &&
        operators[operators.length - 1].type === 'OPERATOR' &&
        precedence[(operators[operators.length - 1] as any).value] >= precedence[token.value]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else if (token.type === 'LPAREN') {
      operators.push(token);
    } else if (token.type === 'RPAREN') {
      while (operators.length > 0 && operators[operators.length - 1].type !== 'LPAREN') {
        output.push(operators.pop()!);
      }
      operators.pop(); 
    }
  });
  while (operators.length > 0) output.push(operators.pop()!);
  return output;
};

type StackValue = 
  | { type: 'scalar', val: number }
  | { type: 'matrix', val: number[][], name?: string };

const evaluateRPN = (rpn: Token[], contextMatrices: Record<string, number[][]>): { val: StackValue, steps: CalculationStep[] } => {
  const stack: StackValue[] = [];
  const steps: CalculationStep[] = [];

  const pop = () => {
    const val = stack.pop();
    if (!val) throw new Error("Expresión inválida");
    return val;
  };

  rpn.forEach(token => {
    if (token.type === 'NUMBER') {
      stack.push({ type: 'scalar', val: token.value });
    } else if (token.type === 'IDENTIFIER') {
      const name = token.value;
      if (contextMatrices[name]) {
          stack.push({ type: 'matrix', val: contextMatrices[name], name: name });
      } else {
         throw new Error(`Matriz "${name}" no encontrada.`);
      }
    } else if (token.type === 'OPERATOR') {
      const op = token.value;
      
      if (op === "'") {
        const a = pop();
        if (a.type !== 'matrix') throw new Error("Transpuesta solo aplica a matrices");
        const res = transposeMatrix(a.val);
        const name = a.name ? `${a.name}^t` : 'Transpuesta';
        steps.push({ type: 'text', value: `Calculando transpuesta de ${a.name || 'matriz'}` });
        steps.push({ type: 'matrix', title: name, data: res });
        stack.push({ type: 'matrix', val: res, name: name });
      } else {
        const b = pop();
        const a = pop(); 

        if (op === '+') {
          if (a.type === 'matrix' && b.type === 'matrix') {
            const res = addMatricesWithSteps(a.val, b.val);
            const name = `(${a.name || 'A'} + ${b.name || 'B'})`;
            steps.push({ type: 'text', value: `Sumando matrices: ${a.name || ''} + ${b.name || ''}` });
            // Add rich steps from the operation
            steps.push(...res.steps.filter(s => s.type !== 'text' || !s.value.startsWith('Suma')));
            stack.push({ type: 'matrix', val: res.result, name });
          } else {
             throw new Error("Suma escalar-matriz no implementada completamente en pasos ricos");
          }
        } else if (op === '-') {
             if (a.type === 'matrix' && b.type === 'matrix') {
                const res = subtractMatricesWithSteps(a.val, b.val);
                const name = `(${a.name || 'A'} - ${b.name || 'B'})`;
                steps.push({ type: 'text', value: `Restando matrices: ${a.name || ''} - ${b.name || ''}` });
                // Add rich steps (symbolic matrix)
                steps.push(...res.steps.filter(s => s.type !== 'text' || !s.value.startsWith('Resta')));
                stack.push({ type: 'matrix', val: res.result, name });
             } else {
                throw new Error("Resta escalar-matriz no implementada completamente en pasos ricos");
             }
        } else if (op === '*') {
          if (a.type === 'scalar' && b.type === 'matrix') {
            const res = multiplyScalarWithSteps(b.val, a.val);
            const name = `${a.val}${b.name || 'M'}`;
            steps.push({ type: 'text', value: `Multiplicación por escalar ${a.val} a ${b.name || 'matriz'}` });
            steps.push({ type: 'matrix', title: name, data: res.result });
            stack.push({ type: 'matrix', val: res.result, name });
          } else if (a.type === 'matrix' && b.type === 'scalar') {
            const res = multiplyScalarWithSteps(a.val, b.val);
            const name = `${b.val}${a.name || 'M'}`;
            steps.push({ type: 'text', value: `Multiplicación por escalar ${b.val} a ${a.name || 'matriz'}` });
            steps.push({ type: 'matrix', title: name, data: res.result });
            stack.push({ type: 'matrix', val: res.result, name });
          } else if (a.type === 'matrix' && b.type === 'matrix') {
            const res = multiplyMatrixWithSteps(a.val, b.val);
            const name = `${a.name || 'A'}·${b.name || 'B'}`;
            steps.push({ type: 'text', value: `Multiplicando matrices: ${a.name || 'A'} · ${b.name || 'B'}` });
            steps.push({ type: 'matrix', title: name, data: res.result });
            stack.push({ type: 'matrix', val: res.result, name });
          } else {
            stack.push({ type: 'scalar', val: (a.val as number) * (b.val as number) });
          }
        } else if (op === '^') {
            if (a.type === 'matrix' && b.type === 'scalar') {
                const res = matrixPowerWithSteps(a.val, b.val);
                const name = `${a.name || 'M'}^${b.val}`;
                // steps are already collected in res.steps
                steps.push(...res.steps);
                stack.push({ type: 'matrix', val: res.result, name });
            } else {
                throw new Error("Potencia solo soportada para matriz ^ entero");
            }
        }
      }
    }
  });

  if (stack.length !== 1) throw new Error("Error evaluando expresión");
  return { val: stack[0], steps };
};

// --- API ---

export const evaluateExpression = (expression: string, matrices: Matrix[]): { result: number[][], steps: CalculationStep[] } => {
    if (!expression || expression.trim() === '') throw new Error("Expresión vacía");
    
    const context: Record<string, number[][]> = {};
    matrices.forEach(m => context[m.name] = m.data);
    
    const tokens = tokenize(expression);
    const rpn = shuntingYard(tokens);
    const { val, steps } = evaluateRPN(rpn, context);

    if (val.type === 'scalar') {
        return { result: [[val.val]], steps };
    }
    return { result: val.val, steps };
};

export const calculateBasicOp = (matrices: Matrix[], op: OperationType): { result: number[][], steps: CalculationStep[] } => {
    if (op === OperationType.DETERMINANT) {
        const res = getDeterminantWithSteps(matrices[0].data);
        return { result: [[res.result]], steps: res.steps.map(s => ({ type: 'text', value: s } as CalculationStep)) };
    }
    if (op === OperationType.RANK) {
        const res = getRankWithSteps(matrices[0].data);
        return { result: [[res.result]], steps: res.steps.map(s => ({ type: 'text', value: s } as CalculationStep)) };
    }
    if (op === OperationType.INVERSE) {
        const res = getInverseWithSteps(matrices[0].data);
        return { 
          result: res.result, 
          steps: res.steps.map(s => ({ type: 'text', value: s } as CalculationStep)) 
        };
    }
    if (op === OperationType.TRANSPOSE) {
        const res = transposeMatrix(matrices[0].data);
        return { 
            result: res,
            steps: [
              { type: 'text', value: "Operación de Transpuesta: filas -> columnas" },
              { type: 'matrix', title: `${matrices[0].name}^t`, data: res }
            ] 
        };
    }
    throw new Error("Operación no soportada por cálculo básico.");
};
