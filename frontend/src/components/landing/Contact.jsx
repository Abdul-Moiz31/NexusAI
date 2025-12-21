import { Mail, MessageSquare } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 text-center text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Building?</h2>
            <p className="text-blue-100 mb-10 text-lg">
              Join the future of AI engineering today. Explore the code, contribute, or start your own journey with NexusAI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="px-8 py-4 bg-white text-primary rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2 w-full sm:w-auto justify-center">
                <Mail className="w-5 h-5" />
                <span>Contact Deployment</span>
              </button>
              <button className="px-8 py-4 bg-primary/20 backdrop-blur-sm border border-white/20 text-white rounded-full font-bold hover:bg-primary/30 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center">
                <MessageSquare className="w-5 h-5" />
                <span>Join Community</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
