import { Users, Layers, Verified, User, TrendingUp, Filter, Printer, ArrowRight } from 'lucide-react';

export default function Programs() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-1">Programs & Belt Tracking</h2>
          <p className="text-base text-on-surface-variant">Monitor progression and manage curriculum across all disciplines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-transparent border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider rounded-lg px-4 py-2 hover:bg-surface-container transition-colors">
            Manage Ranks
          </button>
          <button className="bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider rounded-lg px-4 py-2 shadow-[0_0_15px_rgba(197,160,68,0.2)] hover:shadow-[0_0_20px_rgba(197,160,68,0.4)] transition-all">
            New Program
          </button>
        </div>
      </div>

      {/* Stats Overview Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Users className="w-24 h-24 stroke-[1]" />
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Total Practitioners</span>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-on-surface">342</span>
            <span className="text-sm font-medium text-emerald-500 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> +12 this month
            </span>
          </div>
        </div>
        
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Layers className="w-24 h-24 stroke-[1]" />
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Active Programs</span>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-on-surface">6</span>
          </div>
        </div>
        
        <div className="bg-surface-container-low border border-primary/30 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_30px_rgba(197,160,68,0.05)]">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
             <Verified className="w-24 h-24 stroke-[1] text-primary" fill="currentColor" />
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Pending Promotions</span>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-on-surface">14</span>
            <span className="text-sm font-medium text-on-surface-variant mb-2">Ready for evaluation</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        
        {/* Left Col: Programs List */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-on-surface">Curriculum Tracks</h3>
            <button className="text-primary hover:text-primary-fixed transition-colors text-xs font-bold uppercase tracking-wider">View All</button>
          </div>
          
          {/* Program Card 1 */}
          <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 hover:border-surface-variant transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-display text-2xl font-bold text-on-surface mb-1">Adult BJJ Fundamentals</h4>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <User className="w-4 h-4" /> Head Instructor: Prof. Silva
                </p>
              </div>
              <div className="bg-surface-container py-1 px-3 rounded-full border border-surface-container-high flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background rounded-lg p-3 border border-surface-container-highest">
                <span className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Enrolled Students</span>
                <span className="text-xl font-bold text-on-surface">128</span>
              </div>
              <div className="bg-background rounded-lg p-3 border border-surface-container-highest">
                <span className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Next Grading</span>
                <span className="text-xl font-bold text-on-surface">Oct 15</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cohort Progression</span>
                <span className="text-xs font-bold text-primary">65% Readiness</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Program Card 2 */}
          <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 hover:border-surface-variant transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-display text-2xl font-bold text-on-surface mb-1">Advanced No-Gi</h4>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <User className="w-4 h-4" /> Head Instructor: Coach Martinez
                </p>
              </div>
              <div className="bg-surface-container py-1 px-3 rounded-full border border-surface-container-high flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Active</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background rounded-lg p-3 border border-surface-container-highest">
                <span className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Enrolled Students</span>
                <span className="text-xl font-bold text-on-surface">64</span>
              </div>
              <div className="bg-background rounded-lg p-3 border border-surface-container-highest">
                <span className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Next Grading</span>
                <span className="text-xl font-bold text-on-surface">Nov 02</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cohort Progression</span>
                <span className="text-xs font-bold text-primary">42% Readiness</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full opacity-80" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Belt Distribution & Mini tasks */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           <h3 className="text-xl font-bold text-on-surface mb-2">Academy Belt Distribution</h3>
           
           <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex-1 flex flex-col">
              <div className="space-y-5">
                {/* Belt Item 1 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-tertiary-fixed border border-surface-container-highest"></div>
                      <span className="text-sm font-medium text-on-surface">White Belt</span>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">145</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-tertiary-fixed h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                {/* Belt Item 2 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#1e88e5] border border-surface-container-highest"></div>
                      <span className="text-sm font-medium text-on-surface">Blue Belt</span>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">98</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-[#1e88e5] h-2 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
                
                {/* Belt Item 3 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#8e24aa] border border-surface-container-highest"></div>
                      <span className="text-sm font-medium text-on-surface">Purple Belt</span>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">42</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-[#8e24aa] h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                {/* Belt Item 4 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#6d4c41] border border-surface-container-highest"></div>
                      <span className="text-sm font-medium text-on-surface">Brown Belt</span>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">21</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-[#6d4c41] h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                
                {/* Belt Item 5 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-black border border-[#444]"></div>
                      <span className="text-sm font-medium text-on-surface">Black Belt</span>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant">6</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                    <div className="bg-black border border-[#444] h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-surface-container-high">
                 <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Quick Actions</h4>
                 <button className="w-full bg-transparent border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider rounded-lg px-4 py-2 hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                   <Printer className="w-4 h-4" /> Print Belt Certificates
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Promotion Candidates Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-on-surface">Promotion Candidates</h3>
          <div className="flex gap-2">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded bg-surface-container-low border border-surface-container-high">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high bg-surface-container/50">
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Program</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Current Rank</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Readiness</th>
                  <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyT7ENeqasri8b3AAbUp1RkCMM_58TUSewEAOwnB_elJz2XWvddNI5LMQ3HzGs_bovJk4FRp9GWVXG5c1SArU61DzCMM_M9SSq8htUzDtmcePynyBx84U-poAukGrgWpQsF0ec4eMXeZ-oAAMR66Oxh-akk54gb6OGRpdd-LcEzkmdxsccaOuUR2XcgaxFO3tCCGD1TLpyKHMiXZOjCRxrrohWVRrVQxgjG6MbI8cdivOg9Rc8yXohZyr_r7cFg4fggUAnMaLtQg" alt="Student" className="w-8 h-8 rounded-full border border-surface-container-high object-cover" />
                      <div>
                        <p className="text-sm font-medium text-on-surface">Marcus Johnson</p>
                        <p className="text-xs text-on-surface-variant">120 Classes Attended</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">Adult Fundamentals</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-1 rounded-full border border-tertiary-fixed text-tertiary-fixed text-[10px] font-bold tracking-widest uppercase bg-tertiary-fixed/10">White Belt</span>
                       <ArrowRight className="w-4 h-4 text-on-surface-variant" />
                       <span className="px-2 py-1 rounded-full border border-[#1e88e5] text-[#1e88e5] text-[10px] font-bold tracking-widest uppercase bg-[#1e88e5]/10">Blue Belt</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-primary">98%</span>
                       <div className="w-16 bg-surface-container rounded-full h-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: '98%' }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider rounded px-3 py-1.5 hover:brightness-110 transition-colors">Approve</button>
                  </td>
                </tr>
                
                {/* Row 2 */}
                <tr className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoioxQv623VydpyH1KbQJNtpmndbGsZ4v8nM0nbnGRVhbyF2kfywZ3FlfaVHQJmiiiAE8DwvoH5kkvmiIR4UPEV1S_vkUlu7LC4jjvdI6nW5IGbGWa0W7ECnRk-BEBjnyI8iXB1mfLd9QGx0eVzxSfYnx3vbTFLjLZygcB7gLfeOJ8iDJccKo9LLDU3bvIhWtTJ57ZJboKI9PPaXy8mEpv1H-5qHU4KUTg2NX5vmrdctrOCTTQ6EOR5nmxkRRgXRIqSdLSqd01hw" alt="Student" className="w-8 h-8 rounded-full border border-surface-container-high object-cover" />
                      <div>
                        <p className="text-sm font-medium text-on-surface">Sarah Jenkins</p>
                        <p className="text-xs text-on-surface-variant">215 Classes Attended</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">Advanced No-Gi</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-1 rounded-full border border-[#1e88e5] text-[#1e88e5] text-[10px] font-bold tracking-widest uppercase bg-[#1e88e5]/10">Blue Belt</span>
                       <ArrowRight className="w-4 h-4 text-on-surface-variant" />
                       <span className="px-2 py-1 rounded-full border border-[#8e24aa] text-[#8e24aa] text-[10px] font-bold tracking-widest uppercase bg-[#8e24aa]/10">Purple Belt</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-primary">95%</span>
                       <div className="w-16 bg-surface-container rounded-full h-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: '95%' }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider rounded px-3 py-1.5 hover:brightness-110 transition-colors">Approve</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
