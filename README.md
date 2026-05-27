# RaceTrack VN — Mobile App

Ứng dụng di động quản lý giải đua ngựa, hỗ trợ hai vai trò: **Khán giả** và **Kỵ sĩ**.

---

## Tính năng

### Khán giả
| Màn hình | Mô tả |
|---|---|
| Trang chủ | Thông tin giải đấu, cuộc đua trực tiếp, kết quả mới nhất |
| Trực tiếp | Danh sách cuộc đua theo trạng thái, chi tiết trận đấu, bảng xếp hạng jockey |
| Dự đoán | Chọn ngựa để dự đoán kết quả, xem lịch sử và điểm thưởng |
| Thông báo | Nhận thông báo kết quả, phần thưởng, thông tin giải đấu |
| Hồ sơ | Thống kê dự đoán, tỷ lệ đoán trúng/sai, cài đặt tài khoản |

### Kỵ sĩ
| Màn hình | Mô tả |
|---|---|
| Trang chủ | Thống kê sự nghiệp, lời mời chờ phản hồi, lịch đua sắp tới, thu nhập tháng |
| Lời mời | Xem và phản hồi lời mời từ chủ ngựa (chấp nhận / từ chối) |
| Lịch đua | Lịch thi đấu dạng calendar, danh sách cuộc đua theo ngày |
| Kết quả | Kết quả cá nhân và bảng xếp hạng jockey toàn giải |
| Hồ sơ | Thành tích sự nghiệp, danh hiệu, cài đặt tài khoản |

---

## Tech Stack

- **Framework**: [Expo](https://expo.dev) SDK 56 + Expo Router v3 (file-based routing)
- **Language**: TypeScript 6
- **UI**: React Native 0.85 + React Native Reanimated 4 + React Native Paper v5
- **Icons**: `@expo/vector-icons` (MaterialCommunityIcons)
- **Gradient**: `expo-linear-gradient`
- **Theme**: Material Design 3 — seed color amber `#FFB86C` (dark theme)

---

## Cài đặt & chạy

```bash
# Cài dependencies
npm install

# Chạy trên Android emulator
npm run android

# Chạy trên iOS simulator
npm run ios

# Chạy trên web
npm run web
```

> Yêu cầu: Android emulator tên `Resizable_Experimental` hoặc thay đổi `ANDROID_EMULATOR` trong `package.json`.

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/          # Màn hình đăng nhập / đăng ký
│   ├── (app)/           # Tab navigator khán giả (home, live, predict, notifications)
│   ├── jockey/          # Tab navigator kỵ sĩ (home, invitations, schedule, results)
│   ├── profile.tsx      # Hồ sơ khán giả (stack screen)
│   └── jockey-profile.tsx  # Hồ sơ kỵ sĩ (stack screen)
├── components/
│   ├── auth/            # Form đăng nhập, đăng ký, chọn vai trò
│   ├── spectator/       # Tất cả màn hình của khán giả
│   ├── jockey/          # Tất cả màn hình của kỵ sĩ
│   ├── large-header-scroll-view.tsx  # Collapsible large title header
│   └── m3-tab-bar.tsx   # Material 3 Expressive tab bar
├── mock-data/           # Mock data và types (races, jockey, user, predictions...)
└── constants/
    └── theme.ts         # Bảng màu HorseRacingDark + spacing + typography
```

---

## Demo nhanh

Tại màn hình đăng nhập, nhấn một trong hai nút demo ở cuối trang để bỏ qua xác thực:

- **Demo Khán giả** — vào app với tài khoản khán giả mẫu
- **Demo Kỵ sĩ** — vào app với tài khoản kỵ sĩ mẫu
