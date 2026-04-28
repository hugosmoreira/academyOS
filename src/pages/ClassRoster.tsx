import { ArrowLeft, Printer, Mail, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClassRoster() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <Link to="/app/attendance" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-4">
         <ArrowLeft className="w-4 h-4" /> Back to Schedule
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
         <div>
            <h1 className="text-4xl font-display font-bold text-on-surface mb-2">Advanced No-Gi</h1>
            <p className="text-on-surface-variant">Thursday, Oct 26 • 6:30 PM - 8:00 PM</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-surface-container-high rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors">
               <Printer className="w-4 h-4" /> Print Roster
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface text-on-surface border border-surface-container-high rounded-lg text-sm font-semibold hover:bg-surface-container transition-colors">
               <Mail className="w-4 h-4" /> Email Class
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex items-center gap-4">
            <img src="https://i.pravatar.cc/100?img=11" alt="Instructor" className="w-16 h-16 rounded-full border-2 border-primary object-cover" />
            <div>
               <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">INSTRUCTOR</div>
               <div className="text-lg font-bold text-on-surface mb-0.5">Prof. Silva</div>
               <span className="px-2 py-0.5 text-[10px] bg-black text-white border border-[#333] rounded-sm font-bold uppercase tracking-wider inline-flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div> Black Belt
               </span>
            </div>
         </div>
         
         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">CAPACITY</div>
               <div className="text-sm font-semibold text-primary">85% Full</div>
            </div>
            <div>
               <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-display font-bold text-on-surface">34</span>
                  <span className="text-lg text-on-surface-variant">/ 40</span>
               </div>
               <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
               </div>
            </div>
         </div>

         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">ATTENDANCE TREND</div>
            <div className="flex items-end gap-2 h-12 mb-2">
               <div className="w-full bg-surface-container-highest rounded-t-sm" style={{ height: '40%' }}></div>
               <div className="w-full bg-surface-container-highest rounded-t-sm" style={{ height: '45%' }}></div>
               <div className="w-full bg-surface-container-highest rounded-t-sm" style={{ height: '40%' }}></div>
               <div className="w-full bg-surface-container-highest rounded-t-sm" style={{ height: '55%' }}></div>
               <div className="w-full bg-primary/70 rounded-t-sm" style={{ height: '60%' }}></div>
               <div className="w-full bg-primary rounded-t-sm" style={{ height: '100%' }}></div>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">PAST 6 WEEKS</span>
               <span className="text-[10px] text-primary font-bold flex items-center gap-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  +12%
               </span>
            </div>
         </div>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
         <div className="p-6 border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-on-surface">Class Roster</h3>
            <div className="flex items-center gap-3">
               <input type="text" placeholder="Search student..." className="bg-surface border border-surface-container-high rounded-lg pl-4 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-64" />
               <button className="bg-primary text-on-primary-fixed hover:brightness-110 font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
                  Check-in All (34)
               </button>
            </div>
         </div>
         <table className="w-full text-left">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
               <tr>
                  <th className="px-6 py-4 w-12 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Last Attended</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
               {/* Checked In */}
               <tr className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4">
                     <div className="w-6 h-6 rounded border-2 border-primary flex items-center justify-center text-primary">
                        <Check className="w-4 h-4" />
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface">MJ</div>
                        <div>
                           <div className="font-bold text-on-surface mb-0.5">Marcus Johnson</div>
                           <div className="text-xs text-on-surface-variant">Monthly Unlimited</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8e24aa] border border-[#8e24aa]/30 bg-[#8e24aa]/10 rounded-full flex items-center gap-1.5 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8e24aa]"></div> Purple Belt
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">2 days ago</td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Undo</button>
                  </td>
               </tr>

               {/* Not Checked In */}
               <tr className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4">
                     <div className="w-6 h-6 rounded border-2 border-surface-variant flex items-center justify-center text-transparent hover:border-primary transition-colors cursor-pointer">
                        <Check className="w-4 h-4" />
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface">ST</div>
                        <div>
                           <div className="font-bold text-on-surface mb-0.5">Sarah Thompson</div>
                           <div className="text-xs text-on-surface-variant">Drop-in</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1e88e5] border border-[#1e88e5]/30 bg-[#1e88e5]/10 rounded-full flex items-center gap-1.5 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e88e5]"></div> Blue Belt
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">1 week ago</td>
                  <td className="px-6 py-4 text-right">
                     <button className="bg-surface border border-surface-container-high px-3 py-1.5 text-xs font-bold rounded hover:bg-surface-container transition-colors text-on-surface">Check In</button>
                  </td>
               </tr>

               {/* Issue */}
               <tr className="bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <td className="px-6 py-4">
                     <AlertCircle className="w-6 h-6 text-red-500" />
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface">AL</div>
                        <div>
                           <div className="font-bold text-on-surface mb-0.5">Alex Lee</div>
                           <div className="text-xs text-red-400 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Payment Overdue
                           </div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface border border-surface-container-high bg-on-surface/5 rounded-full flex items-center gap-1.5 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div> White Belt
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">2 weeks ago</td>
                  <td className="px-6 py-4 text-right">
                     <button className="bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-3 py-1.5 text-xs rounded hover:bg-red-500/20 transition-colors">Resolve</button>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}
