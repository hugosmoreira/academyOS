import { Search, MoreHorizontal, User, Mail, Phone, Clock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const leadsData = {
  newLeads: [
    {
      id: 'marcus',
      name: 'Marcus Johnson',
      source: 'INSTAGRAM AD',
      email: 'marcus.j@example.com',
      phone: '(555) 123-4567',
      followUp: 'Today',
      assignee: 'https://i.pravatar.cc/100?img=11'
    },
    {
      id: 'sarah',
      name: 'Sarah Chen',
      source: 'REFERRAL',
      email: 'schen@example.com',
      phone: null,
      followUp: 'Tomorrow',
      assignee: null
    }
  ],
  trialBooked: [
    {
      id: 'david',
      name: 'David Miller',
      source: 'WEBSITE',
      trialClass: 'Intro Class (BJJ)',
      trialDate: 'Oct 24, 6:00 PM',
      status: 'Waiver Sent'
    }
  ],
  trialAttended: [
    {
      id: 'elena',
      name: 'Elena Rodriguez',
      source: 'WALK-IN',
      quote: '"Really enjoyed the striking fundamentals. Considering the 6-month plan."',
      followUpIssue: 'Follow up overdue'
    }
  ]
};

export default function LeadsPipeline() {
  return (
    <div className="flex-1 h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-8 py-6 border-b border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface mb-1">Leads Pipeline</h2>
          <p className="text-sm text-on-surface-variant">Manage prospective students and track trial conversions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-surface-variant w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="bg-surface-container rounded-lg pl-9 pr-4 py-2 border border-surface-container-high text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-64"
            />
          </div>
          <button className="bg-primary text-on-primary-fixed font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:brightness-110 transition-all">
            Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto p-8 flex items-start gap-6">
        
        {/* Column 1: New Lead */}
        <div className="w-[350px] min-w-[350px] bg-surface-container-lowest border border-surface-container-high rounded-xl flex flex-col">
          <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
              <h3 className="font-bold text-on-surface text-base">New Lead</h3>
            </div>
            <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">3</span>
          </div>
          
          <div className="p-4 flex flex-col gap-4 overflow-y-auto">
            {leadsData.newLeads.map(lead => (
              <Link to={`/app/leads/123`} key={lead.id} className="bg-surface-container-low border border-surface-container-high p-4 rounded-lg hover:border-surface-variant transition-all cursor-pointer block">
                <div className="flex items-start justify-between mb-2">
                   <div className="flex items-center gap-2">
                      <h4 className="font-bold text-on-surface text-[15px]">{lead.name}</h4>
                   </div>
                   <button className="text-on-surface-variant hover:text-on-surface p-1"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-surface border border-surface-container-highest text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{lead.source}</span>
                </div>
                <div className="space-y-2 mb-4">
                   {lead.email && <div className="flex items-center gap-2 text-sm text-on-surface-variant px-1"><Mail className="w-3.5 h-3.5" /> <span className="truncate">{lead.email}</span></div>}
                   {lead.phone && <div className="flex items-center gap-2 text-sm text-on-surface-variant px-1"><Phone className="w-3.5 h-3.5" /> <span>{lead.phone}</span></div>}
                </div>
                <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Clock className="w-3 h-3" /> Follow up: {lead.followUp}
                  </div>
                  {lead.assignee ? (
                     <img src={lead.assignee} className="w-5 h-5 rounded-full border border-surface-container" alt="Assignee" />
                  ) : (
                     <div className="w-5 h-5 rounded-full border border-dashed border-surface-variant flex items-center justify-center">
                        <User className="w-3 h-3 text-surface-variant" />
                     </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2: Trial Booked */}
        <div className="w-[350px] min-w-[350px] bg-surface-container-lowest border border-surface-container-high rounded-xl flex flex-col">
          <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span>
              <h3 className="font-bold text-on-surface text-base">Trial Booked</h3>
            </div>
            <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">2</span>
          </div>
          
          <div className="p-4 flex flex-col gap-4 overflow-y-auto">
            {leadsData.trialBooked.map(lead => (
              <div key={lead.id} className="bg-surface-container-low border border-surface-container-high p-4 rounded-lg hover:border-surface-variant transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                   <h4 className="font-bold text-on-surface text-[15px]">{lead.name}</h4>
                   <button className="text-on-surface-variant hover:text-on-surface p-1"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-surface border border-surface-container-highest text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{lead.source}</span>
                </div>
                
                <div className="bg-surface border border-surface-container-high rounded-md p-3 mb-4 space-y-1">
                   <div className="text-xs font-semibold text-primary">{lead.trialClass}</div>
                   <div className="flex items-center gap-1.5 text-sm text-on-surface-variant"><Clock className="w-3 h-3" /> {lead.trialDate}</div>
                </div>

                <div className="pt-3 border-t border-surface-container-high flex items-center">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <CheckCircle2 className="w-3.5 h-3.5 text-on-surface" /> {lead.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Trial Attended */}
        <div className="w-[350px] min-w-[350px] bg-surface-container-lowest border border-surface-container-high rounded-xl flex flex-col">
          <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              <h3 className="font-bold text-on-surface text-base">Trial Attended</h3>
            </div>
            <span className="bg-surface-container text-on-surface-variant text-xs font-bold px-2 py-0.5 rounded-full">1</span>
          </div>
          
          <div className="p-4 flex flex-col gap-4 overflow-y-auto">
            {leadsData.trialAttended.map(lead => (
              <div key={lead.id} className="bg-surface-container-low border border-surface-container-high p-4 rounded-lg hover:border-surface-variant transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                   <h4 className="font-bold text-on-surface text-[15px]">{lead.name}</h4>
                   <button className="text-on-surface-variant hover:text-on-surface p-1"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
                <div className="mb-4">
                  <span className="inline-block px-2 py-0.5 rounded bg-surface border border-surface-container-highest text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{lead.source}</span>
                </div>
                
                <div className="text-sm text-on-surface-variant italic mb-4">
                   {lead.quote}
                </div>

                <div className="pt-3 border-t border-surface-container-high flex items-center">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> {lead.followUpIssue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
