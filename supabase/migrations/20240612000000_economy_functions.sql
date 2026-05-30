-- Atomic Economy Functions

-- Credit function
CREATE OR REPLACE FUNCTION public.credit_gc(
  target_user_id UUID,
  amount_to_add INTEGER,
  tx_type TEXT,
  tx_description TEXT
) RETURNS VOID AS $$
BEGIN
  -- Update user balance atomically
  UPDATE public.profiles
  SET balance = COALESCE(balance, 0) + amount_to_add
  WHERE id = target_user_id;

  -- Log the transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (target_user_id, amount_to_add, tx_type, tx_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Debit function
CREATE OR REPLACE FUNCTION public.debit_gc(
  target_user_id UUID,
  amount_to_subtract INTEGER,
  tx_type TEXT,
  tx_description TEXT
) RETURNS VOID AS $$
DECLARE
  current_bal INTEGER;
BEGIN
  -- Check current balance
  SELECT balance INTO current_bal FROM public.profiles WHERE id = target_user_id FOR UPDATE;
  
  IF current_bal < amount_to_subtract THEN
    RAISE EXCEPTION 'Insufficient GuriCoins';
  END IF;

  -- Update user balance atomically
  UPDATE public.profiles
  SET balance = balance - amount_to_subtract
  WHERE id = target_user_id;

  -- Log the transaction
  INSERT INTO public.transactions (user_id, amount, type, description)
  VALUES (target_user_id, -amount_to_subtract, tx_type, tx_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
