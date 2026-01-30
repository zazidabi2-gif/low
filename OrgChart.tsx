import React from 'react';
import { OrgStructure } from '../types';

interface OrgChartProps {
  data: OrgStructure[];
}

// Simple recursive renderer or level-based renderer for Org Chart
const OrgNode: React.FC<{ node: OrgStructure; children: OrgStructure[]; allData: OrgStructure[] }> = ({ node, children, allData }) => {
  return (
    <div className="flex flex-col items-center mx-4">
      <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 shadow-lg w-48 text-center mb-6 relative z-10">
        <div className="w-2 h-2 bg-emerald-500 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
        <h4 className="font-bold text-emerald-800 text-sm">{node.position}</h4>
        <p className="text-slate-600 mt-1">{node.holderName}</p>
        <div className="w-2 h-2 bg-emerald-500 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
      </div>
      
      {children.length > 0 && (
        <div className="relative flex justify-center gap-8 pt-6 border-t-2 border-slate-300 w-full">
           {/* Connecting line vertical from parent */}
           <div className="absolute top-0 left-1/2 h-6 border-l-2 border-slate-300 transform -translate-x-1/2 -mt-6"></div>
           
           {children.map(child => (
             <OrgNode 
               key={child.id} 
               node={child} 
               allData={allData} 
               children={allData.filter(d => d.parentId === child.id)} 
             />
           ))}
        </div>
      )}
    </div>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({ data }) => {
  const root = data.find(d => !d.parentId);

  if (!root) return <div>Data Struktur Belum Ada</div>;

  return (
    <div className="overflow-x-auto pb-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Struktur Pengurus Lembaga</h2>
      <div className="min-w-[800px] flex justify-center">
        <OrgNode 
          node={root} 
          allData={data} 
          children={data.filter(d => d.parentId === root.id)} 
        />
      </div>
    </div>
  );
};