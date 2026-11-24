/**
 * Shared colour tokens. Sketches reference these names instead of hex/gray literals.
 * Plain script (no modules) so every sketch can load it with a <script> tag.
 */
const Palette = Object.freeze({
  // Surfaces
  ink: "#000000", // canvas ground for dark sketches
  slate: "#464646", // mid-dark ground (was background(70))
  paper: "#dcdcdc", // light ground (was background(220))
  white: "#ffffff",
  signal: "#ff0000", // highlight / tracer

  // Schemes (ordered swatch lists)
  cools: Object.freeze([
    "#F0EEED",
    "#609EA2",
    "#C92C6D",
    "#332C39",
    "#08415c",
    "#cc2936",
    "#6b818c",
    "#ffe436",
    "#57a75a",
  ]),
  bright: Object.freeze(["#C31717", "#E59315", "#D5EA2B", "#10A11A", "#1995D2"]),
  quads: Object.freeze(["#919191", "#415c6a", "#2fa1bb", "#ffd92f", "#fb5e09"]),
});
