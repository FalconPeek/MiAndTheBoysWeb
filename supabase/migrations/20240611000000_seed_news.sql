-- Seed News
INSERT INTO public.news (title, content, type) VALUES
  ('Bienvenidos a la Fase 5', 'Ya está disponible el Tribunal de Faltas y el Salón de la Fama. ¡Cuidense de las multas!', 'MANUAL'),
  ('Cierre de Grupos', 'La FIFA anunció que los grupos para el Mundial 2026 se sortearán el próximo mes.', 'API'),
  ('Nueva GuriShop', 'Nuevos items disponibles en la tienda. ¡Usá tus GuriCoins antes de que se devalúen!', 'MANUAL')
ON CONFLICT DO NOTHING;
