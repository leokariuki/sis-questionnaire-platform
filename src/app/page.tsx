import Link from "next/link";
import { ALL_QUESTIONNAIRES, isLive } from "@/config/questionnaires";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-content flex-col justify-center px-container-mobile py-stack-lg sm:px-container-desktop">
      <div className="flex flex-col gap-stack-md">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-4xl" aria-hidden>
          🏔️
        </span>
        <h1 className="font-head text-headline-lg-mobile text-on-surface sm:text-headline-xl">
          SIS Skills Questionnaire
        </h1>
        <p className="max-w-form font-body text-body-lg text-on-surface-variant">
          A friendly questionnaire for the Leysin American School Summer Experience. It helps you
          reflect on your skills and grow during the summer. There are no right or wrong answers.
        </p>

        <div className="mt-stack-md flex flex-col gap-stack-sm">
          {ALL_QUESTIONNAIRES.map((q) => {
            const live = isLive(q.id);
            return live ? (
              <Link
                key={q.id}
                href={`/q/${q.id}`}
                className="card flex items-center justify-between gap-4 p-6 transition-transform hover:-translate-y-0.5"
              >
                <span>
                  <span className="font-head text-headline-md text-on-surface">{q.title}</span>
                  <span className="block font-body text-body-md text-on-surface-variant">
                    {q.type === "PRE" ? "Before the summer" : "After the summer"} · about 5–8 minutes
                  </span>
                </span>
                <span className="btn-primary px-6" aria-hidden>
                  Start →
                </span>
              </Link>
            ) : (
              <div
                key={q.id}
                className="flex items-center justify-between gap-4 rounded-md border-2 border-dashed border-outline-variant p-6 opacity-60"
              >
                <span>
                  <span className="font-head text-headline-md text-on-surface">{q.title}</span>
                  <span className="block font-body text-body-md text-on-surface-variant">
                    Coming soon — generated from the same shared config.
                  </span>
                </span>
                <span className="font-head text-label-bold text-on-surface-variant">Not yet live</span>
              </div>
            );
          })}
        </div>

        <p className="mt-stack-md font-body text-body-md text-on-surface-variant">
          Are you an adviser?{" "}
          <Link href="/admin" className="font-semibold text-primary underline">
            Open the admin dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
