import { Search, Mail, Phone, MapPin, MoreVertical, CreditCard, CheckCircle2, AlertCircle, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FamilyProfile() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-surface-container-high pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <i className="text-primary w-4 h-4" /> 
             <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Parent Account</span>
           </div>
           <h1 className="text-4xl font-display font-bold text-on-surface mb-4">The Thorne Family</h1>
           
           <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> contact@thornefamily.com</div>
              <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> +1 (555) 019-2834</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> 422 Elite Ave, Suite B</div>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="bg-transparent border border-surface-container-high text-on-surface text-sm font-semibold rounded-lg px-4 py-2 hover:bg-surface-container transition-colors">
             Edit Details
           </button>
           <button className="bg-primary text-on-primary-fixed text-sm font-bold rounded-lg px-4 py-2 shadow-sm hover:brightness-110 transition-colors">
             Add Member
           </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
         
         {/* Main Content (Linked Members) */}
         <div className="flex-1 w-full flex flex-col gap-6">
            <h2 className="text-xl font-bold text-on-surface">Linked Members</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Member Card 1 */}
              <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <img src="https://i.pravatar.cc/100?img=11" className="w-12 h-12 rounded-full border border-surface-container-highest object-cover" alt="Marcus Thorne" />
                       <div>
                          <h3 className="font-bold text-lg text-on-surface">Marcus Thorne</h3>
                          <span className="text-xs text-on-surface-variant">Child • Age 12</span>
                       </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-on-surface p-1"><MoreVertical className="w-5 h-5"/></button>
                 </div>
                 
                 <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">PROGRAM</span>
                       <span className="text-sm text-on-surface">Youth BJJ Advanced</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">RANK STATUS</span>
                       <span className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                         <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600/50"></div> Yellow Belt
                       </span>
                    </div>
                 </div>
                 
                 <button className="w-full bg-surface border border-surface-container-high text-on-surface hover:bg-surface-container text-xs font-semibold uppercase tracking-wider py-2 rounded transition-colors">
                   View Profile
                 </button>
              </div>

              {/* Member Card 2 */}
              <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <img src="https://i.pravatar.cc/100?img=9" className="w-12 h-12 rounded-full border border-surface-container-highest object-cover" alt="Elena Thorne" />
                       <div>
                          <h3 className="font-bold text-lg text-on-surface">Elena Thorne</h3>
                          <span className="text-xs text-on-surface-variant">Child • Age 9</span>
                       </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-on-surface p-1"><MoreVertical className="w-5 h-5"/></button>
                 </div>
                 
                 <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">PROGRAM</span>
                       <span className="text-sm text-on-surface">Little Ninjas</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">RANK STATUS</span>
                       <span className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
                         <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></div> White Belt
                       </span>
                    </div>
                 </div>
                 
                 <button className="w-full bg-surface border border-surface-container-high text-on-surface hover:bg-surface-container text-xs font-semibold uppercase tracking-wider py-2 rounded transition-colors">
                   View Profile
                 </button>
              </div>

            </div>
         </div>

         {/* Sidebar widgets */}
         <div className="w-full xl:w-[320px] flex flex-col gap-6">
            
            {/* Shared Billing Card */}
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
                   <CreditCard className="w-5 h-5 text-primary" /> Shared Billing
                 </h3>
                 <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Active</span>
               </div>
               
               <div className="mb-6">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">NEXT PAYMENT</span>
                  <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-display font-bold text-on-surface">$290.00</span>
                     <span className="text-sm font-medium text-on-surface-variant">/ mo</span>
                  </div>
                  <div className="text-sm font-medium text-on-surface mt-2 border-b border-surface-container-high pb-4">
                     Due on <strong>Oct 15, 2023</strong>
                  </div>
               </div>

               <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                     <CreditCard className="w-4 h-4" /> Visa ending in 4242
                  </div>
                  <button className="text-primary font-medium hover:text-primary-fixed transition-colors">Update</button>
               </div>
            </div>

            {/* Waiver Status Card */}
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
               <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface mb-4">
                 <FileText className="w-5 h-5 text-primary" /> Waiver Status
               </h3>
               
               <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-surface-container-high rounded-lg bg-surface">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-medium text-on-surface">Marcus Thorne</span>
                     </div>
                     <span className="text-[10px] leading-tight text-on-surface-variant text-right">Signed<br/>01/12/23</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-red-500/30 rounded-lg bg-red-500/5">
                     <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-sm font-medium text-on-surface">Elena Thorne</span>
                     </div>
                     <button className="text-[10px] font-medium text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider">
                       Resend Request
                     </button>
                  </div>
               </div>
            </div>

            {/* Family Notes Card */}
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
                    <FileText className="w-5 h-5 text-primary" /> Family Notes
                  </h3>
                  <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1"><Plus className="w-4 h-4" /></button>
               </div>
               
               <div className="space-y-4 mb-4">
                  <div className="p-3 bg-surface border border-surface-container-high rounded-lg">
                     <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Sep 10, 2023 - System</div>
                     <p className="text-sm text-on-surface font-medium leading-relaxed">Elena needs to be picked up by Grandmother (Sarah) on Tuesdays.</p>
                  </div>
                  <div className="p-3 bg-surface border border-surface-container-high rounded-lg">
                     <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">Aug 01, 2023 - Master Kim</div>
                     <p className="text-sm text-on-surface leading-relaxed">Upgraded to family plan. Applied 10% sibling discount to recurring billing.</p>
                  </div>
               </div>

               <div className="relative">
                  <input type="text" placeholder="Add a quick note..." className="w-full bg-surface border border-surface-container-high rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-fixed transition-colors"><Send className="w-4 h-4" /></button>
               </div>
            </div>

         </div>

      </div>
    </div>
  );
}
