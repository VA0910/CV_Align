import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import Button from "../components/Button";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-[#041C32] to-[#04293A] min-h-screen text-white">
      <Navbar />

      <div className="text-center py-6 px-36">
        <h1 className="text-5xl font-bold">CV ALIGN</h1>
        <p className="text-teal-300 text-xl mt-4">Align your CV to job descriptions using intelligent, recruiter-style feedback</p>
        <p className="text-gray-300 max-w-3xl mx-auto mt-2 leading-relaxed">
        CV Align is a smart, AI-driven CV evaluation platform that analyzes your resume against job descriptions and delivers detailed, structured feedback. Leveraging modern Retrieval-Augmented Generation (RAG) pipelines and GenAI models, it mimics the decision-making process of Applicant Tracking Systems (ATS) and human recruiters.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
          <FeatureCard title="Smart CV Analysis" hoverType="color" />
          <div className="mt-16 md:mt-8">
            <FeatureCard title="Cloud Storage + Live Dashboard" hoverType="color" />
          </div>
          <FeatureCard title="RAG-based Evaluation Pipeline" hoverType="color" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button text="GET STARTED" outlined />
          <div onClick={() => navigate('/register-company')}>
            <Button text="REGISTER COMPANY" outlined />
          </div>
          <div onClick={() => navigate('/contact-us')}>
            <Button text="CONTACT US" outlined />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
