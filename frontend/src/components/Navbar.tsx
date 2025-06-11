import { Shield } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <div className="fixed top-0 w-full bg-white backdrop-blur z-50 border-b px-24">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">SecureAuth</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button className="cursor-pointer" variant={"ghost"}>
              Sign In
            </Button>
            <Button className="bg-green-600 hover:bg-green-700/95 cursor-pointer">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
