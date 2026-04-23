-- HeartHealthHub funnel attribution and milestone tracking fields

alter table public.leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists gclid text,
  add column if not exists landing_page text,
  add column if not exists referrer text,
  add column if not exists quiz_started_at timestamptz,
  add column if not exists quiz_completed_at timestamptz,
  add column if not exists result_viewed_at timestamptz,
  add column if not exists city_selected_at timestamptz,
  add column if not exists whatsapp_clicked_at timestamptz,
  add column if not exists lead_status text,
  add column if not exists qualified boolean default false,
  add column if not exists updated_at timestamptz default now();

create index if not exists leads_gclid_idx on public.leads (gclid);
create index if not exists leads_utm_campaign_idx on public.leads (utm_campaign);
create index if not exists leads_created_score_idx on public.leads (created_at, score);

create or replace function public.set_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_leads_updated_at();
