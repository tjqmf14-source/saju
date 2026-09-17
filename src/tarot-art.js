const wrap=(body)=>`<svg viewBox="0 0 180 250" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="170" height="240" rx="12" fill="#f0dfb8" stroke="#6f5224" stroke-width="3"/><rect x="13" y="13" width="154" height="224" rx="8" fill="#efe3c4" stroke="#9d7b3a" stroke-width="1.5"/><circle cx="90" cy="38" r="18" fill="#e9b84d" opacity=".95"/><g fill="none" stroke="#27365d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

export const TAROT_ILLUSTRATIONS=[
  wrap('<path d="M35 190 75 105l38 40 32-24"/><circle cx="69" cy="87" r="12"/><path d="M69 100v42m0-25-18 20m18-16 22 20m-51 49h100"/>'),
  wrap('<path d="M90 60v82m-28 6h56M55 180h70M64 175v-45h52v45"/><path d="M66 76c8-15 40-15 48 0-8 15-40 15-48 0Z"/>'),
  wrap('<path d="M48 190V78m84 112V78M48 96h84"/><path d="M73 160c18-32 16-57 16-57s4 28 22 57"/><path d="M75 190h34"/>'),
  wrap('<path d="M58 188h64M68 184v-70h44v70"/><path d="M70 106 90 75l20 31M53 160c8-25 21-38 37-38s29 13 37 38"/>'),
  wrap('<path d="M55 188h70M66 184v-74h48v74"/><path d="M70 110 90 78l20 32M52 128h24m28 0h24"/>'),
  wrap('<path d="M48 188h84M62 180V96h56v84M70 116h40M73 146h34"/><path d="M66 88h48L90 64Z"/>'),
  wrap('<circle cx="58" cy="105" r="14"/><circle cx="122" cy="105" r="14"/><path d="M58 120v50m64-50v50M58 140 88 165m34-25-30 25M43 190h94"/>'),
  wrap('<path d="M46 184h88M58 178v-48h64v48M72 130l18-28 18 28"/><circle cx="58" cy="194" r="10"/><circle cx="122" cy="194" r="10"/>'),
  wrap('<circle cx="112" cy="137" r="27"/><path d="M74 95c16 8 21 28 18 47-2 13 7 30 25 34M65 188h72"/><path d="M98 128c10 5 20 5 29 0"/>'),
  wrap('<path d="M87 77v104M87 78 67 98m20-20 20 20"/><circle cx="87" cy="113" r="16"/><path d="M53 190h70"/>'),
  wrap('<circle cx="90" cy="137" r="50"/><circle cx="90" cy="137" r="28"/><path d="M90 87v100m-50-50h100M55 102l70 70m0-70-70 70"/>'),
  wrap('<path d="M90 72v108M61 102h58M55 190h70"/><path d="M48 112h30l-15 42Zm54 0h30l-15 42Z"/>'),
  wrap('<path d="M45 82h90M90 82v82"/><circle cx="90" cy="177" r="13"/><path d="M90 96 68 132m22-18 21 31m-43 47h44"/>'),
  wrap('<path d="M50 190h80M65 178V94h50v84"/><path d="M73 115h34M90 92v-27"/><circle cx="90" cy="61" r="8"/>'),
  wrap('<path d="M58 96c18 18 46 18 64 0M58 96v70m64-70v70M58 166c18-18 46-18 64 0"/><path d="M45 190h90"/>'),
  wrap('<path d="M64 98c14-27 38-27 52 0l18 68H46Z"/><circle cx="76" cy="125" r="8"/><circle cx="104" cy="125" r="8"/><path d="M75 151h30M54 190h72"/>'),
  wrap('<path d="M57 190V92h66v98M47 190h86"/><path d="m44 71 26 27 18-38 20 32 28-25"/><path d="m116 58-13 25 20 3-16 27"/>'),
  wrap('<path d="M47 190c20-35 30-63 43-83 13 20 23 48 43 83"/><circle cx="90" cy="96" r="11"/><path d="M50 83 62 95m56 0 12-12M90 62v16"/>'),
  wrap('<path d="M46 190h88M60 180V94m60 86V94M60 110h60"/><path d="M55 77c20-18 50-18 70 0-20 21-50 21-70 0Z"/><path d="M90 116v46"/>'),
  wrap('<path d="M45 190h90M58 178h64"/><circle cx="90" cy="103" r="35"/><path d="M90 60v-20m-37 78-20 8m94-8 20 8M66 145l-18 18m66-18 18 18"/>'),
  wrap('<path d="M47 190h86M60 181v-50m30 50v-70m30 70v-50"/><path d="M48 94c22-28 62-28 84 0M90 94V57"/><path d="M90 57 73 77m17-20 17 20"/>'),
  wrap('<ellipse cx="90" cy="132" rx="52" ry="74"/><path d="M90 64v136M45 132h90"/><circle cx="90" cy="132" r="21"/><path d="M55 84 72 101m53-17-17 17m-53 79 17-17m53 17-17-17"/>')
];
