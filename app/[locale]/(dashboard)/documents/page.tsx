"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DocumentCard } from "@/features/documents/components/document-card";
import { EditDocumentDialog } from "@/features/documents/components/edit-document-dialog";
import { FileText } from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  iconType: "drive" | "photos" | "certificate";
}

const STORAGE_KEY = "huayu-hub-documents";

const defaultDocuments: DocumentItem[] = [
  {
    id: "1",
    title: "Google Drive",
    description:
      "Truy cap va quan ly tat ca tai lieu, file va folder cua team tren Google Drive.",
    url: "https://drive.google.com",
    iconType: "drive",
  },
  {
    id: "2",
    title: "Google Photos",
    description:
      "Xem va chia se album anh, ky niem va hinh anh hoat dong cua team.",
    url: "https://photos.google.com",
    iconType: "photos",
  },
  {
    id: "3",
    title: "Certificate Website",
    description:
      "Trang web chung nhan va chung chi chinh thuc cua to chuc.",
    url: "https://certificates.example.com",
    iconType: "certificate",
  },
];

export default function DocumentsPage() {
  const t = useTranslations("documents");
  const [documents, setDocuments] = useState<DocumentItem[]>(defaultDocuments);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);

  /* Load saved links from localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        /* Merge saved URLs with defaults */
        setDocuments((prev) =>
          prev.map((d) => {
            const s = parsed.find((p: DocumentItem) => p.id === d.id);
            return s ? { ...d, url: s.url } : d;
          })
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSaveLink = useCallback((id: string, url: string) => {
    setDocuments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, url } : d));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
    setEditDoc(null);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[20px] bg-[#C62828] shadow-lg">
            <FileText className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">{t("title")}</h1>
            <p className="text-gray-600 mt-1">{t("subtitle")}</p>
          </div>
        </div>
      </motion.div>

      {/* Documents Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {documents.map((doc, index) => (
          <DocumentCard
            key={doc.id}
            {...doc}
            index={index}
            onEdit={() => setEditDoc(doc)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <EditDocumentDialog
        isOpen={!!editDoc}
        onClose={() => setEditDoc(null)}
        documentId={editDoc?.id || ""}
        currentUrl={editDoc?.url || ""}
        onSave={handleSaveLink}
      />
    </div>
  );
}
