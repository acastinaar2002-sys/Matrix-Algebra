
export interface Matrix {
  id: string;
  name: string;
  rows: number;
  cols: number;
  data: number[][];
  selected?: boolean;
}

export enum OperationType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  MULTIPLY = 'MULTIPLY',
  SCALAR_MULT = 'SCALAR_MULT',
  // Advanced Operations
  EXPRESSION = 'EXPRESSION',
  TRANSPOSE = 'TRANSPOSE',
  INVERSE = 'INVERSE',
  DETERMINANT = 'DETERMINANT',
  RANK = 'RANK',
  POWER = 'POWER',
  EQUATION = 'EQUATION' // M * X + N = P
}

export type CalculationStep = 
  | { type: 'text', value: string }
  | { type: 'matrix', title: string, data: (number | string)[][] };

export interface CalculationResult {
  id: string;
  title: string;
  operation: OperationType;
  expressionStr?: string;
  resultMatrix?: Matrix; 
  resultValue?: number; 
  equationParams?: { m: string; n: string; p: string };
  steps?: CalculationStep[];
  timestamp: Date;
}
