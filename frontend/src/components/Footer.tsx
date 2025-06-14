import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 text-zinc-100 mb-2 border-t-[0.5px] border-zinc-400 min-w-2xl">
      <div className="flex items-center justify-center mt-2 gap-1">
        <span className="block">
          Made with <Heart className="inline border-none" /> by
        </span>
        <span className="block cursor-pointer hover:text-red-400">
          {" "}
          akgbytes
        </span>
      </div>
    </footer>
  );
};
export default Footer;
