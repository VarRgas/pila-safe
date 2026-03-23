export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          PilaSafe
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Base do projeto pronta para o sistema de controle financeiro.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Next.js com App Router, TypeScript e Prisma configurados de forma simples,
          com a estrutura inicial preparada para as proximas etapas.
        </p>
      </div>
    </main>
  );
}
