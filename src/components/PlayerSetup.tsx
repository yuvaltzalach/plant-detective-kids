import { useState } from "react";
import { AVATARS } from "../lib/players";
import { playPop } from "../lib/sound";

interface PlayerSetupProps {
  title?: string;
  submitLabel?: string;
  initialName?: string;
  initialAvatar?: string;
  onSubmit: (name: string, avatar: string) => void;
  onCancel?: () => void;
}

export function PlayerSetup({
  title = "מי משחק?",
  submitLabel = "יאללה!",
  initialName = "",
  initialAvatar = AVATARS[0],
  onSubmit,
  onCancel
}: PlayerSetupProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-6">
      <div className="text-center">
        <div className="text-6xl animate-float">{avatar}</div>
        <h2 className="mt-2 text-3xl font-black text-leaf-dark">{title}</h2>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="השם שלי"
        maxLength={16}
        className="mt-6 w-full max-w-xs rounded-blob border-2 border-leaf-light bg-white px-5 py-4 text-center text-2xl font-bold text-leaf-dark outline-none focus:border-leaf"
      />

      <div className="mt-5 grid max-w-xs grid-cols-6 gap-2">
        {AVATARS.map((a) => (
          <button
            key={a}
            onClick={() => {
              playPop();
              setAvatar(a);
            }}
            className={`aspect-square rounded-2xl text-3xl transition ${
              a === avatar ? "bg-leaf-light ring-4 ring-leaf" : "bg-white"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          playPop();
          onSubmit(name, avatar);
        }}
        disabled={!name.trim()}
        className="big-btn mt-7 w-full max-w-xs bg-leaf disabled:opacity-40"
      >
        {submitLabel}
      </button>

      {onCancel && (
        <button onClick={onCancel} className="mt-3 text-leaf-dark/60 underline">
          ביטול
        </button>
      )}
    </div>
  );
}
