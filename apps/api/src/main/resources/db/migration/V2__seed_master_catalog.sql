insert into products (
    id, shop_id, sku, category, brand, unit, selling_price, stock_quantity, enabled,
    name_en, name_ta, name_hi, name_te, name_kn, name_ml, aliases,
    created_at, updated_at
) values
(uuid_to_bin(uuid()), null, 'RICE-SONA-1KG', 'Rice', 'Generic', 'kg', 58.00, 0, 1,
 'Sona Masoori Rice', 'சோனா மசூரி அரிசி', 'सोना मसूरी चावल', 'సోనా మసూరి బియ్యం', 'ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ', 'സോന മസൂരി അരി',
 json_array('rice', 'arisi', 'chawal', 'biyyam', 'akki', 'ari'), current_timestamp(6), current_timestamp(6)),
(uuid_to_bin(uuid()), null, 'SUGAR-1KG', 'Staples', 'Generic', 'kg', 44.00, 0, 1,
 'Sugar', 'சர்க்கரை', 'चीनी', 'చక్కెర', 'ಸಕ್ಕರೆ', 'പഞ്ചസാര',
 json_array('sugar', 'sakkarai', 'chini', 'chakkera'), current_timestamp(6), current_timestamp(6)),
(uuid_to_bin(uuid()), null, 'OIL-SUNFLOWER-1L', 'Oil', 'Generic', 'L', 142.00, 0, 1,
 'Sunflower Oil', 'சூரியகாந்தி எண்ணெய்', 'सूरजमुखी तेल', 'సన్‌ఫ్లవర్ ఆయిల్', 'ಸೂರ್ಯಕಾಂತಿ ಎಣ್ಣೆ', 'സൺഫ്ലവർ ഓയിൽ',
 json_array('oil', 'ennai', 'tel', 'noone', 'enne'), current_timestamp(6), current_timestamp(6)),
(uuid_to_bin(uuid()), null, 'DAL-TOOR-1KG', 'Pulses', 'Generic', 'kg', 168.00, 0, 1,
 'Toor Dal', 'துவரம் பருப்பு', 'अरहर दाल', 'కందిపప్పు', 'ತೊಗರಿ ಬೇಳೆ', 'തുവര പരിപ്പ്',
 json_array('dal', 'paruppu', 'arhar', 'pappu', 'bele'), current_timestamp(6), current_timestamp(6)),
(uuid_to_bin(uuid()), null, 'MILK-1L', 'Dairy', 'Generic', 'packet', 30.00, 0, 1,
 'Milk', 'பால்', 'दूध', 'పాలు', 'ಹಾಲು', 'പാൽ',
 json_array('milk', 'paal', 'doodh', 'paalu', 'haalu', 'paal'), current_timestamp(6), current_timestamp(6));

