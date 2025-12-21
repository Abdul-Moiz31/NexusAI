import { Link } from "react-router-dom";
import { ArrowRight, Brain, Sparkles, Zap, Network } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0d1117]">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Next Generation AI Engineering</span>
            </span>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
              Build the Future with{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                NexusAI
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience production-grade AI with LangGraph Agents, RAG, and Multi-Agent Orchestration. 
              Built for engineers who want to go beyond the basics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/chat"
                className="group flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <span>Start Chatting</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-[#30363d] rounded-xl font-semibold transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-lg">
                <Brain className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-gray-300">GPT-4o Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-lg">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-gray-300">AI Agents</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-lg">
                <Network className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">Multi-Agent System</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
