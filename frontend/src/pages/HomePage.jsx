import Clock from "../components/Clock";
import TeamView from "../components/TeamView";

const HomePage = () => {
  return (
    <div className=" h-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex justify-center">
          <div className="w-full max-w-[600px]">
            <Clock />
          </div>
        </div>


        <div className="flex justify-center">
          <div className="w-full max-w-[600px]">
            <TeamView />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
