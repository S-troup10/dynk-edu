// Props for the TalkVideo composition. Produced by tools/talk/resolve_edl.py from the
// board director's edl.json — every `at`/`start` word index is already resolved to frames
// (`atF`, `fromF`, `toF`). Never hand-write this file; edit edl.json and re-resolve.

export type TWord = { i: number; text: string; start: number; end: number; phrase: number; f0: number; f1: number };

export type Mark = { kind: "circle" | "underline" | "cross" | "check"; atF: number };

export type FlowNode = { icon?: string; label: string; atF: number; accent?: boolean; marks?: Mark[] };
export type ListItem = { text: string; atF: number; marks?: Mark[] };
export type CompareSide = {
  title: string;
  icon?: string;
  lines?: string[];
  atF: number;
  verdict?: "good" | "bad";
  verdictAtF?: number;
};

export type BoardElement = (
  | { type: "title"; text: string; accent?: string[]; underline?: string[]; size?: "xl" | "l" | "m" }
  | { type: "text"; text: string; accent?: string[]; highlight?: string[]; size?: "l" | "m" | "s" }
  | { type: "note"; text: string; color?: "yellow" | "orange" | "white"; highlight?: string[] }
  | { type: "clipping"; headline: string; sub?: string }
  | { type: "icon"; icon: string; label?: string; accent?: boolean; size?: number }
  | { type: "flow"; direction?: "row" | "column"; nodes: FlowNode[] }
  | { type: "list"; items: ListItem[]; numbered?: boolean }
  | { type: "compare"; left: CompareSide; right: CompareSide }
  | { type: "stat"; value: number; prefix?: string; unit?: string; label?: string; decimals?: number }
  | { type: "strike"; before: string; after?: string; strikeAtF?: number; afterAtF?: number }
  | { type: "image"; src: string; phone?: boolean; width?: number; caption?: string }
  | { type: "chips"; items: { text: string; atF: number }[] }
) & { atF: number; marks?: Mark[]; gapAfter?: number };

export type Board = { label?: string; theme?: "paper" | "ink"; elements: BoardElement[] };

export type Segment = {
  mode: "face" | "board" | "split";
  fromF: number;
  toF: number;
  zoom?: number; // face framing 1.0–1.45
  board?: string;
  pip?: boolean; // small face bubble while on the board
  rehook?: boolean; // face return that re-grabs attention (punch + hit)
  captions?: boolean; // override the global caption rule for this segment
  enter?: "slide" | "cut";
};

export type TalkProps = {
  runId: string;
  style: "paper" | "clean"; // paper = hand-made marker board + native captions (default); clean = v1 vector board
  format: "vertical" | "horizontal" | "square";
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  aroll: string; // path under studio/public
  words: TWord[];
  seamsF: number[];
  face: { x: number; y: number };
  captions: "face" | "always" | "off";
  sfx: "full" | "light" | "off";
  hook?: { text: string; accent?: string[]; fromF: number; toF: number };
  boards: Record<string, Board>;
  segments: Segment[];
  safe: { top: number; bottom: number; left: number; right: number };
};
