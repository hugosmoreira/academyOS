import { Settings, Users, Clock, Save, X } from 'lucide-react';

export default function MembershipPlans() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-container-high">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Membership Plan Builder</h1>
          <p className="text-sm text-on-surface-variant">Design and manage access tiers, billing cycles, and promotional trials.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
         
         <div className="flex-1 w-full flex flex-col gap-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-on-surface">Active Plans</h2>
               <span className="bg-surface-container-high text-on-surface text-xs font-bold px-3 py-1 rounded-full">3 Active</span>
            </div>

            <div className="space-y-4">
               <div className="bg-surface-container-low border border-surface-container-high p-6 rounded-xl hover:border-surface-variant transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 border border-surface-container-highest">
                        <svg className="w-6 h-6 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1.5">
                           <h3 className="font-bold text-xl text-on-surface">Fundamentals</h3>
                           <span className="px-2 py-0.5 text-[10px] bg-surface-container border border-surface-variant text-on-surface-variant rounded font-bold uppercase tracking-widest">Entry</span>
                        </div>
                        <p className="text-sm text-on-surface-variant">Core curriculum for white to blue belts.</p>
                     </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-on-surface">$150</span>
                        <span className="text-sm text-on-surface-variant">/mo</span>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Monthly</div>
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 45 Members</div>
                     </div>
                  </div>
               </div>

               <div className="bg-surface border border-primary/40 p-6 rounded-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer shadow-[inset_0_0_20px_rgba(233,194,98,0.05)]">
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary"></div>
                  <div className="flex items-start gap-4 relative z-10 pl-2">
                     <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1.5">
                           <h3 className="font-bold text-xl text-primary">Unlimited Elite</h3>
                           <span className="px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/30 text-primary rounded font-bold uppercase tracking-widest">Popular</span>
                        </div>
                        <p className="text-sm text-on-surface-variant">All-access pass to all classes and open mat.</p>
                     </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-1 relative z-10">
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-on-surface">$220</span>
                        <span className="text-sm text-on-surface-variant">/mo</span>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Monthly</div>
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 112 Members</div>
                     </div>
                  </div>
               </div>

               <div className="bg-surface-container-low border border-surface-container-high p-6 rounded-xl hover:border-surface-variant transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 border border-surface-container-highest">
                        <svg className="w-6 h-6 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1.5">
                           <h3 className="font-bold text-xl text-on-surface">Kids Program</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant">Ages 5-12. Focus on discipline and fundamentals.</p>
                     </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-1">
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-on-surface">$120</span>
                        <span className="text-sm text-on-surface-variant">/mo</span>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 1 Class Trial</div>
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 80 Members</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Sidebar Form */}
         <div className="w-full xl:w-[400px] bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative">
            <div className="flex items-center justify-between mb-6 border-b border-surface-container-high pb-4">
               <h2 className="text-lg font-bold text-on-surface">Build New Plan</h2>
               <button className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Plan Name</label>
                  <input type="text" placeholder="e.g. Competition Prep" className="w-full bg-surface border border-surface-container-highest rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-on-surface mb-2">Price ($)</label>
                     <input type="text" placeholder="0.00" className="w-full bg-surface border border-surface-container-highest rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-on-surface mb-2">Billing Cycle</label>
                     <select className="w-full bg-surface border border-surface-container-highest rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors appearance-none">
                        <option>Monthly</option>
                        <option>Weekly</option>
                        <option>Yearly</option>
                     </select>
                  </div>
               </div>

               <div className="pt-4 border-t border-surface-container-high">
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">ONBOARDING & TRIALS</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Setup Fee ($)</label>
                        <input type="text" placeholder="Optional" className="w-full bg-surface border border-surface-container-highest rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Trial Period</label>
                        <select className="w-full bg-surface border border-surface-container-highest rounded-lg px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors appearance-none">
                           <option>No Trial</option>
                           <option>1 Class</option>
                           <option>1 Week</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="flex items-start justify-between">
                     <div>
                        <h4 className="text-sm font-bold text-on-surface mb-1">Enable Family Discount</h4>
                        <p className="text-xs text-on-surface-variant">Apply automatic % off for linked members.</p>
                     </div>
                     <div className="w-10 h-5 bg-surface-container-highest rounded-full relative cursor-pointer mt-1">
                        <div className="w-4 h-4 bg-on-surface-variant rounded-full absolute top-0.5 left-0.5"></div>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-surface-container-high flex items-center justify-between gap-3">
                  <button className="flex-1 py-2.5 text-sm font-medium text-on-surface border border-surface-container-highest hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
                  <button className="flex-1 py-2.5 text-sm font-bold bg-primary text-on-primary-fixed hover:brightness-110 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors">
                     <Save className="w-4 h-4"/> Save Plan
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
