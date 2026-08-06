# Static Content Translation Fixes

## Summary
All translation files (EN, NL, FR, DE, ES) now have a `company` section with contact details. The following components need to be updated to use these translation keys instead of hardcoded values.

## Translation Keys Added

```json
"company": {
  "name": "ZENYOURLIFE.BE",
  "name_lowercase": "zenyourlife.be",
  "email": "info@zenyourlife.be",
  "email_privacy": "privacy@zenyourlife.be",
  "phone": "0476 66 71 15",
  "phone_international": "+32476667115",
  "phone_placeholder": "0812 3456 789",
  "vat": "BE0899912649",
  "vat_label": "BTW",
  "address_street": "Schapenbaan 45",
  "address_city": "1731 Relegem",
  "address_country": "Belgium/België/Belgique/Belgien/Bélgica",
  "address_full": "Schapenbaan 45, 1731 Relegem, Belgium",
  "location_massage": "Groot-Bijgaarden, Belgium",
  "location_rental": "Lanzarote, Spain"
}
```

---

## Components That Need Updates

### 1. **Frontend/src/Pages/Contact.tsx**

**Lines to Replace:**

Line 281-282: Email
```tsx
// CURRENT (hardcoded):
<a href="mailto:info@zenyourlife.be" className="text-xs sm:text-sm text-gray-900 font-medium mb-1.5 sm:mb-2 hover:text-[#d4af37] transition-colors">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-xs sm:text-sm text-gray-900 font-medium mb-1.5 sm:mb-2 hover:text-[#d4af37] transition-colors">
  {t('company.email')}
</a>
```

Line 285: VAT
```tsx
// CURRENT:
BTW: BE0899912649

// REPLACE WITH:
{t('company.vat_label')}: {t('company.vat')}
```

Line 296: Phone
```tsx
// CURRENT:
0476 66 71 15

// REPLACE WITH:
{t('company.phone')}
```

Line 312-314: Address
```tsx
// CURRENT:
<span>Schapenbaan 45</span>
...
<span>1731 Relegem, Belgium</span>

// REPLACE WITH:
<span>{t('company.address_street')}</span>
...
<span>{t('company.address_city')}, {t('company.address_country')}</span>
```

---

### 2. **Frontend/src/Pages/MainLanding.tsx**

Line 41: Company Name
```tsx
// CURRENT:
ZENYOURLIFE.BE

// REPLACE WITH:
{t('company.name')}
```

Line 163: Address
```tsx
// CURRENT:
<span>Schapenbaan 45 ,1731 Relegem</span>

// REPLACE WITH:
<span>{t('company.address_street')} ,{t('company.address_city')}</span>
```

---

### 3. **Frontend/src/components/Footer.tsx**

Line 141: Company Name
```tsx
// CURRENT:
<h3 className="text-xl font-semibold mb-3">zenyourlife.be</h3>

// REPLACE WITH:
<h3 className="text-xl font-semibold mb-3">{t('company.name_lowercase')}</h3>
```

Line 153: Company Name
```tsx
// CURRENT:
<h3 className="text-xl font-semibold">ZENYOURLIFE.BE</h3>

// REPLACE WITH:
<h3 className="text-xl font-semibold">{t('company.name')}</h3>
```

Line 206: Phone
```tsx
// CURRENT:
<span className="underline">0476 66 71 15</span>

// REPLACE WITH:
<span className="underline">{t('company.phone')}</span>
```

Line 214-218: Email
```tsx
// CURRENT:
<a
  href="mailto:info@zenyourlife.be"
  ...
>
  <span>info@zenyourlife.be</span>
</a>

// REPLACE WITH:
<a
  href={`mailto:${t('company.email')}`}
  ...
>
  <span>{t('company.email')}</span>
</a>
```

Line 222: VAT Label
```tsx
// CURRENT:
<span className="text-xs mr-2 flex-shrink-0 font-medium">BTW:</span>

// REPLACE WITH:
<span className="text-xs mr-2 flex-shrink-0 font-medium">{t('company.vat_label')}:</span>
```

Line 264-265: Address
```tsx
// CURRENT:
<p>Schapenbaan 45</p>
<p>1731 Relegem</p>

// REPLACE WITH:
<p>{t('company.address_street')}</p>
<p>{t('company.address_city')}</p>
```

---

### 4. **Frontend/src/components/Navbar.tsx**

Line 174: Company Name
```tsx
// CURRENT:
ZENYOURLIFE.BE

// REPLACE WITH:
{t('company.name')}
```

---

### 5. **Frontend/src/components/NavbarHome.tsx**

Line 58: Company Name
```tsx
// CURRENT:
ZENYOURLIFE.BE

// REPLACE WITH:
{t('company.name')}
```

---

### 6. **Frontend/src/components/Rental/RNavbar.tsx**

Line 68: Company Name
```tsx
// CURRENT:
ZENYOURLIFE.BE

// REPLACE WITH:
{t('company.name')}
```

---

### 7. **Frontend/src/components/Rental/RFooter.tsx**

Line 213: Company Name
```tsx
// CURRENT:
<h3 className="text-xl font-semibold">ZENYOURLIFE.BE</h3>

// REPLACE WITH:
<h3 className="text-xl font-semibold">{t('company.name')}</h3>
```

Line 285: Phone
```tsx
// CURRENT:
<a href="tel:+32476667115" className="hover:text-white">0476 66 71 15</a>

// REPLACE WITH:
<a href={`tel:${t('company.phone_international')}`} className="hover:text-white">{t('company.phone')}</a>
```

Line 289: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="hover:text-white">info@zenyourlife.be</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="hover:text-white">{t('company.email')}</a>
```

Line 293: VAT
```tsx
// CURRENT:
<span>BTW: BE0899912649</span>

// REPLACE WITH:
<span>{t('company.vat_label')}: {t('company.vat')}</span>
```

Line 485: Privacy Email
```tsx
// CURRENT:
To exercise any of these rights, please contact us at privacy@zenyourlife.be.

// REPLACE WITH:
To exercise any of these rights, please contact us at {t('company.email_privacy')}.
```

Line 618-619: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="text-[#0D9488] hover:underline">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-[#0D9488] hover:underline">
  {t('company.email')}
</a>
```

---

### 8. **Frontend/src/components/Rental/RContact.tsx**

Line 311: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="hover:text-blue-600">info@zenyourlife.be</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="hover:text-blue-600">{t('company.email')}</a>
```

Line 327: Phone
```tsx
// CURRENT:
<a href="tel:+32476667115" className="hover:text-blue-600">0476 66 71 15</a>

// REPLACE WITH:
<a href={`tel:${t('company.phone_international')}`} className="hover:text-blue-600">{t('company.phone')}</a>
```

---

### 9. **Frontend/src/Pages/TermsAndConditions.tsx**

Line 134-135: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="text-[#d4af37] hover:underline">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-[#d4af37] hover:underline">
  {t('company.email')}
</a>
```

---

### 10. **Frontend/src/Pages/DPAPage.tsx**

Line 226-227: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="text-[#d4af37] hover:underline">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-[#d4af37] hover:underline">
  {t('company.email')}
</a>
```

---

### 11. **Frontend/src/Pages/CookiePolicy.tsx**

Line 154-155: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="text-[#d4af37] hover:underline">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-[#d4af37] hover:underline">
  {t('company.email')}
</a>
```

---

### 12. **Frontend/src/Pages/Privacypolicy.tsx**

Line 143-144: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="text-[#d4af37] hover:underline">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-[#d4af37] hover:underline">
  {t('company.email')}
</a>
```

---

### 13. **Frontend/src/Pages/RentalPages/RPrivacy.tsx**

Line 106: Privacy Email
```tsx
// CURRENT:
To exercise any of these rights, please contact us at privacy@zenyourlife.be.

// REPLACE WITH:
To exercise any of these rights, please contact us at {t('company.email_privacy')}.
```

Line 194-195: Email
```tsx
// CURRENT:
<a href="mailto:info@zenyourlife.be" className="text-[#0D9488] hover:underline">
  info@zenyourlife.be
</a>

// REPLACE WITH:
<a href={`mailto:${t('company.email')}`} className="text-[#0D9488] hover:underline">
  {t('company.email')}
</a>
```

---

## Implementation Notes

1. **Make sure useTranslation is imported** in each component:
   ```tsx
   import { useTranslation } from 'react-i18next';
   ```

2. **Get the t function** at the top of the component:
   ```tsx
   const { t } = useTranslation();
   ```

3. **Test each page** after making changes to ensure the translations display correctly in all 5 languages (EN, NL, FR, DE, ES).

4. **Verify email and phone links** work correctly with the template literal syntax.

---

## Benefits

After these updates:
- ✅ All company contact information centralized in translation files
- ✅ Easy to update contact details in one place
- ✅ Country names properly translated (Belgium → België/Belgique/Belgien/Bélgica)
- ✅ Location names properly localized
- ✅ Consistent contact information across all pages
- ✅ Full multi-language support for all static content
