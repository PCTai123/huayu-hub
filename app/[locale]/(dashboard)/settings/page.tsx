'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe, Bell, Moon, Shield, User, ChevronRight, Check } from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (langCode: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${langCode}`);
    router.push(newPath);
  };

  const settingsGroups = [
    {
      title: t('general') || 'Chung',
      items: [
        { icon: Globe, label: t('language') || 'Ngôn ngữ', value: languages.find(l => l.code === locale)?.label, action: () => {} },
        { icon: Moon, label: t('theme') || 'Giao diện', value: t('light') || 'Sáng', action: () => {} },
        { icon: Bell, label: t('notifications') || 'Thông báo', value: t('enabled') || 'Bật', action: () => {} },
      ],
    },
    {
      title: t('account') || 'Tài khoản',
      items: [
        { icon: User, label: t('profile_info') || 'Thông tin cá nhân', value: '', action: () => router.push(`/${locale}/profile`) },
        { icon: Shield, label: t('privacy') || 'Quyền riêng tư', value: '', action: () => {} },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('title') || 'Cài đặt'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle') || 'Quản lý tùy chọn và tài khoản'}</p>
      </div>

      {/* Language Section */}
      <div className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100/50">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {t('language') || 'Ngôn ngữ'}
        </h3>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                locale === lang.code
                  ? 'bg-amber-50 border border-amber-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span className={`text-sm font-medium ${locale === lang.code ? 'text-amber-700' : 'text-gray-700'}`}>
                  {lang.label}
                </span>
              </div>
              {locale === lang.code && <Check className="w-5 h-5 text-amber-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group, gi) => (
        <div key={gi} className="rounded-[20px] bg-white p-5 shadow-sm border border-gray-100/50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item, ii) => {
              const Icon = item.icon;
              return (
                <button
                  key={ii}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-sm text-gray-400">{item.value}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Version */}
      <p className="text-center text-xs text-gray-400">
        Huayu Hub v1.0.0
      </p>
    </motion.div>
  );
}
