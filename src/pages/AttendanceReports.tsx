import { Download, Users, UserCheck, AlertTriangle, MessageSquare, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const chartData = [
  { name: 'MON', value: 10 },
  { name: 'TUE', value: 15 },
  { name: 'WED', value: 20 },
  { name: 'THU', value: 25 },
  { name: 'FRI', value: 18 },
  { name: 'SAT', value: 30 },
];

const missedAlerts = [
  { initials: 'JD', name: 'John Doe', days: 15 },
  { img: 'https://i.pravatar.cc/100?img=5', name: 'Sarah Smith', days: 18 },
  { initials: 'MJ', name: 'Mike Johnson', days: 21 },
  { initials: 'AT', name: 'Alex Turner', days: 24 },
];

export default function AttendanceReports() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-1">Attendance Reports</h2>
          <p className="text-on-surface-variant text-sm">Monitor class engagement and student retention.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface-container border border-surface-container-high rounded-lg p-1 flex">
             <button className="px-4 py-1.5 text-sm font-medium text-on-surface bg-surface-container-high rounded-md">Overview</button>
             <button className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">By Class</button>
             <button className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface">By Student</button>
          </div>
          <button className="bg-primary text-on-primary-fixed hover:brightness-110 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
            <div className="flex items-start justify-between mb-2">
               <span className="text-secondary text-sm font-medium">Total Check-ins (30d)</span>
               <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-display font-bold text-on-surface mb-2">1,248</div>
            <div className="text-xs font-medium text-primary flex items-center gap-1">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
               +12% from last month
            </div>
         </div>
         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
            <div className="flex items-start justify-between mb-2">
               <span className="text-secondary text-sm font-medium">Avg. Daily Attendance</span>
               <Users className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-4xl font-display font-bold text-on-surface mb-2">42</div>
            <div className="text-xs font-medium text-on-surface-variant">
               Consistent with 90-day average
            </div>
         </div>
         <div className="bg-[#1a1111] border-l-4 border-l-red-500 border border-y-red-900/30 border-r-red-900/30 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(239,68,68,0.02)]">
            <div className="flex items-start justify-between mb-2">
               <span className="text-red-300 text-sm font-medium">At-Risk Students (14+ Days)</span>
               <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-4xl font-display font-bold text-red-400 mb-2">18</div>
            <div className="text-xs font-medium text-red-400/80">
               Requires immediate follow-up
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
         <div className="xl:col-span-2 bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-xl font-bold text-on-surface">Popular Class Times</h3>
                 <p className="text-sm text-on-surface-variant mt-1">Average attendance by hour over the last 30 days.</p>
               </div>
               <select className="bg-surface border border-surface-container-high text-on-surface text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
                 <option>All Programs</option>
               </select>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#353534" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#c8c6c5', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#c8c6c5', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#2a2a2a' }} 
                    contentStyle={{ backgroundColor: '#1c1b1b', border: '1px solid #353534', borderRadius: '8px' }}
                    itemStyle={{ color: '#e9c262' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#e9c262" 
                    radius={[4, 4, 0, 0]} 
                    opacity={0.8}
                    activeBar={{ opacity: 1, filter: 'drop-shadow(0 0 8px rgba(233,194,98,0.4))' }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
                 Missed Alerts 
                 <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">14+ Days</span>
               </h3>
               <Link to="#" className="text-primary text-xs font-bold uppercase tracking-wider hover:text-primary-fixed">View All</Link>
            </div>
            <div className="space-y-4 flex-1">
               {missedAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface border border-surface-container-highest rounded-lg">
                     <div className="flex items-center gap-3">
                        {alert.img ? (
                           <img src={alert.img} alt={alert.name} className="w-10 h-10 rounded-full object-cover border border-surface-container-high" />
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant font-bold text-sm flex items-center justify-center border border-surface-variant">
                             {alert.initials}
                           </div>
                        )}
                        <div>
                           <div className="text-sm font-medium text-on-surface">{alert.name}</div>
                           <div className="text-xs text-red-400">{alert.days} days absent</div>
                        </div>
                     </div>
                     <button className="text-on-surface-variant hover:text-on-surface p-2 border border-surface-container-high rounded-md hover:bg-surface-container transition-colors">
                        <MessageSquare className="w-4 h-4" />
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
         <div className="p-6 border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h3 className="text-xl font-bold text-on-surface">Student Directory</h3>
               <p className="text-sm text-on-surface-variant mt-1">Detailed attendance logs and frequency.</p>
            </div>
            <div className="flex gap-3 items-center">
               <div className="relative">
                 <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                 <input type="text" placeholder="Search student name..." className="bg-surface border border-surface-container-high rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-64" />
               </div>
               <button className="p-2 border border-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                 <Filter className="w-4 h-4" />
               </button>
            </div>
         </div>
         <table className="w-full text-left">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
               <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rank/Belt</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Last Attended</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Frequency (30d)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
               <tr className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4">
                     <Link to="/app/attendance/class-1" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-medium text-on-surface-variant">EW</div>
                        <span className="font-medium text-on-surface group-hover:text-primary transition-colors">Emily White</span>
                     </Link>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1e88e5] border border-[#1e88e5]/30 bg-[#1e88e5]/10 rounded-full flex items-center gap-1.5 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e88e5]"></div> Blue
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">Today, 6:00 PM</td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                           <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-xs text-on-surface-variant">12 classes</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                     <button className="text-on-surface-variant hover:text-on-surface p-1">
                        <Eye className="w-4 h-4" />
                     </button>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
  );
}
