import { useState } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/** שדה סיסמה עם כפתור להצגה/הסתרה (👁). */
export function PasswordInput({ value, onChange, placeholder = "סיסמה" }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 border-leaf-light bg-white px-4 py-3 pl-12 text-lg outline-none focus:border-leaf"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xl"
        aria-label={show ? "הסתרת סיסמה" : "הצגת סיסמה"}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
