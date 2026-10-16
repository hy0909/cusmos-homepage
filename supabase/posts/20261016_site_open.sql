-- 영어·일본어·독일어 게시판에 "홈페이지 새로 열었습니다" 공지를 올린다
-- Supabase 대시보드 > SQL Editor에 붙여 넣고 Run. 여러 번 실행해도 같은 글이 덮어써질 뿐 중복되지 않는다
insert into public.notices (id, title, date, pinned, published, body, attachments, lang) values
(
  'n-20261016-open-en', 'Our new website is live', '2026-10-16', true, true,
  E'We have launched the new CUSMOS website.\n\nYou can see how our sensors identify a noise and locate where it came from, what we found in the Siheung City pilot and the KEPCO Taean proof of concept, and the technical details behind both. We will post company news and notices on this page.\n\nTo talk about a pilot or a partnership, please use the [contact page](contact.html).',
  '[]'::jsonb, 'en'
),
(
  'n-20261016-open-ja', 'ホームページを公開しました', '2026-10-16', true, true,
  E'CUSMOSのホームページを公開しました。\n\nセンサーが音の種類と発生場所を特定する仕組み、始興市での実証と韓国電力公社 泰安火力発電所でのPoCの結果、製品の仕様を掲載しています。今後は、このページで会社のニュースとお知らせをお伝えします。\n\n導入や提携のご相談は、[お問い合わせ](contact.html)ページからご連絡ください。',
  '[]'::jsonb, 'ja'
),
(
  'n-20261016-open-de', 'Unsere neue Website ist online', '2026-10-16', true, true,
  E'Die neue Website von CUSMOS ist online.\n\nHier sehen Sie, wie unsere Sensoren Geräusche erkennen und ihre Quelle orten, welche Ergebnisse das Pilotprojekt in Siheung und der Machbarkeitsnachweis (PoC) im Kraftwerk Taean von KEPCO gebracht haben und welche technischen Daten dahinterstehen. Neuigkeiten und Hinweise veröffentlichen wir künftig an dieser Stelle.\n\nFür Anfragen zu Pilotprojekten oder Kooperationen nutzen Sie bitte unser [Kontaktformular](contact.html).',
  '[]'::jsonb, 'de'
)
on conflict (id) do update set
  title = excluded.title, date = excluded.date, pinned = excluded.pinned, published = excluded.published,
  body = excluded.body, lang = excluded.lang, updated_at = now();
