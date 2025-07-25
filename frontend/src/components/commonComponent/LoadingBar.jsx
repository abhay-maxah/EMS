const LoadingBar = () => {
  return (
    <div className="w-full h-[1.5px] overflow-hidden relative">
      <div className="absolute left-[-100%] w-full h-full bg-gray-300 animate-slide-right" />

      <style>
        {`
          @keyframes slide-right {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          .animate-slide-right {
            animation: slide-right 1.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default LoadingBar;
