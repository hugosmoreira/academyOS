import { Search, ChevronLeft, ChevronRight, Award, ClipboardList, History, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Promotions() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Promotion Eligibility</h1>
          <p className="text-sm text-on-surface-variant">Review students who have met attendance and time-in-rank requirements.</p>
        </div>
        <button className="flex items-center gap-2 bg-surface border border-surface-container-high text-on-surface hover:bg-surface-container font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-colors">
           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export Roster
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
            <Award className="absolute top-6 right-6 w-12 h-12 text-surface-variant opacity-10" />
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">READY TO PROMOTE</div>
            <div className="flex items-baseline gap-2 mb-2">
               <span className="text-5xl font-display font-bold text-primary">18</span>
               <span className="text-lg text-on-surface-variant">students</span>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
               +3 from last week
            </div>
         </div>

         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
            <ClipboardList className="absolute top-6 right-6 w-12 h-12 text-surface-variant opacity-10" />
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">PENDING INSTRUCTOR REVIEW</div>
            <div className="flex items-baseline gap-2 mb-2">
               <span className="text-5xl font-display font-bold text-on-surface">7</span>
               <span className="text-lg text-on-surface-variant">requires approval</span>
            </div>
            <div className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Review by Friday
            </div>
         </div>

         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
            <History className="absolute top-6 right-6 w-12 h-12 text-surface-variant opacity-10" />
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">PROMOTED THIS MONTH</div>
            <div className="flex items-baseline gap-2 mb-2">
               <span className="text-5xl font-display font-bold text-on-surface">24</span>
               <span className="text-lg text-on-surface-variant">total</span>
            </div>
            <div className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> System updated
            </div>
         </div>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
         <div className="p-4 border-b border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container/30">
            <div className="flex items-center gap-3">
               <select className="bg-surface border border-surface-container-high rounded-lg text-sm text-on-surface px-3 py-2 outline-none focus:border-primary">
                 <option>All Programs</option>
                 <option>Brazilian Jiu-Jitsu</option>
                 <option>Muay Thai</option>
               </select>
               <select className="bg-surface border border-surface-container-high rounded-lg text-sm text-on-surface px-3 py-2 outline-none focus:border-primary">
                 <option>All Ranks</option>
               </select>
            </div>
            <div className="relative">
               <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search student name..." 
                 className="bg-surface border border-surface-container-high rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none w-64 transition-colors"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-surface-container/50 border-b border-surface-container-high">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Student</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Program & Current Rank</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Time In Rank</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Attendance</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Instructor Approval</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-surface-container">
                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border border-surface-container-highest object-cover" />
                          <div>
                             <div className="font-bold text-base text-on-surface">Sarah Jenkins</div>
                             <div className="text-xs text-on-surface-variant">ID: #8492</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="text-sm text-on-surface mb-1">Brazilian Jiu-Jitsu</div>
                       <div className="px-3 py-1 border border-[#1e88e5] rounded-full text-xs font-semibold text-on-surface flex items-center gap-2 w-fit">
                          <div className="w-2 h-2 rounded-full bg-[#1e88e5]"></div> Blue Belt (3 Stripes)
                       </div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-lg font-bold text-on-surface">14</div>
                        <div className="text-[10px] uppercase text-on-surface-variant tracking-wider">Months</div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-base font-bold text-on-surface">156 / 120</div>
                        <div className="text-[10px] uppercase text-primary font-bold tracking-wider">Requirement Met</div>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ml-auto shadow-sm">
                           Promote <ArrowRight className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>

                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border border-surface-container-highest object-cover" />
                          <div>
                             <div className="font-bold text-base text-on-surface">Marcus Wright</div>
                             <div className="text-xs text-on-surface-variant">ID: #9102</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="text-sm text-on-surface mb-1">Brazilian Jiu-Jitsu</div>
                       <div className="px-3 py-1 border border-surface-container-high rounded-full text-xs font-semibold text-on-surface flex items-center gap-2 w-fit">
                          <div className="w-2 h-2 rounded-full bg-white border border-surface-container"></div> White Belt (4 Stripes)
                       </div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-lg font-bold text-on-surface">18</div>
                        <div className="text-[10px] uppercase text-on-surface-variant tracking-wider">Months</div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-base font-bold text-on-surface">210 / 180</div>
                        <div className="text-[10px] uppercase text-primary font-bold tracking-wider">Requirement Met</div>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ml-auto shadow-sm">
                           Promote <ArrowRight className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>

                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full border border-surface-container-highest object-cover" />
                          <div>
                             <div className="font-bold text-base text-on-surface">Elena Rodriguez</div>
                             <div className="text-xs text-on-surface-variant">ID: #4021</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="text-sm text-on-surface mb-1">Muay Thai Advanced</div>
                       <div className="px-3 py-1 border border-surface-container-high rounded-full text-xs font-semibold text-on-surface flex items-center gap-2 w-fit">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div> Level 3 (Purple)
                       </div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-lg font-bold text-on-surface">11</div>
                        <div className="text-[10px] uppercase text-on-surface-variant tracking-wider">Months</div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-base font-bold text-on-surface">105 / 100</div>
                        <div className="text-[10px] uppercase text-primary font-bold tracking-wider">Requirement Met</div>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex flex-col items-center">
                           <div className="w-6 h-6 rounded-full border border-surface-container-high flex items-center justify-center mb-1">
                              <svg className="w-4 h-4 text-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                           </div>
                           <span className="text-[10px] text-on-surface-variant">Pending</span>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="bg-transparent border border-surface-container-highest text-on-surface hover:bg-surface-container px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ml-auto transition-colors">
                           Request Review
                        </button>
                     </td>
                  </tr>

                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-on-surface-variant bg-surface-container-highest border border-surface-container-highest">JT</div>
                          <div>
                             <div className="font-bold text-base text-on-surface">James Thompson</div>
                             <div className="text-xs text-on-surface-variant">ID: #1042</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="text-sm text-on-surface mb-1">Kids Martial Arts</div>
                       <div className="px-3 py-1 border border-surface-container-high rounded-full text-xs font-semibold text-on-surface flex items-center gap-2 w-fit">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-white to-yellow-500 border border-surface-variant"></div> White/Yellow Belt
                       </div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-lg font-bold text-on-surface">4</div>
                        <div className="text-[10px] uppercase text-on-surface-variant tracking-wider">Months</div>
                     </td>
                     <td className="px-6 py-5 text-center">
                        <div className="text-base font-bold text-on-surface">32 / 30</div>
                        <div className="text-[10px] uppercase text-primary font-bold tracking-wider">Requirement Met</div>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 text-sm font-bold rounded flex items-center gap-2 ml-auto shadow-sm">
                           Promote <ArrowRight className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>

               </tbody>
            </table>
         </div>

         {/* Pagination Footer */}
         <div className="p-4 border-t border-surface-container-high flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Showing 1 to 4 of 18 entries</span>
            <div className="flex items-center gap-1">
               <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <ChevronLeft className="w-4 h-4" />
               </button>
               <button className="w-8 h-8 rounded bg-surface-container text-on-surface font-medium text-sm flex items-center justify-center">1</button>
               <button className="w-8 h-8 rounded text-on-surface-variant hover:bg-surface-container/50 font-medium text-sm flex items-center justify-center transition-colors">2</button>
               <button className="w-8 h-8 rounded text-on-surface-variant hover:bg-surface-container/50 font-medium text-sm flex items-center justify-center transition-colors">3</button>
               <button className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
