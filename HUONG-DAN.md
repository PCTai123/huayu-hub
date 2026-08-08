# Huayu Hub - Huong Dan Cai Dat (Tieng Viet)

## Tom Tat Nhanh

| Buc | Lenh | Muc dich |
|-----|------|----------|
| 1 | `npm install` | Cai dat thu vien |
| 2 | `cp .env.example .env.local` | Tao file cau hinh |
| 3 | Sua `.env.local` | Dien Supabase URL + API key |
| 4 | `npm run dev` | Chay server phat trien |
| 5 | Mo trinh duyet tai `http://localhost:3000` | Xem ket qua |

---

## Cac Cong Cu Can Co

| Cong cu | Muc dich | Co mat phi khong? |
|---------|----------|-------------------|
| **VS Code** | Viet code | **Mien phi** |
| **GitCode** | Quan ly Git | **Mien phi** |
| **Node.js** | Chay du an Next.js | **Mien phi** (tai ve tu nodejs.org) |
| **Supabase** | Database + Authentication | **Mien phi** (goi Free) |
| **Cloudflare Pages** | Deploy website | **Mien phi** |
| **Chrome/Firefox** | Test trinh duyet | **Mien phi** |

**Tom lai: Khong mat phi gi ca cho du an nay.** Tat ca deu co goi mien phi du dung.

---

## Chi Tiet Tung Buc

### Buc 1: Cai dat Node.js

Neu chua co Node.js, vao [https://nodejs.org](https://nodejs.org) tai ban LTS (khuyen dung 18.x hoac 20.x).

Kiem tra da cai dat chua:
```bash
node -v    # Hien thi version, vi du: v20.11.0
npm -v     # Hien thi version, vi du: 10.2.4
```

### Buc 2: Cai dat thu vien du an

Mo terminal trong thu muc `huayu-hub` (thu muc chua file `package.json`):

```bash
cd huayu-hub
npm install
```

Lenh nay se tai khoang 300+ goi thu vien ve may tinh. Mat khoang 1-3 phut tuy toc do mang.

### Buc 3: Cau hinh bien moi truong

Trong thu muc `huayu-hub`, tao file `.env.local`:

```bash
cp .env.example .env.local
```

Sau do mo file `.env.local` bang VS Code va dien thong tin Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**Lay thong tin Supabase o dau?**

1. Vao [https://supabase.com](https://supabase.com)
2. Dang nhap bang Google/GitHub (mien phi)
3. Tao project moi (ten gi cung duoc)
4. Doi khoang 2 phut de Supabase khoi tao
5. Vao menu **Project Settings** → **API**
6. Copy 2 gia tri:
   - **URL** (dan vao `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (dan vao `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Buc 4: Chay server phat trien

```bash
npm run dev
```

Neu thanh cong se thay dong chu:
```
Ready on http://localhost:3000
```

Mo trinh duyet Chrome, vao dia chi `http://localhost:3000`

### Buc 5: Build de deploy

Khi muon dua len Cloudflare hoac Vercel:

```bash
npm run build
```

Neu build thanh cong, se thay thong bao:
```
Build Successful
```

---

## Giai Thich Cau Truc Thu Muc

```
huayu-hub/
├── app/                    # Cac trang website
│   ├── [locale]/           # Da ngon ngu (vi/en/zh)
│   │   ├── (dashboard)/    # Trang noi bo (co sidebar + topbar)
│   │   │   ├── page.tsx      # Trang chu Dashboard
│   │   │   ├── activities/   # Quan ly hoat dong
│   │   │   ├── announcements/# Thong bao
│   │   │   ├── calendar/     # Lich
│   │   │   ├── documents/    # Tai lieu
│   │   │   ├── members/      # Thanh vien
│   │   │   ├── news-feed/    # Bang tin
│   │   │   ├── notifications/# Thong bao
│   │   │   ├── org-chart/    # So do to chuc
│   │   │   ├── organization/ # Thong tin to chuc
│   │   │   ├── profile/      # Ho so ca nhan
│   │   │   └── settings/     # Cai dat
│   │   └── login/            # Trang dang nhap
│   └── layout.tsx            # Bo cuc goc
├── components/ui/          # Nut, o nhap, sidebar (dung chung)
├── features/               # Tung chuc nang rieng
│   ├── auth/               # Dang nhap/dang xuat
│   ├── dashboard/          # Bieu do, thong ke
│   ├── activities/         # Hoat dong ngoai khoa
│   ├── calendar/           # Lich
│   ├── news-feed/          # Bang tin
│   └── ...
├── lib/                    # Supabase client
├── messages/               # File dich tieng Viet/Anh/Hoa
│   ├── vi.json
│   ├── en.json
│   └── zh.json
├── i18n/                   # Cau hinh da ngon ngu
├── middleware.ts           # Tu dong chuyen huong ngon ngu
├── next.config.ts          # Cau hinh Next.js
└── package.json            # Danh sach thu vien
```

---

## Bang Chi Phi Day Du (Tat Ca Deu Co Mien Phi)

| Cong nghe/Dich vu | Vai tro | Phi khong? | Ghi chu |
|-------------------|---------|-----------|---------|
| **Next.js** | Framework web | **Mien phi 100%** | Open source, khong gioi han |
| **React** | Thu vien UI | **Mien phi 100%** | Open source, Meta phat trien |
| **TypeScript** | Kiem tra loi | **Mien phi 100%** | Microsoft open source |
| **Tailwind CSS** | CSS utility | **Mien phi 100%** | Open source |
| **next-intl** | Da ngon ngu | **Mien phi 100%** | Open source |
| **Framer Motion** | Hieu ung chuyen dong | **Mien phi 100%** | Goi mien phi du dung |
| **Radix UI** | Nut, hop thoai | **Mien phi 100%** | Open source |
| **Lucide React** | Bieu tuong icon | **Mien phi 100%** | Open source |
| **Supabase** | Database + Auth | **Mien phi** | Goi Free: 500MB data, 2GB bandwidth, khong gioi han so nguoi dung |
| **Cloudflare Pages** | Host website | **Mien phi** | 100.000 request/ngay, khong gioi han ban width |
| **Vercel** | Host Next.js | **Mien phi** | Gioi han 100GB bandwidth/thang |
| **VS Code** | Viet code | **Mien phi 100%** | Microsoft open source |
| **GitCode** | Quan ly Git | **Mien phi 100%** | Tuong du GitHub |
| **Node.js** | Chay JavaScript server | **Mien phi 100%** | Open source |

### Khi nao moi CAN tra phi?

| Tinh huong | Can tra phi? | Gia uoc tinh |
|------------|-------------|-------------|
| Du an < 50 thanh vien, < 500MB data | **Khong** | 0 VND |
| Du an > 50 thanh vien, can them storage Supabase | Co the | ~$25/thang |
| Can custom domain (huayuhub.com) | Mua ten mien | ~200.000-500.000 VND/nam |
| Can email chuyen nghiep | Mua email | ~50.000 VND/thang |
| Can server rieng (khong dung Cloudflare) | Thu may chu | ~300.000+ VND/thang |

**Ket luan: Voi quy mo hien tai (cong dong hoc tieng Trung AI), ban hoan toan khong can tra phi gi ca.**

---

## Cac Thuong Gap Khi Chay Lan Dau

### 1. Loi "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Loi "Port 3000 already in use"
```bash
# Tim va tat process dang chiem port 3000
taskkill /F /IM node.exe
# Hoac chay port khac
npm run dev -- --port 3001
```

### 3. Loi "Supabase is not configured"
Day la canh bao, khong phai loi. Website van chay nhung khong dang nhap duoc. Can bo sung `.env.local` nhu huong dan o tren.

### 4. Loi tieng Viet bi font chu la
Dam bao da cai font Inter hoac Poppins. Next.js tu tai ve tu Google Fonts.

---

## Deployment (Dua Website Len Internet)

### Cach 1: Cloudflare Pages (Khuyen dung)

1. Vao [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Dang nhap (mien phi)
3. Vao **Pages** → **Create a project**
4. Ket noi GitCode/GitHub repo
5. Cau hinh:
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
6. Nhan **Save and Deploy**

### Cach 2: Vercel

1. Vao [https://vercel.com](https://vercel.com)
2. Dang nhap bang GitCode/GitHub
3. Import repo `huayu-hub`
4. Nhan **Deploy** (Vercel tu dong nhan Next.js)

### Cach 3: Supabase Static Hosting

Supabase cung co the host static site mien phi.

---

## Support

Neu gap loi, hay kiem tra:
1. File `.env.local` da co chua?
2. `npm install` da chay chua?
3. Node.js version >= 18 chua? (`node -v`)
4. Port 3000 co bi chiem khong?

---
*Huong dan nay duoc viet cho Huayu Hub - He thong quan ly cong dong hoc tieng Trung AI*
*Cap nhat: 2026-08-08*
