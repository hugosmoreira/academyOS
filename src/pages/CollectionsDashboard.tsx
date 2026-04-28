import { Search, Download, AlertTriangle } from 'lucide-react';

export default function CollectionsDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Collections Dashboard</h1>
          <p className="text-sm text-on-surface-variant">Manage past-due balances and failed recurring payments.</p>
        </div>
        <button className="flex items-center gap-2 bg-surface text-on-surface border border-surface-container-highest hover:bg-surface-container py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-sm">
           <div className="text-xs font-bold text-on-surface-variant mb-2">Total Past Due</div>
           <div className="flex items-end gap-1 text-on-surface">
              <span className="text-5xl font-display font-bold text-error/90">$4,250</span>
              <span className="text-xl font-bold mb-1 text-on-surface-variant">.00</span>
           </div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-sm">
           <div className="text-xs font-bold text-on-surface-variant mb-2">Members in Arrears</div>
           <div className="text-5xl font-display font-bold text-on-surface">12</div>
        </div>
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 shadow-sm">
           <div className="text-xs font-bold text-on-surface-variant mb-2">Recovery Rate (30d)</div>
           <div className="text-5xl font-display font-bold text-primary">68%</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-on-surface mb-6">Action Required</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-error/80"></div>
          
          <div className="flex items-start justify-between mb-6">
             <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=11" className="w-12 h-12 rounded-full object-cover border border-surface-container-highest" />
                <div>
                   <h3 className="font-bold text-lg text-on-surface leading-tight mb-1">Marcus<br/>Thorne</h3>
                   <div className="text-xs text-on-surface-variant">Adult BJJ • Blue Belt</div>
                </div>
             </div>
             <div className="bg-error/10 border border-error/20 text-error px-2 py-1 flex items-center gap-1.5 rounded text-[10px] font-bold uppercase tracking-wider">
               <AlertTriangle className="w-3 h-3" /> Account Warning
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-surface-container-highest/20 rounded-lg p-4 mb-6 border border-surface-container-high/50">
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Amount Due</div>
                <div className="font-bold text-error/90">$150.00</div>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Overdue</div>
                <div className="font-bold text-on-surface flex items-baseline gap-1">14 <span className="text-xs">Days</span></div>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Last Attempt</div>
                <div className="font-medium text-sm text-on-surface">Oct 12</div>
             </div>
          </div>

          <div className="mt-auto flex gap-3">
             <button className="flex-1 bg-primary text-on-primary-fixed hover:brightness-110 font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm">Retry Payment</button>
             <button className="flex-1 bg-surface border border-surface-container-highest text-on-surface hover:bg-surface-container font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm">Send Reminder</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          
          <div className="flex items-start justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-surface-container-highest bg-surface-container flex items-center justify-center font-bold text-lg text-on-surface-variant">SL</div>
                <div>
                   <h3 className="font-bold text-lg text-on-surface leading-tight mb-1">Sarah Lin</h3>
                   <div className="text-xs text-on-surface-variant">Muay Thai • Beginner</div>
                </div>
             </div>
             <div className="bg-error/10 border border-error/20 text-error px-2 py-1 flex items-center gap-1.5 rounded text-[10px] font-bold uppercase tracking-wider">
               <AlertTriangle className="w-3 h-3" /> Account Warning
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-surface-container-highest/20 rounded-lg p-4 mb-6 border border-surface-container-high/50">
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Amount Due</div>
                <div className="font-bold text-primary">$120.00</div>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Overdue</div>
                <div className="font-bold text-on-surface flex items-baseline gap-1">7 <span className="text-xs">Days</span></div>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Last Attempt</div>
                <div className="font-medium text-sm text-on-surface">Oct 19</div>
             </div>
          </div>

          <div className="mt-auto flex gap-3">
             <button className="flex-1 bg-primary text-on-primary-fixed hover:brightness-110 font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm">Retry Payment</button>
             <button className="flex-1 bg-surface border border-surface-container-highest text-on-surface hover:bg-surface-container font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm">Send Reminder</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-error/40"></div>
          
          <div className="flex items-start justify-between mb-6">
             <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=5" className="w-12 h-12 rounded-full object-cover border border-surface-container-highest" />
                <div>
                   <h3 className="font-bold text-lg text-on-surface leading-tight mb-1">Elena<br/>Rostova</h3>
                   <div className="text-xs text-on-surface-variant">Kickboxing<br/>• Advanced</div>
                </div>
             </div>
             <div className="bg-error/10 border border-error/20 text-error px-2 py-1 flex items-center gap-1.5 rounded text-[10px] font-bold uppercase tracking-wider">
               <AlertTriangle className="w-3 h-3" /> Account Warning
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-surface-container-highest/20 rounded-lg p-4 mb-6 border border-surface-container-high/50">
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Amount Due</div>
                <div className="font-bold text-error/90">$300.00</div>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Overdue</div>
                <div className="font-bold text-on-surface flex items-baseline gap-1">32 <span className="text-xs">Days</span></div>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Last Attempt</div>
                <div className="font-medium text-sm text-on-surface">Sep 24</div>
             </div>
          </div>

          <div className="mt-auto flex gap-3">
             <button className="flex-1 bg-primary text-on-primary-fixed hover:brightness-110 font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm">Retry Payment</button>
             <button className="flex-1 bg-surface border border-surface-container-highest text-on-surface hover:bg-surface-container font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm">Send Reminder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
