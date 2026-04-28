import { Search, Filter, MoreVertical, Plus, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Instructors() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-surface-container-high pb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-1">Staff & Instructors</h2>
          <p className="text-sm text-on-surface-variant">Manage your team, roles, and system permissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors">
           <UserPlus className="w-4 h-4" /> Invite Staff Member
        </button>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
         <div className="p-4 border-b border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container/30">
            <div className="flex items-center gap-2">
               <Filter className="w-4 h-4 text-on-surface-variant" />
               <select className="bg-transparent border-none text-sm text-on-surface outline-none focus:ring-0 font-medium">
                 <option>All Roles</option>
                 <option>Owner</option>
                 <option>Admin</option>
                 <option>Instructor</option>
                 <option>Desk</option>
               </select>
            </div>
            <div className="relative">
               <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Find by name..." 
                 className="bg-surface border border-surface-container-high rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none w-64 transition-colors"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-surface-container/50 border-b border-surface-container-high">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Member Details</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Primary Role</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Assigned Classes</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Access Level</th>
                     <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-surface-container">
                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <Link to="/app/instructors/marcus" className="flex items-center gap-4 group">
                          <img src="https://i.pravatar.cc/100?img=11" alt="Marcus" className="w-12 h-12 rounded bg-surface-container-high border border-surface-container-highest object-cover" />
                          <div>
                             <div className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">Marcus Vance</div>
                             <div className="text-sm text-on-surface-variant">marcus@academyos.com</div>
                          </div>
                       </Link>
                     </td>
                     <td className="px-6 py-5 text-sm text-on-surface">Head Instructor & Owner</td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          14 / week
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-primary/30 text-primary bg-primary/5 rounded">Owner</span>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="text-on-surface-variant hover:text-on-surface p-1">
                           <MoreVertical className="w-5 h-5" />
                        </button>
                     </td>
                  </tr>

                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-surface-container-high border border-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">SH</div>
                          <div>
                             <div className="font-bold text-base text-on-surface">Sarah Hayes</div>
                             <div className="text-sm text-on-surface-variant">sarah.h@academyos.com</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5 text-sm text-on-surface">General Manager</td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          0 / week
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-on-surface-variant/30 text-on-surface-variant bg-surface-container rounded">Admin</span>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="text-on-surface-variant hover:text-on-surface p-1">
                           <MoreVertical className="w-5 h-5" />
                        </button>
                     </td>
                  </tr>

                  <tr className="hover:bg-surface-container/30 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <img src="https://i.pravatar.cc/100?img=5" alt="Elena" className="w-12 h-12 rounded bg-surface-container-high border border-surface-container-highest object-cover grayscale" />
                          <div>
                             <div className="font-bold text-base text-on-surface">Elena Rostova</div>
                             <div className="text-sm text-on-surface-variant">elena@academyos.com</div>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5 text-sm text-on-surface">Striking Coach</td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          8 / week
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-on-surface-variant/30 text-on-surface-variant bg-surface-container rounded">Instructor</span>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="text-on-surface-variant hover:text-on-surface p-1">
                           <MoreVertical className="w-5 h-5" />
                        </button>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
