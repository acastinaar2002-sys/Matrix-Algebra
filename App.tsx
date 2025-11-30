import React, { useState, useEffect } from 'react';
import { Plus, Download, Calculator, Trash2 } from 'lucide-react';
import { Matrix, OperationType, CalculationResult } from './types';
import MatrixInput from './components/MatrixInput';
import ResultDisplay from './components/ResultDisplay';
import { createEmptyMatrix, evaluateExpression, solveEquation, calculateBasicOp } from './services/matrixUtils';
import { generatePDFReport } from './services/pdfService';

const App = () => {
  // State
  const [matrices, setMatrices] = useState<Matrix[]>([]);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [mode, setMode] = useState<'CALCULATOR' | 'EQUATION'>('CALCULATOR');
  
  // Calculator Inputs
  const [expression, setExpression] = useState<string>('');
  
  // Equation Inputs
  const [eqM, setEqM] = useState<string>('');
  const [eqN, setEqN] = useState<string>('');
  const [eqP, setEqP] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  // Init
  useEffect(() => {
    // Default matrices
    setMatrices([
        { id: '1', name: 'A', rows: 2, cols: 2, data: [[1, 2], [3, 4]] },
        { id: '2', name: 'B', rows: 2, cols: 2, data: [[5, 6], [7, 8]] }
    ]);
  }, []);

  const handleAddMatrix = () => {
    const existingNames = matrices.map(m => m.name);
    let nextName = 'A';
    let charCode = 65;
    while (existingNames.includes(nextName)) {
        nextName = String.fromCharCode(++charCode);
    }

    const newMatrix: Matrix = {
      id: crypto.randomUUID(),
      name: nextName,
      rows: 3,
      cols: 3,
      data: createEmptyMatrix(3, 3)
    };
    setMatrices([...matrices, newMatrix]);
  };

  const updateMatrix = (id: string, updated: Matrix) => {
    setMatrices(prev => prev.map(m => m.id === id ? updated : m));
  };

  const removeMatrix = (id: string) => {
    setMatrices(prev => prev.filter(m => m.id !== id));
  };

  const handleExpressionCalculate = () => {
      setError(null);
      if (!expression.trim()) return;

      try {
          const { result, steps } = evaluateExpression(expression, matrices);
          
          const newResult: CalculationResult = {
              id: crypto.randomUUID(),
              title: "Evaluación de Expresión",
              operation: OperationType.EXPRESSION,
              expressionStr: expression,
              resultMatrix: { id: 'res', name: 'R', rows: result.length, cols: result[0].length, data: result },
              steps,
              timestamp: new Date()
          };
          setResults(prev => [...prev, newResult]);
          setExpression(''); 
      } catch (e: any) {
          setError(e.message);
      }
  };

  const handleQuickOp = (op: OperationType, matrixName: string) => {
      if (op === OperationType.TRANSPOSE) setExpression(prev => `${prev}${matrixName}'`);
      else if (op === OperationType.INVERSE) {
           const target = matrices.find(m => m.name === matrixName);
           if (!target) return;
           try {
               const { result, steps } = calculateBasicOp([target], op);
               const newResult: CalculationResult = {
                   id: crypto.randomUUID(),
                   title: `Inversa de ${matrixName}`,
                   operation: op,
                   resultMatrix: { id: 'res', name: 'R', rows: result.length, cols: result[0].length, data: result },
                   steps,
                   timestamp: new Date()
               };
               setResults(prev => [...prev, newResult]);
           } catch(e: any) {
               setError(e.message);
           }
      }
      else if (op === OperationType.DETERMINANT || op === OperationType.RANK) {
          const target = matrices.find(m => m.name === matrixName);
          if (!target) return;
          try {
             const { result, steps } = calculateBasicOp([target], op);
             const title = op === OperationType.DETERMINANT ? `Determinante |${matrixName}|` : `Rango de ${matrixName}`;
             
             const newResult: CalculationResult = {
                 id: crypto.randomUUID(),
                 title: title,
                 operation: op,
                 resultMatrix: { id: 'res', name: 'R', rows: result.length, cols: result[0].length, data: result }, // Det/Rank return 1x1 matrix in result prop
                 resultValue: result[0][0],
                 steps,
                 timestamp: new Date()
             };
             setResults(prev => [...prev, newResult]);
          } catch (e: any) {
              setError(e.message);
          }
      } else {
         // Fallback mainly for expression building
         setExpression(prev => prev + matrixName);
      }
  };

  const handleSolveEquation = () => {
      setError(null);
      const M = matrices.find(m => m.name === eqM);
      const N = matrices.find(m => m.name === eqN);
      const P = matrices.find(m => m.name === eqP);

      if (!M || !N || !P) {
          setError("Seleccione las matrices M, N y P.");
          return;
      }

      try {
          const { result, steps } = solveEquation(M, N, P);
           const newResult: CalculationResult = {
              id: crypto.randomUUID(),
              title: "Ecuación Matricial",
              operation: OperationType.EQUATION,
              equationParams: { m: eqM, n: eqN, p: eqP },
              resultMatrix: { id: 'res-eq', name: 'X', rows: result.length, cols: result[0].length, data: result },
              steps,
              timestamp: new Date()
          };
          setResults(prev => [...prev, newResult]);
      } catch (e: any) {
          setError(e.message);
      }
  };

  const clearHistory = () => setResults([]);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
               <Calculator size={20} />
             </div>
             <h1 className="text-xl font-semibold tracking-tight">Matrix Algebra</h1>
           </div>

           <div className="flex items-center gap-4">
              <button onClick={() => generatePDFReport(results)} className="text-slate-500 hover:text-black transition flex items-center gap-2 text-sm font-medium">
                  <Download size={18} />
                  <span>Reporte</span>
              </button>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Panel: Matrix Manager */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Matrices</h2>
                    <button 
                        onClick={handleAddMatrix}
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
                    >
                        <Plus size={16} /> Nueva
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-20 custom-scrollbar">
                    {matrices.map(m => (
                        <MatrixInput 
                            key={m.id} 
                            matrix={m} 
                            onUpdate={updateMatrix} 
                            onRemove={() => removeMatrix(m.id)} 
                        />
                    ))}
                    {matrices.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                            No hay matrices definidas.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Operation Canvas */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl w-fit mb-8">
                    <button 
                        onClick={() => setMode('CALCULATOR')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'CALCULATOR' ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Calculadora Libre
                    </button>
                    <button 
                        onClick={() => setMode('EQUATION')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'EQUATION' ? 'bg-white shadow-sm text-black' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Ecuaciones (MX + N = P)
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium animate-fade-in-up flex items-center gap-2 border border-red-100">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {error}
                    </div>
                )}

                {mode === 'CALCULATOR' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                            Expresión Algebraica
                        </label>
                        <div className="flex gap-4">
                            <input 
                                type="text"
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleExpressionCalculate()}
                                placeholder="Ej: 3A^t - B^2"
                                className="flex-1 text-2xl font-mono text-slate-800 placeholder-slate-300 border-b-2 border-slate-100 focus:border-black outline-none bg-transparent transition-colors py-2"
                            />
                            <button 
                                onClick={handleExpressionCalculate}
                                className="bg-black text-white px-6 rounded-xl font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                            >
                                Calcular
                            </button>
                        </div>
                        
                        {/* Quick Actions / Keyboard Helpers */}
                        <div className="mt-6">
                            <p className="text-xs text-slate-400 mb-3 font-medium">Insertar Matriz / Operación Rápida:</p>
                            <div className="flex flex-wrap gap-2">
                                {matrices.map(m => (
                                    <div key={m.id} className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                                        <button 
                                            onClick={() => setExpression(prev => prev + m.name)}
                                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-700 border-r border-slate-200"
                                        >
                                            {m.name}
                                        </button>
                                        <button onClick={() => handleQuickOp(OperationType.TRANSPOSE, m.name)} className="px-2 py-1.5 bg-white hover:bg-slate-50 text-xs text-slate-500 border-r border-slate-200" title="Transpuesta">T</button>
                                        <button onClick={() => handleQuickOp(OperationType.INVERSE, m.name)} className="px-2 py-1.5 bg-white hover:bg-slate-50 text-xs text-slate-500 border-r border-slate-200" title="Inversa">-1</button>
                                        <button onClick={() => handleQuickOp(OperationType.DETERMINANT, m.name)} className="px-2 py-1.5 bg-white hover:bg-slate-50 text-xs text-slate-500 border-r border-slate-200" title="Determinante">|A|</button>
                                        <button onClick={() => handleQuickOp(OperationType.RANK, m.name)} className="px-2 py-1.5 bg-white hover:bg-slate-50 text-xs text-slate-500" title="Rango">Rg</button>
                                    </div>
                                ))}
                                {matrices.length === 0 && <span className="text-sm text-slate-400 italic">Crea matrices para ver opciones.</span>}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex flex-col gap-2">
                           <span className="font-semibold text-slate-500">Sintaxis admitida:</span>
                           <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                               <li>• Transpuesta: <code className="bg-slate-100 px-1 rounded text-slate-600">A'</code> o <code className="bg-slate-100 px-1 rounded text-slate-600">A^t</code></li>
                               <li>• Multiplicación: <code className="bg-slate-100 px-1 rounded text-slate-600">3*A</code> o <code className="bg-slate-100 px-1 rounded text-slate-600">3A</code></li>
                               <li>• Potencia: <code className="bg-slate-100 px-1 rounded text-slate-600">B^2</code></li>
                               <li>• Suma/Resta: <code className="bg-slate-100 px-1 rounded text-slate-600">A + B</code></li>
                           </ul>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                         <div className="flex flex-col items-center justify-center mb-8">
                             <div className="flex items-center gap-4 text-3xl font-serif text-slate-800">
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-sans text-slate-400 font-bold uppercase">Matriz M</label>
                                    <select value={eqM} onChange={e => setEqM(e.target.value)} className="bg-slate-50 border-none rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-200 outline-none text-xl font-bold cursor-pointer hover:bg-slate-100">
                                        <option value="">?</option>
                                        {matrices.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                 </div>
                                 <span className="mt-6">· X +</span>
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-sans text-slate-400 font-bold uppercase">Matriz N</label>
                                    <select value={eqN} onChange={e => setEqN(e.target.value)} className="bg-slate-50 border-none rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-200 outline-none text-xl font-bold cursor-pointer hover:bg-slate-100">
                                        <option value="">?</option>
                                        {matrices.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                 </div>
                                 <span className="mt-6">=</span>
                                 <div className="flex flex-col gap-1">
                                    <label className="text-xs font-sans text-slate-400 font-bold uppercase">Matriz P</label>
                                    <select value={eqP} onChange={e => setEqP(e.target.value)} className="bg-slate-50 border-none rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-200 outline-none text-xl font-bold cursor-pointer hover:bg-slate-100">
                                        <option value="">?</option>
                                        {matrices.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                 </div>
                             </div>
                             <p className="mt-6 text-sm text-slate-500 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                                 Resuelve para X: <span className="font-mono font-bold text-blue-700">X = M⁻¹ · (P - N)</span>
                             </p>
                         </div>
                         
                         <div className="flex justify-center">
                            <button 
                                onClick={handleSolveEquation}
                                disabled={!eqM || !eqN || !eqP}
                                className="bg-black text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition shadow-xl shadow-slate-200/50"
                            >
                                Resolver Ecuación
                            </button>
                         </div>
                    </div>
                )}

                {/* Results Section */}
                <ResultDisplay results={results} />
                
                {results.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <button onClick={clearHistory} className="text-red-400 text-sm hover:text-red-600 transition flex items-center gap-1">
                            <Trash2 size={14} /> Limpiar Historial
                        </button>
                    </div>
                )}

            </div>
        </div>
      </main>

    </div>
  );
};

export default App;