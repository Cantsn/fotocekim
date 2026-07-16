import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs tracking-[0.25em] text-accent uppercase">404</p>
      <h1 className="mt-3 font-serif text-4xl text-foreground">Sayfa bulunamadı</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Ana sayfa</ButtonLink>
        <ButtonLink href="/portfolyo" variant="secondary">
          Portföy
        </ButtonLink>
      </div>
    </div>
  );
}
