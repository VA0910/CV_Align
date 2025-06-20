function FeatureCard({ title, hoverType }) {
  const baseClasses = "rounded-xl w-64 h-80 p-6 bg-[#04364A] text-center shadow-md transition-transform duration-300";
  const hoverEffect =
    hoverType === "color"
      ? "hover:bg-[#064663] hover:scale-110"
      : "hover:opacity-90 hover:scale-110";

  return (
    <div className={`${baseClasses} ${hoverEffect}`}>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="rounded-xl w-full h-40 bg-white mb-4"></div>
      <p className="text-sm text-gray-200">
         
      </p>
    </div>
  );
}

export default FeatureCard;
