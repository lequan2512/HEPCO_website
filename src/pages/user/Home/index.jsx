import Hero from '../../../components/Hero';
import HomeStats from '../../../components/HomeStats';
import CoreValues from '../../../components/CoreValues';
import HomeServices from '../../../components/HomeServices';
import HomeOccasions from '../../../components/HomeOccasions';
import HomeWhyChoose from '../../../components/HomeWhyChoose';
import HomeShowcase from '../../../components/HomeShowcase';
import HomeTestimonials from '../../../components/HomeTestimonials';
import HomeCtaBanner from '../../../components/HomeCtaBanner';
import HomeImageSlider from '../../../components/HomeImageSlider';
import NewsPartnersAwards from '../../../components/NewsPartnersAwards';
import FaqContact from '../../../components/FaqContact';
import ScrollAnimation from '../../../components/ScrollAnimation';

import { useShowcase } from '../../../apis/showcase';

const components = {
  hero: Hero,
  stats: HomeStats,
  utilities: CoreValues,
  services: HomeServices,
  sectors: HomeOccasions,
  why: HomeWhyChoose,
  showcase: HomeShowcase,
  banners: HomeImageSlider,
  testimonials: HomeTestimonials,
  cta: HomeCtaBanner,
  news: NewsPartnersAwards,
  faq: FaqContact,
};

const defaultSections = Object.keys(components).map((id) => ({ id, visible: true }));

const Home = () => {
  const { data } = useShowcase();
  const homeConfig = data?.data || {};
  const sections = homeConfig.sections ?? defaultSections;

  return (
    <div className="w-full bg-white overflow-hidden">
      {sections.map(({ id, visible }) => {
        const Section = components[id];
        if (!visible || !Section) return null;
        const sectionProps = {
          config: id === 'utilities' ? homeConfig.utilities : homeConfig[id],
          homeConfig
        };
        if (id === 'hero' || id === 'stats') return <Section key={id} {...sectionProps} />;
        return (
          <ScrollAnimation key={id} animation="fade-up" duration={700}>
            <Section {...sectionProps} />
          </ScrollAnimation>
        );
      })}
    </div>
  );
};

export default Home;
