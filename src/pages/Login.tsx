import { Swords, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden">
      {/* Left Panel: Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-lowest flex-col justify-between p-12 overflow-hidden border-r border-surface-container-high">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0eP6pPVv2JrvTQU5V-2-TlKBJSzZKNPSWs7NcP8KNCoGFBIOZrkkPFoldHp1aVFrogKR6CNl4YRYyYGRypNHWpCEr1DXhPV78k7NDtTuf1l5YLo9RMvqGrmV5V4mNJ1EQV__dOtJFe4tdxQswkiZFJtFA0LOql1xfEsfCnPc-xKeaGZw2O9IjKnD3NeYiPs4fnKQeXSu-4ZAqATyaUTBoSMbURgb41B5fre2pKXDmwNDdSD9ySQLOWXb3XLmVFQu8t9JHp0j3FA" 
          alt="Martial arts gi"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent"></div>
        
        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3 mt-4">
          <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
            <Swords className="text-on-primary-container w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-2xl text-primary tracking-tighter uppercase font-black font-display">AcademyOS</span>
        </div>
        
        {/* Bottom Tagline */}
        <div className="relative z-10 max-w-md pb-12">
          <h1 className="font-display text-5xl text-on-surface mb-6 leading-tight font-bold">
            Elite Management.<br/><span className="text-surface-variant">Quiet Authority.</span>
          </h1>
          <p className="text-lg text-on-surface-variant">
            Streamline your operations, empower your instructors, and deliver a premium experience to your members. Focus on the art; we handle the academy.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-background relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <Swords className="text-primary w-6 h-6 stroke-[2]" />
           <span className="text-xl text-primary tracking-tighter uppercase font-black font-display">AcademyOS</span>
        </div>
        
        <div className="w-full max-w-sm mt-16 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-display text-3xl text-on-surface mb-2 font-bold">Welcome Back</h2>
            <p className="text-base text-on-surface-variant">Access your academy dashboard.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-surface-variant w-4 h-4" />
                </div>
                <input 
                  className="w-full bg-surface border border-surface-container-high rounded-md pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-surface-variant/70" 
                  id="email" 
                  name="email" 
                  placeholder="sensei@dojo.com" 
                  required 
                  type="email" 
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider" htmlFor="password">Password</label>
                <Link className="text-xs font-medium text-primary hover:text-primary-fixed transition-colors" to="#">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Lock className="text-surface-variant w-4 h-4" />
                </div>
                <input 
                  className="w-full bg-surface border border-surface-container-high rounded-md pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-surface-variant/70" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password" 
                />
              </div>
            </div>
            
            <button 
              className="w-full bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-4 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-8 shadow-sm" 
              type="submit"
            >
              Log In <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an academy registered? 
              <Link className="text-primary hover:text-primary-fixed font-medium transition-colors ml-2" to="#">Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
