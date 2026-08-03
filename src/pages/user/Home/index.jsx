import Hero from '../../../components/Hero';
import VisionMission from '../../../components/VisionMission';
import CoreValues from '../../../components/CoreValues';
import HomeServices from '../../../components/HomeServices';
import NewsPartnersAwards from '../../../components/NewsPartnersAwards';
import FaqContact from '../../../components/FaqContact';
import HomeImageSlider from '../../../components/HomeImageSlider';
import ScrollAnimation from '../../../components/ScrollAnimation';

const Home = () => {
  return (
    <div className="w-full bg-white">
      <Hero />

      <ScrollAnimation animation="fade-up" duration={800}>
        <VisionMission />
      </ScrollAnimation>

      <ScrollAnimation animation="zoom-in" duration={800}>
        <CoreValues />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" duration={800}>
        <HomeServices />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" duration={800}>
        <HomeImageSlider />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" duration={800}>
        <NewsPartnersAwards />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" duration={800}>
        <FaqContact />
      </ScrollAnimation>
    </div>
  );
};

export default Home;
