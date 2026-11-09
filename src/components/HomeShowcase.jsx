import { useShowcase } from '../apis/showcase';
import HomeShowcaseView from './HomeShowcaseView';

export const SHOWCASE_2026_DEFAULT = {
  title: 'Hoạt Động & Dự Án Trọng Điểm 2026',
  description: 'Hình ảnh công tác thực tế của đội ngũ cán bộ công nhân viên HEPCO trên khắp các nẻo đường Cố đô Huế năm 2026.',
  linkLabel: 'Thư Viện Hình Ảnh & Hoạt Động',
  href: '/tin-tuc?tab=gallery',
  items: [
    {
      id: 'trucks-2026',
      title: 'Đoàn Phương Tiện Chuyên Dụng Thu Gom Rác 2026',
      subtitle: 'Hiện đại hóa quy trình thu gom & vận chuyển',
      location: 'Các tuyến đường trục chính, TP. Huế',
      scale: '100+ Xe chuyên dùng thế hệ mới',
      image: '/uploads/images/RacThai_42b22196.jpg',
      href: '/tin-tuc/20263',
      linkLabel: 'Xem lịch trình'
    },
    {
      id: 'huan-luyen-2026',
      title: 'Huấn Luyện An Toàn & Vệ Sinh Lao Động Năm 2026',
      subtitle: 'Bảo hộ và an toàn tuyệt đối cho người lao động',
      location: 'Hội trường Trung tâm HEPCO',
      scale: 'Toàn thể 1.000+ CBCNV công ty',
      image: 'https://res.cloudinary.com/doy7sp8ah/image/upload/v1785398891/hepco_news/cjvihyz2gychrt5f2z5q.jpg',
      href: '/tin-tuc/2',
      linkLabel: 'Xem chi tiết'
    },
    {
      id: 'parks-2026',
      title: 'Chăm Sóc & Tôn Tạo Công Viên Di Sản Huế',
      subtitle: 'Duy tu cảnh quan xanh - sạch - sáng',
      location: 'Dọc bờ sông Hương & công viên trung tâm',
      scale: '50+ Hécta thảm cỏ, hoa cảnh',
      image: '/uploads/images/HL-2_a07c11d6.jpg',
      href: '/tin-tuc?tab=gallery',
      linkLabel: 'Xem thư viện ảnh'
    },
    {
      id: 'dhcd-2026',
      title: 'Đại Hội Đồng Cổ Đông Thường Niên Năm 2026',
      subtitle: 'Chiến lược phát triển & công bố minh bạch',
      location: 'Trụ sở chính HEPCO, TP. Huế',
      scale: 'Phiên họp thường niên năm 2026',
      image: 'https://res.cloudinary.com/doy7sp8ah/image/upload/v1785398910/hepco_news/xcuzby8c8hzjkv6ozgid.jpg',
      href: '/tin-tuc/4',
      linkLabel: 'Xem văn kiện'
    }
  ]
};

const HomeShowcase = () => {
  const { data } = useShowcase();
  const config = data?.data;

  // Use 2026 flagship activities if no server data or if server data contains legacy placeholder illustrations
  const hasLegacyPlaceholders =
    !config?.items ||
    !config.items.length ||
    config.items.some(
      (item) =>
        item.image?.includes('news_trucks') ||
        item.image?.includes('news_planting') ||
        item.image?.includes('news_cleanup') ||
        item.image?.includes('news_meeting')
    );

  const finalConfig = hasLegacyPlaceholders ? SHOWCASE_2026_DEFAULT : config;
  return <HomeShowcaseView config={finalConfig} />;
};

export default HomeShowcase;
