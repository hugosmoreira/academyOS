import { ArrowLeft, Download, RotateCcw, CreditCard, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InvoiceDetail() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/app/dashboard" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2 mb-2">
             <ArrowLeft className="w-4 h-4" /> Back to Billing
          </Link>
          <div className="flex items-center gap-4">
             <h1 className="text-3xl font-display font-bold text-on-surface">Invoice #INV-2023-0842</h1>
             <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">Paid</span>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-surface text-on-surface border border-surface-container-highest hover:bg-surface-container py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm">
             <Download className="w-4 h-4" /> Download PDF
           </button>
           <button className="flex items-center gap-2 bg-primary text-on-primary-fixed hover:brightness-110 py-2 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm">
             <RotateCcw className="w-4 h-4" /> Refund
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
         <div className="flex-1 w-full space-y-6">
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                     <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Date Issued</div>
                     <div className="font-semibold text-on-surface">Oct 24, 2023</div>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Date Paid</div>
                     <div className="font-semibold text-on-surface">Oct 24, 2023</div>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Student</div>
                     <div className="font-semibold text-on-surface">Marcus Johnson</div>
                  </div>
                  <div>
                     <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Amount</div>
                     <div className="font-semibold text-on-surface">$185.00</div>
                  </div>
               </div>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
               <div className="p-6 border-b border-surface-container-high">
                  <h2 className="text-xl font-bold text-on-surface">Charges</h2>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-surface-container/50 border-b border-surface-container-high">
                     <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Qty</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Unit Price</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                     <tr>
                        <td className="px-6 py-4">
                           <div className="font-semibold text-sm text-on-surface mb-0.5">Monthly Membership - Elite Plan</div>
                           <div className="text-xs text-on-surface-variant">Oct 24, 2023 - Nov 23, 2023</div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-on-surface text-sm">1</td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface text-sm">$150.00</td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface text-sm">$150.00</td>
                     </tr>
                     <tr>
                        <td className="px-6 py-4">
                           <div className="font-semibold text-sm text-on-surface mb-0.5">Gi Uniform - Size A2</div>
                           <div className="text-xs text-on-surface-variant">White, Standard Weave</div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-on-surface text-sm">1</td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface text-sm">$35.00</td>
                        <td className="px-6 py-4 text-right font-medium text-on-surface text-sm">$35.00</td>
                     </tr>
                  </tbody>
                  <tfoot className="bg-surface-container/20">
                     <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-xs font-bold text-on-surface-variant">Subtotal</td>
                        <td className="px-6 py-4 text-right font-semibold text-on-surface text-sm">$185.00</td>
                     </tr>
                     <tr>
                        <td colSpan={3} className="px-6 py-3 text-right text-xs font-bold text-on-surface-variant">Tax (0%)</td>
                        <td className="px-6 py-3 text-right font-semibold text-on-surface text-sm">$0.00</td>
                     </tr>
                     <tr className="bg-surface-container-high/50 border-t border-surface-container-high">
                        <td colSpan={3} className="px-6 py-5 text-right font-bold text-base text-on-surface">Total</td>
                        <td className="px-6 py-5 text-right font-bold text-primary text-xl">$185.00</td>
                     </tr>
                  </tfoot>
               </table>
            </div>
         </div>

         <div className="w-full lg:w-80 space-y-6">
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col gap-6">
               <h3 className="font-bold text-lg text-on-surface flex items-center gap-2"><CreditCard className="w-5 h-5"/> Payment Details</h3>
               
               <div className="bg-surface border border-surface-container-highest rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-8 bg-white rounded shadow-sm flex items-center justify-center p-1">
                     <svg viewBox="0 0 32 20" fill="none"><path d="M12.92 13.91H11.08L12.21 6.84H14.05L12.92 13.91ZM22.61 7.02C22.38 6.94 21.94 6.81 21.36 6.81C19.56 6.81 18.24 7.76 18.24 9.14C18.2 10.15 19.16 10.72 19.86 11.05C20.59 11.39 20.85 11.61 20.85 11.93C20.83 12.44 20.21 12.65 19.65 12.65C18.88 12.65 18.42 12.45 18.06 12.29L17.76 13.68C18.15 13.85 18.81 14.02 19.48 14.04C21.41 14.04 22.71 13.1 22.74 11.65C22.75 10.96 22.25 10.42 19.98 9.35C19.34 9.04 18.96 8.84 18.98 8.44C18.98 8.01 19.46 7.66 20.48 7.66C21.1 7.64 21.6 7.76 22 7.93L22.61 7.02ZM29.28 13.91H30.88L28.78 6.84H27.35C26.96 6.84 26.65 7.06 26.49 7.42L22.6 13.91H24.52L24.9 12.87H27.23L27.46 13.91H29.28ZM25.43 11.39L26.39 8.78L26.94 11.39H25.43ZM10.59 6.84H8.38L4.35 13.91H6.26L7 11.89H10.66L10.59 6.84Z" fill="#1434CB"/></svg>
                  </div>
                  <div>
                     <div className="font-bold text-sm text-on-surface">•••• •••• •••• 4242</div>
                     <div className="text-xs text-on-surface-variant">Expires 12/25</div>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-on-surface-variant">Transaction ID</span>
                     <span className="font-mono text-on-surface">ch_3N1X8x...</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-on-surface-variant">Processed By</span>
                     <span className="text-on-surface font-medium">Stripe</span>
                  </div>
               </div>
            </div>

            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex flex-col gap-6">
               <h3 className="font-bold text-lg text-on-surface flex items-center gap-2"><User className="w-5 h-5"/> Customer</h3>
               
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container-highest flex items-center justify-center font-bold text-sm text-on-surface">MJ</div>
                  <div>
                     <div className="font-bold text-sm text-on-surface">Marcus Johnson</div>
                     <div className="text-xs text-on-surface-variant">marcus.j@example.com</div>
                  </div>
               </div>

               <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-between">
                  View Profile <span className="text-lg">→</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
