// src/app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Estrae i parametri dalla query string
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term') || '';
  const lang = searchParams.get('lang') || 'en';

  // Per test, simuliamo dei risultati fittizi basati sul termine di ricerca e la lingua
  const results = [
    {
      title: `Risultato fittizio per "${term}" (${lang})`,
      description: `Descrizione fittizia per "${term}" in lingua ${lang}.`
    },
    // Puoi aggiungere altri risultati fittizi se necessario
  ];

  return NextResponse.json({ results });
}