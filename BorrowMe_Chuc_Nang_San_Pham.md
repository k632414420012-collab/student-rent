# PHẦN 2: PRODUCT REQUIREMENTS — BORROWME

**BorrowMe – Nền tảng Cho thuê Đồ dùng Sinh viên Tự động hóa**

---

## 2.0. Chức năng lõi (Core Engine) — Tự động hóa Đặt chỗ & Cọc tiền

Đây là điểm khác biệt cốt lõi của BorrowMe so với hình thức trao đổi qua Zalo/Facebook, nên được ưu tiên phát triển đầu tiên trong project.

- **Lịch trống thời gian thực (Availability Calendar):** mỗi món đồ có một lịch riêng, chủ đồ đánh dấu ngày sẵn sàng cho thuê; hệ thống tự động khoá ngày khi đã có đơn được xác nhận.
- **Đặt chỗ tự chọn ngày (Self-service Booking):** người thuê chọn khoảng ngày trực tiếp trên lịch (drag chọn ngày bắt đầu – kết thúc), hệ thống tự tính tổng phí thuê + tiền cọc, không cần nhắn tin xin phép chủ đồ.
- **Thanh toán bằng mã QR động:** hệ thống sinh mã QR (VietQR/ngân hàng hoặc ví điện tử) riêng cho từng đơn, số tiền và nội dung chuyển khoản được điền sẵn.
- **Đối soát & xác nhận tự động:** webhook/API từ cổng thanh toán xác nhận giao dịch thành công → đơn tự chuyển trạng thái "Đã xác nhận" → gửi thông báo cho cả hai bên, không cần admin duyệt tay.
- **Quản lý vòng đời tiền cọc:** giữ cọc (escrow) trong thời gian thuê → tự động hoàn cọc khi người thuê xác nhận trả đồ đúng hạn/không hư hỏng → tự động khấu trừ một phần cọc theo biểu phí nếu có khiếu nại được duyệt.
- **Nhắc lịch tự động:** thông báo trước ngày nhận đồ, ngày phải trả đồ, và cảnh báo trễ hạn.

---

## 2.1. Chức năng dành cho người dùng (phiên bản miễn phí)

### Dành cho Người cho thuê (Lender)
- Đăng ký/đăng nhập, xác thực bằng email trường (giảm giả mạo).
- Đăng tin cho thuê đồ: ảnh, tên đồ, danh mục, giá thuê/ngày, mức cọc yêu cầu, mô tả tình trạng.
- Thiết lập và chỉnh sửa lịch ngày cho thuê (đánh dấu ngày rảnh/bận, ví dụ trước khi về quê nghỉ hè).
- Nhận thông báo khi có đơn đặt/thanh toán thành công.
- Xác nhận giao đồ và xác nhận nhận lại đồ (kích hoạt hoàn cọc).
- Xem lịch sử cho thuê và doanh thu đã nhận.

### Dành cho Người thuê (Renter)
- Tìm kiếm & lọc đồ theo danh mục, khoảng giá, khu vực, khoảng ngày cần thuê.
- Xem trang chi tiết sản phẩm: ảnh, giá, mức cọc, đánh giá, lịch trống.
- Chọn khoảng ngày thuê trên lịch và quét mã QR để chốt đơn ngay lập tức.
- Theo dõi trạng thái đơn thuê: Chờ thanh toán → Đã xác nhận → Đang thuê → Đã trả → Đã hoàn cọc.
- Nhắn tin/ghi chú với chủ đồ (kênh phụ, không bắt buộc để hoàn tất giao dịch).
- Huỷ đơn theo chính sách (trước X giờ được hoàn cọc toàn phần).

### Chung cho cả hai bên
- Đánh giá & nhận xét hai chiều sau khi giao dịch hoàn tất.
- Trang "Đơn của tôi" tổng hợp cả vai trò thuê và cho thuê.
- Trung tâm thông báo trong ứng dụng (nhắc hạn, xác nhận thanh toán, kết quả tranh chấp).

## 2.2. Các tính năng nâng cao (nguồn doanh thu)

- **Phí dịch vụ giao dịch:** thu 8–10% trên mỗi giao dịch thành công, trừ tự động vào lúc đối soát thanh toán.
- **Gói tin ưu tiên (Premium Listing):** đẩy tin cho thuê lên đầu trang tìm kiếm/trang chủ trong X ngày.
- **Nhãn "Đã xác thực" (Verified Lender):** xác minh danh tính/CCCD hoặc thẻ sinh viên để tăng độ tin cậy, thu phí xác thực một lần.
- **Gói bảo vệ giao dịch (Protection Plan):** phụ phí nhỏ để người thuê được bảo hiểm một phần nếu xảy ra tranh chấp hư hỏng.
- **Gói cho tổ chức (Ký túc xá/CLB):** cho thuê tài sản dùng chung (máy chiếu, loa, dụng cụ sự kiện) theo mô hình quản lý tập trung, tính phí thuê bao.

## 2.3. Chức năng dành cho quản trị viên

- **Dashboard thống kê:** tổng số đơn, tổng phí dịch vụ thu được, tỷ lệ giao dịch thành công, món đồ được thuê nhiều nhất.
- **Quản lý giao dịch & tiền cọc:** theo dõi trạng thái escrow của từng đơn (đang giữ/đã hoàn/đã khấu trừ).
- **Kiểm duyệt tin đăng:** gỡ tin vi phạm, đồ cấm cho thuê, tin trùng lặp/spam.
- **Quản lý người dùng:** khoá/mở khoá tài khoản vi phạm, duyệt xác thực sinh viên.
- **Xử lý tranh chấp:** tiếp nhận khiếu nại (trả trễ, đồ hư hỏng, không đúng mô tả), quyết định mức khấu trừ cọc.
- **Quản lý danh mục sản phẩm** chuẩn hoá (Điện tử, Trang phục sự kiện, Đồ gia dụng, Dụng cụ học tập...).
- **Cấu hình biểu phí:** % phí dịch vụ, mức cọc tối thiểu theo danh mục, chính sách hoàn huỷ.

---

*Ghi chú: cấu trúc mục 2.1–2.3 được xây dựng theo cùng khung với báo cáo UniFind (Lớp TIN314) để tiện đối chiếu khi phát triển, có bổ sung mục 2.0 làm rõ luồng tự động hoá đặt chỗ – thanh toán là trọng tâm khác biệt của BorrowMe.*
