// src/constants/equipment.js
import {
  Sliders,
  Camera,
  RotateCcw,
  Tv,
  Monitor,
  HardDrive,
  Server,
  Cpu,
  Network,
  Radio,
  Layers,
  Box,
  Zap,
  Mic,
  Volume2,
  Headphones,
  Wifi,
  ScreenShare,
  BatteryCharging
} from 'lucide-react';

export const DOMAINS = [
  { id: 'all', label: 'Tous les domaines' },
  { id: 'video', label: 'Vidéo & Affichage' },
  { id: 'audio', label: 'Audio & Sonorisation' },
  { id: 'it', label: 'Informatique & Réseau' },
  { id: 'intercom', label: 'Intercom & Ordres' },
  { id: 'power', label: 'Énergie & Distribution' },
];

export const SIGNAL_COLORS = {
  HDMI: '#f59e0b',
  SDI: '#a855f7',
  RJ45: '#22c55e',
  USB: '#ef4444',
  XLR: '#3b82f6',
  Jack: '#0284c7',
  Dante: '#06b6d4',
  Fibre: '#ec4899',
  Sync: '#64748b',
  DMX: '#e11d48',
  Power: '#eab308',
};

// Bibliothèque étendue de connecteurs avec profils PoE
export const PORT_PRESETS = [
  { id: 'sdi_12g', label: '12G-SDI (BNC 4K)', type: 'SDI', connector: 'BNC', domain: 'video' },
  { id: 'sdi_3g', label: '3G-SDI (BNC HD)', type: 'SDI', connector: 'BNC', domain: 'video' },
  { id: 'hdmi_2', label: 'HDMI 2.0 / 2.1', type: 'HDMI', connector: 'HDMI', domain: 'video' },
  { id: 'displayport', label: 'DisplayPort', type: 'HDMI', connector: 'DisplayPort', domain: 'video' },
  { id: 'genlock', label: 'Genlock / Tri-Level (BNC)', type: 'Sync', connector: 'BNC', domain: 'video' },

  // Réseau RJ45 & PoE
  { id: 'rj45', label: 'RJ45 standard (Non-PoE)', type: 'RJ45', connector: 'RJ45', domain: 'it', poeOutput: 'none' },
  { id: 'rj45_poe_plus', label: 'RJ45 PoE+ (30W - 802.3at)', type: 'RJ45', connector: 'RJ45', domain: 'it', poeOutput: 'poe+' },
  { id: 'rj45_poe_bt', label: 'RJ45 PoE++ (90W - 802.3bt)', type: 'RJ45', connector: 'RJ45', domain: 'it', poeOutput: 'poe++' },
  { id: 'ethercon', label: 'etherCON Neutrik', type: 'RJ45', connector: 'etherCON', domain: 'it', poeOutput: 'none' },
  { id: 'fiber_lc', label: 'Fibre Optique (LC Duplex)', type: 'Fibre', connector: 'Fibre-LC', domain: 'it' },
  { id: 'dante', label: 'Dante Primary / Secondary', type: 'Dante', connector: 'etherCON', domain: 'audio' },
  { id: 'usb_c', label: 'USB-C (Data / Vidéo)', type: 'USB', connector: 'USB-C', domain: 'it' },
  { id: 'usb_b', label: 'USB-B (Audio Host)', type: 'USB', connector: 'USB-B', domain: 'it' },
  { id: 'usb_a', label: 'USB-A standard', type: 'USB', connector: 'USB-A', domain: 'it' },

  // Audio & Intercom
  { id: 'xlr_3_m', label: 'XLR 3 broches (Micro / Ligne)', type: 'XLR', connector: 'XLR-3', domain: 'audio' },
  { id: 'xlr_4', label: 'XLR 4 broches (Casque Intercom)', type: 'XLR', connector: 'XLR-4', domain: 'intercom' },
  { id: 'xlr_5', label: 'XLR 5 broches (Casque Stéréo / DMX)', type: 'XLR', connector: 'XLR-5', domain: 'intercom' },
  { id: 'jack_635', label: 'Jack 6.35mm Symétrique', type: 'Jack', connector: 'Jack 6.35', domain: 'audio' },
  { id: 'mini_jack', label: 'Mini-Jack 3.5mm', type: 'Jack', connector: 'Mini-Jack', domain: 'audio' },

  // Énergie
  { id: 'dmx', label: 'DMX 512', type: 'DMX', connector: 'XLR-5', domain: 'video' },
  { id: 'power_schuko', label: 'Alimentation 230V (Schuko / C13)', type: 'Power', connector: 'Schuko', domain: 'power' }
];

export const BRANDS = [
  'Blackmagic Design',
  'Panasonic',
  'Sony',
  'AJA',
  'Decimator',
  'Ross Video',
  'Yamaha',
  'Shure',
  'Sennheiser',
  'Netgear',
  'Cisco',
  'Luminex',
  'Riedel',
  'Green-GO',
  'Clear-Com',
  'Apple',
  'Autre'
];

export const CATEGORIES = [
  { id: 'all', label: 'Toutes les catégories', color: '#94a3b8', icon: Layers, domain: 'all' },
  { id: 'mixer', label: 'Mélangeur Vidéo', color: '#a855f7', icon: Sliders, domain: 'video' },
  { id: 'camera_ptz', label: 'Caméra PTZ', color: '#38bdf8', icon: RotateCcw, domain: 'video' },
  { id: 'camera', label: 'Caméra Plateau', color: '#0284c7', icon: Camera, domain: 'video' },
  { id: 'controller', label: 'Pupitre & Télécommande', color: '#06b6d4', icon: Sliders, domain: 'video' },
  { id: 'display_tv', label: 'Moniteur / Télé / Retour', color: '#eab308', icon: Tv, domain: 'video' },
  { id: 'display_led', label: 'Processeur / Mur LED', color: '#f59e0b', icon: ScreenShare, domain: 'video' },
  { id: 'grid', label: 'Grille / Matrice Vidéo', color: '#6366f1', icon: Server, domain: 'video' },
  { id: 'converter', label: 'Convertisseur / Scaler', color: '#ec4899', icon: Cpu, domain: 'video' },
  { id: 'recorder', label: 'Enregistreur / Slow Motion', color: '#10b981', icon: HardDrive, domain: 'video' },
  { id: 'audio_console', label: 'Console Son / Mixeur', color: '#f97316', icon: Sliders, domain: 'audio' },
  { id: 'audio_mic', label: 'Micro HF / Filaire', color: '#fb923c', icon: Mic, domain: 'audio' },
  { id: 'audio_stagebox', label: 'Boîtier de scène / Stagebox', color: '#ea580c', icon: Server, domain: 'audio' },
  { id: 'audio_speaker', label: 'Enceinte / Retour / PA', color: '#c2410c', icon: Volume2, domain: 'audio' },
  { id: 'network', label: 'Switch Réseau', color: '#22c55e', icon: Network, domain: 'it' },
  { id: 'it_server', label: 'Serveur Média / PC Régie', color: '#64748b', icon: Monitor, domain: 'it' },
  { id: 'it_router', label: 'Routeur / Borne 4G/WiFi', color: '#10b981', icon: Wifi, domain: 'it' },
  { id: 'intercom_matrix', label: 'Centrale Intercom', color: '#d946ef', icon: Radio, domain: 'intercom' },
  { id: 'intercom_beltpack', label: 'Beltpack / Poste Ordres', color: '#c026d3', icon: Headphones, domain: 'intercom' },
  { id: 'power_distro', label: 'Armoire / Split Élec 230V', color: '#eab308', icon: Zap, domain: 'power' },
  { id: 'power_ups', label: 'Onduleur / Secouru (UPS)', color: '#ca8a04', icon: BatteryCharging, domain: 'power' },
  { id: 'other', label: 'Autre équipement', color: '#71717a', icon: Box, domain: 'all' },
];

export function normalizeCategoryId(rawCat) {
  if (!rawCat) return 'other';
  const str = String(rawCat).toLowerCase().trim();

  if (str === 'all' || str === 'tous') return 'all';
  if (str.includes('micro') || str.includes('hf')) return 'audio_mic';
  if (str.includes('console') || str.includes('mixeur son')) return 'audio_console';
  if (str.includes('stagebox') || str.includes('rio')) return 'audio_stagebox';
  if (str.includes('enceinte') || str.includes('retour')) return 'audio_speaker';
  if (str.includes('mélangeur') || str.includes('mixer')) return 'mixer';
  if (str.includes('ptz')) return 'camera_ptz';
  if (str.includes('caméra') || str.includes('camera')) return 'camera';
  if (str.includes('télécommande') || str.includes('controller')) return 'controller';
  if (str.includes('mur led') || str.includes('novastar')) return 'display_led';
  if (str.includes('tv') || str.includes('moniteur')) return 'display_tv';
  if (str.includes('enregistreur') || str.includes('hyperdeck')) return 'recorder';
  if (str.includes('grille') || str.includes('matrice')) return 'grid';
  if (str.includes('convertisseur') || str.includes('decimator')) return 'converter';
  if (str.includes('switch') || str.includes('luminex') || str.includes('netgear') || str.includes('cisco')) return 'network';
  if (str.includes('routeur') || str.includes('wifi')) return 'it_router';
  if (str.includes('serveur') || str.includes('pc')) return 'it_server';
  if (str.includes('intercom')) return 'intercom_beltpack';
  if (str.includes('onduleur') || str.includes('ups')) return 'power_ups';
  if (str.includes('armoire') || str.includes('power')) return 'power_distro';

  const exact = CATEGORIES.find((c) => c.id === str);
  return exact ? exact.id : 'other';
}

export function getDomainForCategory(catId) {
  const normCat = normalizeCategoryId(catId);
  const found = CATEGORIES.find((c) => c.id === normCat);
  return found ? found.domain : 'all';
}

export function getCategoryMeta(categoryId) {
  const normId = normalizeCategoryId(categoryId);
  const found = CATEGORIES.find((c) => c.id === normId);
  if (found && found.icon) return found;

  return {
    id: 'other',
    label: categoryId || 'Autre',
    color: '#71717a',
    icon: Box,
  };
}

/**
 * Hiérarchie de puissance PoE normalisée
 */
export const POE_LEVELS = {
  'none': 0,
  'poe': 1,     // 802.3af (15.4W)
  'poe+': 2,    // 802.3at (30W)
  'poe++': 3,   // 802.3bt (60-90W)
};

export const INITIAL_EQUIPMENT_LIBRARY = [
  {
    id: 'default_atem_mini',
    label: 'Blackmagic ATEM Mini Pro',
    brand: 'Blackmagic Design',
    category: 'mixer',
    domain: 'video',
    power: true,
    powerWatts: '30',
    poeRequirement: 'none', // Ne s'alimente jamais en PoE
    location: 'Régie',
    inputs: [
      { id: 'in_hdmi_1', name: 'HDMI 1', type: 'HDMI', connector: 'HDMI', visible: true },
      { id: 'in_hdmi_2', name: 'HDMI 2', type: 'HDMI', connector: 'HDMI', visible: true },
      { id: 'in_hdmi_3', name: 'HDMI 3', type: 'HDMI', connector: 'HDMI', visible: true },
      { id: 'in_hdmi_4', name: 'HDMI 4', type: 'HDMI', connector: 'HDMI', visible: true },
      { id: 'in_mic_1', name: 'Mic 1', type: 'Jack', connector: 'Mini-Jack', visible: true },
    ],
    outputs: [
      { id: 'out_hdmi', name: 'HDMI Out', type: 'HDMI', connector: 'HDMI', visible: true },
      { id: 'out_webcam', name: 'Webcam', type: 'USB', connector: 'USB-C', visible: true },
      { id: 'out_lan', name: 'LAN Control', type: 'RJ45', connector: 'RJ45', visible: true },
    ],
  },
  {
    id: 'default_ue150',
    label: 'Panasonic AW-UE150',
    brand: 'Panasonic',
    category: 'camera_ptz',
    domain: 'video',
    power: true,
    powerWatts: '48',
    poeRequirement: 'poe++', // Exige impérativement du PoE++ (bt) pour couper le 230V
    location: 'Plateau',
    inputs: [
      { id: 'ue150_ref', name: 'Genlock', type: 'Sync', connector: 'BNC', visible: true },
      { id: 'ue150_lan', name: 'LAN PoE++', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true },
    ],
    outputs: [
      { id: 'ue150_12g', name: '12G-SDI', type: 'SDI', connector: 'BNC', visible: true },
      { id: 'ue150_3g', name: '3G-SDI', type: 'SDI', connector: 'BNC', visible: true },
      { id: 'ue150_hdmi', name: 'HDMI', type: 'HDMI', connector: 'HDMI', visible: true },
    ],
  },
  {
    id: 'default_rp150',
    label: 'Panasonic AW-RP150',
    brand: 'Panasonic',
    category: 'controller',
    domain: 'video',
    power: true,
    powerWatts: '25',
    poeRequirement: 'poe+', // S'alimente dès le PoE+ (at)
    location: 'Régie',
    inputs: [
      { id: 'rp150_lan', name: 'LAN PoE+', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true },
      { id: 'rp150_sdi_in', name: 'Mon In', type: 'SDI', connector: 'BNC', visible: true },
    ],
    outputs: [
      { id: 'rp150_sdi_out', name: 'Active Thru', type: 'SDI', connector: 'BNC', visible: true },
    ],
  },
  {
    id: 'default_netgear_m4250',
    label: 'Netgear M4250-16M2XF (PoE++ / PoE+)',
    brand: 'Netgear',
    category: 'network',
    domain: 'it',
    power: true,
    powerWatts: '1440',
    poeRequirement: 'none',
    location: 'Baie Régie',
    inputs: [
      // 8 Ports PoE++ (802.3bt Ultra90 jusqu'à 90W)
      { id: 'sw_p1', name: 'Port 1 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p2', name: 'Port 2 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p3', name: 'Port 3 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p4', name: 'Port 4 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p5', name: 'Port 5 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p6', name: 'Port 6 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p7', name: 'Port 7 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
      { id: 'sw_p8', name: 'Port 8 (PoE++)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe++' },
    ],
    outputs: [
      // 8 Ports PoE+ (802.3at 30W)
      { id: 'sw_p9', name: 'Port 9 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p10', name: 'Port 10 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p11', name: 'Port 11 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p12', name: 'Port 12 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p13', name: 'Port 13 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p14', name: 'Port 14 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p15', name: 'Port 15 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      { id: 'sw_p16', name: 'Port 16 (PoE+)', type: 'RJ45', connector: 'RJ45', visible: true, isBiDirectional: true, poeOutput: 'poe+' },
      // Uplinks SFP+
      { id: 'sw_sfp1', name: 'SFP+ 1 (10G)', type: 'Fibre', connector: 'Fibre-LC', visible: true, isBiDirectional: true, poeOutput: 'none' },
      { id: 'sw_sfp2', name: 'SFP+ 2 (10G)', type: 'Fibre', connector: 'Fibre-LC', visible: true, isBiDirectional: true, poeOutput: 'none' },
    ],
  }
];