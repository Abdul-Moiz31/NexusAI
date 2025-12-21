import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60" />
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop"
                alt="AI Technology"
                className="relative rounded-2xl shadow-2xl z-10 w-full object-cover h-[400px]"
              />
            </motion.div>
          </div>

          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">About NexusAI</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Bridging the Gap Between Theory and Practice</h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                NexusAI isn't just another chatbot. It's a comprehensive educational platform designed to demonstrate the cutting-edge capabilities of modern AI Engineering.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Production-grade FastAPI Backend",
                  "Advanced RAG with Vector Databases",
                  "Multi-Agent Orchestration via LangGraph",
                  "Tool Calling & Streamed Responses"
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3 text-gray-700">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a href="#features" className="text-primary font-semibold hover:text-blue-700 transition-colors inline-flex items-center space-x-2">
                <span>Explore Features</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
