import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
          <section className="hidden rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:block">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              PilaSafe
            </span>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-slate-950">
              Controle financeiro com clareza, foco e confianca.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Uma experiencia visual simples e profissional para acompanhar movimentacoes,
              planejar categorias e evoluir seu fluxo financeiro com seguranca.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Visao centralizada
                </p>
                <strong className="mt-3 block text-lg font-semibold text-slate-950">
                  Dashboard organizado
                </strong>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Proxima etapa
                </p>
                <strong className="mt-3 block text-lg font-semibold text-slate-950">
                  Integracao com autenticacao
                </strong>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                P
              </span>
              <span>
                <strong className="block text-lg font-semibold tracking-tight text-slate-950">
                  PilaSafe
                </strong>
                <span className="block text-sm text-slate-500">Sistema financeiro pessoal</span>
              </span>
            </Link>

            <div className="mt-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {eyebrow}
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <div className="mt-8">{children}</div>

            <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-600">{footer}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
