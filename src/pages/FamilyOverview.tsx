import { Download, MoreHorizontal, Calendar as CalendarIcon, Award, CreditCard, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FamilyOverview() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 border-b border-surface-container-high pb-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-on-surface mb-2">Family Overview</h1>
          <p className="text-sm text-on-surface-variant">Manage schedules, progress, and billing for your household.</p>
        </div>
        <button className="bg-surface text-on-surface border border-surface-container-highest hover:bg-surface-container px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
          <Download className="w-4 h-4" /> Tax Statement
        </button>
      </div>

      {/* Top Section - Member Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        
        {/* Leo Chen Card */}
        <div className="bg-surface-container-low border border-primary/40 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(233,194,98,0.05)] relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
           
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                 <img src="https://i.pravatar.cc/100?img=11" className="w-14 h-14 rounded-full border border-primary/20 object-cover" />
                 <div>
                    <h2 className="text-2xl font-bold text-on-surface mb-1">Leo Chen</h2>
                    <span className="text-[10px] font-bold bg-surface-container border border-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 w-fit">
                       <div className="w-2 h-2 rounded-full bg-slate-400"></div> Youth BJJ • Grey Belt
                    </span>
                 </div>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface"><MoreHorizontal className="w-5 h-5"/></button>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-container border border-surface-container-high rounded-xl p-4">
                 <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5"/> Next Class</div>
                 <div className="text-lg font-bold text-on-surface">Today, 4:30 PM</div>
                 <div className="text-xs text-on-surface-variant mt-1.5 font-medium">Intermediate Grappling</div>
              </div>
              <div className="bg-surface border border-surface-container border-t-0 border-b-[3px] border-b-primary rounded-xl p-4 shadow-sm relative overflow-hidden">
                 <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 flex items-center gap-1.5"><Award className="w-3.5 h-3.5"/> Rank Progress</div>
                 <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-on-surface leading-none">18/24</span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Classes</span>
                 </div>
                 <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-auto">
                    <div className="bg-primary h-1.5 rounded-full w-[75%]"></div>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-between border-t border-surface-container-high/50 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                 <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Waiver up to date
              </div>
              <button className="text-xs font-bold text-primary hover:text-primary-fixed uppercase tracking-wider transition-colors">View Profile</button>
           </div>
        </div>

        {/* Mia Chen Card */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-container-highest rounded-l-xl"></div>
           
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                 <img src="https://i.pravatar.cc/100?img=9" className="w-14 h-14 rounded-full border border-surface-container-highest object-cover opacity-90" />
                 <div>
                    <h2 className="text-2xl font-bold text-on-surface mb-1">Mia Chen</h2>
                    <span className="text-[10px] font-bold bg-surface-container border border-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 w-fit">
                       <div className="w-2 h-2 rounded-full border border-surface-variant"></div> Teens Muay Thai • Level 2
                    </span>
                 </div>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface"><MoreHorizontal className="w-5 h-5"/></button>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface border border-surface-container-high rounded-xl p-4">
                 <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5"/> Next Class</div>
                 <div className="text-lg font-bold text-on-surface">Tomorrow, 5:00 PM</div>
                 <div className="text-xs text-on-surface-variant mt-1.5 font-medium">Pad Work Fundamentals</div>
              </div>
              <div className="bg-surface-container border border-surface-container-high rounded-xl p-4 shadow-sm relative">
                 <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 flex items-center gap-1.5"><Award className="w-3.5 h-3.5"/> Rank Progress</div>
                 <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-on-surface leading-none">4/30</span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Classes</span>
                 </div>
                 <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-auto">
                    <div className="bg-surface-variant h-1.5 rounded-full w-[15%]"></div>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-between border-t border-surface-container-high/50 pt-4">
              <div className="flex items-center gap-2 text-sm text-error font-medium">
                 <AlertTriangle className="w-4 h-4" /> Waiver expires in 5 days
              </div>
              <button className="text-xs font-bold text-primary hover:text-primary-fixed uppercase tracking-wider transition-colors">Sign Now</button>
           </div>
        </div>
      </div>

      {/* Bottom Section - Family Account & Upcoming Schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Family Account */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col">
           <h3 className="font-bold text-lg text-on-surface mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5"/> Family Account</h3>
           
           <div className="bg-surface border border-surface-container-high rounded-xl p-6 mb-6">
              <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2">Current Balance</div>
              <div className="text-5xl font-display font-bold text-on-surface mb-6">$0.00</div>
              
              <div className="flex items-end justify-between border-t border-surface-container pt-4">
                 <div>
                    <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Next Auto-pay</div>
                    <div className="text-sm font-semibold text-on-surface">Nov 1st • $350.00</div>
                 </div>
                 <div className="bg-surface-container-highest px-2 py-1 text-[10px] rounded uppercase font-mono text-on-surface-variant border border-surface-container-high font-bold tracking-wider">
                    Visa •••• 4242
                 </div>
              </div>
           </div>

           <div className="mt-auto space-y-3">
              <button className="w-full bg-primary text-on-primary-fixed hover:brightness-110 font-bold text-sm py-3 rounded-lg shadow-sm transition-colors">
                 Update Payment Method
              </button>
              <button className="w-full bg-surface border border-surface-container-highest text-on-surface hover:bg-surface-container font-semibold text-sm py-3 rounded-lg transition-colors">
                 View Billing History
              </button>
           </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="xl:col-span-2 bg-surface-container-low border border-surface-container-high rounded-xl p-6">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> Upcoming Schedule</h3>
              <button className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors text-right">Full Calendar</button>
           </div>

           <div className="space-y-6">
              {/* Day 1 */}
              <div className="flex gap-4">
                 <div className="w-12 text-center pt-1 shrink-0">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Today</div>
                    <div className="text-2xl font-bold text-on-surface leading-none">15</div>
                 </div>
                 <div className="flex-1 bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <h4 className="font-bold text-on-surface text-base">Youth BJJ - Int. Grappling</h4>
                       </div>
                       <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 4:30 PM - 5:30 PM</span>
                          <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Leo Chen</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Day 2 */}
              <div className="flex gap-4">
                 <div className="w-12 text-center pt-1 shrink-0">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Wed</div>
                    <div className="text-2xl font-bold text-on-surface-variant leading-none">16</div>
                 </div>
                 <div className="flex-1 bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-surface-variant"></div>
                          <h4 className="font-bold text-on-surface text-base">Teens Muay Thai</h4>
                       </div>
                       <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 5:00 PM - 6:00 PM</span>
                          <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Mia Chen</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Day 3 */}
              <div className="flex gap-4">
                 <div className="w-12 text-center pt-1 shrink-0">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">Thu</div>
                    <div className="text-2xl font-bold text-on-surface-variant leading-none">17</div>
                 </div>
                 <div className="flex-1 bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <h4 className="font-bold text-on-surface text-base">Youth BJJ - Open Mat</h4>
                       </div>
                       <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 4:30 PM - 5:30 PM</span>
                          <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Leo Chen</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
