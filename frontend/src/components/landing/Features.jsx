import { MessageSquare, Zap, Network, BookOpen, Database, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: MessageSquare,
    title: "Basic Chat",
    description: "Stream responses from GPT-4o with real-time streaming. Perfect for quick conversations and simple queries.",
    color: "emerald",
  },
  {
    icon: Zap,
    title: "AI Agents",
    description: "Equip AI with tools like Calculator, Web Search, and Knowledge Base. Watch it reason and act autonomously.",
    color: "amber",
  },
  {
    icon: Network,
    title: "Multi-Agent System",
    description: "Supervisor-Worker pattern with specialized agents. The supervisor routes tasks to Researcher or Tutor.",
    color: "purple",
  },
  {
    icon: BookOpen,
    title: "RAG Pipeline",
    description: "Upload documents and query them using semantic search. Perfect for document Q&A and knowledge bases.",
    color: "cyan",
  },
  {
    icon: Database,
    title: "Vector Database",
    description: "ChromaDB stores embeddings locally. Fast similarity search for relevant document retrieval.",
    color: "rose",
  },
  {
    icon: Share2,
    title: "Structured Outputs",
    description: "Force LLMs to return JSON using Pydantic models. Build reliable systems that parse AI responses.",
    color: "orange",
  },
];

const colorClasses = {
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#161b22]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From simple chat to complex multi-agent systems, NexusAI has all the building blocks for advanced AI applications.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 border ${colorClasses[feature.color]}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
