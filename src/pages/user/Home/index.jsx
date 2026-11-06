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

const Home = () => {
  return (
    <div className="w-full bg-white overflow-hidden">
      {/* 1. Hero Section (Oakdale Tents display title, dual CTAs, video spotlight) */}
      <Hero />

      {/* 2. Stats Strip (Oakdale Tents 4-metric credibility bar) */}
      <HomeStats />

      {/* 3. Online Utilities (Lịch gom rác, Hóa đơn điện tử, Báo cáo sự cố, Đăng ký dịch vụ) */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <CoreValues />
      </ScrollAnimation>

      {/* 4. Core Services (Oakdale Tents "Our Rentals / Everything You Need" Grid) */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeServices />
      </ScrollAnimation>

      {/* 5. Occasions / Service Sectors (Oakdale Tents "Perfect For Every Occasion") */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeOccasions />
      </ScrollAnimation>

      {/* 6. Why Choose Us (Oakdale Tents "Experience The Difference / 4 Pillars") */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeWhyChoose />
      </ScrollAnimation>

      {/* 8. Field Operations & Project Showcase (Oakdale Tents "Real Events. Real Memories.") */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeShowcase />
      </ScrollAnimation>

      {/* 9. Image Slider / Event Banners */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeImageSlider />
      </ScrollAnimation>

      {/* 10. Testimonials (Oakdale Tents "What Our Clients Say / Kind Words") */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeTestimonials />
      </ScrollAnimation>

      {/* 11. Large CTA Banner (Oakdale Tents "Let’s Make Your Event Unforgettable") */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <HomeCtaBanner />
      </ScrollAnimation>

      {/* 12. News, Strategic Partners & Awards */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <NewsPartnersAwards />
      </ScrollAnimation>

      {/* 13. FAQ & Contact Inquiry Form + Map */}
      <ScrollAnimation animation="fade-up" duration={700}>
        <FaqContact />
      </ScrollAnimation>
    </div>
  );
};

export default Home;
