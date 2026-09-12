import React, { useState, useEffect } from 'react';
import { WheelPreset, WheelItem } from '../types';
import { X, Plus, Trash2, RotateCcw, Palette, Layers, Check, HelpCircle, Lightbulb, Sparkles, ChevronRight, Gauge, Timer, Zap, Heart } from 'lucide-react';

interface WheelEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: WheelPreset;
  presets?: WheelPreset[];
  onSelectPreset?: (id: string) => void;
  onUpdatePreset: (updatedPreset: WheelPreset) => void;
  onCreateNewPreset: (title: string, description: string) => void;
  onResetDefaults: () => void;
  onResetCounter?: () => void;
  todaySpinCount?: number;
  spinDuration?: number;
  onUpdateSpinDuration?: (duration: number) => void;
}

const PRESET_COLORS = [
  '#004c98', // Sigtuna Royal Blue
  '#003366', // Deep Navy Blue
  '#0284c7', // Sky Blue
  '#1d4ed8', // Vibrant Blue
  '#ffd744', // Sigtuna Gold Yellow
  '#fbbf24', // Warm Amber Yellow
  '#ffcc00', // Bright Yellow
  '#f59e0b', // Honey Gold
  '#ffffff', // Crisp White
  '#f1f5f9', // Soft Light Slate
];

export const WheelEditorModal: React.FC<WheelEditorModalProps> = ({
  isOpen,
  onClose,
  preset,
  presets = [],
  onSelectPreset,
  onUpdatePreset,
  onCreateNewPreset,
  onResetDefaults,
  onResetCounter,
  todaySpinCount = 0,
  spinDuration = 4.5,
  onUpdateSpinDuration,
}) => {
  const [items, setItems] = useState<WheelItem[]>(preset.items);
  const [title, setTitle] = useState<string>(preset.title);
  const [description, setDescription] = useState<string>(preset.description);

  const [newItemText, setNewItemText] = useState<string>('');
  const [newItemSubtext, setNewItemSubtext] = useState<string>('');
  const [newItemColor, setNewItemColor] = useState<string>(PRESET_COLORS[0]);

  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState<boolean>(false);
  const [isCounterResetDone, setIsCounterResetDone] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setItems(preset.items);
      setTitle(preset.title);
      setDescription(preset.description);
    }
  }, [preset, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: WheelItem = {
      id: `custom-item-${Date.now()}`,
      text: newItemText.trim(),
      wheelLabel: newItemText.trim().toUpperCase(),
      subtext: newItemSubtext.trim() || undefined,
      color: newItemColor,
      textColor: '#ffffff',
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onUpdatePreset({
      ...preset,
      title,
      description,
      items: updatedItems,
    });

    setNewItemText('');
    setNewItemSubtext('');
    // Pick next color from preset array
    const currentIndex = PRESET_COLORS.indexOf(newItemColor);
    setNewItemColor(PRESET_COLORS[(currentIndex + 1) % PRESET_COLORS.length]);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 2) {
      alert('Ett hjul måste ha minst 2 delar.');
      return;
    }
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    onUpdatePreset({
      ...preset,
      title,
      description,
      items: updatedItems,
    });
  };

  const handleCreateNewPresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetTitle.trim()) return;
    onCreateNewPreset(newPresetTitle.trim(), 'Eget anpassat hjul för teamet');
    setNewPresetTitle('');
    setIsCreatingNew(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ios-glass-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl icon-badge-glass text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 icon-realistic" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Anpassa Morgonhjulet
                </h2>
                {/* Subtle Interactive Tooltip Trigger */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowHelpTooltip(!showHelpTooltip)}
                    onMouseEnter={() => setShowHelpTooltip(true)}
                    onMouseLeave={() => setShowHelpTooltip(false)}
                    aria-label="Hjälp och tips för egna hjul"
                    className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 icon-realistic" />
                  </button>

                  {/* Tooltip Popover */}
                  {showHelpTooltip && (
                    <div className="absolute left-0 top-full mt-1 z-30 w-72 sm:w-80 p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs backdrop-blur-md shadow-2xl border border-slate-700/70 animate-fadeIn pointer-events-none">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Skapa personliga temahjul</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        Du kan anpassa befintliga texter eller skapa helt egna hjul för specifika förvaltningar, måndagsmöten, fikaraster eller personliga mål via knappen <em>"+ Skapa ett helt nytt hjul"</em>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redigera texter, färger och lägg till egna budskap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ios-glass-btn p-2 rounded-full text-slate-500 dark:text-slate-300"
            title="Stäng"
            aria-label="Stäng"
          >
            <X className="w-4 h-4 icon-realistic" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Subtle Guidance & Inspiration Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-amber-50/60 to-blue-50/80 dark:from-blue-950/40 dark:via-amber-950/30 dark:to-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 shadow-xs flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 icon-realistic" />
            </div>
            <div className="flex-1 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Tips för personlig relevans i din vardag</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                Skapa unika hjul anpassade för din enhet inom Sigtuna kommun (t.ex. <em>Socialförvaltningen</em>, <em>Skolteamet</em> eller <em>Fredagspepp</em>). Du kan ha flera olika hjul sparade och växla mellan dem när som helst.
              </p>
              {!isCreatingNew && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 dark:text-amber-300 hover:underline pt-0.5"
                >
                  <span>+ Skapa en ny hjul-kategori nu</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Preset Selector (if multiple presets exist) */}
          {presets.length > 1 && onSelectPreset && (
            <div className="p-4 rounded-2xl ios-glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-blue-950 dark:text-blue-200">
                Aktivt hjul:
              </div>
              <select
                value={preset.id}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-blue-300/80 dark:border-blue-700/80 bg-white/90 dark:bg-slate-800/90 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md shadow-xs"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.isCustom ? '(Eget)' : '(Standard)'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Wheel Title & Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Hjulets Namn
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                onUpdatePreset({ ...preset, title: e.target.value, items });
              }}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-md shadow-xs"
            />
          </div>

          {/* Add New Item Form */}
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl ios-glass-card space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 icon-realistic" />
              Lägg till nytt budskap i hjulet
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Huvudtext (t.ex. DU ÄR BÄST)"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Underrubrik / Förklaring (valfritt)"
                  value={newItemSubtext}
                  onChange={(e) => setNewItemSubtext(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Färg:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewItemColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform shadow-xs ${
                      newItemColor === c ? 'scale-125 ring-2 ring-blue-600 dark:ring-white' : 'hover:scale-110 opacity-90'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!newItemText.trim()}
                className="ios-glass-btn-emerald px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 whitespace-nowrap"
              >
                + Lägg till
              </button>
            </div>
          </form>

          {/* Current Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Innehåll i hjulet ({items.length} delar)
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl ios-glass-card shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: item.color }}
                      className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-900 shadow-2xs"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.text}
                      </div>
                      {item.subtext && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.subtext}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="ios-glass-btn p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Ta bort"
                  >
                    <Trash2 className="w-3.5 h-3.5 icon-realistic" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Custom Category Form */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateNewPresetSubmit} className="p-4 rounded-2xl ios-glass-card border border-emerald-300/60 dark:border-emerald-700/60 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Skapa nytt anpassat hjul
              </h4>
              <input
                type="text"
                placeholder="T.ex. Måndagspepp eller Fikatåget"
                value={newPresetTitle}
                onChange={(e) => setNewPresetTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="ios-glass-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={!newPresetTitle.trim()}
                  className="ios-glass-btn-emerald px-4 py-1.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Skapa
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="ios-glass-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300"
              >
                + Skapa ett helt nytt hjul
              </button>

              <button
                type="button"
                onClick={onResetDefaults}
                className="ios-glass-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5 icon-realistic" />
                <span>Återställ standardhjul</span>
              </button>
            </div>
          )}

          {/* Spin Speed & Duration Slider Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl ios-glass-card border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  <Timer className="w-4 h-4 icon-realistic" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Snurrhastighet & Varaktighet
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-200/80 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200 tabular-nums">
                      {spinDuration.toFixed(1)} s
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Justera hur snabbt och hur länge hjulet roterar innan det stannar.
                  </p>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onUpdateSpinDuration && onUpdateSpinDuration(2.5)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    Math.abs(spinDuration - 2.5) < 0.2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'ios-glass-btn text-slate-700 dark:text-slate-300 hover:text-blue-600'
                  }`}
                  title="Snabb snurr (2.5 sekunder)"
                >
                  ⚡ Snabb (2.5s)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSpinDuration && onUpdateSpinDuration(4.5)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    Math.abs(spinDuration - 4.5) < 0.2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'ios-glass-btn text-slate-700 dark:text-slate-300 hover:text-blue-600'
                  }`}
                  title="Balanserad standard (4.5 sekunder)"
                >
                  🎯 Balanserad (4.5s)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSpinDuration && onUpdateSpinDuration(7.0)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    Math.abs(spinDuration - 7.0) < 0.2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'ios-glass-btn text-slate-700 dark:text-slate-300 hover:text-blue-600'
                  }`}
                  title="Långsam & dramatisk inbromsning (7.0 sekunder)"
                >
                  🏆 Spännande (7s)
                </button>
              </div>
            </div>

            {/* Slider Track with labels */}
            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.5"
                value={spinDuration}
                onChange={(e) => {
                  if (onUpdateSpinDuration) {
                    onUpdateSpinDuration(parseFloat(e.target.value));
                  }
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-amber-400 focus:outline-none"
                aria-label="Snurrvaraktighet i sekunder"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                <span>Snabb (2 s)</span>
                <span>Standard (4.5 s)</span>
                <span>Lång & Spännande (8 s)</span>
              </div>
            </div>
          </div>

          {/* Spin Counter Settings Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl ios-glass-card border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-between gap-3 flex-wrap bg-rose-50/40 dark:bg-rose-950/20">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-[#f04456] text-white">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Dagens snurrräknare (Hjärta)
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 tabular-nums">
                  {todaySpinCount} {todaySpinCount === 1 ? 'snurr' : 'snurr'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nollställ dagens räknare tillbaka till 0 när som helst.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onResetCounter) {
                  onResetCounter();
                  setIsCounterResetDone(true);
                  setTimeout(() => setIsCounterResetDone(false), 2500);
                }
              }}
              className="ios-glass-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/50 hover:bg-amber-200/80 active:scale-98 transition-all"
            >
              {isCounterResetDone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 icon-realistic" />
                  <span className="text-emerald-700 dark:text-emerald-300">Återställd till 0!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 icon-realistic" />
                  <span>Återställ räknare till 0</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="ios-glass-btn-primary px-7 py-2.5 rounded-2xl font-bold text-xs sm:text-sm"
          >
            Klar & Spara
          </button>
        </div>

      </div>
    </div>
  );
};
