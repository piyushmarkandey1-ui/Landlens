import fs from 'node:fs';

function fixEslintErrors() {
  const replaceAny = (content) => content.replace(/:\s*any/g, ': unknown');

  // Fix audit page
  let audit = fs.readFileSync('src/app/audit/page.tsx', 'utf8');
  audit = replaceAny(audit);
  fs.writeFileSync('src/app/audit/page.tsx', audit);

  // Fix citizen page
  let citizen = fs.readFileSync('src/app/citizen/page.tsx', 'utf8');
  citizen = replaceAny(citizen);
  fs.writeFileSync('src/app/citizen/page.tsx', citizen);

  // Fix data sources page
  let ds = fs.readFileSync('src/app/data-sources/page.tsx', 'utf8');
  ds = ds.replace(/"(Live|Simulated)"/g, '&quot;$1&quot;'); // naive fix
  fs.writeFileSync('src/app/data-sources/page.tsx', ds);

  // Fix parcel page
  let parcel = fs.readFileSync('src/app/parcels/[id]/page.tsx', 'utf8');
  parcel = parcel.replace(/Info\s*\}/, 'Info, Layers }'); // Add Layers import
  parcel = parcel.replace(/>"([^"]+)"</g, '>&quot;$1&quot;<');
  fs.writeFileSync('src/app/parcels/[id]/page.tsx', parcel);

  // Fix planning page
  let planning = fs.readFileSync('src/app/planning/page.tsx', 'utf8');
  planning = replaceAny(planning);
  fs.writeFileSync('src/app/planning/page.tsx', planning);

  // Fix registration page
  let reg = fs.readFileSync('src/app/registration/page.tsx', 'utf8');
  reg = replaceAny(reg);
  fs.writeFileSync('src/app/registration/page.tsx', reg);

  // Fix revenue page
  let rev = fs.readFileSync('src/app/revenue/page.tsx', 'utf8');
  rev = replaceAny(rev);
  fs.writeFileSync('src/app/revenue/page.tsx', rev);

  // Fix MapView
  let mapview = fs.readFileSync('src/components/MapView.tsx', 'utf8');
  mapview = replaceAny(mapview);
  fs.writeFileSync('src/components/MapView.tsx', mapview);

  // Fix LandingPage
  let landing = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
  landing = landing.replace(/>([^<]*?)'s([^<]*?)</g, '>$1&apos;s$2<'); // Fix unescaped entities 's
  // run multiple times in case there are multiple on same line
  landing = landing.replace(/>([^<]*?)'s([^<]*?)</g, '>$1&apos;s$2<');
  fs.writeFileSync('src/components/LandingPage.tsx', landing);
}

fixEslintErrors();
