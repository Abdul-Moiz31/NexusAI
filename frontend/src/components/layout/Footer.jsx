import { Brain, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#161b22] border-t border-[#30363d] py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NexusAI</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <Link to="/chat" className="text-sm text-gray-400 hover:text-white transition-colors">
              Chat
            </Link>
            <a href="#contact" className="text-sm text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>using FastAPI & React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
