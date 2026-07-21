"use client";

import { useRouter } from "next/navigation";

export function YearFilter({
  years,
  selected,
}: {
  years: number[];
  selected: number;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-black/60 dark:text-white/60">
      Año
      <select
        value={selected}
        onChange={(e) => router.push(`/mis-reservas?year=${e.target.value}`)}
        className="rounded border border-black/10 bg-transparent px-2 py-1 text-black dark:border-white/10 dark:text-white"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
