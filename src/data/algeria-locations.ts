// ============================================================
// Sakan DZ — Algerian Wilayas & Communes dataset (source of truth)
// 58 wilayas (code, name_ar, name_fr) + principal communes per wilaya.
// Commune lists cover the principal communes of each wilaya and are
// intentionally extensible: add entries to COMMUNES_BY_WILAYA as needed.
// ============================================================

export type LocationLocale = 'ar' | 'fr'

export interface WilayaLocation {
  code: number
  name_ar: string
  name_fr: string
  lat: number
  lng: number
}

export interface CommuneLocation {
  name_ar: string
  name_fr: string
}

export const WILAYAS_58: WilayaLocation[] = [
  { code: 1, name_fr: 'Adrar', name_ar: 'أدرار', lat: 27.8742, lng: -0.2939 },
  { code: 2, name_fr: 'Chlef', name_ar: 'الشلف', lat: 36.1647, lng: 1.3317 },
  { code: 3, name_fr: 'Laghouat', name_ar: 'الأغواط', lat: 33.8003, lng: 2.8632 },
  { code: 4, name_fr: 'Oum El Bouaghi', name_ar: 'أم البواقي', lat: 35.8756, lng: 7.1133 },
  { code: 5, name_fr: 'Batna', name_ar: 'باتنة', lat: 35.556, lng: 6.1742 },
  { code: 6, name_fr: 'Béjaïa', name_ar: 'بجاية', lat: 36.7509, lng: 5.0568 },
  { code: 7, name_fr: 'Biskra', name_ar: 'بسكرة', lat: 34.8333, lng: 5.7333 },
  { code: 8, name_fr: 'Béchar', name_ar: 'بشار', lat: 31.6167, lng: -2.2167 },
  { code: 9, name_fr: 'Blida', name_ar: 'البليدة', lat: 36.4722, lng: 2.8278 },
  { code: 10, name_fr: 'Bouira', name_ar: 'البويرة', lat: 36.3742, lng: 3.9 },
  { code: 11, name_fr: 'Tamanrasset', name_ar: 'تمنراست', lat: 22.785, lng: 5.5228 },
  { code: 12, name_fr: 'Tébessa', name_ar: 'تبسة', lat: 35.4042, lng: 8.1242 },
  { code: 13, name_fr: 'Tlemcen', name_ar: 'تلمسان', lat: 34.8828, lng: -1.3167 },
  { code: 14, name_fr: 'Tiaret', name_ar: 'تيارت', lat: 35.3711, lng: 1.3181 },
  { code: 15, name_fr: 'Tizi Ouzou', name_ar: 'تيزي وزو', lat: 36.7117, lng: 4.0456 },
  { code: 16, name_fr: 'Alger', name_ar: 'الجزائر', lat: 36.7538, lng: 3.0588 },
  { code: 17, name_fr: 'Djelfa', name_ar: 'الجلفة', lat: 34.6708, lng: 3.2631 },
  { code: 18, name_fr: 'Jijel', name_ar: 'جيجل', lat: 36.8211, lng: 5.7667 },
  { code: 19, name_fr: 'Sétif', name_ar: 'سطيف', lat: 36.1898, lng: 5.4108 },
  { code: 20, name_fr: 'Saïda', name_ar: 'سعيدة', lat: 34.8303, lng: 0.1517 },
  { code: 21, name_fr: 'Skikda', name_ar: 'سكيكدة', lat: 36.8667, lng: 6.9 },
  { code: 22, name_fr: 'Sidi Bel Abbès', name_ar: 'سيدي بلعباس', lat: 35.1897, lng: -0.6308 },
  { code: 23, name_fr: 'Annaba', name_ar: 'عنابة', lat: 36.9, lng: 7.7667 },
  { code: 24, name_fr: 'Guelma', name_ar: 'قالمة', lat: 36.4622, lng: 7.4306 },
  { code: 25, name_fr: 'Constantine', name_ar: 'قسنطينة', lat: 36.365, lng: 6.6147 },
  { code: 26, name_fr: 'Médéa', name_ar: 'المدية', lat: 36.2675, lng: 2.75 },
  { code: 27, name_fr: 'Mostaganem', name_ar: 'مستغانم', lat: 35.9333, lng: 0.0833 },
  { code: 28, name_fr: "M'Sila", name_ar: 'المسيلة', lat: 35.7, lng: 4.55 },
  { code: 29, name_fr: 'Mascara', name_ar: 'معسكر', lat: 35.3956, lng: 0.1403 },
  { code: 30, name_fr: 'Ouargla', name_ar: 'ورقلة', lat: 31.95, lng: 5.3333 },
  { code: 31, name_fr: 'Oran', name_ar: 'وهران', lat: 35.6969, lng: -0.6331 },
  { code: 32, name_fr: 'El Bayadh', name_ar: 'البيض', lat: 33.6833, lng: 1.0167 },
  { code: 33, name_fr: 'Illizi', name_ar: 'إليزي', lat: 26.5, lng: 8.4833 },
  { code: 34, name_fr: 'Bordj Bou Arréridj', name_ar: 'برج بوعريريج', lat: 36.0722, lng: 4.7622 },
  { code: 35, name_fr: 'Boumerdès', name_ar: 'بومرداس', lat: 36.7594, lng: 3.4764 },
  { code: 36, name_fr: 'El Tarf', name_ar: 'الطارف', lat: 36.7672, lng: 8.3136 },
  { code: 37, name_fr: 'Tindouf', name_ar: 'تندوف', lat: 27.6742, lng: -8.1478 },
  { code: 38, name_fr: 'Tissemsilt', name_ar: 'تيسمسيلت', lat: 35.6075, lng: 1.8103 },
  { code: 39, name_fr: 'El Oued', name_ar: 'الوادي', lat: 33.3683, lng: 6.8528 },
  { code: 40, name_fr: 'Khenchela', name_ar: 'خنشلة', lat: 35.4353, lng: 7.1431 },
  { code: 41, name_fr: 'Souk Ahras', name_ar: 'سوق أهراس', lat: 36.2864, lng: 7.9511 },
  { code: 42, name_fr: 'Tipaza', name_ar: 'تيبازة', lat: 36.5881, lng: 2.4472 },
  { code: 43, name_fr: 'Mila', name_ar: 'ميلة', lat: 36.4503, lng: 6.2644 },
  { code: 44, name_fr: 'Aïn Defla', name_ar: 'عين الدفلى', lat: 36.2644, lng: 1.9667 },
  { code: 45, name_fr: 'Naâma', name_ar: 'النعامة', lat: 33.2667, lng: -0.3 },
  { code: 46, name_fr: 'Aïn Témouchent', name_ar: 'عين تموشنت', lat: 35.2975, lng: -1.1404 },
  { code: 47, name_fr: 'Ghardaïa', name_ar: 'غرداية', lat: 32.4912, lng: 3.6739 },
  { code: 48, name_fr: 'Relizane', name_ar: 'غليزان', lat: 35.7372, lng: 0.5567 },
  { code: 49, name_fr: 'Timimoun', name_ar: 'تيميمون', lat: 29.2583, lng: 0.2306 },
  { code: 50, name_fr: 'Bordj Badji Mokhtar', name_ar: 'برج باجي مختار', lat: 21.3278, lng: 0.9547 },
  { code: 51, name_fr: 'Ouled Djellal', name_ar: 'أولاد جلال', lat: 34.4333, lng: 5.0667 },
  { code: 52, name_fr: 'Béni Abbès', name_ar: 'بني عباس', lat: 30.1333, lng: -2.1667 },
  { code: 53, name_fr: 'In Salah', name_ar: 'عين صالح', lat: 27.1936, lng: 2.4606 },
  { code: 54, name_fr: 'In Guezzam', name_ar: 'عين قزام', lat: 19.5728, lng: 5.7694 },
  { code: 55, name_fr: 'Touggourt', name_ar: 'تقرت', lat: 33.1083, lng: 6.0583 },
  { code: 56, name_fr: 'Djanet', name_ar: 'جانت', lat: 24.5542, lng: 9.4847 },
  { code: 57, name_fr: "El M'Ghair", name_ar: 'المغير', lat: 33.95, lng: 5.9167 },
  { code: 58, name_fr: 'El Meniaa', name_ar: 'المنيعة', lat: 30.5833, lng: 2.8833 },
]

// Principal communes mapped by wilaya code.
export const COMMUNES_BY_WILAYA: Record<number, CommuneLocation[]> = {
  1: [
    { name_fr: 'Adrar', name_ar: 'أدرار' },
    { name_fr: 'Reggane', name_ar: 'رقان' },
    { name_fr: 'Aoulef', name_ar: 'أولف' },
    { name_fr: 'Zaouiet Kounta', name_ar: 'زاوية كنتة' },
    { name_fr: 'Tamentit', name_ar: 'تامنطيط' },
    { name_fr: 'Fenoughil', name_ar: 'فنوغيل' },
  ],
  2: [
    { name_fr: 'Chlef', name_ar: 'الشلف' },
    { name_fr: 'Ténès', name_ar: 'تنس' },
    { name_fr: 'Boukadir', name_ar: 'بوقادير' },
    { name_fr: 'Oued Fodda', name_ar: 'وادي الفضة' },
    { name_fr: 'Aïn Merane', name_ar: 'عين مران' },
    { name_fr: 'El Karimia', name_ar: 'الكريمية' },
  ],
  3: [
    { name_fr: 'Laghouat', name_ar: 'الأغواط' },
    { name_fr: 'Aflou', name_ar: 'أفلو' },
    { name_fr: "Hassi R'Mel", name_ar: 'حاسي الرمل' },
    { name_fr: 'El Ghicha', name_ar: 'الغيشة' },
    { name_fr: 'Brida', name_ar: 'بريدة' },
  ],
  4: [
    { name_fr: 'Oum El Bouaghi', name_ar: 'أم البواقي' },
    { name_fr: 'Aïn Beïda', name_ar: 'عين البيضاء' },
    { name_fr: "Aïn M'lila", name_ar: 'عين مليلة' },
    { name_fr: 'Aïn Kercha', name_ar: 'عين كرشة' },
    { name_fr: 'Dhalaa', name_ar: 'الضلعة' },
  ],
  5: [
    { name_fr: 'Batna', name_ar: 'باتنة' },
    { name_fr: 'Arris', name_ar: 'أريس' },
    { name_fr: 'Merouana', name_ar: 'مروانة' },
    { name_fr: 'Tazoult', name_ar: 'تازولت' },
    { name_fr: "N'Gaous", name_ar: 'نقاوس' },
    { name_fr: 'Ras El Aioun', name_ar: 'رأس العيون' },
  ],
  6: [
    { name_fr: 'Béjaïa', name_ar: 'بجاية' },
    { name_fr: 'Amizour', name_ar: 'أميزور' },
    { name_fr: 'El Kseur', name_ar: 'القصر' },
    { name_fr: 'Kherrata', name_ar: 'خراطة' },
    { name_fr: 'Aokas', name_ar: 'أوقاس' },
    { name_fr: 'Seddouk', name_ar: 'صدوق' },
  ],
  7: [
    { name_fr: 'Biskra', name_ar: 'بسكرة' },
    { name_fr: 'Tolga', name_ar: 'طولقة' },
    { name_fr: 'Sidi Okba', name_ar: 'سيدي عقبة' },
    { name_fr: 'Zeribet El Oued', name_ar: 'زريبة الوادي' },
    { name_fr: 'El Kantara', name_ar: 'القنطرة' },
  ],
  8: [
    { name_fr: 'Béchar', name_ar: 'بشار' },
    { name_fr: 'Abadla', name_ar: 'العبادلة' },
    { name_fr: 'Béni Ounif', name_ar: 'بني ونيف' },
    { name_fr: 'Kenadsa', name_ar: 'القنادسة' },
    { name_fr: 'Taghit', name_ar: 'تاغيت' },
  ],
  9: [
    { name_fr: 'Blida', name_ar: 'البليدة' },
    { name_fr: 'Boufarik', name_ar: 'بوفاريك' },
    { name_fr: 'Chréa', name_ar: 'الشريعة' },
    { name_fr: 'El Affroun', name_ar: 'العفرون' },
    { name_fr: 'Mouzaïa', name_ar: 'موزاية' },
    { name_fr: 'Ouled Yaïch', name_ar: 'أولاد يعيش' },
  ],
  10: [
    { name_fr: 'Bouira', name_ar: 'البويرة' },
    { name_fr: 'Lakhdaria', name_ar: 'الأخضرية' },
    { name_fr: 'Sour El Ghozlane', name_ar: 'سور الغزلان' },
    { name_fr: "M'Chedallah", name_ar: 'مشد الله' },
    { name_fr: 'Kadiria', name_ar: 'القادرية' },
  ],
  11: [
    { name_fr: 'Tamanrasset', name_ar: 'تمنراست' },
    { name_fr: 'Abalessa', name_ar: 'عابلسة' },
    { name_fr: 'Idlès', name_ar: 'إدلس' },
    { name_fr: 'Tazrouk', name_ar: 'تازروك' },
  ],
  12: [
    { name_fr: 'Tébessa', name_ar: 'تبسة' },
    { name_fr: 'Bir El Ater', name_ar: 'بئر العاتر' },
    { name_fr: 'Cheria', name_ar: 'الشريعة' },
    { name_fr: 'El Aouinet', name_ar: 'العوينات' },
    { name_fr: 'Negrine', name_ar: 'نقرين' },
  ],
  13: [
    { name_fr: 'Tlemcen', name_ar: 'تلمسان' },
    { name_fr: 'Maghnia', name_ar: 'مغنية' },
    { name_fr: 'Nedroma', name_ar: 'ندرومة' },
    { name_fr: 'Ghazaouet', name_ar: 'الغزوات' },
    { name_fr: 'Remchi', name_ar: 'الرمشي' },
    { name_fr: 'Sebdou', name_ar: 'سبدو' },
  ],
  14: [
    { name_fr: 'Tiaret', name_ar: 'تيارت' },
    { name_fr: 'Frenda', name_ar: 'فرندة' },
    { name_fr: 'Sougueur', name_ar: 'السوقر' },
    { name_fr: 'Ksar Chellala', name_ar: 'قصر الشلالة' },
    { name_fr: 'Mahdia', name_ar: 'مهدية' },
  ],
  15: [
    { name_fr: 'Tizi Ouzou', name_ar: 'تيزي وزو' },
    { name_fr: 'Azazga', name_ar: 'عزازقة' },
    { name_fr: 'Draâ El Mizan', name_ar: 'ذراع الميزان' },
    { name_fr: 'Tigzirt', name_ar: 'تيقزيرت' },
    { name_fr: 'Azeffoun', name_ar: 'أزفون' },
    { name_fr: 'Larbaâ Nath Irathen', name_ar: 'الأربعاء ناث إيراثن' },
  ],
  16: [
    { name_fr: 'Alger Centre', name_ar: 'الجزائر الوسطى' },
    { name_fr: 'Bab Ezzouar', name_ar: 'باب الزوار' },
    { name_fr: 'Bab El Oued', name_ar: 'باب الوادي' },
    { name_fr: 'Baraki', name_ar: 'براقي' },
    { name_fr: 'Bir Mourad Raïs', name_ar: 'بئر مراد رايس' },
    { name_fr: 'Bordj El Kiffan', name_ar: 'برج الكيفان' },
    { name_fr: 'Cheraga', name_ar: 'شراقة' },
    { name_fr: 'Dar El Beïda', name_ar: 'دار البيضاء' },
    { name_fr: 'Djasr Kasentina', name_ar: 'جسر قسنطينة' },
    { name_fr: 'Draria', name_ar: 'درارية' },
    { name_fr: 'El Harrach', name_ar: 'الحراش' },
    { name_fr: 'Hydra', name_ar: 'حيدرة' },
    { name_fr: 'Kouba', name_ar: 'القبة' },
    { name_fr: 'Rouiba', name_ar: 'الرويبة' },
    { name_fr: 'Zéralda', name_ar: 'زرالدة' },
    { name_fr: 'Aïn Bénian', name_ar: 'عين البنيان' },
  ],
  17: [
    { name_fr: 'Djelfa', name_ar: 'الجلفة' },
    { name_fr: 'Messaad', name_ar: 'مسعد' },
    { name_fr: 'El Idrissia', name_ar: 'الإدريسية' },
    { name_fr: 'Aïn Oussera', name_ar: 'عين وسارة' },
    { name_fr: 'Hassi Bahbah', name_ar: 'حاسي بحبح' },
  ],
  18: [
    { name_fr: 'Jijel', name_ar: 'جيجل' },
    { name_fr: 'Taher', name_ar: 'الطاهير' },
    { name_fr: 'El Milia', name_ar: 'الميلية' },
    { name_fr: 'Chekfa', name_ar: 'الشقفة' },
    { name_fr: 'Ziama Mansouriah', name_ar: 'زيامة منصورية' },
  ],
  19: [
    { name_fr: 'Sétif', name_ar: 'سطيف' },
    { name_fr: 'El Eulma', name_ar: 'العلمة' },
    { name_fr: 'Aïn Oulmene', name_ar: 'عين ولمان' },
    { name_fr: 'Bougaa', name_ar: 'بوقاعة' },
    { name_fr: 'Aïn Arnat', name_ar: 'عين أرنات' },
    { name_fr: 'Aïn Azel', name_ar: 'عين أزال' },
  ],
  20: [
    { name_fr: 'Saïda', name_ar: 'سعيدة' },
    { name_fr: 'El Hassasna', name_ar: 'الحساسنة' },
    { name_fr: 'Youb', name_ar: 'يوب' },
    { name_fr: 'Aïn El Hadjar', name_ar: 'عين الحجر' },
  ],
  21: [
    { name_fr: 'Skikda', name_ar: 'سكيكدة' },
    { name_fr: 'Collo', name_ar: 'القل' },
    { name_fr: 'Azzaba', name_ar: 'عزابة' },
    { name_fr: 'El Harrouch', name_ar: 'الحروش' },
    { name_fr: 'Tamalous', name_ar: 'تمالوس' },
  ],
  22: [
    { name_fr: 'Sidi Bel Abbès', name_ar: 'سيدي بلعباس' },
    { name_fr: 'Sfisef', name_ar: 'سفيزف' },
    { name_fr: 'Ben Badis', name_ar: 'بن باديس' },
    { name_fr: 'Telagh', name_ar: 'تلاغ' },
    { name_fr: 'Ras El Ma', name_ar: 'رأس الماء' },
  ],
  23: [
    { name_fr: 'Annaba', name_ar: 'عنابة' },
    { name_fr: 'El Bouni', name_ar: 'البوني' },
    { name_fr: 'El Hadjar', name_ar: 'الحجار' },
    { name_fr: 'Seraïdi', name_ar: 'سرايدي' },
    { name_fr: 'Berrahal', name_ar: 'برحال' },
  ],
  24: [
    { name_fr: 'Guelma', name_ar: 'قالمة' },
    { name_fr: 'Bouchegouf', name_ar: 'بوشقوف' },
    { name_fr: 'Oued Zenati', name_ar: 'وادي الزناتي' },
    { name_fr: 'Héliopolis', name_ar: 'هيليوبوليس' },
  ],
  25: [
    { name_fr: 'Constantine', name_ar: 'قسنطينة' },
    { name_fr: 'El Khroub', name_ar: 'الخروب' },
    { name_fr: 'Hamma Bouziane', name_ar: 'حامة بوزيان' },
    { name_fr: 'Aïn Smara', name_ar: 'عين سمارة' },
    { name_fr: 'Didouche Mourad', name_ar: 'ديدوش مراد' },
    { name_fr: 'Zighoud Youcef', name_ar: 'زيغود يوسف' },
  ],
  26: [
    { name_fr: 'Médéa', name_ar: 'المدية' },
    { name_fr: 'Berrouaghia', name_ar: 'البرواقية' },
    { name_fr: 'Ksar El Boukhari', name_ar: 'قصر البخاري' },
    { name_fr: 'Tablat', name_ar: 'تابلاط' },
    { name_fr: 'Aïn Boucif', name_ar: 'عين بوسيف' },
  ],
  27: [
    { name_fr: 'Mostaganem', name_ar: 'مستغانم' },
    { name_fr: 'Aïn Tédles', name_ar: 'عين تادلس' },
    { name_fr: 'Hassi Mamèche', name_ar: 'حاسي ماماش' },
    { name_fr: 'Achaacha', name_ar: 'عشعاشة' },
    { name_fr: 'Mazagran', name_ar: 'مزغران' },
  ],
  28: [
    { name_fr: "M'Sila", name_ar: 'المسيلة' },
    { name_fr: 'Bou Saâda', name_ar: 'بوسعادة' },
    { name_fr: 'Barika', name_ar: 'بريكة' },
    { name_fr: 'Aïn El Hadjel', name_ar: 'عين الحجل' },
    { name_fr: 'Magra', name_ar: 'مقرة' },
  ],
  29: [
    { name_fr: 'Mascara', name_ar: 'معسكر' },
    { name_fr: 'Sig', name_ar: 'سيق' },
    { name_fr: 'Mohammedia', name_ar: 'المحمدية' },
    { name_fr: 'Tighennif', name_ar: 'تيغنيف' },
    { name_fr: 'Ghriss', name_ar: 'غريس' },
  ],
  30: [
    { name_fr: 'Ouargla', name_ar: 'ورقلة' },
    { name_fr: 'Hassi Messaoud', name_ar: 'حاسي مسعود' },
    { name_fr: "N'Goussa", name_ar: 'نقوسة' },
    { name_fr: 'Sidi Khouiled', name_ar: 'سيدي خويلد' },
  ],
  31: [
    { name_fr: 'Oran', name_ar: 'وهران' },
    { name_fr: 'Bir El Djir', name_ar: 'بئر الجير' },
    { name_fr: 'Es Sénia', name_ar: 'السانية' },
    { name_fr: 'Aïn El Turk', name_ar: 'عين الترك' },
    { name_fr: 'Arzew', name_ar: 'أرزيو' },
    { name_fr: 'Mers El Kébir', name_ar: 'مرسى الكبير' },
    { name_fr: 'Gdyel', name_ar: 'قديل' },
    { name_fr: 'Oued Tlélat', name_ar: 'وادي تليلات' },
  ],
  32: [
    { name_fr: 'El Bayadh', name_ar: 'البيض' },
    { name_fr: 'Brézina', name_ar: 'بريزينة' },
    { name_fr: 'Bougtob', name_ar: 'بوقطب' },
    { name_fr: 'El Abiodh Sidi Cheikh', name_ar: 'الأبيض سيدي الشيخ' },
  ],
  33: [
    { name_fr: 'Illizi', name_ar: 'إليزي' },
    { name_fr: 'In Amenas', name_ar: 'إن أمناس' },
    { name_fr: 'Bordj Omar Driss', name_ar: 'برج عمر إدريس' },
  ],
  34: [
    { name_fr: 'Bordj Bou Arréridj', name_ar: 'برج بوعريريج' },
    { name_fr: 'Ras El Oued', name_ar: 'رأس الوادي' },
    { name_fr: 'Aïn Taghrout', name_ar: 'عين تاغروت' },
    { name_fr: 'El Achir', name_ar: 'العشير' },
  ],
  35: [
    { name_fr: 'Boumerdès', name_ar: 'بومرداس' },
    { name_fr: 'Khemis El Khechna', name_ar: 'خميس الخشنة' },
    { name_fr: 'Boudouaou', name_ar: 'بودواو' },
    { name_fr: 'Thénia', name_ar: 'الثنية' },
    { name_fr: 'Isser', name_ar: 'يسر' },
    { name_fr: 'Bordj Menaïel', name_ar: 'برج منايل' },
  ],
  36: [
    { name_fr: 'El Tarf', name_ar: 'الطارف' },
    { name_fr: 'El Kala', name_ar: 'القالة' },
    { name_fr: 'Bouhadjar', name_ar: 'بوحجار' },
    { name_fr: 'Besbes', name_ar: 'بسباس' },
  ],
  37: [
    { name_fr: 'Tindouf', name_ar: 'تندوف' },
    { name_fr: 'Oum El Assel', name_ar: 'أم العسل' },
  ],
  38: [
    { name_fr: 'Tissemsilt', name_ar: 'تيسمسيلت' },
    { name_fr: 'Theniet El Had', name_ar: 'ثنية الحد' },
    { name_fr: 'Bordj Bou Naama', name_ar: 'برج بونعامة' },
    { name_fr: 'Lazharia', name_ar: 'الأزهرية' },
  ],
  39: [
    { name_fr: 'El Oued', name_ar: 'الوادي' },
    { name_fr: 'Guemar', name_ar: 'قمار' },
    { name_fr: 'Robbah', name_ar: 'الرباح' },
    { name_fr: 'Debila', name_ar: 'الدبيلة' },
    { name_fr: 'Hassi Khalifa', name_ar: 'حاسي خليفة' },
  ],
  40: [
    { name_fr: 'Khenchela', name_ar: 'خنشلة' },
    { name_fr: 'Aïn Touila', name_ar: 'عين الطويلة' },
    { name_fr: 'Kaïs', name_ar: 'قايس' },
    { name_fr: 'Chechar', name_ar: 'ششار' },
  ],
  41: [
    { name_fr: 'Souk Ahras', name_ar: 'سوق أهراس' },
    { name_fr: 'Sedrata', name_ar: 'سدراتة' },
    { name_fr: 'Taoura', name_ar: 'تاورة' },
    { name_fr: "M'daourouch", name_ar: 'مداوروش' },
  ],
  42: [
    { name_fr: 'Tipaza', name_ar: 'تيبازة' },
    { name_fr: 'Koléa', name_ar: 'القليعة' },
    { name_fr: 'Hadjout', name_ar: 'حجوط' },
    { name_fr: 'Cherchell', name_ar: 'شرشال' },
    { name_fr: 'Bou Ismaïl', name_ar: 'بواسماعيل' },
  ],
  43: [
    { name_fr: 'Mila', name_ar: 'ميلة' },
    { name_fr: 'Ferdjioua', name_ar: 'فرجيوة' },
    { name_fr: 'Chelghoum Laïd', name_ar: 'شلغوم العيد' },
    { name_fr: 'Telerghma', name_ar: 'تلاغمة' },
  ],
  44: [
    { name_fr: 'Aïn Defla', name_ar: 'عين الدفلى' },
    { name_fr: 'Miliana', name_ar: 'مليانة' },
    { name_fr: 'El Attaf', name_ar: 'العطاف' },
    { name_fr: 'Khemis Miliana', name_ar: 'خميس مليانة' },
  ],
  45: [
    { name_fr: 'Naâma', name_ar: 'النعامة' },
    { name_fr: 'Mécheria', name_ar: 'المشرية' },
    { name_fr: 'Aïn Sefra', name_ar: 'عين الصفراء' },
  ],
  46: [
    { name_fr: 'Aïn Témouchent', name_ar: 'عين تموشنت' },
    { name_fr: 'El Amria', name_ar: 'العامرية' },
    { name_fr: 'Hamma Bou Hadjar', name_ar: 'حمام بوحجر' },
    { name_fr: 'Béni Saf', name_ar: 'بني صاف' },
  ],
  47: [
    { name_fr: 'Ghardaïa', name_ar: 'غرداية' },
    { name_fr: 'Berriane', name_ar: 'بريان' },
    { name_fr: 'Metlili', name_ar: 'متللي' },
    { name_fr: 'El Atteuf', name_ar: 'العطف' },
    { name_fr: 'Beni Isguen', name_ar: 'بني يزقن' },
  ],
  48: [
    { name_fr: 'Relizane', name_ar: 'غليزان' },
    { name_fr: 'Oued Rhiou', name_ar: 'وادي رهيو' },
    { name_fr: 'Mazouna', name_ar: 'مازونة' },
    { name_fr: 'Yellel', name_ar: 'يلل' },
  ],
  49: [
    { name_fr: 'Timimoun', name_ar: 'تيميمون' },
    { name_fr: 'Charouine', name_ar: 'شروين' },
    { name_fr: 'Aougrout', name_ar: 'أوقروت' },
    { name_fr: 'Talmine', name_ar: 'طالمين' },
  ],
  50: [
    { name_fr: 'Bordj Badji Mokhtar', name_ar: 'برج باجي مختار' },
    { name_fr: 'Timiaouine', name_ar: 'تيمياوين' },
  ],
  51: [
    { name_fr: 'Ouled Djellal', name_ar: 'أولاد جلال' },
    { name_fr: 'Sidi Khaled', name_ar: 'سيدي خالد' },
    { name_fr: 'Chaïba', name_ar: 'الشعيبة' },
    { name_fr: 'Doucen', name_ar: 'دوسن' },
  ],
  52: [
    { name_fr: 'Béni Abbès', name_ar: 'بني عباس' },
    { name_fr: 'Kerzaz', name_ar: 'كرزاز' },
    { name_fr: 'El Ouata', name_ar: 'الواتة' },
    { name_fr: 'Igli', name_ar: 'إيقلي' },
  ],
  53: [
    { name_fr: 'In Salah', name_ar: 'عين صالح' },
    { name_fr: 'In Ghar', name_ar: 'إن غار' },
    { name_fr: 'Foggaret Ezzoua', name_ar: 'فقارة الزوى' },
  ],
  54: [
    { name_fr: 'In Guezzam', name_ar: 'عين قزام' },
    { name_fr: 'Tin Zaouatine', name_ar: 'تين زاوتين' },
  ],
  55: [
    { name_fr: 'Touggourt', name_ar: 'تقرت' },
    { name_fr: 'Temacine', name_ar: 'تماسين' },
    { name_fr: 'Megarine', name_ar: 'المقارين' },
    { name_fr: 'Sidi Slimane', name_ar: 'سيدي سليمان' },
    { name_fr: 'El Hadjira', name_ar: 'الحجيرة' },
  ],
  56: [
    { name_fr: 'Djanet', name_ar: 'جانت' },
    { name_fr: 'Bordj El Houasse', name_ar: 'برج الحواس' },
  ],
  57: [
    { name_fr: "El M'Ghair", name_ar: 'المغير' },
    { name_fr: 'Djamaa', name_ar: 'جامعة' },
    { name_fr: 'Still', name_ar: 'سطيل' },
    { name_fr: 'Oum Touyour', name_ar: 'أم الطيور' },
  ],
  58: [
    { name_fr: 'El Meniaa', name_ar: 'المنيعة' },
    { name_fr: 'Hassi Gara', name_ar: 'حاسي القارة' },
    { name_fr: 'Hassi Fehal', name_ar: 'حاسي الفحل' },
  ],
}

// ============================================================
// Helpers
// ============================================================

export function getWilayaByCode(code: number | string | undefined | null): WilayaLocation | undefined {
  if (code === undefined || code === null || code === '') return undefined
  return WILAYAS_58.find((w) => w.code === Number(code))
}

export function getCommunesByWilaya(code: number | string | undefined | null): CommuneLocation[] {
  if (code === undefined || code === null || code === '') return []
  return COMMUNES_BY_WILAYA[Number(code)] ?? []
}

export function wilayaLabel(wilaya: WilayaLocation, locale: LocationLocale): string {
  return locale === 'ar' ? wilaya.name_ar : wilaya.name_fr
}

export function communeLabel(commune: CommuneLocation, locale: LocationLocale): string {
  return locale === 'ar' ? commune.name_ar : commune.name_fr
}

/** Canonical stored value (locale-independent) so filters match regardless of UI language. */
export function communeValue(commune: CommuneLocation): string {
  return commune.name_fr
}
