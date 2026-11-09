> Implementation update (2026-11-07): the legacy reference below predates the current CMS/authentication changes. Use README.md and the paired frontend docs/CMS_DELIVERY.md as the current rollout reference. Login now requires a hashed password and an allowed IP. Protected requests validate the current account and IP; article/banner/upload writes also require CMS_ADMIN_USER_IDS permission. GET /api/session validates the session. Article create/update return { success: true, data: article }; delete returns { success: true, id }. The optional News.metadata column requires the reviewed additive migration before use. These changes are local and not deployed.

# TÀI LIỆU KỸ THUẬT & HƯỚNG DẪN TÍCH HỢP RESTful API - HỆ THỐNG HEPCO (HEPCO-API)

Tài liệu này cung cấp toàn bộ đặc tả kỹ thuật, danh sách endpoint, cấu trúc request/response, mã lỗi và hướng dẫn tích hợp dành cho lập trình viên khi kết nối các hệ thống bên ngoài (Web App, Mobile App, Microservices hoặc Hệ thống quản lý bên thứ 3) với **HEPCO API**.

---

## MỤC LỤC
1. [Tổng quan hệ thống & Kiến trúc](#1-tổng-quan-hệ-thống--kiến-trúc)
2. [Cơ chế Xác thực & Bảo mật (Authentication)](#2-cơ-chế-xác-thực--bảo-mật-authentication)
3. [Quy chuẩn Request & Response](#3-quy-chuẩn-request--response)
4. [Bảng mã lỗi hệ thống (System Error Codes)](#4-bảng-mã-lỗi-hệ-thống-system-error-codes)
5. [Chi tiết các Endpoints theo Phân hệ](#5-chi-tiết-các-endpoints-theo-phân-hệ)
   - [5.1. Authentication (Đăng nhập)](#51-authentication)
   - [5.2. Quản lý Tài khoản (Users)](#52-quản-lý-tài-khoản-users)
   - [5.3. Kiểm tra Trạng thái Hệ thống (Health Check)](#53-kiểm-tra-trạng-thái-hệ-thống-health-check)
   - [5.4. Quản lý Danh sách IP Whitelist](#54-quản-lý-danh-sách-ip-whitelist)
   - [5.5. Quản lý Tin tức & Thông báo (News)](#55-quản-lý-tin-tức--thông-báo-news)
   - [5.6. Quản lý Banner ảnh](#56-quản-lý-banner-ảnh)
   - [5.7. Tải lên tệp đa phương tiện (Uploads)](#57-tải-lên-tệp-đa-phương-tiện-uploads)
   - [5.8. Quản lý Cơ cấu Tổ chức & Phòng ban (Departments)](#58-quản-lý-cơ-cấu-tổ-chức--phòng-ban-departments)
   - [5.9. Quản lý Nhân sự (Employees)](#59-quản-lý-nhân-sự-employees)
   - [5.10. Quản lý Nhà cung cấp (Suppliers)](#510-quản-lý-nhà-cung-cấp-suppliers)
   - [5.11. Quản lý Thiết bị CNTT (IT Devices)](#511-quản-lý-thiết-bị-cntt-it-devices)
   - [5.12. Cấp phát & Thu hồi Thiết bị CNTT (Assignments)](#512-cấp-phát--thu-hồi-thiết-bị-cntt-assignments)
   - [5.13. Quản lý Thiết bị POS Thu phí (POS Devices)](#513-quản-lý-thiết-bị-pos-thu-phí-pos-devices)
   - [5.14. Quản lý Tồn kho & Cấp phát Giấy in POS (POS Paper)](#514-quản-lý-tồn-kho--cấp-phát-giấy-in-pos-pos-paper)
   - [5.15. Tích hợp Nền tảng Điều hành Base.vn (Base Office / Request / Wework)](#515-tích-hợp-nền-tảng-điều-hành-basevn)
6. [Mã nguồn mẫu Tích hợp (Integration Code Samples)](#6-mã-nguồn-mẫu-tích-hợp-integration-code-samples)

---

## 1. TỔNG QUAN HỆ THỐNG & KIẾN TRÚC

- **Nền tảng phát triển:** Node.js (Express 5.x), Prisma ORM 6.x, cơ sở dữ liệu MySQL.
- **Lưu trữ tệp & hình ảnh:** Cloudinary CDN.
- **Base URL phát triển (Dev):** `http://localhost:3000/api`
- **Base URL Vercel / Production:** `https://<domain-production>/api`
- **Giao thức:** HTTP/HTTPS. Toàn bộ payload giao tiếp sử dụng định dạng JSON UTF-8 (ngoại trừ các endpoint upload multipart/form-data).

---

## 2. CƠ CHẾ XÁC THỰC & BẢO MẬT (AUTHENTICATION)

Hệ thống sử dụng cơ chế bảo mật kép:

### 2.1. Xác thực bằng JSON Web Token (JWT)
Đối với các endpoint yêu cầu xác thực (`authMiddleware.verifyToken`), Client phải đính kèm Header:
```http
Authorization: Bearer <access_token>
```
- Token được phát sinh tại endpoint `POST /api/login`.
- Thời hạn hiệu lực: **24 giờ** (1 day).
- Payload của token lưu trữ: `{ id: number, username: string }`.

### 2.2. Kiểm tra Địa chỉ IP (IP Verification)
- Endpoint đăng nhập `POST /api/login` kiểm tra IP của client gửi đến (hỗ trợ đọc từ `x-forwarded-for` hoặc `socket.remoteAddress`).
- Hệ thống giới hạn giao thức **IPv4**. Client dùng IPv6 không hợp lệ sẽ trả về lỗi `ONLY_IPV4_ALLOWED`.

---

## 3. QUY CHUẨN REQUEST & RESPONSE

### 3.1. Headers mặc định
```http
Content-Type: application/json
Accept: application/json
```

### 3.2. Cấu trúc Response thành công với dữ liệu phân trang (Pagination)
Hầu hết các API lấy danh sách đều trả về định dạng chuẩn:
```json
{
  "data": [ ... ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "totalPages": 6,
    "stats": { ... } // (Tùy chọn: Thống kê số lượng theo trạng thái)
  }
}
```

### 3.3. Cấu trúc Response lỗi (Standard Error Format)
Tất cả các lỗi xử lý thông qua Middleware tập trung đều trả về cấu trúc đồng nhất:
```json
{
  "errorCode": "STRING_ERROR_CODE",
  "message": "Mô tả chi tiết nguyên nhân lỗi"
}
```

---

## 4. BẢNG MÃ LỖI HỆ THỐNG (SYSTEM ERROR CODES)

| HTTP Status | Mã `errorCode` | Ý nghĩa / Hướng khắc phục |
|---|---|---|
| 400 | `MISSING_CREDENTIALS` | Chưa truyền đủ `username` hoặc `password` khi đăng nhập. |
| 400 | `MISSING_REQUIRED_FIELDS` | Thiếu các trường dữ liệu bắt buộc của bản ghi. |
| 400 | `INVALID_INPUT` | Giá trị dữ liệu gửi lên không đúng định dạng hoặc để chuỗi rỗng. |
| 400 | `INVALID_IPV4_FORMAT` | Địa chỉ IP không đúng định dạng IPv4. |
| 400 | `IP_ALREADY_EXISTS` | Địa chỉ IP này đã tồn tại trong danh sách whitelist. |
| 400 | `BAD_REQUEST` | Yêu cầu vi phạm ràng buộc dữ liệu (ví dụ: Serial trùng lặp, giấy in tồn kho không đủ, thiết bị đang có linh kiện bên trong). |
| 400 | `EMPLOYEE_POS_CROSS_ENTERPRISE` | Nhân viên đang giữ máy POS không thể chuyển xí nghiệp trái tuyến. |
| 400 | `EMPLOYEE_HAS_DEVICES` | Không thể xóa nhân viên khi người này đang giữ thiết bị hoặc máy POS chưa thu hồi. |
| 401 | `INVALID_CREDENTIALS` | Tên đăng nhập hoặc mật khẩu không chính xác. |
| 401 | `TOKEN_INVALID_OR_EXPIRED` | Access Token hết hạn hoặc chữ ký không hợp lệ. Cần đăng nhập lại. |
| 403 | `TOKEN_MISSING` | Thiếu Header `Authorization: Bearer <token>`. |
| 403 | `ONLY_IPV4_ALLOWED` | Hệ thống từ chối kết nối không thuộc IPv4. |
| 404 | `NOT_FOUND` / `ARTICLE_NOT_FOUND` | Không tìm thấy bản ghi với ID cung cấp. |
| 500 | `INTERNAL_ERROR` | Lỗi máy chủ không xác định. |
| 500 | `DATABASE_ERROR` | Lỗi truy vấn cơ sở dữ liệu MySQL (Prisma Known Error). |

---

## 5. CHI TIẾT CÁC ENDPOINTS THEO PHÂN HỆ

---

### 5.1. AUTHENTICATION

#### 5.1.1. Đăng nhập hệ thống (Login)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/login`
- **Yêu cầu Token:** Không
- **Mô tả:** Xác thực người dùng, trả về thông tin tài khoản và JWT Bearer Token.

##### Request Body (JSON)
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `username` | string | Có | Tên tài khoản |
| `password` | string | Có | Mật khẩu tài khoản |

##### Request Example
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

##### Response Thành công (200 OK)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### Response Lỗi (401 Unauthorized)
```json
{
  "errorCode": "INVALID_CREDENTIALS",
  "message": "Tài khoản hoặc mật khẩu không chính xác"
}
```

---

### 5.2. QUẢN LÝ TÀI KHOẢN (USERS)

#### 5.2.1. Lấy danh sách tài khoản
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/users`
- **Yêu cầu Token:** Có (`Bearer <token>`)

##### Query Parameters
| Tham số | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 20 | Số lượng bản ghi mỗi trang |

##### Response Thành công (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 5.3. KIỂM TRA TRẠNG THÁI HỆ THỐNG (HEALTH CHECK)

#### 5.3.1. Health Check
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/health`
- **Yêu cầu Token:** Không
- **Mô tả:** Kiểm tra kết nối dịch vụ Node.js và Cơ sở dữ liệu MySQL.

##### Response Thành công (200 OK)
```json
{
  "status": "healthy",
  "database": "connected",
  "serverTime": "2026-11-06T06:15:30.000Z"
}
```

---

### 5.4. QUẢN LÝ DANH SÁCH IP WHITELIST

#### 5.4.1. Lấy danh sách IP Whitelist
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/ip`
- **Yêu cầu Token:** Có
- **Query Params:** `page` (number, default: 1), `limit` (number, default: 20)

#### 5.4.2. Thêm địa chỉ IP
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/ip`
- **Yêu cầu Token:** Có

##### Request Body (JSON)
```json
{
  "ip": "118.69.182.10",
  "description": "Văn phòng Tầng 3"
}
```

#### 5.4.3. Cập nhật địa chỉ IP
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/ip/:id`
- **Yêu cầu Token:** Có

#### 5.4.4. Xóa địa chỉ IP
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/ip/:id`
- **Yêu cầu Token:** Có

---

### 5.5. QUẢN LÝ TIN TỨC & THÔNG BÁO (NEWS)

#### 5.5.1. Lấy danh sách bài viết
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/news`
- **Yêu cầu Token:** Không

##### Query Parameters
| Tham số | Kiểu | Mô tả |
|---|---|---|
| `type` | string | Loại bài viết: `news`, `announcement` hoặc kết hợp `news,internal` |
| `search` | string | Tìm kiếm theo tiêu đề bài viết |
| `sort` | string | `title_asc`, `title_desc`, `created_at_asc`, `created_at_desc` |
| `page` | number | Trang dữ liệu (Mặc định: 1) |
| `limit` | number | Số tin mỗi trang (Mặc định: 20) |

#### 5.5.2. Lấy chi tiết bài viết
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/news/:id`
- **Yêu cầu Token:** Không

#### 5.5.3. Tạo bài viết mới
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/news`
- **Yêu cầu Token:** Có (`Bearer <token>`)

##### Request Body (JSON)
```json
{
  "title": "Thông báo bảo trì hệ thống thiết bị",
  "content": "<p>Nội dung chi tiết định dạng HTML hoặc Plaintext...</p>",
  "thumbnail": "https://res.cloudinary.com/.../image.jpg",
  "type": "news",
  "date": "06-11-2026 14:00"
}
```

#### 5.5.4. Cập nhật bài viết
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/news/:id`
- **Yêu cầu Token:** Có

#### 5.5.5. Xóa bài viết
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/news/:id`
- **Yêu cầu Token:** Có

---

### 5.6. QUẢN LÝ BANNER ẢNH

- **`GET /api/banner`** (Không token): Lấy danh sách link ảnh banner (có hỗ trợ `page`, `limit`). Trả về: `{ "data": [ "url1", "url2" ], "meta": { ... } }`.
- **`POST /api/banner`** (Yêu cầu token, `multipart/form-data`): Upload tệp banner qua trường `image`. File tự động lưu tại thư mục `hepco_banner` trên Cloudinary.
- **`DELETE /api/banner/:filename`** (Yêu cầu token): Xóa ảnh banner dựa theo tên filename.

---

### 5.7. TẢI LÊN TỆP ĐA PHƯƠNG TIỆN (UPLOADS)

#### 5.7.1. Tải lên hình ảnh lên Cloudinary
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/upload`
- **Yêu cầu Token:** Có
- **Headers:** `Content-Type: multipart/form-data`
- **Form-data Field:** `image` (File ảnh: jpg, jpeg, png, webp, gif)

##### Response Thành công (200 OK)
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/demo/image/upload/v123456789/hepco_news/abcxyz.jpg"
}
```

#### 5.7.2. Xóa ảnh trên Cloudinary
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/upload`
- **Yêu cầu Token:** Có
- **Request Body (JSON):**
```json
{
  "url": "https://res.cloudinary.com/demo/image/upload/v123456789/hepco_news/abcxyz.jpg"
}
```

---

### 5.8. QUẢN LÝ CƠ CẤU TỔ CHỨC & PHÒNG BAN (DEPARTMENTS)

#### 5.8.1. Lấy danh sách phòng ban
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/departments`
- **Yêu cầu Token:** Có (`Bearer <token>`)

##### Query Parameters
| Tham số | Kiểu | Mô tả |
|---|---|---|
| `search` | string | Tìm kiếm theo tên hoặc mã phòng ban |
| `type` / `dept_type` | number / string | `1` hoặc `van_phong` (Văn phòng); `2` hoặc `xi_nghiep` (Xí nghiệp) |
| `sort` | string | `name_asc`, `name_desc`, `code_asc`, `code_desc`, `id_desc` |
| `page` | number | Trang (default: 1) |
| `limit` | number | Số lượng (default: 20) |

#### 5.8.2. Tạo phòng ban mới
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/departments`
- **Yêu cầu Token:** Có (`Bearer <token>`)

##### Request Body (JSON)
```json
{
  "code": "KTTC",
  "name": "Phòng Kế toán - Tài chính",
  "description": "Quản lý ngân sách và tài chính công ty",
  "type": 1,
  "parent_id": null
}
```
*Ghi chú `type`:* `1`: Khối Văn phòng, `2`: Khối Xí nghiệp.

#### 5.8.3. Cập nhật phòng ban
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/departments/:id`
- **Yêu cầu Token:** Có (`Bearer <token>`)

#### 5.8.4. Xóa phòng ban
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/departments/:id`
- **Yêu cầu Token:** Có (`Bearer <token>`)

---

### 5.9. QUẢN LÝ NHÂN SỰ (EMPLOYEES)

#### 5.9.1. Lấy danh sách nhân viên
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/employees`
- **Yêu cầu Token:** Có (`Bearer <token>`)

##### Query Parameters
| Tham số | Kiểu | Mô tả |
|---|---|---|
| `search` | string | Tìm theo mã nhân viên, họ tên, email, sđt |
| `department_id` | number | Lọc theo ID phòng ban (tự động đệ quy phòng ban con) |
| `dept_type` | number/string | `1` (Văn phòng), `2` (Xí nghiệp) |
| `employee_type` | number | `1`: Nhân viên Thu phí, `2`: Nhân viên Văn phòng |
| `status` | number | `1`: Đang làm việc, `0`: Đã thôi việc |
| `sort` | string | Sắp xếp dữ liệu |
| `page` / `limit` | number | Phân trang |

#### 5.9.2. Tạo mới nhân viên
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/employees`

##### Request Body (JSON)
```json
{
  "employee_code": "NV-00125",
  "full_name": "Nguyễn Văn A",
  "department_id": 2,
  "position": "Nhân viên thu tiền rác",
  "employee_type": 1,
  "email": "vana@hepco.com.vn",
  "phone": "0905123456",
  "status": 1
}
```
*Ràng buộc nghiệp vụ:* `employee_code`, `full_name`, `department_id` là bắt buộc. `employee_type`: `1` (NV Thu phí - chỉ được giao máy POS), `2` (NV Văn phòng - được giao PC/Laptop).

#### 5.9.3. Cập nhật nhân viên
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/employees/:id`
*Lưu ý:* Nếu đổi phòng ban của nhân viên thuộc nhóm xí nghiệp khác trong khi nhân viên đang giữ máy POS chưa hoàn trả, hệ thống sẽ chặn với mã lỗi `EMPLOYEE_POS_CROSS_ENTERPRISE`.

#### 5.9.4. Xóa nhân viên
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/employees/:id`
*Lưu ý:* Nếu nhân viên đang giữ thiết bị CNTT hoặc máy POS đang dùng, hệ thống chặn với mã lỗi `EMPLOYEE_HAS_DEVICES`.

---

### 5.10. QUẢN LÝ NHÀ CUNG CẤP (SUPPLIERS)

- **`GET /api/suppliers`**: Lấy danh sách nhà cung cấp (hỗ trợ `search`, `page`, `limit`).
- **`POST /api/suppliers`**: Thêm nhà cung cấp mới.
  ```json
  {
    "name": "Công ty TNHH Tin Học Á Châu",
    "contact_person": "Trần Thị B",
    "phone": "02343888999",
    "email": "asia@supplier.vn",
    "address": "123 Hùng Vương, TP. Huế"
  }
  ```
- **`PUT /api/suppliers/:id`**: Sửa thông tin nhà cung cấp.
- **`DELETE /api/suppliers/:id`**: Xóa nhà cung cấp.

---

### 5.11. QUẢN LÝ THIẾT BỊ CNTT (IT DEVICES)

#### 5.11.1. Lấy danh mục thiết bị
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/devices/categories`
- **Mô tả:** Lấy danh sách phân cấp danh mục (PC, Laptop, Màn hình, Mainboard, RAM, Ổ cứng...).

#### 5.11.2. Lấy danh sách thiết bị
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/devices`

##### Query Parameters
| Tham số | Kiểu | Mô tả |
|---|---|---|
| `search` | string | Tìm kiếm theo tên thiết bị, mã tài sản, số serial |
| `category_id` | number | Lọc theo ID danh mục |
| `status` | string | `in_stock` (Trong kho), `in_use` (Đang sử dụng), `broken` (Hỏng), `retired` (Đã thanh lý) |
| `brand` | string | Hãng sản xuất (Dell, HP, Asus...) |
| `serial_number`| string | Số serial |
| `supplier_id` | number | Nhà cung cấp |
| `is_component` | boolean (`"true"`/`"false"`) | Là linh kiện con hay thiết bị chính |
| `hide_assembled` | boolean (`"true"`) | Ẩn các linh kiện đã được lắp ráp vào case/máy chính |
| `min_price` / `max_price` | number | Khoảng giá mua |
| `group_by` | boolean (`"true"`) | Gom nhóm thiết bị theo tên, danh mục, model để đếm tổng số lượng |
| `page`, `limit`, `sort` | | Phân trang & sắp xếp |

#### 5.11.3. Lấy chi tiết thiết bị
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/devices/:id`
- **Mô tả:** Trả về thông tin thiết bị kèm theo danh sách linh kiện con bên trong (`child_devices`), thông tin thiết bị cha (`parent_device`) và lịch sử bàn giao (`assignments`).

#### 5.11.4. Tạo thiết bị mới
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/devices`

##### Request Body (JSON)
```json
{
  "name": "Máy tính để bàn Dell OptiPlex 7090",
  "category_id": 1,
  "brand": "Dell",
  "model": "OptiPlex 7090 MT",
  "serial_number": "SN-DELL-882199",
  "spec_detail": "Core i7-11700, RAM 16GB, SSD 512GB",
  "manufacture_year": 2023,
  "purchase_date": "2023-05-10",
  "purchase_price": 18500000,
  "warranty_expiry": "2026-05-10",
  "supplier_id": 1,
  "location": "Phòng Kế toán",
  "notes": "Trang bị mới cho Kế toán tổng hợp",
  "quantity": 1,
  "child_devices": [
    {
      "name": "RAM DDR4 8GB Kingston",
      "category_id": 5,
      "brand": "Kingston",
      "serial_number": "RAM-KG-001"
    }
  ]
}
```
*Tính năng tự động:* Hệ thống sẽ tự sinh `asset_code` theo quy tắc `{PREFIX_DANH_MUC}-{STT}` (ví dụ: `PC-00045`).

#### 5.11.5. Cập nhật thiết bị
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/devices/:id`

#### 5.11.6. Xóa thiết bị
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/devices/:id`
- **Ràng buộc an toàn:**
  - Không thể xóa nếu thiết bị đang được sử dụng (`in_use`). Cần thu hồi trước.
  - Không thể xóa nếu thiết bị đang chứa linh kiện con bên trong. Cần tháo rời linh kiện ra trước.
  - Không thể xóa nếu thiết bị đã có lịch sử bàn giao nhằm bảo toàn báo cáo kiểm kê. Khuyến nghị cập nhật trạng thái `retired`.

#### 5.11.7. Xóa nhiều thiết bị
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/devices/delete-multiple`
- **Request Body:** `{ "ids": [ 12, 13, 14 ] }`

---

### 5.12. CẤP PHÁT & THU HỒI THIẾT BỊ CNTT (ASSIGNMENTS)

#### 5.12.1. Lấy danh sách cấp phát
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/assignments`
- **Query Params:** `search`, `department_id`, `category_id`, `start_date` (`YYYY-MM-DD`), `end_date` (`YYYY-MM-DD`), `status` (`in_use` / `returned`), `page`, `limit`, `sort`.

#### 5.12.2. Lấy dữ liệu xuất báo cáo (Export)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/assignments/export`
- **Mô tả:** Lấy danh sách các thiết bị đang cấp phát (chưa thu hồi), tự động gom nhóm theo phòng ban phục vụ lập báo cáo Excel / In ấn.

#### 5.12.3. Lập phiếu cấp phát thiết bị
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/assignments`

##### Request Body (JSON)
```json
{
  "device_id": 10,
  "employee_id": 5,
  "assigned_date": "2026-11-06",
  "assigned_by": "Nguyễn Quản Trị",
  "note": "Cấp phát máy tính làm việc"
}
```
*Nghiệp vụ tự động:*
- Kiểm tra quy tắc loại nhân viên: Nếu thiết bị là PC/Laptop, chỉ được cấp phát cho Nhân viên Văn phòng. Cấm cấp phát cho Nhân viên Thu phí (`FEE_COLLECTOR`).
- Cập nhật tự động trạng thái của thiết bị thành `in_use`.

#### 5.12.4. Thu hồi thiết bị (Return)
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/assignments/:id/return`

##### Request Body (JSON)
```json
{
  "returned_date": "2026-11-06",
  "note": "Thu hồi khi nhân viên chuyển công tác",
  "return_status": "in_stock"
}
```
*`return_status` chấp nhận:* `in_stock` (Nhập lại kho dùng tiếp) hoặc `broken` (Thiết bị hỏng cần sửa).

#### 5.12.5. Sửa thông tin phiếu cấp phát
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/assignments/:id`

#### 5.12.6. Xóa phiếu cấp phát
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/assignments/:id`
- *Cơ chế:* Nếu phiếu bị xóa đang có hiệu lực (chưa thu hồi), hệ thống tự động hoàn trả trạng thái thiết bị về `in_stock`.

---

### 5.13. QUẢN LÝ THIẾT BỊ POS THU PHÍ (POS DEVICES)

Phân hệ máy POS chuyên biệt cho công tác thu tiền phí dịch vụ vệ sinh môi trường tại 2 xí nghiệp:
- **`BSH`**: Xí nghiệp Môi trường Bắc sông Hương.
- **`NSH`**: Xí nghiệp Môi trường Nam sông Hương.

#### 5.13.1. Lấy danh sách máy POS
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/pos`

##### Query Parameters
| Tham số | Kiểu | Mô tả |
|---|---|---|
| `search` | string | Tìm kiếm theo serial, imei, sđt sim, ghi chú, tên nhân viên đang giữ/mượn |
| `enterprise` | string | `BSH` hoặc `NSH` |
| `status` | string | `in_stock`, `in_use`, `borrowed`, `broken`, `retired` (cho phép truyền nhiều: `in_stock,borrowed`) |
| `region` | string | Địa bàn thu phí |
| `department_id` | number | Lọc theo phòng ban/xí nghiệp |
| `page`, `limit`, `sort` | | Phân trang & sắp xếp |

##### Response mẫu (Kèm thống kê tổng hợp `stats`)
```json
{
  "data": [
    {
      "id": 1,
      "asset_code": "POS-BSH-0001",
      "serial_number": "POS-A920-888999",
      "imei": "860123456789012",
      "sim_number": "0988123456",
      "telecom_plan": "Viettel 4G",
      "enterprise": "BSH",
      "region": "Phường Phú Hội",
      "status": "in_use",
      "assignments": [
        {
          "id": 10,
          "employee_name": "Lê Văn C",
          "assigned_date": "2026-10-01"
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "stats": {
      "total": 150,
      "BSH": 80,
      "NSH": 70,
      "in_stock": 20,
      "in_use": 115,
      "borrowed": 10,
      "broken": 3,
      "retired": 2
    }
  }
}
```

#### 5.13.2. Lấy chi tiết máy POS
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/pos/:id`

#### 5.13.3. Tạo mới máy POS
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos`

##### Request Body (JSON)
```json
{
  "serial_number": "POS-V2-998877",
  "imei": "865432198765432",
  "sim_number": "0912345678",
  "sim_imei": "898404...",
  "telecom_plan": "VinaPhone Smart",
  "enterprise": "BSH",
  "region": "Phường Thuận Lộc",
  "status": "in_stock",
  "notes": "Máy nhập mới đợt 2"
}
```
*Tự động sinh mã:* Mã tài sản có định dạng `POS-{enterprise}-{STT_4_CHỮ_SỐ}` (ví dụ: `POS-BSH-0081`).

#### 5.13.4. Cập nhật máy POS
- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/pos/:id`

#### 5.13.5. Xóa máy POS
- **Phương thức:** `DELETE`
- **Đường dẫn:** `/api/pos/:id`

#### 5.13.6. Cấp phát máy POS cho nhân viên
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos/:id/assign`

##### Request Body (JSON)
```json
{
  "employee_id": 8,
  "employee_name": "Nguyễn Văn D",
  "region": "Phường Vỹ Dạ",
  "assigned_by": "Quản lý Xí nghiệp",
  "assigned_date": "2026-11-06",
  "note": "Giao tuyến thu phí Vỹ Dạ"
}
```
*Quy tắc nghiệp vụ nghiêm ngặt:*
1. Máy POS chỉ được cấp phát cho Nhân viên thuộc nhóm **Nhân viên Thu phí (`FEE_COLLECTOR`)**. Nếu chỉ định nhân viên văn phòng, hệ thống sẽ trả về lỗi `BAD_REQUEST`.
2. Nếu máy POS đang có người khác sử dụng hoặc đang ở trạng thái cho mượn, bắt buộc phải làm thủ tục thu hồi / nhận trả kho trước.
3. Khi cấp phát thành công, máy POS chuyển trạng thái sang `in_use` và đồng bộ mã Xí nghiệp (`enterprise`) tương ứng với xí nghiệp của nhân viên.

#### 5.13.7. Thu hồi máy POS (Unassign)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos/:id/unassign`

##### Request Body (JSON)
```json
{
  "returned_date": "2026-11-06",
  "note": "Nhân viên trả máy về kho xí nghiệp"
}
```
*Trạng thái POS sau khi thu hồi:* Trở về `in_stock`.

#### 5.13.8. Cho mượn máy POS từ kho dự phòng (Borrowing)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos/:id/borrow`

##### Request Body (JSON)
```json
{
  "borrower_name": "Phan Văn E",
  "employee_id": 15,
  "expected_return_date": "2026-11-15",
  "purpose": "Mượn tạm do máy chính đang mang đi sửa",
  "note": "Mượn kho dự phòng BSH"
}
```
*Trạng thái POS:* Chuyển sang `borrowed`.

#### 5.13.9. Nhận trả máy POS mượn (Return Borrow)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos/:id/return-borrow`

##### Request Body (JSON)
```json
{
  "note": "Đã trả lại máy dự phòng nguyên vẹn"
}
```
*Trạng thái POS:* Hoàn trả về `in_stock`.

#### 5.13.10. Xem lịch sử cấp phát & mượn máy POS
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/pos/:id/history`
- **Response:** Trả về `{ "assignments": [ ... ], "borrowings": [ ... ] }`.

#### 5.13.11. Sửa / Xóa bản ghi cấp phát POS
- **`PUT /api/pos/assignments/:assignmentId`**: Sửa thông tin phiếu cấp phát POS.
- **`DELETE /api/pos/assignments/:assignmentId`**: Xóa phiếu cấp phát POS (nếu đang hiệu lực sẽ trả máy POS về `in_stock`).

---

### 5.14. QUẢN LÝ TỒN KHO & CẤP PHÁT GIẤY IN POS (POS PAPER)

#### 5.14.1. Lấy danh sách kho giấy in
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/pos-paper`
- **Query Params:** `search`, `page`, `limit`, `sort`.
- **Dữ liệu trả về:** Mỗi loại giấy có các trường số lượng:
  - `total_quantity`: Tổng số cuộn giấy đã nhập.
  - `in_stock_quantity`: Số cuộn còn tồn trong kho.
  - `issued_quantity`: Số cuộn đã xuất cấp.

#### 5.14.2. Thêm loại giấy in mới vào kho
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos-paper`

##### Request Body (JSON)
```json
{
  "paper_name": "Giấy in nhiệt K57x38mm (Thùng 100 cuộn)",
  "code": "PAP-K57",
  "total_quantity": 500,
  "unit_price": 6500,
  "supplier_name": "Công ty TNHH Giấy Hà Nội",
  "notes": "Dùng cho máy POS cầm tay"
}
```

#### 5.14.3. Xuất cấp giấy in cho nhân viên (Issue Paper)
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/pos-paper/issue`

##### Request Body (JSON)
```json
{
  "paper_id": 1,
  "employee_id": 8,
  "quantity": 10,
  "issue_date": "2026-11-06",
  "issued_by": "Thủ kho Xí nghiệp",
  "note": "Xuất 10 cuộn cho đợt thu phí tháng 11"
}
```
*Kiểm tra tồn kho:* Nếu `quantity` vượt quá `in_stock_quantity`, hệ thống trả lỗi `400 Bad Request` với thông báo: *"Số lượng giấy in tồn kho không đủ để cấp phát."* Khi thành công, hệ thống trừ tự động `in_stock_quantity` và tăng `issued_quantity` trong cùng 1 Transaction.

#### 5.14.4. Lịch sử các lần xuất cấp giấy in
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/pos-paper/issues`
- **Query Params:** `page`, `limit`.

---

### 5.15. TÍCH HỢP NỀN TẢNG ĐIỀU HÀNH BASE.VN

Module này hoạt động như một API Gateway kết nối trực tiếp với hệ sinh thái Base.vn (Base Office, Base Request, Base Wework) sử dụng **Token v2** (`access_token_v2`).

#### 5.15.1. Kiểm tra trạng thái kết nối Base.vn
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/base-office/health`
- **Mô tả:** Kiểm tra tính hợp lệ của Token v2 và kết nối trực tiếp tới máy chủ Base.vn.

##### Response Thành công (200 OK)
```json
{
  "data": {
    "connected": true,
    "message": "Base.vn API connection ready (Token v2) - 100% REAL DATA",
    "mode": "live",
    "token_preview": "Ab12...89Z"
  }
}
```

#### 5.15.2. Lấy danh sách công văn (Base Office)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/base-office/dispatches`
- **Query Params:**
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `search` (string): Tìm theo trích yếu tiêu đề hoặc số hiệu công văn
  - `type` (string): `incoming` (Công văn đến), `outgoing` (Công văn đi), `internal` (Nội bộ)
  - `status` (string): `pending`, `processing`, `completed`, `rejected`

#### 5.15.3. Xem chi tiết công văn
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/base-office/dispatches/:id`

#### 5.15.4. Tạo mới công văn lên Base Office
- **Phương thức:** `POST`
- **Đường dẫn:** `/api/base-office/dispatches`
- **Yêu cầu Token:** Có (`Bearer <token>`)

##### Request Body (JSON)
```json
{
  "title": "Báo cáo tiến độ nâng cấp hạ tầng CNTT quý 4/2026",
  "type": "internal",
  "sender": "Bộ phận CNTT",
  "receiver": "Ban Giám đốc",
  "content": "Kính gửi Ban Giám đốc báo cáo chi tiết đính kèm...",
  "urgency": "high"
}
```

#### 5.15.5. Lấy danh sách đề xuất / tờ trình (Base Request)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/base-office/requests`
- **Query Params:** `page`, `limit`, `search`, `status` (`0`: Chờ duyệt, `1`: Đã duyệt, `2`: Từ chối).

#### 5.15.6. Lấy danh sách công việc / dự án (Base Wework)
- **Phương thức:** `GET`
- **Đường dẫn:** `/api/base-office/tasks`
- **Query Params:** `page`, `limit`, `search`, `status`.

---

## 6. MÃ NGUỒN MẪU TÍCH HỢP (INTEGRATION CODE SAMPLES)

### 6.1. JavaScript / TypeScript (Node.js hoặc React / Vue / Angular với Axios)

```javascript
import axios from 'axios';

// 1. Khởi tạo Axios Instance
const apiClient = axios.create({
  baseURL: 'https://api-hepco.yourcompany.vn/api', // hoặc http://localhost:3000/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Tự động đính kèm Bearer Token vào mọi Request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hepco_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Xử lý phản hồi lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && data.errorCode === 'TOKEN_INVALID_OR_EXPIRED') {
        localStorage.removeItem('hepco_token');
        window.location.href = '/login';
      }
      return Promise.reject(data);
    }
    return Promise.reject({ errorCode: 'NETWORK_ERROR', message: error.message });
  }
);

// 4. Các hàm gọi API mẫu
export const HepcoService = {
  // Đăng nhập
  async login(username, password) {
    const res = await apiClient.post('/login', { username, password });
    if (res.token) {
      localStorage.setItem('hepco_token', res.token);
    }
    return res;
  },

  // Lấy danh sách máy POS
  async getPosDevices(params = {}) {
    return apiClient.get('/pos', { params });
  },

  // Cấp phát máy POS cho nhân viên thu phí
  async assignPos(posId, payload) {
    return apiClient.post(`/pos/${posId}/assign`, payload);
  },

  // Lấy danh sách thiết bị CNTT
  async getDevices(params = {}) {
    return apiClient.get('/devices', { params });
  },

  // Xuất cấp giấy in POS
  async issuePaper(payload) {
    return apiClient.post('/pos-paper/issue', payload);
  }
};
```

---

### 6.2. Dart / Flutter (Dành cho Mobile App)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class HepcoApiClient {
  static const String baseUrl = 'https://api-hepco.yourcompany.vn/api';
  String? _authToken;

  void setToken(String token) {
    _authToken = token;
  }

  Map<String, String> _buildHeaders() {
    final headers = {'Content-Type': 'application/json'};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // Đăng nhập
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode == 200 && data['token'] != null) {
      _authToken = data['token'];
    }
    return data;
  }

  // Lấy danh sách máy POS
  Future<Map<String, dynamic>> fetchPosList({int page = 1, int limit = 20, String? status}) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (status != null) queryParams['status'] = status;

    final uri = Uri.parse('$baseUrl/pos').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _buildHeaders());

    return jsonDecode(utf8.decode(response.bodyBytes));
  }
}
```

---

### 6.3. cURL CLI Quickstart

```bash
# 1. Đăng nhập lấy Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Access Token: $TOKEN"

# 2. Lấy danh sách máy POS kèm thống kê
curl -X GET "http://localhost:3000/api/pos?enterprise=BSH&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 3. Cấp phát máy POS cho nhân viên
curl -X POST "http://localhost:3000/api/pos/1/assign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employee_id": 5,
    "assigned_by": "Admin",
    "region": "Phường Vỹ Dạ",
    "note": "Cấp phát máy thu phí"
  }'
```

---

