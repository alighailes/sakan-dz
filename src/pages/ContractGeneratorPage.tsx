import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/i18n'
import { useProperties } from '@/hooks/useProperties'
import { WILAYAS } from '@/constants'
import { jsPDF } from 'jspdf'

export function ContractGeneratorPage() {
  const [searchParams] = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const { properties } = useProperties()
  const { t } = useLocale()
  const property = properties.find((p) => p.id === propertyId)

  const [landlordName, setLandlordName] = useState(property?.ownerName || '')
  const [landlordFirstName, setLandlordFirstName] = useState('')
  const [landlordCni, setLandlordCni] = useState('')
  const [landlordAddress, setLandlordAddress] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantFirstName, setTenantFirstName] = useState('')
  const [tenantCni, setTenantCni] = useState('')
  const [monthlyRent, setMonthlyRent] = useState(property?.price?.toString() || '')
  const [deposit, setDeposit] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleGenerate = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Title
    doc.setFontSize(18)
    doc.text('عقد كراء نموذجي / Contrat de Location Type', pageWidth / 2, 20, { align: 'center' })

    // Landlord info
    doc.setFontSize(12)
    doc.text('معلومات المالك / Informations du Propriétaire:', 14, 40)
    doc.text(`الاسم الكامل / Nom complet: ${landlordName} ${landlordFirstName}`, 14, 50)
    doc.text(`رقم البطاقة / N° CNI: ${landlordCni}`, 14, 60)
    doc.text(`العنوان / Adresse: ${landlordAddress}`, 14, 70)

    // Tenant info
    doc.text('معلومات المستأجر / Informations du Locataire:', 14, 90)
    doc.text(`الاسم الكامل / Nom complet: ${tenantName} ${tenantFirstName}`, 14, 100)
    doc.text(`رقم البطاقة / N° CNI: ${tenantCni}`, 14, 110)

    // Property details
    doc.text('تفاصيل العقار / Détails du Bien:', 14, 130)
    doc.text(`العنوان / Adresse: ${property?.address || ''}`, 14, 140)
    doc.text(`الولاية / Wilaya: ${WILAYAS.find((w) => w.id === property?.wilayaId)?.name || ''}`, 14, 150)
    doc.text(`الإيجار الشهري / Loyer mensuel: ${monthlyRent} DZD`, 14, 160)
    doc.text(`مبلغ الضمان / Montant de caution: ${deposit} DZD`, 14, 170)

    // Rental terms
    doc.text('شروط الكراء / Conditions de Location:', 14, 190)
    doc.text(`تاريخ البداية / Date de début: ${startDate}`, 14, 200)
    doc.text(`تاريخ النهاية / Date de fin: ${endDate}`, 14, 210)

    // Standard clauses
    doc.setFontSize(10)
    doc.text('الشروط القياسية / Clauses standards:', 14, 230)
    doc.text('1. يلتزم المستأجر بالمحافظة على العقار في حالة جيدة.', 14, 240)
    doc.text('2. يلتزم المستأجر بدفع الإيجار في الموعد المحدد.', 14, 250)
    doc.text('3. لا يجوز للمستأجر إجراء تعديلات دون إذن كتابي من المالك.', 14, 260)
    doc.text('4. يخضع هذا العقد للقانون المدني الجزائري.', 14, 270)

    // Signature blocks
    doc.setFontSize(12)
    doc.text('توقيع المالك / Signature du Propriétaire:', 14, 290)
    doc.text('توقيع المستأجر / Signature du Locataire:', pageWidth / 2 + 10, 290)

    doc.save(`contrat-location-${propertyId || 'draft'}.pdf`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
        <FileText className="h-6 w-6 text-primary-600" />
        {t.contract.title}
      </h1>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-gray-900">
        {/* Landlord Info */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t.contract.landlordInfo}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder={t.contract.landlordName} value={landlordName} onChange={(e) => setLandlordName(e.target.value)} />
            <Input placeholder={t.contract.landlordFirstName} value={landlordFirstName} onChange={(e) => setLandlordFirstName(e.target.value)} />
            <Input placeholder={t.contract.landlordCni} value={landlordCni} onChange={(e) => setLandlordCni(e.target.value)} />
            <Input placeholder={t.contract.landlordAddress} value={landlordAddress} onChange={(e) => setLandlordAddress(e.target.value)} />
          </div>
        </div>

        {/* Tenant Info */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t.contract.tenantInfo}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder={t.contract.tenantName} value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
            <Input placeholder={t.contract.tenantFirstName} value={tenantFirstName} onChange={(e) => setTenantFirstName(e.target.value)} />
            <Input placeholder={t.contract.tenantCni} value={tenantCni} onChange={(e) => setTenantCni(e.target.value)} />
          </div>
        </div>

        {/* Rental Terms */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t.contract.rentalTerms}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" placeholder={t.contract.monthlyRent} value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} />
            <Input type="number" placeholder={t.contract.deposit} value={deposit} onChange={(e) => setDeposit(e.target.value)} />
            <Input type="date" placeholder={t.contract.startDate} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" placeholder={t.contract.endDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <Button className="w-full gap-2" onClick={handleGenerate}>
          <Download className="h-4 w-4" />
          {t.contract.download}
        </Button>
      </div>
    </div>
  )
}
