import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — CivicStat",
  description: "Privacyverklaring van CivicStat.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-5 py-7 pb-24">
      <h1 className="font-serif text-[26px] font-normal text-ink mb-2">
        Privacyverklaring
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-8">
        Laatst bijgewerkt: februari 2025
      </p>

      <div className="space-y-6 text-[15px] leading-relaxed text-text-secondary">
        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Geen persoonsgegevens</h2>
          <p>
            CivicStat verzamelt geen persoonsgegevens van bezoekers. Er worden
            geen cookies geplaatst, geen accounts aangemaakt en geen
            gebruikersprofielen opgebouwd.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Openbare data</h2>
          <p>
            Alle gegevens op dit platform zijn afkomstig uit openbare bronnen,
            met name de{" "}
            <a
              href="https://opendata.tweedekamer.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-moss hover:underline"
            >
              Tweede Kamer Open Data API
            </a>
            . Informatie over Kamerleden, stemgedrag en moties betreft
            openbare ambtshandelingen en valt niet onder de bescherming van
            persoonsgegevens in de zin van de AVG.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Hosting</h2>
          <p>
            CivicStat wordt gehost op Vercel (frontend) en Fly.io (API). Deze
            diensten verwerken standaard serverloggegevens (IP-adressen,
            tijdstempels) voor operationele doeleinden. Wij hebben geen toegang
            tot deze loggegevens en gebruiken ze niet voor analyses.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Onafhankelijkheid</h2>
          <p>
            CivicStat is een onafhankelijk burgerproject. Het platform is niet
            verbonden aan enige politieke partij, overheidsinstelling of
            belangenorganisatie.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink mb-2">Contact</h2>
          <p>
            Vragen over privacy of het platform? Neem contact op via{" "}
            <a
              href="mailto:info@civicstat.nl"
              className="text-moss hover:underline"
            >
              info@civicstat.nl
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border-subtle">
        <Link
          href="/transparantie"
          className="text-sm text-moss hover:underline"
        >
          &larr; Transparantie &amp; methodologie
        </Link>
      </div>
    </main>
  );
}
