import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/landing/Hero";
import About from "./components/landing/About";
import Features from "./components/landing/Features";
import Contact from "./components/landing/Contact";
import ChatInterface from "./components/chat/ChatInterface";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Features />
      <Contact />
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
