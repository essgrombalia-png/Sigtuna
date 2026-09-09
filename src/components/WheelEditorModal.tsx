import React, { useState, useEffect } from 'react';
import { WheelPreset, WheelItem } from '../types';
import { X, Plus, Trash2, RotateCcw, Palette, Layers, Check } from 'lucide-react';

interface WheelEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: WheelPreset;
  presets?: WheelPreset[];
  onSelectPreset?: (id: string) => void;
  onUpdatePreset: (updatedPreset: WheelPreset) => void;
  onCreateNewPreset: (title: string, description: string) => void;
  onResetDefaults: () => void;
}

const PRESET_COLORS = [
  '#10b981', // emerald
  '#059669', // dark green
  '#f59e0b', // amber
  '#d97706', // dark amber
  '#3b82f6', // blue
  '#2563eb', // dark blue
  '#ec4899', // pink
  '#db2777', // dark pink
  '#8b5cf6', // purple
  '#7c3aed', // dark purple
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#f97316', // orange
  '#ef4444', // red
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
}) => {
  const [items, setItems] = useState<WheelItem[]>(preset.items);
  const [title, setTitle] = useState<string>(preset.title);
  const [description, setDescription] = useState<string>(preset.description);

  const [newItemText, setNewItemText] = useState<string>('');
  const [newItemSubtext, setNewItemSubtext] = useState<string>('');
  const [newItemColor, setNewItemColor] = useState<string>(PRESET_COLORS[0]);

  const [newPresetTitle, setNewPresetTitle] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

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
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Anpassa Morgonhjulet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redigera texter, färger och lägg till egna budskap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Stäng"
            aria-label="Stäng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Preset Selector (if multiple presets exist) */}
          {presets.length > 1 && onSelectPreset && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-xs font-bold text-blue-950 dark:text-blue-200">
                Aktivt hjul:
              </div>
              <select
                value={preset.id}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Add New Item Form */}
          <form onSubmit={handleAddItem} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Lägg till nytt budskap i hjulet
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Huvudtext (t.ex. DU ÄR BÄST)"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Underrubrik / Förklaring (valfritt)"
                  value={newItemSubtext}
                  onChange={(e) => setNewItemSubtext(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Färg:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewItemColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newItemColor === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : 'hover:scale-110 opacity-90'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!newItemText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all whitespace-nowrap shadow-sm"
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
                  className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: item.color }}
                      className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-900"
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Ta bort"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Custom Category Form */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateNewPresetSubmit} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Skapa nytt anpassat hjul
              </h4>
              <input
                type="text"
                placeholder="T.ex. Måndagspepp eller Fikatåget"
                value={newPresetTitle}
                onChange={(e) => setNewPresetTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={!newPresetTitle.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white disabled:opacity-50"
                >
                  Skapa
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Skapa ett helt nytt hjul
              </button>

              <button
                type="button"
                onClick={onResetDefaults}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Återställ standardhjul</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Klar & Spara
          </button>
        </div>

      </div>
    </div>
  );
};
