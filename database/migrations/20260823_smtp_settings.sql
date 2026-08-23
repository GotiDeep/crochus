CREATE OR REPLACE FUNCTION sp_admin_get_smtp_settings()
RETURNS TABLE (smtp_host TEXT, smtp_port INTEGER, smtp_secure BOOLEAN, smtp_user TEXT, smtp_from TEXT, contact_receiver_email TEXT, password_configured BOOLEAN)
LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_host' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_port' THEN setting_value END)::INTEGER, 587),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_secure' THEN setting_value END)::BOOLEAN, FALSE),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_user' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_from' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'contact_receiver_email' THEN setting_value END), ''),
    COALESCE(BOOL_OR(setting_key = 'smtp_password_encrypted'), FALSE)
  FROM admin_settings;
$$;

CREATE OR REPLACE FUNCTION sp_get_smtp_settings()
RETURNS TABLE (smtp_host TEXT, smtp_port INTEGER, smtp_secure BOOLEAN, smtp_user TEXT, smtp_from TEXT, contact_receiver_email TEXT, smtp_password_encrypted TEXT)
LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_host' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_port' THEN setting_value END)::INTEGER, 587),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_secure' THEN setting_value END)::BOOLEAN, FALSE),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_user' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_from' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'contact_receiver_email' THEN setting_value END), ''),
    COALESCE(MAX(CASE WHEN setting_key = 'smtp_password_encrypted' THEN setting_value END), '')
  FROM admin_settings;
$$;

CREATE OR REPLACE FUNCTION sp_admin_update_smtp_settings(p_host TEXT, p_port INTEGER, p_secure BOOLEAN, p_user TEXT, p_from TEXT, p_receiver TEXT, p_encrypted_password TEXT DEFAULT NULL)
RETURNS TABLE (smtp_host TEXT, smtp_port INTEGER, smtp_secure BOOLEAN, smtp_user TEXT, smtp_from TEXT, contact_receiver_email TEXT, password_configured BOOLEAN)
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO admin_settings (setting_key, setting_value) VALUES
    ('smtp_host', p_host), ('smtp_port', p_port::TEXT), ('smtp_secure', p_secure::TEXT), ('smtp_user', p_user), ('smtp_from', p_from), ('contact_receiver_email', p_receiver)
  ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
  IF p_encrypted_password IS NOT NULL THEN
    INSERT INTO admin_settings (setting_key, setting_value) VALUES ('smtp_password_encrypted', p_encrypted_password)
    ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
  END IF;
  RETURN QUERY SELECT * FROM sp_admin_get_smtp_settings();
END;
$$;
