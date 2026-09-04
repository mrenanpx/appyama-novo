const ExtraCard = ({ icon: Icon, title, price, subtitle }) => (
  <div className="bg-slate-50 dark:bg-[#0b0e14] border border-slate-200 dark:border-[#1e293b] rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-[#162032] transition-all duration-300 shadow-sm cursor-pointer group">
    <div className="flex-shrink-0 text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex flex-col">
      <div className="text-[13px] text-slate-800 dark:text-slate-200 font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {title} {price && <span className="text-blue-600 dark:text-blue-500 ml-1">{price}</span>}
      </div>
      {subtitle && <div className="text-[11px] text-slate-500 dark:text-slate-500 font-medium mt-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-400 transition-colors">{subtitle}</div>}
    </div>
  </div>
);

export default ExtraCard;
