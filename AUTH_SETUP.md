# Huayu Hub - Huong dan cai dat Supabase Auth

## 1. Yeu cau truoc khi bat dau

- Tai khoan Supabase (https://supabase.com)
- Project Supabase da tao (URL + Anon Key)
- Node.js 18+ va npm/pnpm da cai dat
- Project Huayu Hub da clone ve may

---

## 2. Cau hinh Environment Variables

File `.env.local` (da ton tai trong project):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Lay URL va Anon Key tu:**
1. Mo Supabase Dashboard
2. Chon project cua ban
3. Vao **Project Settings** > **API**
4. Copy **Project URL** va **anon public key**

**Luu y:** KHONG bao gio expose **Service Role Key** o client-side. No chi dung cho server-side admin operations.

---

## 3. Chay SQL Script tao bang profiles va RLS

### Buoc 3.1: Mo Supabase SQL Editor

1. Vao Supabase Dashboard
2. Chon project cua ban
3. Nhan **SQL Editor** (menu ben trai)
4. Nhan **New query**

### Buoc 3.2: Chay script

1. Mo file `supabase/migrations/001_create_profiles.sql` trong project
2. Copy toan bo noi dung
3. Dan vao SQL Editor
4. Nhan **Run** (hoac Ctrl+Enter)

### Buoc 3.3: Kiem tra

Sau khi chay thanh cong, kiem tra:
- Vao **Table Editor** > Ban se thay bang `profiles`
- Vao **Authentication** > **Policies** > Ban se thay 4 policies cho bang `profiles`

---

## 4. Cau hinh Supabase Auth Settings

### 4.1: Bat Email Confirmation (khuyen nghi)

1. Vao **Authentication** > **Providers** > **Email**
2. Bat **Confirm email** = ON
3. Save

### 4.2: Cau hinh Redirect URLs

1. Vao **Authentication** > **URL Configuration**
2. Them cac Site URLs:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
3. Them Redirect URLs:
   - `http://localhost:3000/vi/reset-password`
   - `http://localhost:3000/en/reset-password`
   - `http://localhost:3000/zh/reset-password`

### 4.3: Email Templates (tuy chon)

1. Vao **Authentication** > **Email Templates**
2. Chinh sua cac template:
   - **Confirm signup**: Email xac nhan dang ky
   - **Reset password**: Email dat lai mat khau
   - **Magic Link**: Neu dung magic link

---

## 5. Cau truc bang profiles

| Cot             | Kieu        | Mo ta                                    |
|-----------------|-------------|------------------------------------------|
| id              | UUID (PK)   | Khoi ngoai tham chieu den auth.users.id  |
| full_name       | VARCHAR(255)| Ho va ten                               |
| avatar_url      | TEXT        | URL anh dai dien                         |
| date_of_birth   | DATE        | Ngay sinh                                |
| team            | VARCHAR(100)| Ban/Nhom (Media, Design, Content, ...)   |
| role            | VARCHAR(50) | Founder, Co-Founder, Admin, Member       |
| joined_date     | DATE        | Ngay tham gia                            |
| phone           | VARCHAR(20) | So dien thoai                            |
| email           | VARCHAR(255)| Email                                    |
| bio             | TEXT        | Tieu su                                  |
| status          | VARCHAR(50) | active, inactive, suspended              |
| created_at      | TIMESTAMPTZ | Thoi gian tao                           |
| updated_at      | TIMESTAMPTZ | Thoi gian cap nhat (auto)               |

---

## 6. He thong Role va Phan quyen

### Role Definitions

| Role        | Cap do truy cap                                          |
|-------------|----------------------------------------------------------|
| Founder     | Toan quyen - xem, sua, xoa tat ca                        |
| Co-Founder  | Quan ly thanh vien, xem tat ca du lieu                   |
| Admin       | Them/sua/xoa thanh vien, xem tat ca du lieu              |
| Member      | Chi xem danh sach, va chi sua profile cua minh           |

### RLS Policies

1. **SELECT**: Tat ca nguoi dung dang nhap deu doc duoc profiles
2. **UPDATE (own)**: Nguoi dung chi sua profile cua minh
3. **INSERT**: Nguoi dung chi them profile cua minh (trigger tu dong)
4. **ALL (admin)**: Founder/Co-Founder/Admin co the cap nhat bat ky profile nao

---

## 7. Luong dang ky (Register Flow)

1. Nguoi dung dien form Register (email, password, full name, team)
2. Supabase Auth tao user trong `auth.users`
3. Trigger `on_auth_user_created` tu dong tao row trong `public.profiles`
4. Email xac nhan duoc gui (neu bat Confirm Email)
5. Nguoi dung nhan link trong email de kich hoat
6. Sau khi xac nhan, nguoi dung dang nhap duoc

---

## 8. Luong quen mat khau (Forgot Password Flow)

1. Nguoi dung nhap email tren trang Forgot Password
2. Supabase gui email reset password
3. Nguoi dung nhan link trong email
4. Redirect ve `/vi/reset-password` voi session token
5. Nguoi dung nhap mat khau moi
6. Supabase cap nhat mat khau

---

## 9. Cac file da thay doi

### Files moi tao:
- `supabase/migrations/001_create_profiles.sql` - SQL script
- `app/[locale]/register/page.tsx` - Trang dang ky
- `app/[locale]/forgot-password/page.tsx` - Trang quen mat khau
- `app/[locale]/reset-password/page.tsx` - Trang dat lai mat khau
- `features/auth/components/register-form.tsx` - Form dang ky
- `features/auth/components/forgot-password-form.tsx` - Form quen mat khau
- `features/auth/components/reset-password-form.tsx` - Form dat lai mat khau

### Files da cap nhat:
- `features/auth/hooks/use-auth.ts` - Thay demo mode bang Supabase Auth that
- `features/auth/providers/auth-provider.tsx` - Them register, resetPassword, updateProfile
- `features/auth/components/login-form.tsx` - Xoa demo mode, them link register
- `features/auth/components/forgot-password-dialog.tsx` - Fix error handling
- `middleware.ts` - Xoa demo cookie, chi dung Supabase session
- `lib/member-service.ts` - Doi tu bang `members` sang `profiles`
- `messages/vi.json` - Them auth keys tieng Viet
- `messages/en.json` - Them auth keys tieng Anh
- `messages/zh.json` - Them auth keys tieng Trung

---

## 10. Chay ung dung

```bash
# Cai dependencies (neu chua cai)
npm install

# Chay development server
npm run dev

# Mo browser
# http://localhost:3000/vi/login
```

---

## 11. Khac phuc su co

### Loi "Could not find the table 'public.profiles'"
- Ban chua chay SQL script. Xem Buoc 3.

### Loi "Email not confirmed"
- Email confirmation dang bat. Kiem tra email hoac tat Confirm Email trong Supabase Dashboard.

### Loi "Invalid login credentials"
- Email hoac mat khau sai. Hoac tai khoan chua duoc xac nhan email.

### Loi "Email rate limit exceeded"
- Ban da gui qua nhieu yeu cau. Doi 60 giay roi thu lai.

### Middleware luon redirect ve login
- Kiem tra cookie `sb-*-auth-token` ton tai trong browser DevTools
- Dam bao Supabase URL va Anon Key dung trong `.env.local`

### Trang register khong tao duoc profile
- Kiem tra trigger `on_auth_user_created` da duoc tao (chay lai SQL script)
- Kiem tra RLS policies cho phep INSERT
