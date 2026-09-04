
const ProductTypePills = ({ 
  productTypes, 
  selectedProductType, 
  onSelectType,
  triggerAnimation,
  extraButton
}) => {
  if (!productTypes || productTypes.length === 0) return null;

  const handleSelect = (type) => {
    if (selectedProductType !== type) {
      triggerAnimation();
      onSelectType(type);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 animate-fade-in-up">
      {productTypes.map((type) => {
        const isActive = selectedProductType === type;
        return (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            className={`
              group relative flex items-center justify-center px-4 sm:px-6 py-2.5 rounded-xl
              text-[12px] font-bold uppercase tracking-wider
              transition-all duration-300 ease-out cursor-pointer whitespace-nowrap
              select-none
              text-center
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/60 scale-105 -translate-y-0.5'
                : 'bg-white dark:bg-[#151c2b] text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-[#263449] hover:border-blue-400 dark:hover:border-blue-500/60 hover:text-blue-600 dark:hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 hover:scale-[1.03] active:scale-95'
              }
            `}
            title={`Ver ${type}`}
          >
            {type}
            {isActive && (
              <span className="absolute inline-flex w-4 h-4 items-center justify-center -left-1 -top-1 rounded-full bg-emerald-400 text-white shadow shadow-emerald-500/40 text-[9px] font-black leading-none">
                ✓
              </span>
            )}
          </button>
        );
      })}

      {extraButton}
    </div>
  );
};

export default ProductTypePills;
