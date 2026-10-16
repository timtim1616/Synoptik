import PocketBase from 'pocketbase';

const PB_URL = 'https://synoptik.timeobinda.fr';
const ADMIN_EMAIL = 'etudiant.tbinda@gmail.com';
const ADMIN_PASSWORD = 'Zomvim5395&*';

const pb = new PocketBase(PB_URL);

async function main() {
  console.log(`Connexion à PocketBase (${PB_URL})...`);
  
  // Authentification compatible PocketBase v0.22+ (_superusers) avec repli vers l'ancienne méthode
  try {
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authentification Superuser réussie.');
  } catch {
    try {
      await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('Authentification Administrateur classique réussie.');
    } catch (err) {
      console.error('Échec de la connexion admin :', err.data || err.message || err);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------
  // 1. Initialisation de la collection "connectors"
  // -------------------------------------------------------------
  console.log('Vérification de la collection "connectors"...');
  try {
    await pb.collections.getOne('connectors');
    console.log('-> Collection "connectors" déjà existante.');
  } catch {
    console.log('-> Création de la collection "connectors"...');
    await pb.collections.create({
      name: 'connectors',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != ""',
      updateRule: null,
      deleteRule: null,
      schema: [
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'label', type: 'text', required: true },
        { name: 'signal_family', type: 'select', required: true, options: { values: ['video', 'audio', 'network', 'control', 'power', 'optic'] } },
        { name: 'color', type: 'text', required: true },
        { name: 'default_gender', type: 'select', required: true, options: { values: ['male', 'female', 'neutral'] } }
      ]
    });
  }

  // -------------------------------------------------------------
  // 2. Initialisation de la collection "equipment_models"
  // -------------------------------------------------------------
  console.log('Vérification de la collection "equipment_models"...');
  try {
    await pb.collections.getOne('equipment_models');
    console.log('-> Collection "equipment_models" déjà existante.');
  } catch {
    console.log('-> Création de la collection "equipment_models"...');
    await pb.collections.create({
      name: 'equipment_models',
      type: 'base',
      listRule: 'verified = true || created_by = @request.auth.id',
      viewRule: 'verified = true || created_by = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && created_by = @request.auth.id && verified = false',
      deleteRule: '@request.auth.id != "" && created_by = @request.auth.id && verified = false',
      schema: [
        { name: 'brand', type: 'text', required: true },
        { name: 'brand_slug', type: 'text', required: true },
        { name: 'model_name', type: 'text', required: true },
        { name: 'category', type: 'select', required: true, options: { values: ['switcher', 'converter', 'ptz_cam', 'fixed_cam', 'audio_console', 'display', 'computer', 'network_switch', 'microphone'] } },
        { name: 'chassis', type: 'select', required: true, options: { values: ['rack', 'mini', 'display', 'desk', 'standard'] } },
        { name: 'power_watts', type: 'number', required: false },
        { name: 'power_plugs_count', type: 'number', required: false },
        { name: 'can_be_poe_powered', type: 'bool', required: false },
        { name: 'is_poe_source', type: 'bool', required: false },
        { name: 'ports', type: 'json', required: true },
        { name: 'verified', type: 'bool', required: false },
        {
          name: 'created_by',
          type: 'relation',
          required: false,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: false,
            maxSelect: 1
          }
        }
      ]
    });
  }

  // -------------------------------------------------------------
  // 3. Insertion des connecteurs de référence
  // -------------------------------------------------------------
  console.log('Insertion des connecteurs de référence...');
  const baseConnectors = [
    { slug: 'hdmi_a', label: 'HDMI (Standard A)', signal_family: 'video', color: '#f59e0b', default_gender: 'female' },
    { slug: 'hdmi_c', label: 'Mini HDMI (Type C)', signal_family: 'video', color: '#fbbf24', default_gender: 'female' },
    { slug: 'hdmi_d', label: 'Micro HDMI (Type D)', signal_family: 'video', color: '#d97706', default_gender: 'female' },
    { slug: 'bnc_sdi', label: 'BNC SDI (3G/6G/12G)', signal_family: 'video', color: '#a855f7', default_gender: 'female' },
    { slug: 'rj45_ethercon', label: 'RJ45 / EtherCON', signal_family: 'network', color: '#22c55e', default_gender: 'female' },
    { slug: 'xlr_3p', label: 'XLR 3 Broches', signal_family: 'audio', color: '#3b82f6', default_gender: 'female' },
    { slug: 'xlr_5p', label: 'XLR 5 Broches (DMX / Intercom)', signal_family: 'control', color: '#6366f1', default_gender: 'female' },
    { slug: 'jack_635', label: 'Jack 6.35mm (TRS)', signal_family: 'audio', color: '#0ea5e9', default_gender: 'female' },
    { slug: 'jack_35', label: 'Mini-Jack 3.5mm', signal_family: 'audio', color: '#38bdf8', default_gender: 'female' },
    { slug: 'usb_c', label: 'USB-C', signal_family: 'control', color: '#ef4444', default_gender: 'female' },
    { slug: 'usb_a', label: 'USB-A', signal_family: 'control', color: '#f87171', default_gender: 'female' },
    { slug: 'fiber_lc', label: 'Fibre Optique LC Duplex', signal_family: 'optic', color: '#14b8a6', default_gender: 'female' },
    { slug: 'opticalcon_duo', label: 'Neutrik opticalCON DUO', signal_family: 'optic', color: '#0d9488', default_gender: 'female' }
  ];

  for (const c of baseConnectors) {
    const existing = await pb.collection('connectors').getList(1, 1, { filter: `slug = "${c.slug}"` });
    if (existing.items.length === 0) {
      await pb.collection('connectors').create(c);
      console.log(`  + Connecteur ajouté : ${c.label}`);
    }
  }

  // -------------------------------------------------------------
  // 4. Insertion des équipements de test
  // -------------------------------------------------------------
  console.log('Insertion des équipements de test...');
  const testModels = [
    {
      brand: 'Canon',
      brand_slug: 'canon',
      model_name: 'XA45',
      category: 'fixed_cam',
      chassis: 'standard',
      power_watts: 9,
      power_plugs_count: 1,
      can_be_poe_powered: false,
      is_poe_source: false,
      verified: true,
      ports: [
        { name: 'SDI OUT', connector: 'bnc_sdi', dir: 'out', isPrimary: true },
        { name: 'HDMI OUT', connector: 'hdmi_c', dir: 'out', isPrimary: true },
        { name: 'MIC 1', connector: 'xlr_3p', dir: 'in', isPrimary: true },
        { name: 'MIC 2', connector: 'xlr_3p', dir: 'in', isPrimary: false },
        { name: 'PHONES', connector: 'jack_35', dir: 'out', isPrimary: false }
      ]
    },
    {
      brand: 'Blackmagic Design',
      brand_slug: 'blackmagic_design',
      model_name: 'ATEM SDI Extreme ISO',
      category: 'switcher',
      chassis: 'desk',
      power_watts: 36,
      power_plugs_count: 1,
      can_be_poe_powered: false,
      is_poe_source: false,
      verified: true,
      ports: [
        { name: '1', connector: 'bnc_sdi', dir: 'in', isPrimary: true },
        { name: '2', connector: 'bnc_sdi', dir: 'in', isPrimary: true },
        { name: '3', connector: 'bnc_sdi', dir: 'in', isPrimary: true },
        { name: '4', connector: 'bnc_sdi', dir: 'in', isPrimary: true },
        { name: '5', connector: 'bnc_sdi', dir: 'in', isPrimary: false },
        { name: '6', connector: 'bnc_sdi', dir: 'in', isPrimary: false },
        { name: '7', connector: 'bnc_sdi', dir: 'in', isPrimary: false },
        { name: '8', connector: 'bnc_sdi', dir: 'in', isPrimary: false },
        { name: 'OUT 1', connector: 'bnc_sdi', dir: 'out', isPrimary: true },
        { name: 'OUT 2', connector: 'bnc_sdi', dir: 'out', isPrimary: true },
        { name: 'OUT 3', connector: 'bnc_sdi', dir: 'out', isPrimary: false },
        { name: 'OUT 4', connector: 'bnc_sdi', dir: 'out', isPrimary: false },
        { name: 'LAN', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: true },
        { name: 'USB-C 1', connector: 'usb_c', dir: 'bidirectional', isPrimary: true },
        { name: 'USB-C 2', connector: 'usb_c', dir: 'bidirectional', isPrimary: false }
      ]
    },
    {
      brand: 'Panasonic',
      brand_slug: 'panasonic',
      model_name: 'AW-UE150',
      category: 'ptz_cam',
      chassis: 'standard',
      power_watts: 48,
      power_plugs_count: 1,
      can_be_poe_powered: true,
      is_poe_source: false,
      verified: true,
      ports: [
        { name: '12G SDI', connector: 'bnc_sdi', dir: 'out', isPrimary: true },
        { name: '3G SDI', connector: 'bnc_sdi', dir: 'out', isPrimary: false },
        { name: 'HDMI', connector: 'hdmi_a', dir: 'out', isPrimary: true },
        { name: 'LAN / PoE++', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: true },
        { name: 'FIBER', connector: 'fiber_lc', dir: 'out', isPrimary: false }
      ]
    },
    {
      brand: 'Netgear',
      brand_slug: 'netgear',
      model_name: 'M4250-10G2F-PoE+',
      category: 'network_switch',
      chassis: 'rack',
      power_watts: 180,
      power_plugs_count: 1,
      can_be_poe_powered: false,
      is_poe_source: true,
      verified: true,
      ports: [
        { name: '1', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: true },
        { name: '2', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: true },
        { name: '3', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: true },
        { name: '4', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: true },
        { name: '5', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: false },
        { name: '6', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: false },
        { name: '7', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: false },
        { name: '8', connector: 'rj45_ethercon', dir: 'bidirectional', isPrimary: false },
        { name: 'SFP+ 1', connector: 'fiber_lc', dir: 'bidirectional', isPrimary: true },
        { name: 'SFP+ 2', connector: 'fiber_lc', dir: 'bidirectional', isPrimary: false }
      ]
    }
  ];

  for (const m of testModels) {
    const existing = await pb.collection('equipment_models').getList(1, 1, { filter: `model_name = "${m.model_name}"` });
    if (existing.items.length === 0) {
      await pb.collection('equipment_models').create(m);
      console.log(`  + Modèle inséré : ${m.brand} ${m.model_name}`);
    }
  }

  console.log('\nOpération terminée avec succès.');
}

main().catch((err) => {
  console.error('\nErreur rencontrée :', err.data || err.message || err);
  process.exit(1);
});