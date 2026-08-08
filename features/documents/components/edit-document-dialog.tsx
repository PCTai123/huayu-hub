"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentUrl: string;
  onSave: (id: string, url: string) => void;
}

export function EditDocumentDialog({
  isOpen,
  onClose,
  documentId,
  currentUrl,
  onSave,
}: EditDocumentDialogProps) {
  const t = useTranslations("documents");
  const [url, setUrl] = useState(currentUrl);

  /* Sync url when dialog opens */
  useEffect(() => {
    if (isOpen) {
      setUrl(currentUrl);
    }
  }, [isOpen, currentUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSave(documentId, url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-[20px] bg-white border border-gray-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-black">{t("editLink")}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("url")}
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="pl-10 rounded-xl bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-[#C62828]/40 focus:ring-[#C62828]/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="rounded-xl border-gray-300 text-black hover:bg-gray-50"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={!url.trim()}
                  className="rounded-xl bg-[#C62828] text-white hover:bg-[#a02222] shadow-sm transition-all duration-300 disabled:opacity-50"
                >
                  {t("save")}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
