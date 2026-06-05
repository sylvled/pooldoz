import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import frCommon from '@/i18n/fr/common.json'
import frDosage from '@/i18n/fr/dosage.json'
import frPiscine from '@/i18n/fr/piscine.json'
import frJournal from '@/i18n/fr/journal.json'
import frReglages from '@/i18n/fr/reglages.json'
import frErrors from '@/i18n/fr/errors.json'

import enCommon from '@/i18n/en/common.json'
import enDosage from '@/i18n/en/dosage.json'
import enPiscine from '@/i18n/en/piscine.json'
import enJournal from '@/i18n/en/journal.json'
import enReglages from '@/i18n/en/reglages.json'
import enErrors from '@/i18n/en/errors.json'

// Synchronous init — all resources bundled, no backend, no detector
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon, dosage: frDosage, piscine: frPiscine, journal: frJournal, reglages: frReglages, errors: frErrors },
      en: { common: enCommon, dosage: enDosage, piscine: enPiscine, journal: enJournal, reglages: enReglages, errors: enErrors },
    },
    lng: 'fr',
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  })

export default i18n

export function changeLanguage(lang: 'fr' | 'en') {
  return i18n.changeLanguage(lang)
}
