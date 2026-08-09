import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huayu Hub - Partner & Public Info",
  description: "About Huayu Hub - AI x Chinese Learning Community. Organization info, structure, news and activities.",
};

interface PartnerLayoutProps {
  children: React.ReactNode;
}

export default function PartnerLayout({ children }: PartnerLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      {children}
    </div>
  );
}
