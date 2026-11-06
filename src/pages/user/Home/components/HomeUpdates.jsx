import { Link } from 'react-router-dom';
import { useGetNews } from '../../../../apis/news';
import { ROUTES } from '../../../../constants/routes';

const HomeUpdates = () => {
  const { data, isPending, isError, refetch } = useGetNews({ type: 'news', limit: 4 });
  const items = data?.data || [];
  return (
    <section className="py-12 md:py-16 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-emerald-900">Tin tức – Thông báo</h2>
          <Link to={ROUTES.NEWS} className="text-emerald-800 font-semibold underline underline-offset-4">Xem tất cả</Link>
        </div>
        {isPending ? <p role="status">Đang tải tin tức…</p> : isError ? (
          <div role="alert"><p>Chưa tải được tin tức.</p><button type="button" onClick={() => refetch()} className="mt-3 underline text-emerald-800">Thử lại</button></div>
        ) : items.length === 0 ? <p>Chưa có tin tức được công bố.</p> : (
          <ul className="grid md:grid-cols-2 gap-x-8">
            {items.map((item) => (
              <li key={item.id} className="py-5 border-t border-gray-200">
                <Link to={`/bai-viet/${item.id}`} className="block text-lg font-medium text-gray-900 hover:text-emerald-800 underline-offset-4 hover:underline">{item.title}</Link>
                {item.date && <p className="mt-2 text-sm text-gray-600">{item.date}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
export default HomeUpdates;
