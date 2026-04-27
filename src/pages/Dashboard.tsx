import { 
  Plus, Users, UserPlus, UserMinus, TrendingUp,
  MoreHorizontal, Verified, UserCheck, Cake
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Jan', value: 10 },
  { name: 'Feb', value: 15 },
  { name: 'Mar', value: 12 },
  { name: 'Apr', value: 25 },
  { name: 'May', value: 35 },
  { name: 'Jun', value: 45 },
];

export default function Dashboard() {
  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-2 gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">Overview</h2>
          <p className="text-secondary mt-1">Here's what's happening at your academy today.</p>
        </div>
        <button className="bg-primary-container text-on-primary-container font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-lg hover:brightness-110 transition-all flex items-center gap-2">
           <Plus className="w-5 h-5" />
           NEW MEMBER
        </button>
      </div>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-secondary uppercase tracking-wider font-semibold">Active Students</span>
            <Users className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-3">
             <span className="font-display text-4xl font-bold text-on-surface">342</span>
             <span className="text-sm font-medium text-emerald-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> 12%
             </span>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-secondary uppercase tracking-wider font-semibold">New This Month</span>
             <UserPlus className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-3">
             <span className="font-display text-4xl font-bold text-on-surface">28</span>
             <span className="text-sm font-medium text-emerald-500 flex items-center">
               <TrendingUp className="w-4 h-4 mr-1" /> 5%
             </span>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-secondary uppercase tracking-wider font-semibold">Lost Members</span>
             <UserMinus className="w-5 h-5 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-3">
             <span className="font-display text-4xl font-bold text-on-surface">4</span>
             <span className="text-sm font-medium text-red-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" /> 2%
             </span>
          </div>
        </div>
        
        {/* Card 4 */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between h-[140px] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs text-primary uppercase tracking-wider font-semibold">Net Growth</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-display text-4xl font-bold text-primary">8.5</span>
            <span className="text-xl font-bold text-primary">%</span>
          </div>
        </div>
      </div>
      
      {/* Bento Layout Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Chart Panel */}
        <div className="col-span-12 xl:col-span-8 bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-on-surface">Membership Growth</h3>
             <div className="flex gap-2 bg-surface-container rounded-lg p-1 border border-surface-container-high">
                <button className="px-3 py-1 rounded-md text-xs font-semibold bg-surface-bright text-on-surface">6M</button>
                <button className="px-3 py-1 rounded-md text-xs font-semibold text-secondary hover:text-on-surface transition-colors">1Y</button>
                <button className="px-3 py-1 rounded-md text-xs font-semibold text-secondary hover:text-on-surface transition-colors">ALL</button>
             </div>
          </div>
          <div className="flex-1 w-full relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
        
        {/* Upcoming Classes Panel */}
        <div className="col-span-12 xl:col-span-4 bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-on-surface">Upcoming Classes</h3>
             <button className="text-secondary hover:text-on-surface transition-colors">
               <MoreHorizontal className="w-5 h-5" />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             <div className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-surface-container-high hover:bg-surface-container transition-colors group cursor-pointer">
               <div className="w-12 h-12 rounded-lg bg-surface-container flex flex-col items-center justify-center border border-surface-variant flex-shrink-0">
                 <span className="text-xs font-bold text-primary">17:00</span>
               </div>
               <div className="flex-1 overflow-hidden">
                 <h4 className="text-base font-medium text-on-surface group-hover:text-primary transition-colors truncate">BJJ Fundamentals</h4>
                 <p className="text-sm text-secondary truncate">Prof. Silva • 24 Registered</p>
               </div>
             </div>
             
             <div className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-surface-container-high hover:bg-surface-container transition-colors group cursor-pointer">
               <div className="w-12 h-12 rounded-lg bg-surface-container flex flex-col items-center justify-center border border-surface-variant flex-shrink-0">
                 <span className="text-xs font-bold text-primary">18:30</span>
               </div>
               <div className="flex-1 overflow-hidden">
                 <h4 className="text-base font-medium text-on-surface group-hover:text-primary transition-colors truncate">Muay Thai Sparring</h4>
                 <p className="text-sm text-secondary truncate">Coach Davis • 18 Registered</p>
               </div>
             </div>
             
             <div className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-surface-container-high hover:bg-surface-container transition-colors group cursor-pointer">
               <div className="w-12 h-12 rounded-lg bg-surface-container flex flex-col items-center justify-center border border-surface-variant flex-shrink-0">
                 <span className="text-xs font-bold text-secondary">19:45</span>
               </div>
               <div className="flex-1 overflow-hidden">
                 <h4 className="text-base font-medium text-on-surface truncate">Open Mat</h4>
                 <p className="text-sm text-secondary truncate">All Instructors • No Limit</p>
               </div>
             </div>
           </div>
           
           <button className="w-full mt-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-secondary hover:text-on-surface border border-surface-container-high rounded-lg hover:bg-surface-container transition-colors">
             VIEW SCHEDULE
           </button>
        </div>
        
        {/* Recent Activity Panel */}
        <div className="col-span-12 xl:col-span-6 bg-surface-container-low border border-surface-container-high rounded-xl p-6">
           <h3 className="text-xl font-bold text-on-surface mb-6">Recent Activity</h3>
           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-container-high before:to-transparent">
             
             {/* Activity 1 */}
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
               <div className="flex items-center justify-center w-10 h-10 rounded-full border border-surface-container-high bg-surface-container text-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 group-hover:border-primary group-hover:text-primary transition-colors">
                 <Verified className="w-5 h-5" />
               </div>
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="text-sm font-semibold text-on-surface">Belt Promotion</div>
                    <time className="text-xs text-tertiary">2 hrs ago</time>
                  </div>
                  <div className="text-sm text-secondary">Marcus Johnson promoted to Blue Belt.</div>
               </div>
             </div>
             
             {/* Activity 2 */}
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
               <div className="flex items-center justify-center w-10 h-10 rounded-full border border-surface-container-high bg-surface-container text-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 group-hover:border-primary group-hover:text-primary transition-colors">
                 <UserCheck className="w-5 h-5" />
               </div>
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-surface-container-high bg-surface-container-lowest hover:bg-surface-container transition-colors">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="text-sm font-semibold text-on-surface">New Signup</div>
                    <time className="text-xs text-tertiary">4 hrs ago</time>
                  </div>
                  <div className="text-sm text-secondary">Sarah Connor joined Unlimited Plan.</div>
               </div>
             </div>
             
           </div>
        </div>
        
        {/* Birthdays Panel */}
        <div className="col-span-12 xl:col-span-6 bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-on-surface">Birthdays This Week</h3>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Bday 1 */}
             <div className="flex items-center gap-3 p-3 border border-surface-container-high rounded-lg bg-surface">
                <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden flex-shrink-0">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_hQB3MdS8J4HhgO0yViN6utL7MZP7fi4Si1YP57OC_FnW03Qp76MDUuJg5APIiHb6nQAnq_YMhIVlFDpd1jtFCtCgt8zD1WUP0CzNZw4ROw7VfHstQYakkF8-yGxydBnH44n2co4A0wmEv_yBHoXWABwS1wyiOkgwaQ_qJ2TB_1sbGHI2Lp7T7ygfhFM2HE9hiZup27jeT0ruE5N69QYBaTUKJnedqrH6aRg9C2TvxWhox4cSJ03VlHOoF2SBn01glzwzPKZW-g" className="w-full h-full object-cover" alt="Student" />
                </div>
                <div className="overflow-hidden">
                   <h4 className="text-base font-medium text-on-surface truncate">Elena R.</h4>
                   <p className="text-xs font-semibold text-primary truncate">Today • Turning 24</p>
                </div>
             </div>
             {/* Bday 2 */}
             <div className="flex items-center gap-3 p-3 border border-surface-container-high rounded-lg bg-surface">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm font-semibold text-secondary flex-shrink-0">
                  TJ
                </div>
                <div className="overflow-hidden">
                   <h4 className="text-base font-medium text-on-surface truncate">Tom J.</h4>
                   <p className="text-xs font-semibold text-secondary truncate">Tomorrow • Turning 31</p>
                </div>
             </div>
             {/* Bday 3 */}
             <div className="flex items-center gap-3 p-3 border border-surface-container-high rounded-lg bg-surface opacity-75">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm font-semibold text-secondary flex-shrink-0">
                  AL
                </div>
                <div className="overflow-hidden">
                   <h4 className="text-base font-medium text-on-surface truncate">Alex L.</h4>
                   <p className="text-xs font-semibold text-tertiary truncate">Friday • Turning 19</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
