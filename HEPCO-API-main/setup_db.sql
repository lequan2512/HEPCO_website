IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'HEPCO_DB')
BEGIN
    CREATE DATABASE HEPCO_DB;
END
GO

USE HEPCO_DB;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
    
    INSERT INTO Users (username, password) VALUES ('admin', '123456');
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'News')
BEGIN
    CREATE TABLE News (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        category NVARCHAR(100) NOT NULL,
        date VARCHAR(20) NOT NULL,
        author NVARCHAR(100) NOT NULL,
        image NVARCHAR(500),
        excerpt NVARCHAR(MAX),
        content NVARCHAR(MAX)
    );

    INSERT INTO News (title, category, date, author, image, excerpt, content)
    VALUES 
    (
        N'HEPCO đồng hành cùng ngày hội "Chủ Nhật Xanh" dọn sạch rác thải dọc hai bờ sông Hương',
        N'Bảo vệ Môi trường',
        '14-06-2026',
        N'Ban Truyền Thông',
        N'/images/news_cleanup.png',
        N'Hưởng ứng phong trào Ngày Chủ Nhật Xanh của thành phố Huế, hơn 200 cán bộ công nhân viên HEPCO đã ra quân thu gom rác thải nhựa và dọn dẹp vệ sinh dọc tuyến đường đi bộ bờ sông Hương.',
        N'<p class="mb-4">Sáng ngày 14/06/2026, Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) đã phối hợp cùng Đoàn Thanh niên Thành phố Huế tổ chức ra quân chiến dịch <strong>"Ngày Chủ Nhật Xanh - Vì một Huế xanh - sạch - sáng"</strong>. Hoạt động thu hút sự tham gia tích cực của hơn 200 cán bộ, công nhân viên và đoàn viên thanh niên công ty.</p><p class="mb-4">Tại buổi ra quân, các lực lượng đã tập trung thu gom rác thải, phế thải xây dựng, xóa quảng cáo rao vặt trái phép và làm sạch cỏ dại tại khu vực công viên dọc hai bờ sông Hương, đoạn từ cầu Trường Tiền đến cầu Dã Viên. Đây là khu vực trọng điểm thu hút đông đảo khách du lịch và người dân địa phương đến vui chơi, tập thể dục hằng ngày.</p><blockquote class="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">"Giữ gìn cảnh quan sông Hương không chỉ là trách nhiệm chuyên môn của HEPCO mà còn là tình yêu của mỗi người con xứ Huế gửi gắm vào dòng sông di sản này." - Đại diện Ban Truyền Thông công ty chia sẻ.</blockquote><p class="mb-4">Kết quả sau một buổi sáng làm việc khẩn trương và trách nhiệm, hơn 5 tấn rác thải các loại (chủ yếu là túi nilon, chai nhựa và rác thải sinh hoạt do du khách bỏ lại) đã được thu gom, phân loại và vận chuyển về nhà máy xử lý rác theo đúng quy định.</p><p>Thông qua hoạt động lần này, HEPCO mong muốn lan tỏa mạnh mẽ thông điệp bảo vệ môi trường, nâng cao ý thức giữ gìn vệ sinh nơi công cộng của cộng đồng, góp phần xây dựng Huế trở thành đô thị di sản trực thuộc Trung ương theo hướng xanh, sạch, bền vững.</p>'
    ),
    (
        N'HEPCO đưa vào vận hành dàn xe ép rác chuyên dùng thế hệ mới, giảm thiểu tiếng ồn và khí thải',
        N'Hoạt động Công ty',
        '18-06-2026',
        N'Phòng Kỹ thuật',
        N'/images/news_trucks.png',
        N'Nhằm nâng cao năng lực thu gom và hiện đại hóa quy trình xử lý chất thải đô thị, HEPCO đã chính thức đưa vào sử dụng dàn xe ép rác thế hệ mới đạt tiêu chuẩn khí thải Euro 5.',
        N'<p class="mb-4">Để đáp ứng yêu cầu ngày càng cao về bảo vệ môi trường và mỹ quan đô thị của thành phố du lịch Huế, vừa qua, Công ty Cổ phần Môi trường và Công trình Đô thị Huế (HEPCO) đã tổ chức bàn giao và đưa vào vận hành dàn xe cuốn ép rác chuyên dụng thế hệ mới cực kỳ hiện đại.</p><p class="mb-4">Dàn xe mới bao gồm các dòng xe chuyên dụng có tải trọng từ 5 tấn đến 15 tấn, được nhập khẩu và lắp ráp với công nghệ ép thủy lực tiên tiến nhất. Điểm nổi bật của loạt xe này là trang bị động cơ đạt tiêu chuẩn khí thải Euro 5 thân thiện với môi trường, hệ thống gioăng cao su chống rò rỉ nước rác tuyệt đối và buồng ép kín giảm thiểu tối đa mùi hôi phát tán ra không khí trong quá trình di chuyển.</p><p class="mb-4">Đặc biệt, hệ thống động cơ và bơm thủy lực được tối ưu hóa giúp giảm tiếng ồn vận hành xuống dưới 65dB. Điều này giúp giải quyết triệt để tình trạng tiếng ồn động cơ ảnh hưởng đến giấc ngủ của người dân tại các khu dân cư khi xe thực hiện thu gom rác vào ban đêm.</p><blockquote class="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">"Việc đầu tư dàn xe chuyên dụng mới là một phần trong lộ trình chuyển đổi xanh của HEPCO, nhằm hướng tới một quy trình thu gom rác thông minh, không tiếng ồn, không phát thải mùi hôi tại thành phố Huế." - Trưởng Phòng Kỹ thuật HEPCO cho biết.</blockquote><p>Trong thời gian tới, các xe này sẽ được ưu tiên phân bổ tại các tuyến phố đi bộ trung tâm, khu vực quanh Đại Nội và các phường nội thành để đảm bảo chất lượng phục vụ tốt nhất cho Festival Huế và các mùa lễ hội du lịch cao điểm.</p>'
    ),
    (
        N'Xanh hóa Cố đô: HEPCO ra quân trồng hơn 1.000 cây xanh và hoa trang trí quanh Đại Nội Huế',
        N'Bảo vệ Môi trường',
        '10-06-2026',
        N'Đội Cây xanh',
        N'/images/news_planting.png',
        N'Nhằm tô điểm thêm vẻ đẹp cổ kính của di sản Huế, Đội Công viên Cây xanh HEPCO đã triển khai đề án trồng mới cây bóng mát và hoa trang trí dọc các tuyến đường bao quanh Hoàng Thành.',
        N'<p class="mb-4">Thực hiện chỉ đạo của Ủy ban Nhân dân thành phố về việc chỉnh trang đô thị, Đội Công viên Cây xanh thuộc HEPCO đã đồng loạt ra quân triển khai dự án cải tạo cảnh quan, trồng mới hơn 1.000 cây xanh đô thị và hàng vạn khóm hoa trang trí tại các khu vực trọng điểm quanh Kinh thành Huế.</p><p class="mb-4">Các loại cây được chọn trồng đợt này chủ yếu là cây bản địa có hoa đẹp, tán rộng như Phượng vàng, Ngô đồng, Muồng hoàng yến và Bằng lăng nước. Đây là các loại cây vừa có khả năng thích nghi tốt với thời tiết khắc nghiệt của Huế, vừa giữ gìn nét đặc trưng văn hóa lịch sử của vùng đất Cố đô.</p><p class="mb-4">Song song với việc trồng cây bóng mát, các công nhân lành nghề của HEPCO cũng đã kiến thiết lại các bồn hoa, dải phân cách dọc đường Đoàn Thị Điểm, 23 Tháng 8, Lê Huân bằng các loài hoa rực rỡ như hoa giấy, chiều tím, ngũ sắc thân gỗ... được sắp xếp thành các thảm hoa nghệ thuật uốn lượn đẹp mắt.</p><blockquote class="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">"Mỗi cây xanh được trồng xuống là một lá phổi xanh mới cho thành phố. Chúng tôi hy vọng sự chăm chút tỉ mỉ này sẽ giúp du khách cảm thấy thư thái và ấn tượng hơn khi dạo bước ngắm nhìn Hoàng cung cổ kính." - Tổ trưởng tổ vườn hoa chia sẻ.</blockquote><p>Đề án trồng cây xanh và chỉnh trang cảnh quan đô thị dự kiến sẽ hoàn thành trước cuối tháng 6/2026, mang lại diện mạo xanh mát, thơ mộng chào đón hàng triệu du khách đến với Huế trong dịp hè này.</p>'
    ),
    (
        N'Đại hội đồng Cổ đông thường niên năm 2026 của HEPCO thành công tốt đẹp',
        N'Tin tức Cổ đông',
        '28-05-2026',
        N'Hội đồng Quản trị',
        N'/images/news_meeting.png',
        N'Ngày 28/05/2026, HEPCO đã tổ chức thành công Đại hội đồng Cổ đông thường niên năm 2026. Đại hội đã thông qua kế hoạch kinh doanh với mục tiêu tăng trưởng doanh thu 12%.',
        N'<p class="mb-4">Vào sáng ngày 28/05/2026, tại Hội trường Khách sạn Hương Giang (TP. Huế), Công ty Cổ phần Môi trường và Công trình Đô thị Huế (mã chứng khoán: HEP) đã long trọng tổ chức Đại hội đồng Cổ đông thường niên năm 2026. Đại hội có sự tham dự của các cổ đông đại diện cho hơn 90% số cổ phần có quyền biểu quyết.</p><p class="mb-4">Báo cáo tại Đại hội, Ban điều hành HEPCO cho biết trong năm tài chính vừa qua, mặc dù gặp nhiều khó khăn chung của nền kinh tế, công ty vẫn hoàn thành xuất sắc các chỉ tiêu kế hoạch kinh doanh được giao. Tổng doanh thu đạt hơn 350 tỷ đồng, lợi nhuận sau thuế đạt 24,5 tỷ đồng, tỷ lệ chia cổ tức bằng tiền mặt dự kiến là 10%.</p><p class="mb-4">Về định hướng phát triển năm 2026, HĐQT đề ra mục tiêu tăng trưởng doanh thu tối thiểu 12%, đẩy mạnh chuyển đổi số trong quản lý vận hành xe rác bằng định vị GPS thông minh, đầu tư nâng công suất nhà máy phân loại xử lý rác thải hữu cơ sản xuất phân vi sinh hữu cơ chất lượng cao.</p><blockquote class="border-l-4 border-hepco-green pl-4 italic my-6 text-gray-600 bg-gray-50 py-2 rounded-r">"Đại hội đồng Cổ đông 2026 ghi dấu bước chuyển mình quan trọng của HEPCO sang mô hình kinh tế tuần hoàn, không chỉ làm sạch thành phố mà còn biến rác thải thành tài nguyên sinh lợi cho xã hội và cổ đông." - Chủ tịch HĐQT nhấn mạnh.</blockquote><p>Đại hội đã tiến hành biểu quyết thông qua các tờ trình quan trọng với tỷ lệ nhất trí cao 100%, bầu bổ sung thành viên Ban Kiểm soát nhiệm kỳ mới và kết thúc thành công tốt đẹp vào lúc 11h30 cùng ngày.</p>'
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IpWhitelist')
BEGIN
    CREATE TABLE IpWhitelist (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ip VARCHAR(50) NOT NULL UNIQUE
    );

    -- Seed data for localhost
    INSERT INTO IpWhitelist (ip) VALUES ('127.0.0.1');
    INSERT INTO IpWhitelist (ip) VALUES ('::1');
END
GO
