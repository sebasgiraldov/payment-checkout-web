import React from 'react';
import { Github, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-background-dark py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Globe className="w-5 h-5" />
            <span className="font-bold">TechStore</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Premium technology hardware for next-gen developers and high-end gamers.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-xs font-medium hover:text-primary transition-colors flex items-center gap-1">
              API Docs
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-4">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="px-2 py-1 rounded bg-white/5">Node.js</span>
            <span className="px-2 py-1 rounded bg-white/5">TypeScript</span>
            <span className="px-2 py-1 rounded bg-white/5">Gateway</span>
          </div>
          <p className="text-sm text-slate-400">
            Desarrollado por <span className="text-primary font-bold">Juan Sebastian Giraldo Valencia</span>
          </p>
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            © 2024 TechStore International S.A.
          </p>
        </div>
      </div>
    </footer>
  );
};
