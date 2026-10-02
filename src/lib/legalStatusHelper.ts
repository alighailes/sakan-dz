import type { LegalStatus } from '@/types'

export interface LegalStatusInfo {
  value: LegalStatus
  labelAr: string
  labelFr: string
  descriptionAr: string
  descriptionFr: string
  eligibleForBankLoan: boolean
  badgeColor: 'emerald' | 'amber' | 'blue'
  riskLevel: 'low' | 'medium' | 'high'
}

export const LEGAL_STATUS_INFO: Record<LegalStatus, LegalStatusInfo> = {
  acte_livret: {
    value: 'acte_livret',
    labelAr: 'عقد توثيقي + دفتر عقاري',
    labelFr: 'Acte notarié + Livret foncier',
    descriptionAr: 'هذا العقار يملك سندا رسميا مشهرا في المحافظة العقارية ومطابق لقواعد الرهن العقاري. أعلى درجة من الأمان القانوني.',
    descriptionFr: 'Ce bien possède un titre foncier officiel authentifié auprès de la conservation foncière et conforme aux règles d\'hypothèque. Le plus haut niveau de sécurité juridique.',
    eligibleForBankLoan: true,
    badgeColor: 'emerald',
    riskLevel: 'low',
  },
  acte_seul: {
    value: 'acte_seul',
    labelAr: 'عقد توثيقي فقط',
    labelFr: 'Acte notarié seul',
    descriptionAr: 'العقار موثق لدى العدل لكن بدون دفتر عقاري بعد. يمكن تحويله إلى دفتر عقاري لاحقا. مقبول في معظم المعاملات.',
    descriptionFr: 'Le bien est authentifié auprès d\'un notaire mais sans titre foncier. Peut être converti en titre foncier ultérieurement. Accepté dans la plupart des transactions.',
    eligibleForBankLoan: true,
    badgeColor: 'emerald',
    riskLevel: 'low',
  },
  indivision: {
    value: 'indivision',
    labelAr: 'عقد في الشيوع',
    labelFr: 'Dans l\'indivision',
    descriptionAr: 'العقار مملوك لعدة ورثة أو شركاء دون تقسيم رسمي. يتطلب موافقة جميع الأطراف أو التقسيم قبل البيع.',
    descriptionFr: 'Le bien appartient à plusieurs héritiers ou associés sans division officielle. Nécessite l\'accord de toutes les parties ou un partage avant la vente.',
    eligibleForBankLoan: false,
    badgeColor: 'amber',
    riskLevel: 'medium',
  },
  decision_attribution: {
    value: 'decision_attribution',
    labelAr: 'مقرر استفادة / ترقية عقارية',
    labelFr: 'Décision d\'attribution / Promotion',
    descriptionAr: 'عقار مخصص من قبل الدولة (AADL، LPP، سكن اجتماعي). يخضع لقواعد خاصة وقد يتطلب فترة حظر قبل البيع الحر.',
    descriptionFr: 'Bien attribué par l\'État (AADL, LPP, logement social). Soumis à des règles spéciales et peut nécessiter une période de blocage avant la vente libre.',
    eligibleForBankLoan: false,
    badgeColor: 'blue',
    riskLevel: 'medium',
  },
  cle_desistement: {
    value: 'cle_desistement',
    labelAr: 'مفتاح / تنازل',
    labelFr: 'Clé / Désistement',
    descriptionAr: 'تنازل عن حق الاستفادة في عقار اجتماعي أو AADL. الملكية تنتقل بالتنازل دون تغيير في المحافظة العقارية.',
    descriptionFr: 'Cession de droit à un logement social ou AADL. La propriété se transfère par désistement sans modification à la conservation foncière.',
    eligibleForBankLoan: false,
    badgeColor: 'blue',
    riskLevel: 'medium',
  },
  promesse_vente: {
    value: 'promesse_vente',
    labelAr: 'وعد بالبيع',
    labelFr: 'Promesse de vente',
    descriptionAr: 'اتفاق أولي بين البائع والمشتري قبل البيع النهائي. ليس سندا ملكية نهائيا ويحتاج توثيقا لاحقا.',
    descriptionFr: 'Accord préliminaire entre vendeur et acheteur avant la vente finale. Ce n\'est pas un titre de propriété définitif et nécessite une authentification ultérieure.',
    eligibleForBankLoan: false,
    badgeColor: 'amber',
    riskLevel: 'high',
  },
  papier_timbre: {
    value: 'papier_timbre',
    labelAr: 'ورقة عرفية / عقد عرفي',
    labelFr: 'Papier timbré',
    descriptionAr: 'عقد عرفي مكتوب على ورقة مختومة دون توثيق رسمي. أقل درجة من الأمان القانوني ولا يقبل في المعاملات البنكية.',
    descriptionFr: 'Contrat informel rédigé sur papier timbré sans authentification officielle. Le plus faible niveau de sécurité juridique et non accepté pour les transactions bancaires.',
    eligibleForBankLoan: false,
    badgeColor: 'amber',
    riskLevel: 'high',
  },
}

export const LEGAL_STATUS_LIST = Object.values(LEGAL_STATUS_INFO)

export function getLegalStatusInfo(status: LegalStatus): LegalStatusInfo {
  return LEGAL_STATUS_INFO[status] || LEGAL_STATUS_INFO.papier_timbre
}
