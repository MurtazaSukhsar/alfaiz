import type { SpecTable } from '@/lib/specs';

/** Specification tables pulled out of the product description. */
export function SpecTables({ tables }: { tables: SpecTable[] }) {
  return (
    <div className="flex flex-col gap-8">
      {tables.map((t, i) => (
        <div key={i} className="flex flex-col gap-4">
          <h3 className="text-xl font-bold tracking-[-0.02em]">{t.title}</h3>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-line-soft">
            {t.pairs && !t.head.length ? (
              <table className="w-full border-collapse text-[14.5px]">
                <tbody>
                  {t.rows.map(([k, v], r) => (
                    <tr key={r} className="border-b border-line-soft last:border-0 odd:bg-[#F8F8F6]">
                      <th scope="row" className="w-[42%] px-4 py-3 text-left align-top font-medium text-muted sm:w-[38%] sm:px-5">
                        {k}
                      </th>
                      <td className="px-4 py-3 align-top font-semibold text-ink sm:px-5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[520px] border-collapse text-[14px]">
                {t.head.length > 0 && (
                  <thead>
                    <tr className="bg-ink text-white">
                      {t.head.map((h, c) => (
                        <th key={c} scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {t.rows.map((row, r) => (
                    <tr key={r} className="border-b border-line-soft last:border-0 odd:bg-[#F8F8F6]">
                      {row.map((cell, c) => (
                        <td key={c} className={`px-4 py-2.5 align-top ${c === 0 ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
