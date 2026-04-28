import { useState } from 'react';
import { ArrowLeft, ArrowRight, Home, Activity, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const programs = [
  {
    id: 'bjj',
    title: 'Adult Brazilian Jiu-Jitsu',
    description: 'Technical grappling fundamentals and advanced sparring for ages 16+. Both Gi and No-Gi available.',
    icon: Activity,
  },
  {
    id: 'kids',
    title: 'Kids Martial Arts',
    description: 'Building discipline, focus, and practical self-defense skills in a safe environment for ages 5-15.',
    icon: Users,
  },
  {
    id: 'muay_thai',
    title: 'Muay Thai / Striking',
    description: 'High-intensity striking fundamentals, pad work, and elite cardiovascular conditioning.',
    icon: Shield,
  }
];

export default function TrialBooking() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>('bjj');

  return (
    <div className="min-h-screen bg-background flex text-on-surface font-sans">
      {/* Left Panel - Image/Marketing */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a0a0a] border-r border-surface-container-high overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop" 
            alt="Training" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale"
          />
        </div>
        
        {/* Top Header */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center border-2 border-primary text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span className="text-xl font-black text-primary font-display tracking-tight uppercase">AcademyOS</span>
        </div>

        <div className="relative z-20 mt-auto p-12 lg:p-20 pb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant bg-surface-container-low mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Now Enrolling</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-on-surface leading-[1.1] mb-6">
            Mastery Begins<br />With Action.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mb-12">
            Join an elite community dedicated to precision and discipline. Experience world-class instruction in a facility designed for focused, high-performance training.
          </p>

          <div className="flex items-center gap-4 bg-surface-container-low/50 border border-surface-container p-4 rounded-xl backdrop-blur-sm max-w-[fit-content]">
             <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" src="https://i.pravatar.cc/100?img=1" alt="Student" />
                <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" src="https://i.pravatar.cc/100?img=2" alt="Student" />
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant">+1k</div>
             </div>
             <div className="flex flex-col">
                <div className="flex items-center gap-1 text-primary">
                   {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <div className="text-sm text-on-surface-variant"><span className="text-on-surface font-semibold">4.9/5</span> average rating</div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-[#171717] flex flex-col min-h-screen">
        <div className="flex justify-end p-8">
          <Link to="/" className="text-sm font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
            Return to Main Site <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-8 pb-20">
          <div className="mb-10">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-widest mb-4">
              <span className="text-on-surface-variant">Step 1 of 3</span>
              <span className="text-primary">Select Program</span>
            </div>
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
               <div className="bg-primary h-full rounded-full" style={{ width: '33.33%' }}></div>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold text-on-surface mb-3">What are you training for?</h2>
          <p className="text-on-surface-variant mb-8 text-base">Select a curriculum to view available trial class schedules and secure your spot.</p>

          <div className="space-y-4">
            {programs.map((program) => {
              const isSelected = selectedProgram === program.id;
              return (
                <div 
                  key={program.id}
                  onClick={() => setSelectedProgram(program.id)}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all cursor-pointer group flex gap-4",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-surface-container hover:border-surface-variant bg-surface"
                  )}
                >
                  <div className="mt-1">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected ? "border-primary" : "border-surface-variant group-hover:border-on-surface-variant"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className={cn("text-lg font-bold", isSelected ? "text-on-surface" : "text-on-surface")}>{program.title}</h3>
                       <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", isSelected ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant")}>
                         <program.icon className="w-4 h-4" />
                       </div>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {program.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-between pt-6 border-t border-surface-container-high">
            <button className="text-sm font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </button>
            <button className="bg-primary/90 text-on-primary-fixed hover:bg-primary font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(233,194,98,0.2)]">
              Continue to Schedule <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
