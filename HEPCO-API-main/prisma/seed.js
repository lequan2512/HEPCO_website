const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  console.log('Bắt đầu khôi phục dữ liệu cho các bảng news, banners, users, ip_whitelists...');

  // 1. Seed IP Whitelist
  await prisma.ipWhitelist.upsert({
    where: { ip: '127.0.0.1' },
    update: {},
    create: {
      ip: '127.0.0.1',
      description: 'Localhost IPv4',
    },
  });

  await prisma.ipWhitelist.upsert({
    where: { ip: '::1' },
    update: {},
    create: {
      ip: '::1',
      description: 'Localhost IPv6',
    },
  });

  // 2. Seed Admin User
  await prisma.users.upsert({
    where: { username: 'hepco' },
    update: {},
    create: {
      username: 'hepco',
      password: 'Hepco@2026',
    },
  });

  await prisma.users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: '123456',
    },
  });

  // 3. Seed Banners
  const banners = [
    { url: '/images/hero_banner_1.png' },
    { url: '/images/hero_banner_2.png' },
    { url: '/images/hero_banner_3.png' }
  ];

  const existingBanners = await prisma.banner.count();
  if (existingBanners === 0) {
    for (const b of banners) {
      await prisma.banner.create({ data: b });
    }
  }

  // 4. Seed News
  const newsList = [
    {
      title: 'HEPCO đồng hành cùng ngày hội "Chủ Nhật Xanh" dọn sạch rác thải dọc hai bờ sông Hương',
      date: '14-06-2026',
      type: 'news',
      thumbnail: '/images/news_cleanup.png',
      content: `<p class="mb-4">Sáng ngày 14/06/2026, Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) đã phối hợp cùng Đoàn Thanh niên Thành phố Huế tổ chức ra quân chiến dịch <strong>"Ngày Chủ Nhật Xanh - Vì một Huế xanh - sạch - sáng"</strong>. Hoạt động thu hút sự tham gia tích cực của hơn 200 cán bộ, công nhân viên và đoàn viên thanh niên công ty.</p><p class="mb-4">Tại buổi ra quân, các lực lượng đã tập trung thu gom rác thải, phế thải xây dựng, xóa quảng cáo rao vặt trái phép và làm sạch cỏ dại tại khu vực công viên dọc hai bờ sông Hương, đoạn từ cầu Trường Tiền đến cầu Dã Viên.</p>`
    },
    {
      title: 'HEPCO đưa vào vận hành dàn xe ép rác chuyên dùng thế hệ mới, giảm thiểu tiếng ồn và khí thải',
      date: '18-06-2026',
      type: 'news',
      thumbnail: '/images/news_trucks.png',
      content: `<p class="mb-4">Để đáp ứng yêu cầu ngày càng cao về bảo vệ môi trường và mỹ quan đô thị của thành phố du lịch Huế, vừa qua, HEPCO đã tổ chức bàn giao và đưa vào vận hành dàn xe cuốn ép rác chuyên dụng thế hệ mới cực kỳ hiện đại.</p>`
    },
    {
      title: 'Xanh hóa Cố đô: HEPCO ra quân trồng hơn 1.000 cây xanh và hoa trang trí quanh Đại Nội Huế',
      date: '10-06-2026',
      type: 'news',
      thumbnail: '/images/news_planting.png',
      content: `<p class="mb-4">Thực hiện chỉ đạo của Ủy ban Nhân dân thành phố về việc chỉnh trang đô thị, Đội Công viên Cây xanh thuộc HEPCO đã đồng loạt ra quân triển khai dự án cải tạo cảnh quan, trồng mới hơn 1.000 cây xanh đô thị.</p>`
    },
    {
      title: 'Đại hội đồng Cổ đông thường niên năm 2026 của HEPCO thành công tốt đẹp',
      date: '28-05-2026',
      type: 'news',
      thumbnail: '/images/news_meeting.png',
      content: `<p class="mb-4">Vào sáng ngày 28/05/2026, tại TP. Huế, Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) đã long trọng tổ chức Đại hội đồng Cổ đông thường niên năm 2026.</p>`
    }
  ];

  const existingNews = await prisma.news.count();
  if (existingNews === 0) {
    for (const n of newsList) {
      await prisma.news.create({ data: n });
    }
  }

  // 5. Seed Services News
  const service1 = {
    title: 'Rác thải sinh hoạt',
    date: '24/12/2024',
    type: 'service',
    thumbnail: '/images/services_banner.png',
    content: `<div class="service-content p-4 bg-white"><p class="mb-4 text-gray-700">Ban hành kèm theo quyết định số 660/QĐ-MTĐT ngày 24 tháng 12 năm 2024.</p><p class="mb-2 text-gray-700">Đơn giá dịch vụ thu gom, vận chuyển và xử lý rác thải sinh hoạt bằng phương pháp đốt là: <strong class="text-red-600">436.000đ/m³</strong>.</p></div>`
  };

  const service2 = {
    title: 'Rác thải công nghiệp thông thường',
    date: '24/12/2024',
    type: 'service',
    thumbnail: '/images/services_banner.png',
    content: `<div class="service-content p-4 bg-white"><p class="mb-4 text-gray-700">Ban hành kèm theo quyết định số 660/QĐ-MTĐT ngày 24 tháng 12 năm 2024.</p><p>Đơn giá (đ/tấn): 371.000 đ</p></div>`
  };

  const service3 = {
    title: 'Chở nước, tưới đường',
    date: '24/12/2024',
    type: 'service',
    thumbnail: '/images/services_banner.png',
    content: `<div class="service-content p-4 bg-white"><p class="mb-4 text-gray-700">Ban hành kèm theo quyết định số 660/QĐ-MTĐT ngày 24 tháng 12 năm 2024.</p></div>`
  };

  const services = [service1, service2, service3];
  const serviceCount = await prisma.news.count({ where: { type: 'service' } });
  if (serviceCount === 0) {
    for (const srv of services) {
      await prisma.news.create({ data: srv });
    }
  }

  console.log('Khôi phục dữ liệu hoàn tất!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Lỗi khi seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
