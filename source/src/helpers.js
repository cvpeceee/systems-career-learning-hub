// Same shape the original helpers.js produced: lesson.code is built from line pairs.
export function mk(lesson) {
  if (!lesson.code && lesson.lines) lesson.code = lesson.lines.map((l) => l[0]).join("\n");
  lesson.companies = lesson.companies || [];
  return lesson;
}
export function chapter(c) { c.lessons = c.lessons.map(mk); return c; }
export const L = (code, note = "") => [code, note];
// Oct 12: write code once with inline notes. "code //@ note" becomes [code, note]; lines without //@ get "".
export const LN = (src) => src.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n").map((ln) => {
  const i = ln.indexOf("//@");
  return i < 0 ? [ln, ""] : [ln.slice(0, i).replace(/\s+$/, ""), ln.slice(i + 3).trim()];
});
// Go source written with 4-space indents; gofmt wants tabs for indentation.
export const LNgo = (src) => LN(src.replace(/^((?: {4})+)/gm, (m) => "\t".repeat(m.length / 4)));
