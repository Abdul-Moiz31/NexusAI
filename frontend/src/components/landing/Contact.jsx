import { Mail, MessageSquare, Github, Twitter } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-[#0d1117]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">
              Get in Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
              Ready to Build?
            </h2>
            <p className="text-xl text-gray-400">
              Start exploring NexusAI and build your own AI-powered applications.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Try the Chat</h3>
              <p className="text-gray-400 mb-4">
                Experience NexusAI firsthand. Test all modes and features.
              </p>
              <a
                href="/chat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all"
              >
                <span>Open Chat</span>
              </a>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Contact Us</h3>
              <p className="text-gray-400 mb-4">
                Have questions? Reach out and we'll help you get started.
              </p>
              <a
                href="mailto:contact@nexusai.dev"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white border border-[#30363d] rounded-lg font-medium transition-all"
              >
                <span>Send Email</span>
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="#"
              className="w-12 h-12 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
