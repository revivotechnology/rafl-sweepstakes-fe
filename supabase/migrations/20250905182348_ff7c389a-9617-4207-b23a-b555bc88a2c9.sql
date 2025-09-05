-- Set bjd.boggs@gmail.com as admin when they sign up
-- First, let's create a trigger to automatically assign admin role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a store for the new user if they provided store_name
  IF NEW.raw_user_meta_data ->> 'store_name' IS NOT NULL THEN
    INSERT INTO public.stores (user_id, store_name, store_url)
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data ->> 'store_name',
      'https://' || LOWER(REPLACE(NEW.raw_user_meta_data ->> 'store_name', ' ', '')) || '.example.com'
    );
  END IF;

  -- Assign admin role to bjd.boggs@gmail.com
  IF NEW.email = 'bjd.boggs@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Assign store_owner role to other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'store_owner');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();