
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  article text NOT NULL DEFAULT '',
  summary text,
  source text NOT NULL DEFAULT 'Unknown',
  author text,
  category text NOT NULL DEFAULT 'Other',
  municipality text NOT NULL DEFAULT 'Western Cape',
  url text NOT NULL UNIQUE,
  image_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  sentiment text NOT NULL DEFAULT 'neutral',
  confidence numeric NOT NULL DEFAULT 0,
  keywords text[] NOT NULL DEFAULT '{}',
  topic text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX articles_published_at_idx ON public.articles (published_at DESC);
CREATE INDEX articles_sentiment_idx ON public.articles (sentiment);
CREATE INDEX articles_municipality_idx ON public.articles (municipality);
CREATE INDEX articles_category_idx ON public.articles (category);

CREATE TABLE public.ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  fetched_count integer NOT NULL DEFAULT 0,
  inserted_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  error text
);

CREATE INDEX ingestion_runs_started_at_idx ON public.ingestion_runs (started_at DESC);

GRANT SELECT ON public.articles TO anon, authenticated;
GRANT ALL ON public.articles TO service_role;
GRANT SELECT ON public.ingestion_runs TO anon, authenticated;
GRANT ALL ON public.ingestion_runs TO service_role;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are publicly readable" ON public.articles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Ingestion runs are publicly readable" ON public.ingestion_runs FOR SELECT TO anon, authenticated USING (true);
