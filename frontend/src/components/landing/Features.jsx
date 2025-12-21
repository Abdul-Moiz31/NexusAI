import { Bot, Database, Share2, Terminal, Cpu, Layers } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Bot,
    title: "AI Agents",
    description: "Autonomous agents capable of using tools, searching the web, and performing complex tasks."
  },
  {
    icon: Database,
    title: "RAG System",
    description: "Retrieval Augmented Generation allowing the AI to read and understand your custom documents."
  },
  {
    icon: Share2,
    title: "LangGraph",
    description: "Complex multi-agent workflows orchestrated using the graph-based architecture."
  },
  {
    icon: Terminal,
    title: "Tool Calling",
    description: "Empower the LLM to interact with external APIs like calculators and search engines."
  },
  {
    icon: Cpu,
    title: "Streaming API",
    description: "Real-time token streaming for a responsive and engaging user experience."
  },
  {
    icon: Layers,
    title: "Structured Output",
    description: "Guarantee JSON outputs using Pydantic models for reliable software integration."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase mb-2">Capabilities</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Build Modern AI</h3>
          <p className="text-gray-600">Explore the powerful features that make NexusAI a state-of-the-art engineering reference.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
