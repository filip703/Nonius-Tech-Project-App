
export enum DeploymentStatus {
  NOT_CONTRACTED = 'Not Contracted',
  PENDING = 'Pending Kickoff',
  IN_PROGRESS = 'In Progress',
  QA_READY = 'Ready for QA',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered',
  NA = 'N/A'
}

export enum UserRole {
  SALES = 'Sales',
  TECHNICIAN = 'Technician',
  ADMIN = 'Admin',
  PROJECT_MANAGER = 'Project Manager',
  CLIENT = 'Client'
}

export interface Technician {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface ProjectContact {
  id: string;
  name: string;
  jobDescription: string;
  email: string;
  mobile: string;
  role: 'Nonius' | 'Client' | 'Third-Party';
}

export enum ModuleType {
  TV = 'TV System',
  CAST = 'CAST',
  SIGNAGE = 'Digital Signage',
  VOICE = 'Voice/VoIP',
  MOBILE = 'Mobile App',
  INTERNET = 'Internet Access/Gateway',
  RACK = 'Rack Layout',
  VLAN = 'VLAN & Services',
  SWITCHING = 'Switching Plan',
  BACKUPS = 'Backup Manager',
  PHOTOS = 'Site Photos',
  HANDOVER = 'Final Handover',
  LABELS = 'Label Generator',
  RMA = 'RMA / Defect Manager'
}

export enum RmaStatus {
  REPORTED = 'Reported',
  APPROVED = 'Approved',
  SHIPPED = 'Shipped',
  CLOSED = 'Closed'
}

export interface RmaTicket {
  id: string;
  sn: string;
  deviceType: string;
  issueType: 'Screen Broken' | 'No Power' | 'Software Fail' | 'Cosmetic';
  status: RmaStatus;
  date: string;
  tech: string;
  photo?: string;
}

export interface SiteActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  isError: boolean;
  module?: ModuleType;
  isPublic?: boolean; // For client visibility
}

export enum DocumentCategory {
  NETWORK_DIAGRAM = 'Network Diagram',
  SITE_PHOTO = 'Site Photo',
  QA_CHECKLIST = 'QA Checklist',
  CONTRACT = 'Contract',
  TECHNICAL_SPEC = 'Technical Spec',
  OTHER = 'Other'
}

export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  macAddress: string;
  serialNumber: string;
  room: string;
  ipAddress: string;
  installed: boolean;
  installedBy?: string; // Accountability Tracking
  installedAt?: string; // Accountability Tracking
}

export interface ProjectDocument {
  id: string;
  name: string;
  mimeType: string;
  category: DocumentCategory;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  storageUrl: string;
  moduleId?: ModuleType;
}

export interface NetworkInterface {
  ip: string;
  mask: string;
  gateway: string;
  iface: string;
  notes: string;
}

// TV Module Types
export interface TvChannel {
  id: string;
  name: string;
  multicastIp: string;
  port: string;
  scrambled: boolean;
}

export interface TvTuner {
  id: string;
  source: string;
  frequency: string;
  polarity: string;
  symbolRate: string;
  diseqc: string;
  camSlot: string;
  smartCardId: string;
  channels: TvChannel[];
}

export interface TvStreamer {
  id: string;
  type: string;
  serialNumber: string;
  vpn: string;
  credsUser: string;
  credsPass: string;
  interfaces: {
    management: NetworkInterface;
    streaming: NetworkInterface;
    auxiliary: NetworkInterface;
  };
  tuners: TvTuner[];
}

export interface TvOttStream {
  id: string;
  name: string;
  sourceUrl: string;
  type: 'HLS' | 'DASH' | 'MP4' | 'OTHER';
  multicastIp: string;
  port: string;
  notes: string;
}

export interface TvModuleConfig {
  infrastructure: {
    serverMain: string;
    serverMainSN: string;
    serverSpare: string;
    serverSpareSN: string;
    vpnManagement: string;
    vpnContent: string;
    credsConfig: string;
    credsMgmt: string;
    network: {
      ip: string;
      mask: string;
      dns1: string;
      dns2: string;
      gateway: string;
      vlan: string;
    };
  };
  features: {
    name: string;
    contracted: boolean;
    status: DeploymentStatus;
    comments: string;
  }[];
  inventory: Device[];
  streamers: TvStreamer[];
  ottStreams: TvOttStream[];
}

// Cast Module Types
export interface PhysicalPort {
  id: string;
  label: string;
  role: string;
  ip: string;
  mask: string;
  gateway: string;
  dns1: string;
  dns2: string;
  dhcpRange: string;
  notes: string;
}

export interface VlanInterface {
  id: string;
  phyPort: string;
  vlanId: string;
  role: string;
  ip: string;
  mask: string;
  dhcpRange: string;
}

export interface StaticRoute {
  id: string;
  name: string;
  destNetwork: string;
  destMask: string;
  gateway: string;
  notes: string;
}

export interface PortForward {
  id: string;
  iface: string;
  protocol: 'TCP' | 'UDP' | 'BOTH';
  sourceIp: string;
  sourcePort: string;
  destIp: string;
  destPort: string;
  notes: string;
}

export interface DongleStock {
  homatics4k: number;
  homaticsSpares: number;
  ethAdapters: number;
  remotes: number;
  remoteSpares: number;
  coverBoxes: number;
}

export interface DongleGlobalConfig {
  ssid: string;
  security: string;
  password: string;
  timezone: string;
  language: string;
  timeFormat: string;
}

export interface DongleRoomRow {
  id: string;
  room: string;
  sn: string;
  mac: string;
  state: 'Pending' | 'Online' | 'Offline';
  signal: string;
  notes: string;
  ssid?: string;
  password?: string;
  timezone?: string;
  language?: string;
}

export interface CastModuleConfig {
  system: {
    machineType: 'Physical Unit' | 'Cloud Instance';
    serialNumber: string;
    vpnUrl: string;
    vpnCreds: string;
    localCredsConfig: string;
    localCredsMgmt: string;
  };
  responsibilities: {
    owner: string;
    setupBy: string;
    testsDone: string;
  };
  network: {
    physicalPorts: PhysicalPort[];
    vlanInterfaces: VlanInterface[];
  };
  routing: {
    staticRoutes: StaticRoute[];
    portForwards: PortForward[];
    customRules: string;
  };
  integrations: {
    pmsBrand: string;
    pmsIp: string;
    pmsPort: string;
  };
  dongleInventory: {
    stock: DongleStock;
    globalConfig: DongleGlobalConfig;
    roomRows: DongleRoomRow[];
  };
}

// WiFi Module Types
export interface WifiController {
  mode: 'Central' | 'Manual';
  brand: string;
  model: string;
  firmware: string;
  type: 'Cloud' | 'On-Premise';
  location: string;
  externalUrl: string;
  network: {
    internalIp: string;
    internalPort: string;
    externalIp: string;
    externalPort: string;
  };
  credentials: {
    role: string;
    user: string;
    pass: string;
    notes: string;
  };
}

export interface WifiZone {
  id: string;
  name: string;
  description: string;
}

export interface WifiApGroup {
  id: string;
  name: string;
  zoneId: string;
}

export interface WifiSsid {
  id: string;
  name: string;
  encryption: 'WPA2' | 'WPA3' | 'Open';
  password: string;
  description: string;
}

export interface AccessPoint {
  id: string;
  name: string;
  location: string;
  brand: string;
  mac: string;
  ip: string;
  switchPort: string;
  vlanMgmt: string;
  vlanHotspot: string;
  channel: string;
  user: string;
  pass: string;
}

export interface WifiModuleConfig {
  controller: WifiController;
  zones: WifiZone[];
  groups: WifiApGroup[];
  ssids: WifiSsid[];
  inventory: AccessPoint[];
}

// Rack Module Types
export interface RackDevice {
  id: string;
  uPosition: number;
  height: number;
  label: string;
  type: string;
  isNonius: boolean;
}

export interface Rack {
  id: string;
  name: string;
  height: number;
  devices: RackDevice[];
}

// Network Solutions Types
export interface ServiceAudit {
  name: string;
  description: string;
  contracted: boolean;
  status: DeploymentStatus;
  comment: string;
}

export interface VlanConfig {
  id: string;
  vlanId: string;
  name: string;
  network: string;
  gateway: string;
  physGateway: 'Core Switch' | 'Firewall' | 'Other' | string;
  dhcp: boolean;
  internet: boolean;
  layer7: string;
  description: string;
}

// Switching Plan Types
export interface SwitchEntry {
  id: string;
  location: string;
  name: string;
  label: string;
  ipMng: string;
  ipIptv: string;
  mac: string;
  user: string;
  pass: string;
  brandModel: string;
  partNumber: string;
  serialNumber: string;
  firmware: string;
  backupStatus: 'Pending' | 'Success' | 'Failed' | 'N/A';
}

export interface Project {
  id: string;
  name: string;
  siteId: string;
  address: string;
  pm: string;
  countryManager: string;
  generalManager: string;
  itManager: string;
  rooms: number;
  category: string;
  updatedAt: string;
  selectedModules: ModuleType[];
  clientInfo: {
    socialDesignation: string;
    address: string;
    website: string;
  };
  contacts: ProjectContact[];
  tvConfig?: TvModuleConfig;
  castConfig?: CastModuleConfig;
  wifiConfig?: WifiModuleConfig;
  voiceConfig?: any;
  topology?: any;
  rackConfig?: { racks: Rack[] };
  networkSolutions?: { services: ServiceAudit[], vlans: VlanConfig[] };
  switchingPlan?: { switches: SwitchEntry[] };
  documents: ProjectDocument[];
  handoverSignedAt?: string;
  handoverSignedBy?: string;
}
