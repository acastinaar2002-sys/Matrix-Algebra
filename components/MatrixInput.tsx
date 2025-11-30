import React from 'react';
import { Matrix } from '../types';
import { Trash2, GripHorizontal, RefreshCcw, MoreHorizontal } from 'lucide-react';
import { generateRandomMatrixData, createIdentityMatrix } from '../services/matrixUtils';

interface MatrixInputProps {
  matrix: Matrix;
  onUpdate: (id: string, newMatrix: Matrix) => void;
  onRemove: (id: string) => void;
}

const MatrixInput: React.FC<MatrixInputProps> = ({ 
  matrix, 
  onUpdate, 
  onRemove
}) => {
  
  const handleDimensionChange = (key: 'rows' | 'cols', value: number) => {
    const val = Math.max(1, Math.min(6, value)); // Limit 1-6 for UI specific request
    const newData = Array.from({ length: key === 'rows' ? val : matrix.rows }, (_, r) => 
      Array.from({ length: key === 'cols' ? val : matrix.cols }, (_, c) => {
        if (r < matrix.data.length && c < matrix.data[0].length) {
          return matrix.data[r][c];
        }
        return 0;
      })
    );
    
    onUpdate(matrix.id, { ...matrix, [key]: val, data: newData });
  };

  const handleDataChange = (row: number, col: number, val: string) => {
    const newData = [...matrix.data];
    newData[row] = [...newData[row]];
    newData[row][col] = parseFloat(val) || 0;
    onUpdate(matrix.id, { ...matrix, data: newData });
  };

  const handleRandomize = () => {
    const newData = generateRandomMatrixData(matrix.rows, matrix.cols);
    onUpdate(matrix.id, { ...matrix, data: newData });
  };

  const handleIdentity = () => {
      const size = Math.min(matrix.rows, matrix.cols);
      const newData = createIdentityMatrix(size);
      // If rectangular, it will crop or pad. Let's force square for identity best practice or just fill
      // But creating identity implies square. Let's make it square
      onUpdate(matrix.id, { ...matrix, rows: size, cols: size, data: newData });
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-inner">
             {matrix.name}
           </div>
           {/* Rename */}
           {/* We can stick to fixed names or allow rename. Prompt says "A, B, C..." implied list. keeping fixed is safer for parsing logic but user can rename if careful. */}
           <span className="text-xs text-slate-400 font-medium tracking-wide">
             {matrix.rows} × {matrix.cols}
           </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            onClick={handleRandomize} 
            title="Randomize"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
           >
             <RefreshCcw size={14} />
           </button>
           <button 
            onClick={onRemove}
            title="Remove"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </div>

      {/* Matrix Data */}
      <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[160px]">
        <div 
          className="grid gap-2"
          style={{ 
            gridTemplateColumns: `repeat(${matrix.cols}, minmax(0, 1fr))` 
          }}
        >
          {matrix.data.map((row, i) => (
            row.map((val, j) => (
              <input
                key={`${i}-${j}`}
                type="number"
                value={val}
                onChange={(e) => handleDataChange(i, j, e.target.value)}
                className="w-12 h-10 text-center text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono text-sm"
              />
            ))
          ))}
        </div>
      </div>

      {/* Dimensions Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
             <span>F:</span>
             <input 
                type="number" min="1" max="6" 
                value={matrix.rows} 
                onChange={(e) => handleDimensionChange('rows', parseInt(e.target.value))}
                className="w-8 text-center bg-white border border-slate-200 rounded px-1 focus:outline-none focus:border-blue-400"
             />
          </div>
          <div className="flex items-center gap-2">
             <span>C:</span>
             <input 
                type="number" min="1" max="6" 
                value={matrix.cols} 
                onChange={(e) => handleDimensionChange('cols', parseInt(e.target.value))}
                className="w-8 text-center bg-white border border-slate-200 rounded px-1 focus:outline-none focus:border-blue-400"
             />
          </div>
      </div>
    </div>
  );
};

export default MatrixInput;
