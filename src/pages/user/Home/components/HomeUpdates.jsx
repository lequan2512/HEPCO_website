import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetNews } from '../../../../apis/news';
import { ROUTES } from '../../../../constants/routes';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import { formatDate } from '../../../../utils/formatDate';

const HomeUpdates = () => {
  const { data, isPending, isError, refetch } = useGetNews({ type: 'news', limit: 4 });
  const [featured, ...items] = data?.data || [];
  return (
    <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-200" aria-labelledby="updates-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div><p className="text-sm font-medium text-emerald-800 mb-2">Thông tin từ HEPCO</p><h2 id="updates-heading" className="text-2xl sm:text-3xl font-semibold text-gray-900">Tin tức & thông báo</h2></div>
          <Link to={ROUTES.NEWS} className="inline-flex items-center gap-2 min-h-11 text-emerald-800 font-medium hover:underline">Xem tất cả tin tức <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
        </div>
        {isPending ? <p role="status" className="min-h-48 flex items-center text-gray-600">Đang tải tin tức…</p> : isError ? (
          <div role="alert" className="p-6 rounded-lg border border-gray-200 bg-white"><p>Chưa tải được tin tức. Vui lòng thử lại.</p><button type="button" onClick={() => refetch()} className="mt-3 min-h-11 underline text-emerald-800">Thử lại</button></div>
        ) : !featured ? <p className="py-8 text-gray-600">Chưa có tin tức được công bố.</p> : (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <article className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <Link to={`/bai-viet/${featured.id}`} className="group block h-full">
                <img src={resolveAssetUrl(featured.thumbnail) || '/images/news_cleanup.png'} alt="" width="800" height="450" loading="lazy" className="w-full aspect-video object-cover bg-gray-100" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/news_cleanup.png'; }} />
                <div className="p-5 sm:p-6">
                  {(featured.date || featured.created_at) && <p className="inline-flex items-center gap-2 text-sm text-gray-500 mb-3"><CalendarDays className="w-4 h-4" aria-hidden="true" />{formatDate(featured.date || featured.created_at)}</p>}
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug group-hover:text-emerald-800">{featured.title}</h3>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 mt-5">Đọc bài viết <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {items.map((item) => <li key={item.id}>
                <Link to={`/bai-viet/${item.id}`} className="group block py-6 sm:py-7">
                  {(item.date || item.created_at) && <p className="text-sm text-gray-500 mb-2">{formatDate(item.date || item.created_at)}</p>}
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 leading-relaxed group-hover:text-emerald-800">{item.title}</h3>
                  <span className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-800">Xem chi tiết <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
                </Link>
              </li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
export default HomeUpdates;
