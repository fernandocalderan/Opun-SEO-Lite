"use client";

type Channel = {
  channel: string;
  exposure: string;
  sentiment: string;
  share: string;
};

export function ChannelBreakdown({ channels }: { channels: Channel[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Distribucion por canal
        </h2>
        <span className="text-xs uppercase tracking-widest text-slate-400">
          Ultimos 7 dias
        </span>
      </header>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left font-medium text-slate-500">
            <tr>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3">Exposicion</th>
              <th className="px-4 py-3">Sentimiento dominante</th>
              <th className="px-4 py-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {channels.map((item) => (
              <tr key={item.channel} className="bg-white">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.channel}
                </td>
                <td className="px-4 py-3 text-slate-500">{item.exposure}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {item.sentiment}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-700">
                  {item.share}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
