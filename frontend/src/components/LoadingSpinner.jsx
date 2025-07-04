const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-opacity-20 z-50">
      <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
