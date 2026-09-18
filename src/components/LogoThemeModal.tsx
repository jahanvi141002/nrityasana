import React, { useState, useRef } from 'react';
import { X, Upload, Palette, Check, Sparkles, Image as ImageIcon, ShieldAlert, ShieldCheck } from 'lucide-react';
import { THEME_CONFIGS } from '../data/themeConfig';
import { ThemePreset } from '../types';

interface LogoThemeModalProps {
  currentLogoUrl: string;
  currentTheme: ThemePreset;
  customColor?: string;
  isAdmin?: boolean;
  onClose: () => void;
  onUpdateLogo: (url: string) => void;
  onUpdateTheme: (theme: ThemePreset, customColor?: string) => void;
  onResetLogo?: () => void;
}

export const LogoThemeModal: React.FC<LogoThemeModalProps> = ({
  currentLogoUrl,
  currentTheme,
  customColor,
  isAdmin = true,
  onClose,
  onUpdateLogo,
  onUpdateTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'logo' | 'theme'>('logo');
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(currentTheme);
  const [pickerColor, setPickerColor] = useState(customColor || '#781D32');
  const [useCustomColor, setUseCustomColor] = useState(!!customColor);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateLogo(result);
        setSaveSuccess('Brand logo updated and saved permanently');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (logoInputUrl.trim()) {
      onUpdateLogo(logoInputUrl.trim());
      setSaveSuccess('Brand logo updated and saved permanently');
      setLogoInputUrl('');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  const activePalette = THEME_CONFIGS[selectedTheme] || THEME_CONFIGS.burgundy;
  const primaryColor = useCustomColor ? pickerColor : activePalette.primary;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-[#FDF8F5] max-w-md w-full rounded-[28px] overflow-hidden shadow-2xl border border-[#F2E6E2] p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1F161A]">Administrator Access Only</h3>
          <p className="text-xs text-[#7D6D73] mt-2 mb-6">
            Only administrators have permission to edit the brand logo and application theme.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-xs cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FDF8F5] max-w-lg w-full rounded-[28px] overflow-hidden shadow-2xl border border-[#F2E6E2] p-6 sm:p-7 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2E6E2]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1F161A]">Branding & Theme</h2>
              <p className="text-xs text-[#7D6D73]">Set your exact logo and personalize the theme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#6B5C62] hover:text-[#1F161A] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-black/5 rounded-xl my-4">
          <button
            onClick={() => setActiveTab('logo')}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'logo'
                ? 'bg-white text-[#1F161A] shadow-xs'
                : 'text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Logo Setup
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'theme'
                ? 'bg-white text-[#1F161A] shadow-xs'
                : 'text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Theme Colors
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {activeTab === 'logo' ? (
            <>
              {/* Current Logo Preview */}
              <div className="p-5 rounded-2xl bg-white/80 border border-[#F2E6E2] text-center flex flex-col items-center">
                <span className="text-[11px] font-semibold text-[#7D6D73] uppercase tracking-wider mb-3">
                  Current Logo Display (As-is, uncropped)
                </span>
                <div className="h-24 w-full flex items-center justify-center p-3 bg-[#FAF3F0] rounded-xl border border-dashed border-[#E5D5CF]">
                  {currentLogoUrl ? (
                    <img
                      src={currentLogoUrl}
                      alt="Current Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#7D6D73]">No logo selected</span>
                  )}
                </div>
                <p className="text-[11px] text-[#7D6D73] mt-2">
                  Displayed cleanly with transparent support and no color filter alterations.
                </p>
              </div>

              {/* Upload Your Exact Logo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider">
                  Upload Your Logo File
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#E25B88]/40 hover:border-[#781D32] bg-white hover:bg-[#FDEEF3]/40 transition flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white group-hover:scale-105 transition"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-[#1F161A]">
                    Click to select logo from your device
                  </span>
                  <span className="text-xs text-[#7D6D73]">
                    PNG, JPG, SVG or WEBP (transparent background supported)
                  </span>
                </button>
              </div>

              {/* Or Provide Image URL */}
              <div>
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider mb-1.5">
                  Or Paste Logo Image URL
                </label>
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/my-logo.png"
                    value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#F2E6E2] bg-white text-sm text-[#1F161A] placeholder-[#94848A] focus:outline-none focus:ring-2 focus:ring-[#781D32]/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-white font-semibold text-xs transition cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Set URL
                  </button>
                </form>
              </div>

              {/* Success Notification */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-[#EAF5E9] text-[#2E6930] text-xs font-medium border border-[#C5E3C3] flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {saveSuccess}
                </div>
              )}

              {/* Permanent Brand Logo Status Card */}
              <div className="pt-2">
                <div className="p-3.5 rounded-2xl bg-[#FAF3F0] border border-[#F2E6E2] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-[#1F161A]">Permanent Brand Identity</h4>
                    <p className="text-[11px] text-[#7D6D73] mt-0.5 leading-relaxed">
                      The active logo remains permanently locked across the application, top navigation, student portals, and database records. Only administrators have permission to alter this logo.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Theme Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#1F161A] uppercase tracking-wider">
                  Theme Presets
                </label>

                <div className="grid grid-cols-1 gap-3">
                  {Object.values(THEME_CONFIGS).map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedTheme(preset.id as ThemePreset);
                        setUseCustomColor(false);
                        onUpdateTheme(preset.id as ThemePreset);
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedTheme === preset.id && !useCustomColor
                          ? 'border-[#1F161A] bg-white shadow-xs'
                          : 'border-[#F2E6E2] bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-6 h-6 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-6 h-6 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1F161A]">{preset.name}</p>
                          <p className="text-xs text-[#7D6D73]">
                            {preset.id === 'terracotta'
                              ? 'Warm Terracotta Rust & Sand (from original repo)'
                              : preset.id === 'burgundy'
                              ? 'Royal Temple Burgundy & Gold'
                              : 'Rose Bloom & Warm Sand'}
                          </p>
                        </div>
                      </div>

                      {selectedTheme === preset.id && !useCustomColor && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: preset.primary }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Logo Accent Color Picker */}
              <div className="p-4 rounded-2xl bg-white/80 border border-[#F2E6E2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1F161A] uppercase tracking-wider">
                      Custom Accent Color
                    </h4>
                    <p className="text-[11px] text-[#7D6D73]">
                      Pick any primary color directly from your uploaded logo
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pickerColor}
                      onChange={(e) => {
                        setPickerColor(e.target.value);
                        setUseCustomColor(true);
                        onUpdateTheme(selectedTheme, e.target.value);
                      }}
                      className="w-9 h-9 rounded-xl border border-[#DDD3C7] cursor-pointer"
                    />
                  </div>
                </div>

                {useCustomColor && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#F2E6E2]">
                    <span className="text-xs text-[#7D6D73]">
                      Using custom hex: <span className="font-mono font-bold text-[#1F161A]">{pickerColor}</span>
                    </span>
                    <button
                      onClick={() => {
                        setUseCustomColor(false);
                        onUpdateTheme(selectedTheme, undefined);
                      }}
                      className="text-xs text-[#781D32] hover:underline cursor-pointer"
                    >
                      Restore preset color
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-3 border-t border-[#F2E6E2] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 px-5 rounded-xl text-white font-semibold text-sm transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles className="w-4 h-4" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
