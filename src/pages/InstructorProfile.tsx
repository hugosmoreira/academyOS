import { Mail, Edit3, MapPin, Calendar, TrendingUp, Award, FileText } from 'lucide-react';

export default function InstructorProfile() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      
      {/* Header Profile Card */}
      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden shrink-0 shadow-[0_0_20px_rgba(233,194,98,0.2)]">
               <img src="https://i.pravatar.cc/150?img=11" alt="Marcus" className="w-full h-full object-cover" />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-display font-bold text-on-surface">Marcus Silva</h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-on-surface-variant border border-surface-container-highest bg-surface rounded-full flex items-center gap-1.5 uppercase tracking-widest">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div> 3rd Degree
                  </span>
               </div>
               <p className="text-lg text-on-surface-variant mb-2">Head Instructor - Brazilian Jiu-Jitsu</p>
               <div className="flex items-center gap-1.5 text-sm text-surface-variant font-medium">
                  <MapPin className="w-4 h-4" /> Main Academy HQ
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3 relative z-10">
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-container-highest bg-surface text-on-surface font-semibold text-sm rounded-lg hover:bg-surface-container transition-colors">
               <Mail className="w-4 h-4" /> Message
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary-fixed font-bold text-sm rounded-lg hover:brightness-110 transition-colors shadow-sm">
               <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         
         {/* Left Col: Stats */}
         <div className="md:col-span-4 flex flex-col gap-6">
            
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
               <Calendar className="absolute top-6 right-6 w-12 h-12 text-surface-variant opacity-10" />
               <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">TOTAL CLASSES TAUGHT</div>
               <div className="text-5xl font-display font-bold text-on-surface mb-2">1,248</div>
               <div className="text-xs font-bold text-primary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12 this month
               </div>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
               <TrendingUp className="absolute top-6 right-6 w-12 h-12 text-surface-variant opacity-10" />
               <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">AVG. ATTENDANCE RATE</div>
               <div className="flex items-baseline gap-1 mb-2">
                 <span className="text-5xl font-display font-bold text-on-surface">94</span>
                 <span className="text-xl font-bold text-on-surface">%</span>
               </div>
               <div className="text-xs font-medium text-on-surface-variant">Across all assigned classes</div>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 relative overflow-hidden">
               <Award className="absolute top-6 right-6 w-12 h-12 text-surface-variant opacity-10" />
               <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">STUDENTS PROMOTED</div>
               <div className="text-5xl font-display font-bold text-on-surface mb-2">156</div>
               <div className="text-xs font-medium text-on-surface-variant">Lifetime metric</div>
            </div>

         </div>

         {/* Right Col: Bio & Classes */}
         <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Bio */}
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
               <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface mb-4">
                 <FileText className="w-5 h-5 text-primary" /> Instructor Biography
               </h3>
               <div className="text-on-surface-variant text-[15px] leading-relaxed space-y-4">
                  <p>Professor Marcus Silva brings over 15 years of competitive and instructional experience to AcademyOS. Originally hailing from São Paulo, Brazil, he achieved his black belt under the renowned CheckMat affiliation before relocating to establish a premier training curriculum here.</p>
                  <p>His teaching philosophy emphasizes technical precision, conceptual understanding, and a disciplined approach to both sport and self-defense aspects of Jiu-Jitsu. Professor Silva is dedicated to fostering a high-performance environment that remains accessible to practitioners of all levels.</p>
               </div>
            </div>

            {/* Assigned Classes */}
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
                    <Calendar className="w-5 h-5 text-primary" /> Assigned Classes
                  </h3>
                  <button className="text-primary text-xs font-bold uppercase tracking-wider hover:text-primary-fixed">View Full Schedule</button>
               </div>

               <div className="space-y-4">
                 
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-surface-container-highest bg-surface rounded-lg hover:border-surface-variant transition-colors">
                    <div>
                       <h4 className="font-bold text-on-surface text-base mb-1">Advanced BJJ (Gi)</h4>
                       <p className="text-sm text-on-surface-variant">Mondays, Wednesdays & Fridays</p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                       <div className="font-bold text-on-surface">18:30 - 20:00</div>
                       <div className="text-xs font-medium text-surface-variant uppercase tracking-widest mt-1">Mat 1</div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-surface-container-highest bg-surface rounded-lg hover:border-surface-variant transition-colors">
                    <div>
                       <h4 className="font-bold text-on-surface text-base mb-1">Fundamentals (No-Gi)</h4>
                       <p className="text-sm text-on-surface-variant">Tuesdays & Thursdays</p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                       <div className="font-bold text-on-surface">17:00 - 18:00</div>
                       <div className="text-xs font-medium text-surface-variant uppercase tracking-widest mt-1">Mat 2</div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-surface-container-highest bg-surface rounded-lg hover:border-surface-variant transition-colors">
                    <div>
                       <h4 className="font-bold text-on-surface text-base mb-1">Competition Team Training</h4>
                       <p className="text-sm text-on-surface-variant">Saturdays</p>
                    </div>
                    <div className="mt-2 sm:mt-0 text-left sm:text-right">
                       <div className="font-bold text-on-surface">10:00 - 12:00</div>
                       <div className="text-xs font-medium text-surface-variant uppercase tracking-widest mt-1">Main Mat</div>
                    </div>
                 </div>

               </div>
            </div>

         </div>
      </div>

    </div>
  );
}
