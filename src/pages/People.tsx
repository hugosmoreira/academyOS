import { Filter, Plus, MoreVertical } from 'lucide-react';

const students = [
  {
    id: '1',
    name: 'Marcus Silva',
    email: 'm.silva@example.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWxLzZyKSRpJKXl2UTe5tvrbT0WvOP65BUsoBJqhJJdvsqynB6ZFFVzvxeMLbjh0U3VJlcC1iTKO6eXE129Qx2QBXOTPsuzXyXsky-jPqCyy2p9KPjVXwrug89U00VzREfrZVX7ijsfRyMITYCRh8lKSTIxbnBEGMkv66AeS1CRDR8op9I0fKsTVTdeKTmL6s5ht0T03MRJVMgKgw3zA6EOS_enNU1mInBh5mtck4OXta6iFHMElwz42QnTZH1tXg6zhF8M6Gi0Q',
    program: 'BJJ Fundamentals',
    status: 'BLUE BELT',
    statusColor: 'text-[#2196F3]',
    statusBg: 'bg-[#2196F3]/10',
    statusBorder: 'border-[#2196F3]',
    membership: 'Active',
    lastAttendance: 'Today, 18:00'
  },
  {
    id: '2',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    initials: 'ER',
    program: 'Muay Thai Advanced',
    status: 'PRAJIAD',
    statusColor: 'text-tertiary',
    statusBg: 'bg-tertiary/10',
    statusBorder: 'border-tertiary',
    membership: 'Active',
    lastAttendance: 'Yesterday, 19:30'
  },
  {
    id: '3',
    name: 'James Chen',
    email: 'j.chen88@example.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC42KPixz1118HMpcOTSJCVxbZilt87X9HHnL9OpPh5wT0c1PbWRT6b_DD8uRuDsca02BXX0jrbbReNAP6kaaNTPg_Uruq6S1-2CDXkAq9lmBxzLkNhsQ0b7n05LUt1kTc_IrwEghscYIVKU7lielgkNZPavLHkQ46eJlmdvuXsdRGsIZPN3oImzucry6VIU5ouhBBzbuAYukVWgWrBAqyCQygZmb7M0-k6o-EfdUfq7vQRJG49YRGTTd63EJ_DksHuFClrb75Cw',
    program: 'No-Gi Grappling',
    status: 'PURPLE BELT',
    statusColor: 'text-[#9C27B0]',
    statusBg: 'bg-[#9C27B0]/10',
    statusBorder: 'border-[#9C27B0]',
    membership: 'Past Due',
    lastAttendance: 'Oct 12, 2023'
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    email: 's.jenkins@example.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm7dpRec17-KpaJA7KFuXBNBxoqNu443_5-ogGefkTqDnNWNaYO8IORAJwWJMoMmWEDoqIHLU0KcqFSLAqBFhnq3Nkjd_5XbM04Xvb5lytPPfpuqX-E0d-CpqVu3s1JErq0B84GlgnNXX-TIhXBbewdlrIHE0eW4iXXCXlMu6s5xnpFGSVbk7VauQR8TiZPBzFL_SOsWn_WRWPaNFTp2mDI6yoERdc3nbUxmVPk8q6TLX16NDwVvF5TSEKVjj9b3N9ICQHb62mLA',
    program: 'BJJ Fundamentals',
    status: 'WHITE BELT',
    statusColor: 'text-on-surface',
    statusBg: 'bg-on-surface/5',
    statusBorder: 'border-on-surface',
    membership: 'Active',
    lastAttendance: 'Today, 06:00'
  }
];

export default function People() {
  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-on-surface">People & Students</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage your roster, track progression, and view attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-surface-container-high bg-transparent text-on-surface hover:bg-surface-container transition-colors px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold">
             <Filter className="w-4 h-4" />
             Filters
          </button>
          <button className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 transition-colors px-4 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-sm">
             <Plus className="w-4 h-4 stroke-[3]" />
             Add Student
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/50 border-b border-surface-container-high">
              <tr>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Student Name</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Program</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Status / Rank</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Membership</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold">Last Attendance</th>
                <th className="text-xs text-on-surface-variant px-6 py-4 uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-surface-container/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                         <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-surface-variant" />
                      ) : (
                         <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-surface-variant">
                           <span className="text-sm font-medium text-on-surface">{student.initials}</span>
                         </div>
                      )}
                      <div>
                        <p className="text-base text-on-surface font-medium group-hover:text-primary transition-colors">{student.name}</p>
                        <p className="text-sm text-on-surface-variant">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{student.program}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block border ${student.statusBorder} ${student.statusColor} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${student.statusBg}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${student.membership === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm ${student.membership === 'Active' ? 'text-on-surface' : 'text-red-500 font-medium'}`}>
                        {student.membership}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{student.lastAttendance}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-surface-container-high px-6 py-4 bg-surface-container/20 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">Showing 1 to 4 of 142 entries</p>
          <div className="flex gap-2">
             <button className="px-3 py-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors text-sm disabled:opacity-50 font-medium" disabled>Previous</button>
             <button className="px-3 py-1 border border-surface-variant rounded text-on-surface hover:bg-surface-container transition-colors text-sm bg-surface-container font-medium">1</button>
             <button className="px-3 py-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors text-sm font-medium">2</button>
             <button className="px-3 py-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors text-sm font-medium">3</button>
             <button className="px-3 py-1 border border-surface-variant rounded text-on-surface-variant hover:bg-surface-container transition-colors text-sm font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
