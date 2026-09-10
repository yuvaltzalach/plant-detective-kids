import { useMemo, useState } from "react";
import { getAllPlants } from "../lib/content";
import { playPop, speak } from "../lib/sound";
import type { PlantCategory, ProgressState } from "../types";

interface EncyclopediaProps {
  state: ProgressState;
  initialOpenId?: string;
}

const FILTERS: { label: string; value?: PlantCategory }[] = [
  { label: "הכל", value: undefined },
  { label: "🌳 עצים", value: "עץ" },
  { label: "🌸 פרחים", value: "פרח" },
  { label: "🌿 עשבים", value: "עשב" },
  { label: "🪴 צמחים", value: "צמח" }
];

export function Encyclopedia({ state, initialOpenId }: EncyclopediaProps) {
  const plants = getAllPlants();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PlantCategory | undefined>(undefined);
  const [openId, setOpenId] = useState<string | undefined>(initialOpenId);

  const list = useMemo(() => {
    const q = query.trim();
    return plants
      .filter((p) => (filter ? p.category === filter : true))
      .filter((p) => (q ? p.hebrewName.includes(q) || p.scientificName.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => a.hebrewName.localeCompare(b.hebrewName, "he"));
  }, [plants, query, filter]);

  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <h2 className="text-center text-3xl font-black text-leaf-dark">📖 אנציקלופדיית הצמחים</h2>
      <p className="text-center text-leaf-dark/70">{plants.length} צמחים ללמוד ולגלות</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 חיפוש צמח..."
        className="mt-3 w-full rounded-blob border-2 border-leaf-light bg-white px-5 py-3 text-lg outline-none focus:border-leaf"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              filter === f.value ? "bg-leaf text-white" : "bg-white text-leaf-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {list.map((p) => {
          const open = openId === p.id;
          const found = !!state.stickers[p.id];
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow">
              <button
                onClick={() => {
                  playPop();
                  setOpenId(open ? undefined : p.id);
                }}
                className="flex w-full items-center gap-3 p-3 text-right"
              >
                <span className="text-3xl">{p.emoji}</span>
                <span className="flex-1">
                  <span className="block font-bold text-leaf-dark">
                    {p.hebrewName} {found && <span title="נאסף">✅</span>}
                  </span>
                  <span className="block text-xs text-leaf-dark/50">{p.category}</span>
                </span>
                <span className="text-leaf-dark/40">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div className="border-t border-leaf-light/60 p-3">
                  <ul className="space-y-1.5">
                    {p.facts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-leaf-dark">
                        <span>💡</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                  {p.caution && (
                    <div className="mt-2 rounded-xl bg-amber-100 p-2 text-sm font-bold text-amber-800">
                      ⚠️ {p.caution}
                    </div>
                  )}
                  <button
                    onClick={() => speak(`${p.hebrewName}. ${p.facts.join(" ")}`)}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky/20 px-4 py-2 font-bold text-sky-700"
                  >
                    🔊 הקריאו לי
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <p className="mt-6 text-center text-leaf-dark/60">לא נמצא צמח כזה 🤔</p>
        )}
      </div>
    </div>
  );
}
