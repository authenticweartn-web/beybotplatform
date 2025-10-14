-- Update the trigger to handle Facebook OAuth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with user metadata from signup
  -- For Facebook OAuth, extract name from user_metadata
  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      SPLIT_PART(new.email, '@', 1),
      'User'
    ),
    COALESCE(new.raw_user_meta_data->>'company_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default agent config
  INSERT INTO public.agent_config (
    user_id,
    system_prompt,
    personality,
    language,
    tone,
    auto_respond,
    collect_email,
    handle_orders,
    escalate_complex
  )
  VALUES (
    new.id,
    'You are a helpful AI sales assistant for an e-commerce business.',
    'professional',
    'fr',
    'friendly',
    true,
    true,
    true,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Ensure the trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
