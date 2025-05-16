import { Button } from "../components/ui/button";

const Home = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white px-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-extrabold tracking-wide mb-4">Welcome</h1>
        <p className="text-lg text-zinc-400 mb-6">
          Secure authentication made simple.
        </p>
        <Button className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 transition-all">
          Login / Register
        </Button>
      </div>
    </div>
  );
};

export default Home;
