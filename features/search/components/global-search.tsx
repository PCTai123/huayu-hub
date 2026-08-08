"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  FileText,
  User,
  Calendar,
  Activity,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "post" | "member" | "event" | "activity" | "announcement";
  url: string;
  highlight?: string;
}

interface GlobalSearchProps {
  onSearch?: (query: string) => SearchResult[];
}

export function GlobalSearch({ onSearch }: GlobalSearchProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Team Building Event",
      description: "Upcoming team building activity next week",
      type: "activity",
      url: "/activities/1",
    },
    {
      id: "2",
      title: "John Doe",
      description: "Senior Developer - Engineering Team",
      type: "member",
      url: "/members/1",
    },
    {
      id: "3",
      title: "Monthly Meeting",
      description: "Scheduled for August 15, 2026",
      type: "event",
      url: "/events/1",
    },
    {
      id: "4",
      title: "New Policy Update",
      description: "Important changes to company policies",
      type: "announcement",
      url: "/announcements/1",
    },
    {
      id: "5",
      title: "Project Alpha Update",
      description: "Latest progress on Project Alpha",
      type: "post",
      url: "/posts/1",
    },
  ];

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return <FileText className="w-4 h-4" strokeWidth={1.5} />;
      case "member":
        return <User className="w-4 h-4" strokeWidth={1.5} />;
      case "event":
        return <Calendar className="w-4 h-4" strokeWidth={1.5} />;
      case "activity":
        return <Activity className="w-4 h-4" strokeWidth={1.5} />;
      case "announcement":
        return <Megaphone className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return "bg-blue-500/20 text-blue-300";
      case "member":
        return "bg-green-500/20 text-green-300";
      case "event":
        return "bg-purple-500/20 text-purple-300";
      case "activity":
        return "bg-orange-500/20 text-orange-300";
      case "announcement":
        return "bg-red-500/20 text-red-300";
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300 min-w-[280px]"
      >
        <Search className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        <span className="text-sm text-white/60">{t("searchPlaceholder")}</span>
        <div className="ml-auto flex items-center gap-1 text-xs text-white/40">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-mono">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-mono">K</kbd>
        </div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="flex-1 border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                  </button>
                )}
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-mono">ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {query.trim() && results.length === 0 ? (
                  <div className="text-center py-8 text-white/50">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
                    <p>{t("noResults")}</p>
                  </div>
                ) : !query.trim() ? (
                  <div className="text-center py-8 text-white/50">
                    <p>{t("startTyping")}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* Categories */}
                    {(["post", "member", "event", "activity", "announcement"] as const).map(
                      (category) => {
                        const categoryResults = results.filter(
                          (r) => r.type === category
                        );
                        if (categoryResults.length === 0) return null;

                        return (
                          <div key={category}>
                            <div className="px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                              {t(`category.${category}`)}
                            </div>
                            {categoryResults.map((result, index) => {
                              const globalIndex = results.indexOf(result);
                              return (
                                <motion.div
                                  key={result.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  onClick={() => handleSelect(result)}
                                  className={`flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-all duration-200 ${
                                    selectedIndex === globalIndex
                                      ? "bg-white/20"
                                      : "hover:bg-white/10"
                                  }`}
                                >
                                  <div
                                    className={`p-2 rounded-xl ${getTypeColor(
                                      result.type
                                    )}`}
                                  >
                                    {getTypeIcon(result.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-white truncate">
                                      {highlightText(result.title, query)}
                                    </h4>
                                    <p className="text-xs text-white/60 line-clamp-1">
                                      {highlightText(result.description, query)}
                                    </p>
                                  </div>

                                  <ArrowRight
                                    className={`w-4 h-4 transition-opacity ${
                                      selectedIndex === globalIndex
                                        ? "text-white/80 opacity-100"
                                        : "text-white/40 opacity-0"
                                    }`}
                                    strokeWidth={1.5}
                                  />
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs text-white/40">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/10 font-mono">↑↓</kbd>
                    {t("navigate")}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/10 font-mono">Enter</kbd>
                    {t("select")}
                  </span>
                </div>
                <span>
                  {results.length} {t("results")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
