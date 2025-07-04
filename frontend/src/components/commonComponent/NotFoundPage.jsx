import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-[92vh] bg-gradient-to-r from-blue-50 to-white overflow-hidden">
      <h1 className="text-[10rem] md:text-[12rem] font-extrabold text-blue-600 drop-shadow-lg">
        404
      </h1>
      <div className="bg-blue-600 text-white px-4 py-1 text-sm rounded-md rotate-6 shadow-md mb-4">
        Page Not Found
      </div>
      <p className="text-lg md:text-2xl text-center text-gray-700 max-w-md">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 shadow-lg"
      >
        Go Back Home
      </Link>
    </div>
  );
}
