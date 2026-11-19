-- =====================================================================
-- Seed the content that already exists on the public website so the admin
-- dashboard starts with it (and the site looks identical after switching on
-- Supabase). Each block only runs when its table is empty, so re-running
-- this file never duplicates or overwrites anything the admin has edited.
--
-- Deliberately NOT seeded: membership plans. The website shows no prices,
-- and none are invented here. Add plans from /admin/membership.
-- =====================================================================

-- Trainers (the one featured trainer already on the site; name is the existing placeholder)
insert into public.trainers (name, title, description, image_url, image_alt, display_order, is_active)
select 'Head Trainer',
       'Personal Training & Bodybuilding',
       'Personal guidance for strength, technique and consistent progress, backed by real bodybuilding competition experience.',
       '/images/trainer-owner.jpg',
       'Gentleman Gym head trainer wearing a grey suit at an event',
       1,
       true
where not exists (select 1 from public.trainers);

-- Gallery categories
insert into public.gallery_categories (name, display_order)
select v.name, v.ord
from (values ('Facilities', 1), ('Achievement', 2), ('Competition', 3), ('Training', 4)) as v(name, ord)
where not exists (select 1 from public.gallery_categories);

-- Gallery images (files already shipped in /public/images)
insert into public.gallery (title, description, image_url, category_id, display_order, is_active)
select v.title, v.descr, v.url,
       (select c.id from public.gallery_categories c where c.name = v.category limit 1),
       v.ord, true
from (values
  ('Our Gym',                  'Reception desk and branded interior at Gentleman Gym',          '/images/gym-reception.jpg',     'Facilities',  1),
  ('Hard Work, Real Results',  'Bodybuilding champion posing with a trophy inside the gym',      '/images/champion-trophy.jpg',   'Achievement', 2),
  ('Competition Day',          'Bodybuilding competition stage and trophy presentation',         '/images/competition-team.jpg',  'Competition', 3),
  ('On the Stage',             'Bodybuilding competitors on stage at a physique competition',     '/images/competition-stage.jpg', 'Competition', 4),
  ('Discipline in Action',     'Bodybuilding competitor posing beside awards',                    '/images/champion-pose.jpg',     'Training',    5),
  ('Every Rep Counts',         'Bodybuilding competitor displaying a medal after a competition',  '/images/medal-achievement.jpg', 'Achievement', 6)
) as v(title, descr, url, category, ord)
where not exists (select 1 from public.gallery);

-- FAQs (same questions as the site; the enquiry answer no longer claims the form sends nothing to a server)
insert into public.faqs (question, answer, display_order, is_active)
select v.q, v.a, v.ord, true
from (values
  ($$Where is Gentleman Gym located?$$,
   $$We are located at Thellukuzhi, Perumkidavila P.O., Kerala. Use the Get Directions link in the Contact section to open Google Maps.$$, 1),
  ($$Can ladies and gents join?$$,
   $$Gentleman Gym welcomes ladies and gents. Please contact the gym to confirm the current training arrangements and timings that suit you.$$, 2),
  ($$Do you offer personal training?$$,
   $$Personal fitness training and workout guidance are among the services featured on this website. Contact the gym to discuss availability and the right option for your goals.$$, 3),
  ($$How much does membership cost?$$,
   $$Membership prices and available plans can change. Call or WhatsApp the gym for the latest fees and membership options.$$, 4),
  ($$Can beginners join?$$,
   $$Yes, you can contact the team to discuss your experience level and goals before starting. If you have a medical concern, check with a qualified healthcare professional before beginning a new exercise programme.$$, 5),
  ($$How do I enquire or book a visit?$$,
   $$Use the enquiry form in the Contact section, or call 9895979950 or 9895100630 to ask about a visit.$$, 6)
) as v(q, a, ord)
where not exists (select 1 from public.faqs);
