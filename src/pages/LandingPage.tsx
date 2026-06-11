import { Search, Bell, Settings, CheckCircle2, CreditCard, Layers, Users, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="flex items-center justify-between w-full px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container-high h-16">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-primary tracking-tighter uppercase font-display">AcademyOS</span>
        </div>
        <div className="flex-1 hidden md:flex justify-start px-6 max-w-md">
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2 w-full border border-surface-container-high focus-within:border-primary transition-colors">
            <Search className="text-on-surface-variant w-4 h-4 mr-2" />
            <input 
              className="bg-transparent border-none outline-none text-on-surface text-sm w-full placeholder:text-on-surface-variant/50" 
              placeholder="Search..." 
              type="text" 
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors hidden md:block">Log In</Link>
          <Link to="/contact-sales" className="bg-primary-container text-on-primary-container font-label-caps text-xs md:text-sm px-4 py-2 rounded font-bold hover:brightness-110 transition-all">Book a Demo</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 lg:px-8 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant bg-surface-container-low mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Introducing AcademyOS 2.0</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-5xl text-on-surface max-w-4xl mx-auto mb-6 tracking-tight font-bold !leading-tight">
            The Operating System for <span className="text-primary">Martial Arts Academies</span>
          </h1>
          
          <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Elite management software built for precision, performance, and scaling your gym. Leave the operational friction behind and focus on the mat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/contact-sales" className="bg-primary-container text-on-primary-container font-label-caps text-sm px-8 py-4 rounded font-bold hover:brightness-110 transition-all w-full sm:w-auto">
              Book a Demo
            </Link>
            <Link to="/login" className="bg-transparent text-on-surface border border-outline-variant font-label-caps text-sm px-8 py-4 rounded hover:bg-surface-container w-full sm:w-auto transition-colors font-bold uppercase tracking-wider text-center">
              Academy Sign In
            </Link>
          </div>
          
          <div className="mt-20 w-full max-w-5xl mx-auto aspect-video rounded-xl border border-outline-variant bg-surface-container-low overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-transparent z-10 pointer-events-none"></div>
            <img 
              alt="Dashboard preview" 
              className="w-full h-full object-cover opacity-80 mix-blend-luminosity" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVIAWOC07TOywt4UbXdmtB5UZS-KOU_yqFQvujtpNbANCoKJSmR4BvH_Nn-QH4HcUDpV6IOC3EOugBQ6zM3iPhk4T4tP7ZUEK_CEsUE1Xd-ZfPp5ZishFKusaVLvQMyQFxgVNwlWqiSTjoLLT1GyaILQKtNZXPXBN-HA8Tc2qh7uUFzF7sj3-S2xdvbfO29qCPK1f119us2xbaOQW1SU00Nf1O29C7u0gP942RsQADlt4TrhyPzqSiVPUezVmbtmdjwQ2r68Y5gA" 
            />
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className="py-24 px-6 lg:px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl text-on-surface mb-4 font-bold">Command Every Aspect of Your Academy</h2>
              <p className="text-base text-on-surface-variant max-w-xl mx-auto">A unified suite designed specifically for the unique workflows of combat sports and martial arts facilities.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Attendance (Large) */}
              <div className="col-span-1 md:col-span-8 bg-surface-container-low border border-surface-container-high rounded-xl p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 text-primary opacity-10 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-16 h-16 stroke-1" fill="currentColor" />
                </div>
                <h3 className="font-h2 text-2xl text-on-surface mb-2 relative z-10 font-bold">Frictionless Attendance</h3>
                <p className="text-base text-on-surface-variant max-w-md relative z-10 mb-8">Lightning-fast check-ins, barcode scanning, and real-time class capacity management. Keep the front desk moving.</p>
                <div className="mt-auto bg-surface border border-surface-container-high rounded-lg p-6 relative z-10">
                  <div className="flex items-center justify-between border-b border-surface-variant pb-4 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Advanced No-Gi</span>
                    <span className="text-sm font-semibold text-primary">24 / 30 Checked In</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-variant border border-surface-container-highest"></div>
                    <div className="w-8 h-8 rounded-full bg-surface-variant border border-surface-container-highest"></div>
                    <div className="w-8 h-8 rounded-full bg-surface-variant border border-surface-container-highest"></div>
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center font-bold text-xs text-on-surface-variant">+21</div>
                  </div>
                </div>
              </div>
              
              {/* Billing (Small) */}
              <div className="col-span-1 md:col-span-4 bg-surface-container-low border border-surface-container-high rounded-xl p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 text-primary opacity-10 group-hover:opacity-100 transition-opacity">
                  <CreditCard className="w-16 h-16 stroke-1" fill="currentColor"/>
                </div>
                <h3 className="font-h2 text-2xl text-on-surface mb-2 relative z-10 font-bold">Automated Billing</h3>
                <p className="text-base text-on-surface-variant relative z-10 mb-8">Set and forget recurring memberships. Handle drop-ins, and failed payments.</p>
                <div className="mt-auto relative z-10">
                   <div className="font-display text-4xl text-primary font-bold">$14.2k</div>
                   <div className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest font-semibold">MRR this month</div>
                </div>
              </div>
              
              {/* Programs (Small) */}
              <div className="col-span-1 md:col-span-4 bg-surface-container-low border border-surface-container-high rounded-xl p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 text-primary opacity-10 group-hover:opacity-100 transition-opacity">
                  <Layers className="w-16 h-16 stroke-1" fill="currentColor"/>
                </div>
                <h3 className="font-h2 text-2xl text-on-surface mb-2 relative z-10 font-bold">Program Logic</h3>
                <p className="text-base text-on-surface-variant relative z-10 mb-8">Manage belt promotions, curriculum tracking, and specific access tiers seamlessly.</p>
                <div className="mt-auto flex gap-3 relative z-10 flex-wrap">
                  <div className="px-3 py-1 rounded-full border border-surface-container-highest text-xs uppercase tracking-wider font-bold text-on-surface">BJJ</div>
                  <div className="px-3 py-1 rounded-full border border-surface-container-highest text-xs uppercase tracking-wider font-bold text-on-surface">Muay Thai</div>
                </div>
              </div>
              
              {/* Leads (Large) */}
              <div className="col-span-1 md:col-span-8 bg-surface-container-low border border-surface-container-high rounded-xl p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 text-primary opacity-10 group-hover:opacity-100 transition-opacity">
                  <Users className="w-16 h-16 stroke-1" fill="currentColor"/>
                </div>
                <h3 className="font-h2 text-2xl text-on-surface mb-2 relative z-10 font-bold">Lead Conversion CRM</h3>
                <p className="text-base text-on-surface-variant max-w-md relative z-10 mb-8">Track trial members from their first inquiry to full membership. Automated SMS follow-ups and pipelines.</p>
                <div className="mt-auto flex items-center justify-between bg-surface border border-surface-container-high rounded-lg p-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold uppercase">NW</div>
                    <div>
                      <div className="font-medium text-sm text-on-surface">New Web Lead</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">Scheduled Trial: Tomorrow, 6PM</div>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary-fixed transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 lg:px-8 bg-surface-container-lowest border-t border-surface-container-high">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl text-on-surface mb-4 font-bold">Straightforward Pricing</h2>
              <p className="text-base text-on-surface-variant max-w-xl mx-auto">No hidden fees. Just powerful tools to grow your academy.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-surface-container border border-surface-container-high rounded-xl p-8 flex flex-col">
                <h3 className="text-xl text-on-surface mb-2 font-bold">Starter</h3>
                <p className="text-sm text-on-surface-variant mb-6">Perfect for new or small academies.</p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="font-display text-4xl text-on-surface font-bold">$99</span>
                  <span className="text-sm text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-on-surface-variant" /> Up to 100 Active Members
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-on-surface-variant" /> Basic Billing
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-on-surface-variant" /> Attendance Tracking
                  </li>
                </ul>
                <Link to="/contact-sales" className="block text-center w-full bg-transparent text-on-surface border border-surface-container-highest text-xs uppercase tracking-wider font-bold py-3 rounded hover:bg-surface-container-high transition-colors">
                  Start Free Trial
                </Link>
              </div>
              
              {/* Professional (Highlighted) */}
              <div className="bg-surface-container-low border border-primary rounded-xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_30px_rgba(233,194,98,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
                <h3 className="text-xl text-on-surface mb-2 font-bold">Professional</h3>
                <p className="text-sm text-on-surface-variant mb-6">For growing academies focused on scaling.</p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="font-display text-4xl text-on-surface font-bold">$199</span>
                  <span className="text-sm text-on-surface-variant">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-primary" /> Unlimited Members
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-primary" /> Advanced CRM & Leads
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-primary" /> Automated Communications
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-primary" /> Rank & Promotion Tracking
                  </li>
                </ul>
                <Link to="/contact-sales" className="block text-center w-full bg-primary-container text-on-primary-container text-xs uppercase tracking-wider font-bold py-3 rounded hover:brightness-110 transition-all">
                  Book a Demo
                </Link>
              </div>
              
              {/* Enterprise */}
              <div className="bg-surface-container border border-surface-container-high rounded-xl p-8 flex flex-col">
                <h3 className="text-xl text-on-surface mb-2 font-bold">Enterprise</h3>
                <p className="text-sm text-on-surface-variant mb-6">Multi-location networks and franchises.</p>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="font-display text-2xl text-on-surface font-bold">Custom</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-on-surface-variant" /> Multi-Gym Management
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-on-surface-variant" /> Global Reporting API
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface">
                    <Check className="w-5 h-5 text-on-surface-variant" /> Dedicated Success Manager
                  </li>
                </ul>
                <Link to="/contact-sales" className="block text-center w-full bg-transparent text-on-surface border border-surface-container-highest text-xs uppercase tracking-wider font-bold py-3 rounded hover:bg-surface-container-high transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-container-high bg-surface-container-lowest py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">AcademyOS</span>
          </div>
          <div className="flex gap-6 text-sm text-on-surface-variant font-medium">
            <a className="hover:text-on-surface transition-colors" href="#">Privacy</a>
            <a className="hover:text-on-surface transition-colors" href="#">Terms</a>
            <a className="hover:text-on-surface transition-colors" href="#">Support</a>
          </div>
          <div className="text-sm text-on-surface-variant">
            © 2026 AcademyOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
