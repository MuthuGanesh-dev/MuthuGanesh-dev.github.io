export function cn(...inputs) {
  // Lightweight className combiner. If you later install `clsx` and
  // `tailwind-merge` you can replace this with a merged implementation.
  return inputs.flat().filter(Boolean).join(" ");
}
