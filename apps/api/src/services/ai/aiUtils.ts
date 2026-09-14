/**
 * Utility helpers for the AI service layer.
 */

/**
 * Extract a JSON object from a model response that may include
 * markdown fences (```json ... ```) or bare JSON.
 */
export function extractJson(text: string): string {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }
  // Find the first { or [ and the last matching } or ]
  const start = text.indexOf('{');
  const startArr = text.indexOf('[');
  const useArr = startArr !== -1 && (start === -1 || startArr < start);
  const open = useArr ? '[' : '{';
  const close = useArr ? ']' : '}';

  const from = text.indexOf(open);
  const to = text.lastIndexOf(close);
  if (from !== -1 && to !== -1 && to > from) {
    return text.slice(from, to + 1);
  }
  return text.trim();
}

/**
 * Safe JSON parse that returns null instead of throwing.
 */
export function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(extractJson(text)) as T;
  } catch {
    return null;
  }
}
