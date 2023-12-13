import { toHex, sci, toHex0x, toPercent, toPercentUnit } from './arithmeticFormatters';
import {
  dateTimeAsIso,
  dateTimeAsIsoNoDateIfToday,
  dateTimeAsUS,
  dateTimeAsUSNoDateIfToday,
  getDateTimeAsLocalFormat,
  getDateTimeAsLocalFormatNoDateIfToday,
  dateTimeFromNow,
  toClockMilliseconds,
  toClockSeconds,
  toDays,
  toDurationInDaysHoursMinutesSeconds,
  toDurationInHoursMinutesSeconds,
  toDurationInMilliseconds,
  toDurationInSeconds,
  toHours,
  toMicroSeconds,
  toMilliSeconds,
  toMinutes,
  toNanoSeconds,
  toSeconds,
  toTimeTicks,
  dateTimeSystemFormatter,
} from './dateTimeFormatters';
import { binaryPrefix, currency, SIPrefix } from './symbolFormatters';
import {
  locale,
  scaledUnits,
  simpleCountUnit,
  toFixedUnit,
  ValueFormatCategory,
  stringFormater,
  booleanValueFormatter,
} from './valueFormats';

export const getCategories = (scalable = true): ValueFormatCategory[] => [
  {
    name: 'Misc',
    formats: [
      { name: 'Number', id: 'none', fn: toFixedUnit('') },
      { name: 'String', id: 'string', fn: stringFormater },
      {
        name: 'short',
        id: 'short',
        fn: scaledUnits(1000, ['', ' K', ' Mil', ' Bil', ' Tri', ' Quadr', ' Quint', ' Sext', ' Sept']),
      },
      { name: 'Percent (0-100)', id: 'percent', fn: toPercent },
      { name: 'Percent (0.0-1.0)', id: 'percentunit', fn: toPercentUnit },
      { name: 'Humidity (%H)', id: 'humidity', fn: toFixedUnit('%H') },
      { name: 'Decibel', id: 'dB', fn: toFixedUnit('dB') },
      { name: 'Candela (cd)', id: 'candela', fn: SIPrefix('cd') },
      { name: 'Hexadecimal (0x)', id: 'hex0x', fn: toHex0x },
      { name: 'Hexadecimal', id: 'hex', fn: toHex },
      { name: 'Scientific notation', id: 'sci', fn: sci },
      { name: 'Locale format', id: 'locale', fn: locale },
      { name: 'Pixels', id: 'pixel', fn: toFixedUnit('px') },
    ],
  },
  {
    name: 'Acceleration',
    formats: [
      { name: 'Meters/sec²', id: 'accMS2', fn: toFixedUnit('m/sec²') },
      { name: 'Feet/sec²', id: 'accFS2', fn: toFixedUnit('f/sec²') },
      { name: 'G unit', id: 'accG', fn: toFixedUnit('g') },
    ],
  },
  {
    name: 'Angle',
    formats: [
      { name: 'Degrees (°)', id: 'degree', fn: toFixedUnit('°') },
      { name: 'Radians', id: 'radian', fn: toFixedUnit('rad') },
      { name: 'Gradian', id: 'grad', fn: toFixedUnit('grad') },
      { name: 'Arc Minutes', id: 'arcmin', fn: toFixedUnit('arcmin') },
      { name: 'Arc Seconds', id: 'arcsec', fn: toFixedUnit('arcsec') },
    ],
  },
  {
    name: 'Area',
    formats: [
      { name: 'Square Meters (m²)', id: 'areaM2', fn: toFixedUnit('m²') },
      { name: 'Square Feet (ft²)', id: 'areaF2', fn: toFixedUnit('ft²') },
      { name: 'Square Miles (mi²)', id: 'areaMI2', fn: toFixedUnit('mi²') },
      { name: 'Acres (ac)', id: 'acres', fn: toFixedUnit('ac') },
      { name: 'Hectares (ha)', id: 'hectares', fn: toFixedUnit('ha') },
    ],
  },
  {
    name: 'Computation',
    formats: [
      { name: 'FLOP/s', id: 'flops', fn: SIPrefix('FLOPS', 0, scalable) },
      { name: 'MFLOP/s', id: 'mflops', fn: SIPrefix('FLOPS', 2, scalable) },
      { name: 'GFLOP/s', id: 'gflops', fn: SIPrefix('FLOPS', 3, scalable) },
      { name: 'TFLOP/s', id: 'tflops', fn: SIPrefix('FLOPS', 4, scalable) },
      { name: 'PFLOP/s', id: 'pflops', fn: SIPrefix('FLOPS', 5, scalable) },
      { name: 'EFLOP/s', id: 'eflops', fn: SIPrefix('FLOPS', 6, scalable) },
      { name: 'ZFLOP/s', id: 'zflops', fn: SIPrefix('FLOPS', 7, scalable) },
      { name: 'YFLOP/s', id: 'yflops', fn: SIPrefix('FLOPS', 8, scalable) },
    ],
  },
  {
    name: 'Concentration',
    formats: [
      { name: 'parts-per-million (ppm)', id: 'ppm', fn: toFixedUnit('ppm') },
      { name: 'parts-per-billion (ppb)', id: 'conppb', fn: toFixedUnit('ppb') },
      { name: 'nanogram per cubic meter (ng/m³)', id: 'conngm3', fn: toFixedUnit('ng/m³') },
      { name: 'nanogram per normal cubic meter (ng/Nm³)', id: 'conngNm3', fn: toFixedUnit('ng/Nm³') },
      { name: 'microgram per cubic meter (μg/m³)', id: 'conμgm3', fn: toFixedUnit('μg/m³') },
      { name: 'microgram per normal cubic meter (μg/Nm³)', id: 'conμgNm3', fn: toFixedUnit('μg/Nm³') },
      { name: 'milligram per cubic meter (mg/m³)', id: 'conmgm3', fn: toFixedUnit('mg/m³') },
      { name: 'milligram per normal cubic meter (mg/Nm³)', id: 'conmgNm3', fn: toFixedUnit('mg/Nm³') },
      { name: 'gram per cubic meter (g/m³)', id: 'congm3', fn: toFixedUnit('g/m³') },
      { name: 'gram per normal cubic meter (g/Nm³)', id: 'congNm3', fn: toFixedUnit('g/Nm³') },
      { name: 'milligrams per decilitre (mg/dL)', id: 'conmgdL', fn: toFixedUnit('mg/dL') },
      { name: 'millimoles per litre (mmol/L)', id: 'conmmolL', fn: toFixedUnit('mmol/L') },
    ],
  },
  {
    name: 'Currency',
    formats: [
      { name: 'Dollars ($)', id: 'currencyUSD', fn: currency('$') },
      { name: 'Pounds (£)', id: 'currencyGBP', fn: currency('£') },
      { name: 'Euro (€)', id: 'currencyEUR', fn: currency('€') },
      { name: 'Yen (¥)', id: 'currencyJPY', fn: currency('¥') },
      { name: 'Rubles (₽)', id: 'currencyRUB', fn: currency('₽') },
      { name: 'Hryvnias (₴)', id: 'currencyUAH', fn: currency('₴') },
      { name: 'Real (R$)', id: 'currencyBRL', fn: currency('R$') },
      { name: 'Danish Krone (kr)', id: 'currencyDKK', fn: currency('kr', true) },
      { name: 'Icelandic Króna (kr)', id: 'currencyISK', fn: currency('kr', true) },
      { name: 'Norwegian Krone (kr)', id: 'currencyNOK', fn: currency('kr', true) },
      { name: 'Swedish Krona (kr)', id: 'currencySEK', fn: currency('kr', true) },
      { name: 'Czech koruna (czk)', id: 'currencyCZK', fn: currency('czk') },
      { name: 'Swiss franc (CHF)', id: 'currencyCHF', fn: currency('CHF') },
      { name: 'Polish Złoty (PLN)', id: 'currencyPLN', fn: currency('PLN') },
      { name: 'Bitcoin (฿)', id: 'currencyBTC', fn: currency('฿') },
      { name: 'Milli Bitcoin (฿)', id: 'currencymBTC', fn: currency('mBTC') },
      { name: 'Micro Bitcoin (฿)', id: 'currencyμBTC', fn: currency('μBTC') },
      { name: 'South African Rand (R)', id: 'currencyZAR', fn: currency('R') },
      { name: 'Indian Rupee (₹)', id: 'currencyINR', fn: currency('₹') },
      { name: 'South Korean Won (₩)', id: 'currencyKRW', fn: currency('₩') },
      { name: 'Indonesian Rupiah (Rp)', id: 'currencyIDR', fn: currency('Rp') },
      { name: 'Philippine Peso (PHP)', id: 'currencyPHP', fn: currency('PHP') },
      { name: 'Vietnamese Dong (VND)', id: 'currencyVND', fn: currency('đ', true) },
      { name: 'Turkish Lira (₺)', id: 'currencyTRY', fn: currency('₺', true) },
      { name: 'Malaysian Ringgit (RM)', id: 'currencyMYR', fn: currency('RM') },
      { name: 'CFP franc (XPF)', id: 'currencyXPF', fn: currency('XPF') },
      { name: 'Bulgarian Lev (BGN)', id: 'currencyBGN', fn: currency('BGN') },
    ],
  },
  {
    name: 'Data',
    formats: [
      { name: 'bytes(IEC)', id: 'bytes', fn: binaryPrefix('B') },
      { name: 'bytes(SI)', id: 'decbytes', fn: SIPrefix('B', 0, scalable) },
      { name: 'bits(IEC)', id: 'bits', fn: binaryPrefix('b') },
      { name: 'bits(SI)', id: 'decbits', fn: SIPrefix('b', 0, scalable) },
      { name: 'kibibytes', id: 'kbytes', fn: binaryPrefix('B', 1) },
      { name: 'kilobytes', id: 'deckbytes', fn: SIPrefix('B', 1, scalable) },
      { name: 'mebibytes', id: 'mbytes', fn: binaryPrefix('B', 2) },
      { name: 'megabytes', id: 'decmbytes', fn: SIPrefix('B', 2, scalable) },
      { name: 'gibibytes', id: 'gbytes', fn: binaryPrefix('B', 3) },
      { name: 'gigabytes', id: 'decgbytes', fn: SIPrefix('B', 3, scalable) },
      { name: 'tebibytes', id: 'tbytes', fn: binaryPrefix('B', 4) },
      { name: 'terabytes', id: 'dectbytes', fn: SIPrefix('B', 4, scalable) },
      { name: 'pebibytes', id: 'pbytes', fn: binaryPrefix('B', 5) },
      { name: 'petabytes', id: 'decpbytes', fn: SIPrefix('B', 5, scalable) },
    ],
  },
  {
    name: 'Data rate',
    formats: [
      { name: 'packets/sec', id: 'pps', fn: SIPrefix('p/s', 0, scalable) },
      { name: 'bytes/sec(IEC)', id: 'binBps', fn: binaryPrefix('B/s') },
      { name: 'bytes/sec(SI)', id: 'Bps', fn: SIPrefix('B/s', 0, scalable) },
      { name: 'bits/sec(IEC)', id: 'binbps', fn: binaryPrefix('b/s') },
      { name: 'bits/sec(SI)', id: 'bps', fn: SIPrefix('b/s', 0, scalable) },
      { name: 'kibibytes/sec', id: 'KiBs', fn: binaryPrefix('B/s', 1) },
      { name: 'kibibits/sec', id: 'Kibits', fn: binaryPrefix('b/s', 1) },
      { name: 'kilobytes/sec', id: 'KBs', fn: SIPrefix('B/s', 1, scalable) },
      { name: 'kilobits/sec', id: 'Kbits', fn: SIPrefix('b/s', 1, scalable) },
      { name: 'mebibytes/sec', id: 'MiBs', fn: binaryPrefix('B/s', 2) },
      { name: 'mebibits/sec', id: 'Mibits', fn: binaryPrefix('b/s', 2) },
      { name: 'megabytes/sec', id: 'MBs', fn: SIPrefix('B/s', 2, scalable) },
      { name: 'megabits/sec', id: 'Mbits', fn: SIPrefix('b/s', 2, scalable) },
      { name: 'gibibytes/sec', id: 'GiBs', fn: binaryPrefix('B/s', 3) },
      { name: 'gibibits/sec', id: 'Gibits', fn: binaryPrefix('b/s', 3) },
      { name: 'gigabytes/sec', id: 'GBs', fn: SIPrefix('B/s', 3, scalable) },
      { name: 'gigabits/sec', id: 'Gbits', fn: SIPrefix('b/s', 3, scalable) },
      { name: 'tebibytes/sec', id: 'TiBs', fn: binaryPrefix('B/s', 4) },
      { name: 'tebibits/sec', id: 'Tibits', fn: binaryPrefix('b/s', 4) },
      { name: 'terabytes/sec', id: 'TBs', fn: SIPrefix('B/s', 4, scalable) },
      { name: 'terabits/sec', id: 'Tbits', fn: SIPrefix('b/s', 4, scalable) },
      { name: 'pebibytes/sec', id: 'PiBs', fn: binaryPrefix('B/s', 5) },
      { name: 'pebibits/sec', id: 'Pibits', fn: binaryPrefix('b/s', 5) },
      { name: 'petabytes/sec', id: 'PBs', fn: SIPrefix('B/s', 5, scalable) },
      { name: 'petabits/sec', id: 'Pbits', fn: SIPrefix('b/s', 5, scalable) },
    ],
  },
  {
    name: 'Date & time',
    formats: [
      { name: 'Datetime ISO', id: 'dateTimeAsIso', fn: dateTimeAsIso },
      { name: 'Datetime ISO (No date if today)', id: 'dateTimeAsIsoNoDateIfToday', fn: dateTimeAsIsoNoDateIfToday },
      { name: 'Datetime US', id: 'dateTimeAsUS', fn: dateTimeAsUS },
      { name: 'Datetime US (No date if today)', id: 'dateTimeAsUSNoDateIfToday', fn: dateTimeAsUSNoDateIfToday },
      { name: 'Datetime local', id: 'dateTimeAsLocal', fn: getDateTimeAsLocalFormat() },
      {
        name: 'Datetime local (No date if today)',
        id: 'dateTimeAsLocalNoDateIfToday',
        fn: getDateTimeAsLocalFormatNoDateIfToday(),
      },
      { name: 'Datetime default', id: 'dateTimeAsSystem', fn: dateTimeSystemFormatter },
      { name: 'From Now', id: 'dateTimeFromNow', fn: dateTimeFromNow },
    ],
  },
  {
    name: 'Energy',
    formats: [
      { name: 'Watt (W)', id: 'watt', fn: SIPrefix('W', 0, scalable) },
      { name: 'Kilowatt (kW)', id: 'kwatt', fn: SIPrefix('W', 1, scalable) },
      { name: 'Megawatt (MW)', id: 'megwatt', fn: SIPrefix('W', 2, scalable) },
      { name: 'Gigawatt (GW)', id: 'gwatt', fn: SIPrefix('W', 3, scalable) },
      { name: 'Milliwatt (mW)', id: 'mwatt', fn: SIPrefix('W', -1, scalable) },
      { name: 'Watt per square meter (W/m²)', id: 'Wm2', fn: toFixedUnit('W/m²') },
      { name: 'Volt-Ampere (VA)', id: 'voltamp', fn: SIPrefix('VA', 0, scalable) },
      { name: 'Kilovolt-Ampere (kVA)', id: 'kvoltamp', fn: SIPrefix('VA', 1, scalable) },
      { name: 'Volt-Ampere reactive (VAr)', id: 'voltampreact', fn: SIPrefix('VAr', 0, scalable) },
      { name: 'Kilovolt-Ampere reactive (kVAr)', id: 'kvoltampreact', fn: SIPrefix('VAr', 1, scalable) },
      { name: 'Watt-hour (Wh)', id: 'watth', fn: SIPrefix('Wh') },
      { name: 'Watt-hour per Kilogram (Wh/kg)', id: 'watthperkg', fn: SIPrefix('Wh/kg', 0, scalable) },
      { name: 'Kilowatt-hour (kWh)', id: 'kwatth', fn: SIPrefix('Wh', 1, scalable) },
      { name: 'Kilowatt-min (kWm)', id: 'kwattm', fn: SIPrefix('W-Min', 1, scalable) },
      { name: 'Megawatt-hour (MWh)', id: 'mwatth', fn: SIPrefix('Wh', 2, scalable) },
      { name: 'Ampere-hour (Ah)', id: 'amph', fn: SIPrefix('Ah', 0, scalable) },
      { name: 'Kiloampere-hour (kAh)', id: 'kamph', fn: SIPrefix('Ah', 1, scalable) },
      { name: 'Milliampere-hour (mAh)', id: 'mamph', fn: SIPrefix('Ah', -1, scalable) },
      { name: 'Joule (J)', id: 'joule', fn: SIPrefix('J', 0, scalable) },
      { name: 'Electron volt (eV)', id: 'ev', fn: SIPrefix('eV', 0, scalable) },
      { name: 'Ampere (A)', id: 'amp', fn: SIPrefix('A', 0, scalable) },
      { name: 'Kiloampere (kA)', id: 'kamp', fn: SIPrefix('A', 1, scalable) },
      { name: 'Milliampere (mA)', id: 'mamp', fn: SIPrefix('A', -1, scalable) },
      { name: 'Volt (V)', id: 'volt', fn: SIPrefix('V', 0, scalable) },
      { name: 'Kilovolt (kV)', id: 'kvolt', fn: SIPrefix('V', 1, scalable) },
      { name: 'Millivolt (mV)', id: 'mvolt', fn: SIPrefix('V', -1, scalable) },
      { name: 'Decibel-milliwatt (dBm)', id: 'dBm', fn: SIPrefix('dBm', 0, scalable) },
      { name: 'Milliohm (mΩ)', id: 'mohm', fn: SIPrefix('Ω', -1, scalable) },
      { name: 'Ohm (Ω)', id: 'ohm', fn: SIPrefix('Ω', 0, scalable) },
      { name: 'Kiloohm (kΩ)', id: 'kohm', fn: SIPrefix('Ω', 1, scalable) },
      { name: 'Megaohm (MΩ)', id: 'Mohm', fn: SIPrefix('Ω', 2, scalable) },
      { name: 'Farad (F)', id: 'farad', fn: SIPrefix('F', 0, scalable) },
      { name: 'Microfarad (µF)', id: 'µfarad', fn: SIPrefix('F', -2, scalable) },
      { name: 'Nanofarad (nF)', id: 'nfarad', fn: SIPrefix('F', -3, scalable) },
      { name: 'Picofarad (pF)', id: 'pfarad', fn: SIPrefix('F', -4, scalable) },
      { name: 'Femtofarad (fF)', id: 'ffarad', fn: SIPrefix('F', -5, scalable) },
      { name: 'Henry (H)', id: 'henry', fn: SIPrefix('H', 0, scalable) },
      { name: 'Millihenry (mH)', id: 'mhenry', fn: SIPrefix('H', -1, scalable) },
      { name: 'Microhenry (µH)', id: 'µhenry', fn: SIPrefix('H', -2, scalable) },
      { name: 'Lumens (Lm)', id: 'lumens', fn: SIPrefix('Lm', 0, scalable) },
    ],
  },
  {
    name: 'Flow',
    formats: [
      { name: 'Gallons/min (gpm)', id: 'flowgpm', fn: toFixedUnit('gpm') },
      { name: 'Cubic meters/sec (cms)', id: 'flowcms', fn: toFixedUnit('cms') },
      { name: 'Cubic feet/sec (cfs)', id: 'flowcfs', fn: toFixedUnit('cfs') },
      { name: 'Cubic feet/min (cfm)', id: 'flowcfm', fn: toFixedUnit('cfm') },
      { name: 'Litre/hour', id: 'litreh', fn: toFixedUnit('L/h') },
      { name: 'Litre/min (L/min)', id: 'flowlpm', fn: toFixedUnit('L/min') },
      { name: 'milliLitre/min (mL/min)', id: 'flowmlpm', fn: toFixedUnit('mL/min') },
      { name: 'Lux (lx)', id: 'lux', fn: toFixedUnit('lux') },
    ],
  },
  {
    name: 'Force',
    formats: [
      { name: 'Newton-meters (Nm)', id: 'forceNm', fn: SIPrefix('Nm', 0, scalable) },
      { name: 'Kilonewton-meters (kNm)', id: 'forcekNm', fn: SIPrefix('Nm', 1, scalable) },
      { name: 'Newtons (N)', id: 'forceN', fn: SIPrefix('N', 0, scalable) },
      { name: 'Kilonewtons (kN)', id: 'forcekN', fn: SIPrefix('N', 1, scalable) },
    ],
  },
  {
    name: 'Hash rate',
    formats: [
      { name: 'hashes/sec', id: 'Hs', fn: SIPrefix('H/s', 0, scalable) },
      { name: 'kilohashes/sec', id: 'KHs', fn: SIPrefix('H/s', 1, scalable) },
      { name: 'megahashes/sec', id: 'MHs', fn: SIPrefix('H/s', 2, scalable) },
      { name: 'gigahashes/sec', id: 'GHs', fn: SIPrefix('H/s', 3, scalable) },
      { name: 'terahashes/sec', id: 'THs', fn: SIPrefix('H/s', 4, scalable) },
      { name: 'petahashes/sec', id: 'PHs', fn: SIPrefix('H/s', 5, scalable) },
      { name: 'exahashes/sec', id: 'EHs', fn: SIPrefix('H/s', 6, scalable) },
    ],
  },
  {
    name: 'Mass',
    formats: [
      { name: 'milligram (mg)', id: 'massmg', fn: SIPrefix('g', -1, scalable) },
      { name: 'gram (g)', id: 'massg', fn: SIPrefix('g', 0, scalable) },
      { name: 'pound (lb)', id: 'masslb', fn: toFixedUnit('lb') },
      { name: 'kilogram (kg)', id: 'masskg', fn: SIPrefix('g', 1, scalable) },
      { name: 'metric ton (t)', id: 'masst', fn: toFixedUnit('t') },
    ],
  },
  {
    name: 'Length',
    formats: [
      { name: 'millimeter (mm)', id: 'lengthmm', fn: SIPrefix('m', -1, scalable) },
      { name: 'inch (in)', id: 'lengthin', fn: toFixedUnit('in') },
      { name: 'feet (ft)', id: 'lengthft', fn: toFixedUnit('ft') },
      { name: 'meter (m)', id: 'lengthm', fn: SIPrefix('m', 0, scalable) },
      { name: 'kilometer (km)', id: 'lengthkm', fn: SIPrefix('m', 1, scalable) },
      { name: 'mile (mi)', id: 'lengthmi', fn: toFixedUnit('mi') },
    ],
  },
  {
    name: 'Pressure',
    formats: [
      { name: 'Millibars', id: 'pressurembar', fn: SIPrefix('bar', -1, scalable) },
      { name: 'Bars', id: 'pressurebar', fn: SIPrefix('bar', 0, scalable) },
      { name: 'Kilobars', id: 'pressurekbar', fn: SIPrefix('bar', 1, scalable) },
      { name: 'Pascals', id: 'pressurepa', fn: SIPrefix('Pa', 0, scalable) },
      { name: 'Hectopascals', id: 'pressurehpa', fn: toFixedUnit('hPa') },
      { name: 'Kilopascals', id: 'pressurekpa', fn: toFixedUnit('kPa') },
      { name: 'Inches of mercury', id: 'pressurehg', fn: toFixedUnit('"Hg') },
      { name: 'PSI', id: 'pressurepsi', fn: scaledUnits(1000, ['psi', 'ksi', 'Mpsi']) },
    ],
  },
  {
    name: 'Radiation',
    formats: [
      { name: 'Becquerel (Bq)', id: 'radbq', fn: SIPrefix('Bq', 0, scalable) },
      { name: 'curie (Ci)', id: 'radci', fn: SIPrefix('Ci', 0, scalable) },
      { name: 'Gray (Gy)', id: 'radgy', fn: SIPrefix('Gy', 0, scalable) },
      { name: 'rad', id: 'radrad', fn: SIPrefix('rad', 0, scalable) },
      { name: 'Sievert (Sv)', id: 'radsv', fn: SIPrefix('Sv', 0, scalable) },
      { name: 'milliSievert (mSv)', id: 'radmsv', fn: SIPrefix('Sv', -1, scalable) },
      { name: 'microSievert (µSv)', id: 'radusv', fn: SIPrefix('Sv', -2, scalable) },
      { name: 'rem', id: 'radrem', fn: SIPrefix('rem', 0, scalable) },
      { name: 'Exposure (C/kg)', id: 'radexpckg', fn: SIPrefix('C/kg', 0, scalable) },
      { name: 'roentgen (R)', id: 'radr', fn: SIPrefix('R', 0, scalable) },
      { name: 'Sievert/hour (Sv/h)', id: 'radsvh', fn: SIPrefix('Sv/h', 0, scalable) },
      { name: 'milliSievert/hour (mSv/h)', id: 'radmsvh', fn: SIPrefix('Sv/h', -1, scalable) },
      { name: 'microSievert/hour (µSv/h)', id: 'radusvh', fn: SIPrefix('Sv/h', -2, scalable) },
    ],
  },
  {
    name: 'Rotational Speed',
    formats: [
      { name: 'Revolutions per minute (rpm)', id: 'rotrpm', fn: toFixedUnit('rpm') },
      { name: 'Hertz (Hz)', id: 'rothz', fn: SIPrefix('Hz', 0, scalable) },
      { name: 'Kilohertz (kHz)', id: 'rotkhz', fn: SIPrefix('Hz', 1, scalable) },
      { name: 'Megahertz (MHz)', id: 'rotmhz', fn: SIPrefix('Hz', 2, scalable) },
      { name: 'Gigahertz (GHz)', id: 'rotghz', fn: SIPrefix('Hz', 3, scalable) },
      { name: 'Radians per second (rad/s)', id: 'rotrads', fn: toFixedUnit('rad/s') },
      { name: 'Degrees per second (°/s)', id: 'rotdegs', fn: toFixedUnit('°/s') },
    ],
  },
  {
    name: 'Temperature',
    formats: [
      { name: 'Celsius (°C)', id: 'celsius', fn: toFixedUnit('°C') },
      { name: 'Fahrenheit (°F)', id: 'fahrenheit', fn: toFixedUnit('°F') },
      { name: 'Kelvin (K)', id: 'kelvin', fn: toFixedUnit('K') },
    ],
  },
  {
    name: 'Time',
    formats: [
      { name: 'Hertz (1/s)', id: 'hertz', fn: SIPrefix('Hz', 0, scalable) },
      { name: 'nanoseconds (ns)', id: 'ns', fn: toNanoSeconds },
      { name: 'microseconds (µs)', id: 'µs', fn: toMicroSeconds },
      { name: 'milliseconds (ms)', id: 'ms', fn: toMilliSeconds },
      { name: 'seconds (s)', id: 's', fn: toSeconds },
      { name: 'minutes (m)', id: 'm', fn: toMinutes },
      { name: 'hours (h)', id: 'h', fn: toHours },
      { name: 'days (d)', id: 'd', fn: toDays },
      { name: 'duration (ms)', id: 'dtdurationms', fn: toDurationInMilliseconds },
      { name: 'duration (s)', id: 'dtdurations', fn: toDurationInSeconds },
      { name: 'duration (hh:mm:ss)', id: 'dthms', fn: toDurationInHoursMinutesSeconds },
      { name: 'duration (d hh:mm:ss)', id: 'dtdhms', fn: toDurationInDaysHoursMinutesSeconds },
      { name: 'Timeticks (s/100)', id: 'timeticks', fn: toTimeTicks },
      { name: 'clock (ms)', id: 'clockms', fn: toClockMilliseconds },
      { name: 'clock (s)', id: 'clocks', fn: toClockSeconds },
    ],
  },
  {
    name: 'Throughput',
    formats: [
      { name: 'counts/sec (cps)', id: 'cps', fn: simpleCountUnit('c/s') },
      { name: 'ops/sec (ops)', id: 'ops', fn: simpleCountUnit('ops/s') },
      { name: 'requests/sec (rps)', id: 'reqps', fn: simpleCountUnit('req/s') },
      { name: 'reads/sec (rps)', id: 'rps', fn: simpleCountUnit('rd/s') },
      { name: 'writes/sec (wps)', id: 'wps', fn: simpleCountUnit('wr/s') },
      { name: 'I/O ops/sec (iops)', id: 'iops', fn: simpleCountUnit('io/s') },
      { name: 'events/sec (eps)', id: 'eps', fn: simpleCountUnit('evt/s') },
      { name: 'messages/sec (mps)', id: 'mps', fn: simpleCountUnit('msg/s') },
      { name: 'records/sec (rps)', id: 'recps', fn: simpleCountUnit('rec/s') },
      { name: 'rows/sec (rps)', id: 'rowsps', fn: simpleCountUnit('rows/s') },
      { name: 'counts/min (cpm)', id: 'cpm', fn: simpleCountUnit('c/m') },
      { name: 'ops/min (opm)', id: 'opm', fn: simpleCountUnit('ops/m') },
      { name: 'requests/min (rpm)', id: 'reqpm', fn: simpleCountUnit('req/m') },
      { name: 'reads/min (rpm)', id: 'rpm', fn: simpleCountUnit('rd/m') },
      { name: 'writes/min (wpm)', id: 'wpm', fn: simpleCountUnit('wr/m') },
      { name: 'events/min (epm)', id: 'epm', fn: simpleCountUnit('evts/m') },
      { name: 'messages/min (mpm)', id: 'mpm', fn: simpleCountUnit('msgs/m') },
      { name: 'records/min (rpm)', id: 'recpm', fn: simpleCountUnit('rec/m') },
      { name: 'rows/min (rpm)', id: 'rowspm', fn: simpleCountUnit('rows/m') },
    ],
  },
  {
    name: 'Velocity',
    formats: [
      { name: 'meters/second (m/s)', id: 'velocityms', fn: toFixedUnit('m/s') },
      { name: 'kilometers/hour (km/h)', id: 'velocitykmh', fn: toFixedUnit('km/h') },
      { name: 'miles/hour (mph)', id: 'velocitymph', fn: toFixedUnit('mph') },
      { name: 'knot (kn)', id: 'velocityknot', fn: toFixedUnit('kn') },
    ],
  },
  {
    name: 'Volume',
    formats: [
      { name: 'millilitre (mL)', id: 'mlitre', fn: SIPrefix('L', -1, scalable) },
      { name: 'litre (L)', id: 'litre', fn: SIPrefix('L', 0, scalable) },
      { name: 'cubic meter', id: 'm3', fn: toFixedUnit('m³') },
      { name: 'Normal cubic meter', id: 'Nm3', fn: toFixedUnit('Nm³') },
      { name: 'cubic decimeter', id: 'dm3', fn: toFixedUnit('dm³') },
      { name: 'gallons', id: 'gallons', fn: toFixedUnit('gal') },
    ],
  },
  {
    name: 'Boolean',
    formats: [
      { name: 'True / False', id: 'bool', fn: booleanValueFormatter('True', 'False') },
      { name: 'Yes / No', id: 'bool_yes_no', fn: booleanValueFormatter('Yes', 'No') },
      { name: 'On / Off', id: 'bool_on_off', fn: booleanValueFormatter('On', 'Off') },
    ],
  },
];
