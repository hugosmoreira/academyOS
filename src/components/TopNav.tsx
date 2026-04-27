import { Search, Bell, Settings, Menu } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="flex flex-shrink-0 items-center justify-between w-full px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container-high h-16">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant hover:text-on-surface transition-all active:scale-[0.98] duration-200">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-surface-container-high focus-within:border-primary transition-colors">
          <Search className="text-on-surface-variant mr-2 w-4 h-4" />
          <input 
            className="bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/50 w-64" 
            placeholder="Search members, classes..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-[0.98] duration-200 p-2 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-[0.98] duration-200 p-2 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-surface-container-high ml-2 select-none cursor-pointer">
          <img 
            alt="Gym Owner Avatar" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7sBHkx1fG1TZsECjtQYZHt-7zlLNJDYCf_LNxJ2R814HL33oBecNpeyFj485yBNqJUVYmWmUc_9NoJwe2yLcB6NIBnbP-ZUfDnYzBJO26tyCItBSwaV0q5Qlkk_ANb6pbdzpEzTtikDX7rON3FeU0bRNBhrIKjheL8FZNbCqcvkSm6zRE0I9B03kl98mp_cIAPe8i_AmZxnlq-eSpMTyUc1Ds62A5MnPSLnZykjqABo9FY-OomBavOswvRiBDb3D0l0vhFlbMoA" 
          />
        </div>
      </div>
    </header>
  );
}
