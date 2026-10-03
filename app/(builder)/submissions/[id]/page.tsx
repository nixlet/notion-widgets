"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Submission } from "@/lib/types";

export default function SubmissionsPage() {
  const params = useParams<{ id: string }>();
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/widgets/${params.id}/submissions`)
      .then((r) => r.json())
      .then((body) => {
        const subs: Submission[] = body.submissions ?? [];
        setSubmissions(subs);
        const cols = new Set<string>();
        subs.forEach((s) => Object.keys(s.data).forEach((k) => cols.add(k)));
        setColumns(Array.from(cols));
      });
  }, [params.id]);

  if (submissions === null) {
    return <p className="text-sm text-neutral-500">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Submissions ({submissions.length})
        </h1>
        <a
          href={`/api/widgets/${params.id}/submissions?format=csv`}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Export CSV
        </a>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No submissions yet. Once your form widget is embedded and someone fills it
          out, responses will show up here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="whitespace-nowrap px-3 py-2 font-medium text-neutral-500">
                  Submitted
                </th>
                {columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-2 font-medium text-neutral-500">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="whitespace-nowrap px-3 py-2 text-neutral-500">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                  {columns.map((c) => (
                    <td key={c} className="px-3 py-2 text-neutral-800 dark:text-neutral-200">
                      {String(s.data[c] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
