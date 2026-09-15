import { PlantImage } from "../components/PlantImage";
import { speak } from "../lib/sound";
import type { PlantContent } from "../types";

interface PlantDetailProps {
  plant: PlantContent;
  collected?: boolean;
}

export function PlantDetail({ plant, collected }: PlantDetailProps) {
  return (
    <div className="flex flex-1 flex-col px-5 pb-10 pt-2">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-blob bg-white shadow-xl">
        <PlantImage plant={plant} className="h-56 w-full" />
        <div className="p-5 text-center">
          <div className="text-5xl">{plant.emoji}</div>
          <h2 className="mt-1 text-3xl font-black text-leaf-dark">
            {plant.hebrewName} {collected && <span title="נאסף">✅</span>}
          </h2>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-leaf-light px-3 py-0.5 font-bold text-leaf-dark">
              {plant.category}
            </span>
            <span className="text-gray-500">{plant.scientificName}</span>
          </div>

          <ul className="mt-4 space-y-2 text-right">
            {plant.facts.map((fact, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-2xl bg-leaf-light/60 p-3 text-lg text-leaf-dark"
              >
                <span>💡</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>

          {plant.caution && (
            <div className="mt-3 rounded-2xl bg-amber-100 p-3 text-right font-bold text-amber-800">
              ⚠️ {plant.caution}
            </div>
          )}

          <button
            onClick={() => speak(`${plant.hebrewName}. ${plant.facts.join(" ")}`)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky/20 px-5 py-3 text-lg font-bold text-sky-700 active:scale-95"
          >
            🔊 הקריאו לי
          </button>
        </div>
      </div>
    </div>
  );
}
