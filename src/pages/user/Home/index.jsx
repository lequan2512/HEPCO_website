import Hero from '../../../components/Hero';
import VisionMission from '../../../components/VisionMission';
import CoreValues from '../../../components/CoreValues';
import HomeServices from '../../../components/HomeServices';
import NewsPartnersAwards from '../../../components/NewsPartnersAwards';
import FaqContact from '../../../components/FaqContact';
import HomeImageSlider from '../../../components/HomeImageSlider';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto w-full bg-white shadow-xl min-h-screen">
      <Hero />
      <VisionMission />
      <CoreValues />
      <HomeServices />
      <HomeImageSlider />
      <NewsPartnersAwards />
      <FaqContact />
    </div>
  );
};

export default Home;
