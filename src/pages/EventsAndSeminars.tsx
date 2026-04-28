import { Calendar, Clock, Edit, Download, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export default function EventsAndSeminars() {
  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      <div className="p-8 border-b border-surface-container-high shrink-0">
         <h1 className="text-3xl font-display font-bold text-on-surface mb-1">Events & Seminars</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Event List */}
        <div className="w-[380px] overflow-y-auto border-r border-surface-container-high p-6 space-y-4">
           {/* Event List Item 1 - Selected */}
           <div className="bg-surface-container-low border border-primary rounded-xl p-4 cursor-pointer relative shadow-[inset_0_0_20px_rgba(233,194,98,0.05)]">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
              <div className="flex justify-between items-start mb-2 pl-2">
                 <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Oct 15 • 10:00 AM</div>
                 <button className="text-on-surface-variant hover:text-on-surface"><MoreHorizontal className="w-4 h-4"/></button>
              </div>
              <h3 className="font-bold text-lg text-on-surface mb-4 pl-2">Black Belt Seminar</h3>
              <div className="flex items-center justify-between pl-2">
                 <div className="text-sm font-medium text-on-surface flex items-center gap-2">
                    <svg className="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    45 / 50 Filled
                 </div>
                 <div className="bg-surface-container border border-surface-container-highest px-2 py-1 rounded text-xs font-medium text-on-surface-variant">Closing Soon</div>
              </div>
           </div>

           {/* Event List Item 2 */}
           <div className="bg-surface border border-surface-container-highest hover:border-surface-variant rounded-xl p-4 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-2">
                 <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nov 02 • 09:00 AM</div>
              </div>
              <h3 className="font-bold text-lg text-on-surface mb-4">In-House Tournament</h3>
              <div className="flex items-center justify-between">
                 <div className="text-sm font-medium text-on-surface flex items-center gap-2">
                    <svg className="w-4 h-4 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    120 / 200 Filled
                 </div>
              </div>
           </div>

           {/* Event List Item 3 */}
           <div className="bg-opacity-50 bg-surface border border-surface-container-high rounded-xl p-4 cursor-pointer opacity-70">
              <div className="flex justify-between items-start mb-2">
                 <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Sep 10 • 14:00 PM</div>
                 <div className="bg-surface border border-surface-container-highest px-2 py-0.5 rounded text-[10px] font-medium text-on-surface-variant">Completed</div>
              </div>
              <h3 className="font-bold text-lg text-on-surface mb-4 text-on-surface-variant line-through decoration-on-surface-variant/30">Fundamentals Workshop</h3>
              <div className="flex items-center justify-between">
                 <div className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    30 / 30 Filled
                 </div>
              </div>
           </div>
        </div>

        {/* Right Content Area - Event Details */}
        <div className="flex-1 overflow-y-auto p-12">
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex items-start justify-between">
                 <div>
                    <div className="flex items-center gap-4 text-sm font-semibold text-on-surface-variant mb-4">
                       <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs uppercase tracking-widest">Seminar</span>
                       <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Oct 15, 2023</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 10:00 AM - 2:00 PM</span>
                    </div>
                    <h2 className="text-4xl font-display font-bold text-on-surface">Black Belt Seminar</h2>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="bg-transparent border border-surface-container-high text-on-surface hover:bg-surface-container font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                       <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button className="bg-primary text-on-primary-fixed hover:brightness-110 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                       <Download className="w-4 h-4" /> Export Attendee List
                    </button>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Total Registrations</div>
                    <div className="flex items-baseline gap-2 mb-4">
                       <span className="text-5xl font-display font-bold text-on-surface">45</span>
                       <span className="text-lg font-medium text-on-surface-variant">/ 50</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 shrink-0 overflow-hidden">
                       <div className="bg-primary inset-y-0 left-0 h-full rounded-full w-[90%]"></div>
                    </div>
                 </div>

                 <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Revenue Collected</div>
                    <div className="flex items-baseline mb-4">
                       <span className="text-5xl font-display font-bold text-on-surface">$4,500</span>
                    </div>
                    <div className="text-sm font-medium text-primary flex items-center gap-1.5">
                       <CheckCircle2 className="w-4 h-4" /> All payments cleared
                    </div>
                 </div>

                 <div className="bg-surface border border-surface-container-high rounded-xl p-6">
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Location</div>
                    <div className="text-2xl font-bold text-on-surface mb-4">Main Dojo</div>
                    <button className="text-sm font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors">
                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                       View Floorplan
                    </button>
                 </div>
              </div>

              {/* Event Details Text */}
              <div>
                 <h3 className="text-lg font-bold text-on-surface mb-4">Event Details</h3>
                 <p className="text-on-surface-variant leading-relaxed">
                    An intensive 4-hour seminar focusing on advanced guard retention and submission chaining. Open exclusively to Purple belts and above. Professor Silva will cover curriculum updates for the upcoming competitive season. Ensure all attendees have signed the updated liability waiver prior to stepping on the mat.
                 </p>
              </div>

              {/* Registered Attendees */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-on-surface">Registered Attendees</h3>
                    <div className="relative">
                       <svg className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                       <input type="text" placeholder="Search attendees..." className="bg-surface border border-surface-container-highest rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none w-64 transition-colors" />
                    </div>
                 </div>

                 <div className="bg-surface-container border border-surface-container-highest rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-surface-container-high text-xs uppercase font-bold tracking-widest text-on-surface-variant border-b border-surface-container-highest">
                          <tr>
                             <th className="px-6 py-4">Student Name</th>
                             <th className="px-6 py-4">Rank</th>
                             <th className="px-6 py-4 text-center">Registration Date</th>
                             <th className="px-6 py-4 text-right">Payment Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-surface-container-highest">
                          <tr className="hover:bg-surface-container-high/50 transition-colors">
                             <td className="px-6 py-4 font-semibold text-on-surface flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs text-on-surface-variant border border-surface-container-high shrink-0">JS</div>
                                John Smith
                             </td>
                             <td className="px-6 py-4">
                                <span className="text-xs font-semibold px-2.5 py-1 border border-primary/50 text-primary rounded-full">Brown Belt</span>
                             </td>
                             <td className="px-6 py-4 text-center text-on-surface">Oct 01, 2023</td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-primary text-xs font-bold">
                                   <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                </div>
                             </td>
                          </tr>
                          <tr className="hover:bg-surface-container-high/50 transition-colors">
                             <td className="px-6 py-4 font-semibold text-on-surface flex items-center gap-3">
                                <img src="https://i.pravatar.cc/100?img=33" className="w-8 h-8 rounded-full border border-surface-container-high object-cover shrink-0" />
                                Maria Garcia
                             </td>
                             <td className="px-6 py-4">
                                <span className="text-xs font-semibold px-2.5 py-1 bg-[#1e88e5]/10 border border-[#1e88e5]/30 text-[#1e88e5] rounded-full">Blue Belt</span>
                             </td>
                             <td className="px-6 py-4 text-center text-on-surface">Oct 02, 2023</td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 text-primary text-xs font-bold">
                                   <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                </div>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
