const ColoredBorder = ({ color = "blue" }: { color?: "blue" | "green" | "purple" }) => {
  const colorClasses = {
    blue: "from-transparent via-blue-500/50 to-transparent",
    green: "from-transparent via-green-500/50 to-transparent",
    purple: "from-transparent via-purple-500/50 to-transparent",
  };

  const colorClass = colorClasses[color];

  return (
    <>
      {/* Top border */}
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${colorClass}`} />
      {/* Bottom border */}
      <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r ${colorClass} opacity-60`} />
      {/* Left border */}
      <div className={`absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b ${colorClass}`} />
      {/* Right border */}
      <div className={`absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b ${colorClass} opacity-60`} />
    </>
  );
};

export default ColoredBorder;
