
import React, { useState } from 'react';
import { CalculationResult, CalculationStep } from '../types';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultDisplayProps {
  results: CalculationResult[];
}

// LaTeX-style Matrix Component
const MatrixView = ({ data, title }: { data: (number | string)[][], title?: string }) => (
    <div className="flex flex-col items-center mx-4 my-2">
        {title && <span className="mb-2 text-xs font-serif text-slate-500 italic">{title} =</span>}
        <div className="relative px-4 py-2">
            {/* Big Brackets */}
            <div className="absolute top-0 bottom-0 left-0 w-3 border-l-2 border-t-2 border-b-2 border-slate-800 rounded-l-xl"></div>
            <div className="absolute top-0 bottom-0 right-0 w-3 border-r-2 border-t-2 border-b-2 border-slate-800 rounded-r-xl"></div>
            
            <table className="border-collapse">
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {row.map((val, j) => {
                                const isString = typeof val === 'string';
                                return (
                                    <td key={j} className="p-2 text-center min-w-[36px]">
                                        <span className={`font-serif text-lg ${isString ? 'text-slate-500 font-mono text-sm' : 'text-slate-900'}`}>
                                            {isString ? val : (Number.isInteger(val) ? val : parseFloat((val as number).toFixed(4)))}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const SingleResult: React.FC<{ res: CalculationResult }> = ({ res }) => {
    // Default open steps if complex
    const [showSteps, setShowSteps] = useState(true);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 animate-fade-in-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="text-base font-bold text-slate-700">{res.title}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-1">
                        {res.expressionStr || (res.equationParams ? `Ecuación` : 'Operación')}
                    </div>
                </div>
                {res.steps && res.steps.length > 0 && (
                    <button 
                        onClick={() => setShowSteps(!showSteps)}
                        className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition font-medium shadow-sm"
                    >
                        {showSteps ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        {showSteps ? 'Ocultar pasos' : 'Ver pasos'}
                    </button>
                )}
            </div>

            {/* Rich Steps Section */}
            {showSteps && res.steps && res.steps.length > 0 && (
                <div className="bg-[#FAFAFA] border-b border-slate-100 p-6 space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Procedimiento</h4>
                    
                    {res.steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-start animate-fade-in">
                            {step.type === 'text' && (
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-slate-700 mt-0.5 leading-relaxed font-medium">
                                        {step.value}
                                    </p>
                                </div>
                            )}
                            
                            {step.type === 'matrix' && (
                                <div className="ml-9 mt-2 mb-4 overflow-x-auto max-w-full">
                                    <MatrixView data={step.data} title={step.title} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Final Result */}
            <div className="p-8 flex flex-col items-center bg-white">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resultado Final</span>
                
                {res.resultMatrix && (
                    <MatrixView data={res.resultMatrix.data} />
                )}

                {res.resultValue !== undefined && !res.resultMatrix && (
                    <div className="text-4xl font-serif text-slate-800">
                        {res.resultValue}
                    </div>
                )}
            </div>
        </div>
    );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ results }) => {
  if (results.length === 0) return null;

  const reversed = [...results].reverse();

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 pb-20">
       <div className="flex items-center gap-4 mb-8">
           <div className="h-px bg-slate-200 flex-1"></div>
           <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Resultados</span>
           <div className="h-px bg-slate-200 flex-1"></div>
       </div>
       
       <div>
           {reversed.map((res) => (
               <SingleResult key={res.id} res={res} />
           ))}
       </div>
    </div>
  );
};

export default ResultDisplay;
