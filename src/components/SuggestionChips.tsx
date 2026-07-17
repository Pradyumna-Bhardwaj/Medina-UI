import { cx } from "../utils/cx";

export interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
}

export function SuggestionChips({ suggestions, onSelect, className }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={cx("miden-chat-suggestions", className)}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className="miden-chat-suggestion-chip"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
