import { useRef, useState } from 'react';
import { ArrowRight, ArrowDown, Play, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { COMPANY } from '../constants/company';
import { getHeroSettings } from '../services/news.service';
import { resolveAssetUrl } from '../utils/assetUrl';

const Hero = () => {
  const videoDialog = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const config = getHeroSettings();

  return (
    <section className="bg-emerald-50/60 border-b border-emerald-100" aria-labelledby="home-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 sm:py-12 lg:py-14 grid lg:grid-cols-2 items-center gap-8 lg:gap-12">
        <div>
          <p className="text-sm font-medium text-emerald-800 mb-4 leading-relaxed">{COMPANY.name}</p>
          <h1 id="home-heading" className="text-3xl sm:text-4xl xl:text-5xl font-semibold text-gray-900 leading-tight tracking-tight">
            {config.headlinePrefix}{' '}
            <span className="text-emerald-800">{config.headlineHighlight}</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-gray-600 max-w-xl">{config.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <a href="#tien-ich" className="inline-flex justify-center items-center gap-2 min-h-12 px-5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium transition-colors">
              Tra cứu & liên hệ <ArrowDown className="w-4 h-4" aria-hidden="true" />
            </a>
            <Link to={ROUTES.SERVICES} className="inline-flex justify-center items-center gap-2 min-h-12 px-5 rounded-lg border border-gray-300 bg-white hover:border-emerald-700 text-gray-800 font-medium transition-colors">
              {config.primaryCtaText || 'Tìm hiểu dịch vụ'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <figure className="min-w-0 overflow-hidden rounded-xl border border-emerald-900/10 bg-white">
          <img
            src={resolveAssetUrl(config.coverImage)}
            alt="Hoạt động và dịch vụ của HEPCO tại Huế"
            width="1400" height="934" fetchPriority="high"
            className={`w-full aspect-[4/3] bg-emerald-950 ${config.coverImage === '/images/services/thu-gom-rac-1.jpg' ? 'object-cover' : 'object-contain'}`}
            onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/services/thu-gom-rac-1.jpg'; }}
          />
          <figcaption className="flex flex-wrap justify-between items-center gap-3 px-4 py-3 text-sm">
            <span className="text-gray-600">HEPCO · Đồng hành cùng đô thị Huế</span>
            <button type="button" onClick={() => { setShowVideo(true); videoDialog.current.showModal(); }} className="inline-flex items-center gap-2 min-h-10 text-emerald-800 font-medium hover:underline">
              <Play className="w-4 h-4" aria-hidden="true" />{config.videoButtonText || 'Video giới thiệu'}
            </button>
          </figcaption>
        </figure>
      </div>
      <dialog ref={videoDialog} aria-label="Video giới thiệu HEPCO" onClose={() => setShowVideo(false)} className="m-auto w-[calc(100%_-_2rem)] max-w-4xl rounded-xl bg-gray-950 text-white p-0 backdrop:bg-black/75">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-medium">Giới thiệu HEPCO</h2>
          <button type="button" aria-label="Đóng video" onClick={() => videoDialog.current.close()} className="p-2 rounded-md hover:bg-white/20"><X className="w-5 h-5" /></button>
        </div>
        {showVideo && <iframe title="Phim giới thiệu HEPCO" src={config.videoUrl} className="w-full aspect-video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
      </dialog>
    </section>
  );
};
export default Hero;
