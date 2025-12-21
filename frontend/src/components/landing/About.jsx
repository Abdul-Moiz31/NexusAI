import { motion } from "framer-motion";
import { Brain, Code2, Cpu, Database } from "lucide-react";

const About = () => {
  const stats = [
    { icon: Brain, label: "AI Models", value: "GPT-4o" },
    { icon: Code2, label: "Framework", value: "LangChain" },
    { icon: Database, label: "Vector DB", value: "ChromaDB" },
    { icon: Cpu, label: "Orchestration", value: "LangGraph" },
  ];

  return (
    <section id="about" className="py-24 bg-[#0d1117]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
              About NexusAI
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
              Production-Grade AI Engineering
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              NexusAI is a comprehensive hands-on masterclass in AI Engineering. 
              Learn to build production-ready AI systems from the ground up.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Description */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">What You'll Learn</h3>
                <ul className="space-y-3">
                  {[
                    "FastAPI Backend Development",
                    "LLM Integration & Streaming",
                    "RAG (Retrieval Augmented Generation)",
                    "AI Agents with Tool Calling",
                    "Multi-Agent Orchestration",
                    "Vector Databases & Embeddings",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Tech Stack</h3>
                <ul className="space-y-3">
                  {[
                    "Python + FastAPI",
                    "React + Tailwind CSS",
                    "OpenAI GPT-4o",
                    "LangChain & LangGraph",
                    "ChromaDB Vector Store",
                    "SQLite Database",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
