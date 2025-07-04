import { Link } from 'react-router-dom';

export default function ServerErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-[92vh] bg-gradient-to-r from-red-50 to-white overflow-hidden">
      <h1 className="text-[10rem] md:text-[12rem] font-extrabold text-red-600 drop-shadow-lg">
        500
      </h1>
      <div className="bg-red-600 text-white px-4 py-1 text-sm rounded-md rotate-6 shadow-md mb-4">
        Server Error
      </div>
      <p className="text-lg md:text-2xl text-center text-gray-700 max-w-md">
        Oops! Something went wrong on our end. We're working to fix it.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300 shadow-lg"
      >
        Go Back Home
      </Link>
    </div>
  );
}
