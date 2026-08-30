BEGIN;

DROP FUNCTION IF EXISTS public.sp_get_public_settings();

CREATE OR REPLACE FUNCTION sp_get_public_settings()
RETURNS TABLE (
  whatsapp_number TEXT,
  contact_email TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  studio_address TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(MAX(CASE WHEN setting_key = 'whatsapp_number' THEN setting_value END), '918200502248') AS whatsapp_number,
    COALESCE(MAX(CASE WHEN setting_key = 'contact_email' THEN setting_value END), 'hello@crochus.com') AS contact_email,
    COALESCE(MAX(CASE WHEN setting_key = 'instagram_url' THEN setting_value END), 'https://instagram.com/crochus') AS instagram_url,
    COALESCE(MAX(CASE WHEN setting_key = 'facebook_url' THEN setting_value END), 'https://facebook.com/crochus') AS facebook_url,
    COALESCE(MAX(CASE WHEN setting_key = 'studio_address' THEN setting_value END), 'Surat, Gujarat, India 395007') AS studio_address
  FROM admin_settings;
$$;

CREATE OR REPLACE FUNCTION sp_admin_update_social_settings(
  p_whatsapp_number TEXT,
  p_contact_email TEXT,
  p_instagram_url TEXT,
  p_facebook_url TEXT,
  p_studio_address TEXT
)
RETURNS TABLE (
  whatsapp_number TEXT,
  contact_email TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  studio_address TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO admin_settings (setting_key, setting_value)
  VALUES 
    ('whatsapp_number', COALESCE(p_whatsapp_number, '918200502248')),
    ('contact_email', COALESCE(p_contact_email, 'hello@crochus.com')),
    ('instagram_url', COALESCE(p_instagram_url, 'https://instagram.com/crochus')),
    ('facebook_url', COALESCE(p_facebook_url, 'https://facebook.com/crochus')),
    ('studio_address', COALESCE(p_studio_address, 'Surat, Gujarat, India 395007'))
  ON CONFLICT (setting_key)
  DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

  RETURN QUERY SELECT * FROM sp_get_public_settings();
END;
$$;

COMMIT;
