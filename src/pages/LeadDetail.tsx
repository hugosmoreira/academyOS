import { MessageSquare, Phone, Mail, Calendar, Filter, Send, Plus, ArrowLeft, Activity, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LeadDetail() {
  return (
    <div className="flex-1 h-full flex flex-col bg-background">
      
      {/* Top action bar */}
      <div className="border-b border-surface-container-high bg-background sticky top-0 z-10">
        <div className="flex items-center gap-4 px-8 py-4">
          <Link to="/app/leads" className="text-on-surface-variant hover:text-on-surface p-1 transition-colors">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" className="w-14 h-14 rounded-full border-2 border-surface-container-high object-cover shadow-sm" />
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-display font-bold text-on-surface">Marcus Thorne</h1>
                    <span className="px-2 py-0.5 border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                       <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.284.446-.547.935-.8 1.436-.2.4-.38.804-.54 1.208-.07.175-.137.35-.2.525a1.868 1.868 0 01-.197.41c-.055.084-.111.168-.168.252a1.64 1.64 0 01-.284.34ch-.01a.347.347 0 01-.013.008l-.01.008a.5.5 0 01-.027.02l-.01.008a1.693 1.693 0 01-.264.152c-.085.04-.176.074-.27.106a1.9 1.9 0 01-.4.077c-.156.012-.319.006-.484-.012l-.023-.002-1.05-.12a1 1 0 00-1.07 1.25c.348 1.096.96 2.052 1.706 2.766a5.006 5.006 0 003.543 1.458 5.006 5.006 0 003.543-1.458 4.966 4.966 0 001.218-1.579c.12-.224.23-.453.328-.687a1.002 1.002 0 00-.518-1.28c-.287-.123-.623-.105-.887.052a3.003 3.003 0 01-1.066.388c-.37.054-.75.011-1.11-.137a2.028 2.028 0 01-.84-.57l-.016-.016a2.05 2.05 0 01-.367-.611c-.082-.206-.135-.42-.162-.64a1.986 1.986 0 01.05-.668c.036-.188.087-.373.155-.55.068-.178.15-.353.245-.521.14-.247.3-.483.475-.705.215-.27.45-.526.702-.758a1 1 0 00-.094-1.528z" clipRule="evenodd" /></svg>
                       HOT LEAD
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
                     <span className="flex items-center gap-1.5 border border-surface-container-high bg-surface-container px-2 py-0.5 rounded">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                        Facebook Campaign - "Summer Strong"
                     </span>
                     <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Added 2 days ago
                     </span>
                  </div>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-surface-container-highest text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors">
                   <MessageSquare className="w-4 h-4" /> Message
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary-fixed text-sm font-bold rounded-lg hover:brightness-110 transition-colors shadow-sm">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   Convert to Student
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col xl:flex-row gap-6 items-start">
         
         {/* Left Column */}
         <div className="w-full xl:w-[400px] flex flex-col gap-6">
            
            {/* Contact Details */}
            <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-6">
               <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface mb-6 border-b border-surface-container-high pb-4">
                 <FileText className="w-5 h-5 text-on-surface-variant" /> Contact Details
               </h3>
               
               <div className="space-y-5">
                 <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">EMAIL</span>
                    <p className="text-[15px] text-on-surface">marcus.thorne88@example.com</p>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">PHONE</span>
                    <p className="text-[15px] text-on-surface">+1 (555) 019-4822</p>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">PREFERS</span>
                    <div className="flex items-center gap-2 text-[15px] text-on-surface">
                       <MessageSquare className="w-4 h-4 text-on-surface-variant" /> Text Message
                    </div>
                 </div>
               </div>
            </div>

            {/* Trial Booking Widget */}
            <div className="bg-surface-container-low border border-primary/40 rounded-xl p-6 shadow-[inset_0_0_20px_rgba(233,194,98,0.05)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mt-8 -mr-8"></div>
               <div className="flex justify-between items-start mb-6 border-b border-surface-container px-2 pb-4 pt-1">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface relative z-10">
                    <Calendar className="w-5 h-5 text-primary" /> Trial Booking
                  </h3>
                  <span className="border border-surface-variant bg-surface text-on-surface text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded z-10 relative">SCHEDULED</span>
               </div>
               
               <div className="bg-background border border-surface-container-high rounded-lg p-5 mb-4 relative z-10">
                  <h4 className="font-bold text-on-surface text-[17px] mb-3">Intro to Muay Thai</h4>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
                     <Calendar className="w-4 h-4" /> Thursday, Oct 26th
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                     <Clock className="w-4 h-4" /> 6:00 PM - 7:00 PM
                  </div>
               </div>
               
               <button className="w-full bg-transparent border border-surface-variant text-on-surface hover:bg-surface-container font-semibold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors relative z-10">
                  Reschedule Trial
               </button>
            </div>
         </div>

         {/* Right Column (Activity Feed) */}
         <div className="flex-1 w-full bg-surface-container-lowest border border-surface-container-high rounded-xl p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4 mb-6">
               <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
                 <Activity className="w-5 h-5 text-on-surface-variant" /> Activity & Notes
               </h3>
               <button className="text-sm font-medium text-on-surface-variant flex items-center gap-1.5 hover:text-on-surface transition-colors">
                 <Filter className="w-4 h-4" /> Filter
               </button>
            </div>

            {/* Note Composer */}
            <div className="bg-surface border border-surface-container-high rounded-xl mb-8 flex flex-col p-4 focus-within:border-primary transition-colors">
               <textarea 
                 placeholder="Log a call, text, or note..." 
                 className="bg-transparent border-none text-on-surface text-[15px] resize-none h-20 focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/50"
               ></textarea>
               <div className="flex items-center justify-between border-t border-surface-container-high pt-3">
                  <div className="flex items-center gap-2">
                     <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"><Phone className="w-4 h-4" /></button>
                     <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors"><Mail className="w-4 h-4" /></button>
                  </div>
                  <button className="bg-surface-container-highest text-on-surface hover:bg-surface-bright font-bold text-xs px-4 py-2 rounded-md transition-colors">
                    Save Note
                  </button>
               </div>
            </div>

            {/* Feed */}
            <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-surface-container-high">
               
               {/* Feed Item 1 */}
               <div className="relative flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full border border-primary bg-primary/10 flex items-center justify-center relative z-10 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background"></div>
                 </div>
                 <div className="flex-1 bg-surface-container-low border border-surface-container-highest rounded-lg p-5 group hover:border-surface-variant transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-on-surface-variant" />
                          <span className="font-bold text-[13px] text-on-surface uppercase tracking-wider">Outbound Call</span>
                       </div>
                       <span className="text-[12px] text-on-surface-variant">Today, 10:30 AM</span>
                    </div>
                    <p className="text-[15px] text-on-surface-variant leading-relaxed mb-4">
                      Spoke with Marcus. He's very interested in getting back into shape after a knee injury last year. Advised the striking fundamentals class to start slow. Booked trial for Thursday.
                    </p>
                    <div className="flex items-center gap-2 border-t border-surface-container-high pt-3">
                       <img src="https://i.pravatar.cc/100?img=5" className="w-5 h-5 rounded-full object-cover border border-surface-variant" alt="Admin" />
                       <span className="text-xs text-on-surface-variant">Logged by Admin</span>
                    </div>
                 </div>
               </div>

               {/* Feed Item 2 */}
               <div className="relative flex items-start gap-4 opacity-80">
                 <div className="w-10 h-10 rounded-full border border-surface-container-highest bg-surface-container flex items-center justify-center relative z-10 shrink-0">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                 </div>
                 <div className="flex-1 bg-surface-container-low border border-surface-container-highest rounded-lg p-4">
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-[13px] text-on-surface uppercase tracking-wider">Automated SMS Sent</span>
                       <span className="text-[12px] text-on-surface-variant">Yesterday, 2:15 PM</span>
                    </div>
                    <p className="text-[15px] text-on-surface-variant">
                      "Hey Marcus! Thanks for checking out AcademyOS. Let us know if you have questions about our beginner programs."
                    </p>
                 </div>
               </div>

               {/* Feed Item 3 */}
               <div className="relative flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full border border-surface-container-highest bg-surface-container flex items-center justify-center relative z-10 shrink-0">
                    <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                 </div>
                 <div className="flex-1 pt-2 pb-6">
                    <div className="flex items-center gap-3 mb-1">
                       <span className="font-bold text-[13px] text-on-surface uppercase tracking-wider">Lead Created</span>
                       <span className="text-[12px] text-on-surface-variant">Oct 22, 1:45 PM</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      Captured via Facebook Campaign - "Summer Strong". Form submission.
                    </p>
                 </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}
