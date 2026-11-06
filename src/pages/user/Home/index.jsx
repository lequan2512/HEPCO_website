import Hero from '../../../components/Hero';
import CoreValues from '../../../components/CoreValues';
import HomeServices from '../../../components/HomeServices';
import HomeUpdates from './components/HomeUpdates';
import HomeContact from './components/HomeContact';

const Home = () => (
  <div className="w-full bg-white">
    <Hero />
    <CoreValues />
    <HomeUpdates />
    <HomeServices />
    <HomeContact />
  </div>
);
export default Home;
