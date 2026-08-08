# Huayu Hub - Danh sach kiem thu Auth (Auth Test Checklist)

## 1. Chuan bi truoc khi test

- [ ] Da chay SQL script `001_create_profiles.sql` trong Supabase SQL Editor
- [ ] Da cau hinh `.env.local` voi Supabase URL va Anon Key dung
- [ ] Da chay `npm run dev` va ung dung chay tai `http://localhost:3000`
- [ ] Mo browser tai `http://localhost:3000/vi/login`

---

## 2. Test Register (Dang ky)

### 2.1: Form hien thi dung
- [ ] Mo `http://localhost:3000/vi/register`
- [ ] Form hien day du: Ho va ten, Email, Mat khau, Xac nhan mat khau, Chon Ban
- [ ] Co link "Dang ky tai day" tu trang Login

### 2.2: Validation
- [ ] Nhap mat khau < 6 ky tu -> Hien loi "Mat khau phai co it nhat 6 ky tu"
- [ ] Nhap xac nhan mat khau khac -> Hien loi "Mat khau xac nhan khong khop"
- [ ] Bo trong truong bat buoc -> Form khong submit

### 2.3: Dang ky thanh cong
- [ ] Nhap email hop le, mat khau >= 6 ky tu, ho va ten, chon ban
- [ ] Nhan "Dang ky"
- [ ] Hien trang thanh cong: "Dang ky thanh cong!"
- [ ] Hien huong dan: "Chung toi da gui email xac nhan..."
- [ ] Kiem tra email nhan duoc email xac nhan tu Supabase
- [ ] Kiem tra Supabase Dashboard > Authentication > Users: User moi da xuat hien
- [ ] Kiem tra Table Editor > profiles: Row moi da duoc tao (trigger)

### 2.4: Dang ky voi email da ton tai
- [ ] Dung email da dang ky truoc do
- [ ] Hien loi: "Email nay da duoc dang ky..."

---

## 3. Test Login (Dang nhap)

### 3.1: Dang nhap thanh cong
- [ ] Mo trang Login
- [ ] Khong hien "Che do demo" nua
- [ ] Nhap email + mat khau da xac nhan
- [ ] Nhan "Dang nhap"
- [ ] Redirect den `/vi/dashboard`
- [ ] Topbar hien ten nguoi dung

### 3.2: Dang nhap sai
- [ ] Nhap email dung, mat khau sai
- [ ] Hien loi: "Email hoac mat khau khong dung..."
- [ ] Nhap email khong ton tai
- [ ] Hien loi tuong tu

### 3.3: Dang nhap chua xac nhan email
- [ ] Dang ky tai khoan moi nhung chua nhan link xac nhan
- [ ] Thu dang nhap
- [ ] Hien loi: "Email chua duoc xac nhan..."

### 3.4: Remember Me
- [ ] Danh dau "Ghi nho dang nhap", dang nhap
- [ ] Dong browser, mo lai
- [ ] Email da duoc dien san

### 3.5: Redirect khi da dang nhap
- [ ] Dang nhap thanh cong
- [ ] Thu vao `/vi/login` lai
- [ ] Tu dong redirect den `/vi/dashboard`

---

## 4. Test Route Protection (Bao ve duong dan)

### 4.1: Chua dang nhap
- [ ] Xoa cookie (DevTools > Application > Cookies)
- [ ] Vao `http://localhost:3000/vi/dashboard`
- [ ] Tu dong redirect den `/vi/login`

### 4.2: Da dang nhap
- [ ] Dang nhap thanh cong
- [ ] Vao cac trang: /dashboard, /organization, /org-chart, /members, /profile
- [ ] Tat ca deu truy cap duoc, khong bi redirect

---

## 5. Test Forgot Password (Quen mat khau)

### 5.1: Gui yeu cau
- [ ] Mo `/vi/forgot-password`
- [ ] Nhap email da dang ky
- [ ] Nhan "Gui lien ket dat lai"
- [ ] Hien thong bao: "Da gui lien ket! Vui long kiem tra email..."

### 5.2: Dat lai mat khau
- [ ] Mo email, nhan vao link reset
- [ ] Redirect den `/vi/reset-password`
- [ ] Nhap mat khau moi (>= 6 ky tu)
- [ ] Nhap xac nhan mat khau
- [ ] Nhan "Dat lai mat khau"
- [ ] Hien: "Dat mat khau thanh cong!"
- [ ] Dang nhap voi mat khau moi -> Thanh cong

### 5.3: Link het han/khong hop le
- [ ] Vao `/vi/reset-password` truc tiep (khong qua email link)
- [ ] Hien: "Lien ket khong hop le" + "Vui long yeu cau lien ket moi"

### 5.4: Dialog quen mat khau (tu trang Login)
- [ ] Nhan "Quen mat khau?" tren trang Login
- [ ] Dialog hien ra
- [ ] Nhap email, gui
- [ ] Hien thong bao thanh cong

---

## 6. Test Logout (Dang xuat)

- [ ] Dang nhap thanh cong
- [ ] Nhan avatar > "Dang xuat"
- [ ] Redirect den `/vi/login`
- [ ] Thu vao `/vi/dashboard` -> Bi redirect ve login

---

## 7. Test Profile (Ho so ca nhan)

### 7.1: Xem profile
- [ ] Dang nhap
- [ ] Vao `/vi/profile`
- [ ] Hien thong tin: ten, email, vai tro, ban, ngay sinh, sdt

### 7.2: Cap nhat profile
- [ ] Nhan "Chinh sua"
- [ ] Doi ten, sdt, bio
- [ ] Save
- [ ] Kiem tra Supabase Table Editor > profiles: Data da cap nhat

---

## 8. Test Role-Based Access

### 8.1: Member (thanh vien thuong)
- [ ] Dang nhap voi tai khoan role = Member
- [ ] Vao Members page: Co the xem danh sach
- [ ] Khong co nut "Them thanh vien" hoac "Xoa"

### 8.2: Admin
- [ ] Dang nhap voi tai khoan role = Admin (hoac Founder)
- [ ] Vao Members page: Co nut "Them/Xoa thanh vien"
- [ ] Co the chinh sua profile cua nguoi khac

### 8.3: Founder / Co-Founder
- [ ] Dang nhap voi tai khoan role = Founder
- [ ] Co toan quyen: xem, sua, xoa tat ca profiles

---

## 9. Test Multi-language

- [ ] Chuyen sang tieng Anh: Tat ca auth pages hien tieng Anh
- [ ] Chuyen sang tieng Trung: Tat ca auth pages hien tieng Trung
- [ ] Chuyen lai tieng Viet: Tat ca auth pages hien tieng Viet

---

## 10. Test Error Handling

### 10.1: Network error
- [ ] Tat internet, thu dang nhap
- [ ] Hien loi ro rang, khong phai "Something went wrong"

### 10.2: Supabase chua cau hinh
- [ ] Xoa NEXT_PUBLIC_SUPABASE_URL trong .env.local
- [ ] Thu dang nhap
- [ ] Hien loi cu the

### 10.3: Bang profiles chua tao
- [ ] Xoa bang profiles trong Supabase
- [ ] Dang nhap
- [ ] Khong crash, fallback binh thuong

---

## 11. Ket qua ky vong

| STT | Chuc nang           | Trang thai | Ghi chu |
|-----|---------------------|------------|---------|
| 1   | Register            | [ ] Pass   |         |
| 2   | Login               | [ ] Pass   |         |
| 3   | Logout              | [ ] Pass   |         |
| 4   | Forgot Password     | [ ] Pass   |         |
| 5   | Reset Password      | [ ] Pass   |         |
| 6   | Route Protection    | [ ] Pass   |         |
| 7   | Profile View        | [ ] Pass   |         |
| 8   | Profile Update      | [ ] Pass   |         |
| 9   | Role-Based Access   | [ ] Pass   |         |
| 10  | Multi-language      | [ ] Pass   |         |
| 11  | Error Handling      | [ ] Pass   |         |

---

## 12. Luu y quan trong

1. **Email Confirmation**: Neu bat Confirm Email, nguoi dung phai nhan link trong email truoc khi dang nhap duoc. De tat (khuyen nghi khi development): Authentication > Providers > Email > Confirm email = OFF

2. **Rate Limiting**: Supabase co gioi han so lan gui email (3 email/gio). Khong spam nut "Gui lien ket dat lai".

3. **Service Role Key**: KHONG bao gio dat Service Role Key vao NEXT_PUBLIC_* variables. No chi dung o server-side.

4. **RLS**: Dam bao RLS da duoc enable tren bang profiles. Kiem tra: Table Editor > profiles > RLS = Enabled

5. **Cookie**: Supabase luu session trong cookie `sb-<project-ref>-auth-token`. Middleware kiem tra cookie nay de bao ve routes.
