

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

// Added missing DocumentCategory enum
export enum DocumentCategory {
  NETWORK_DIAGRAM = 'Network Diagram',
  SITE_PHOTO = 'Site Photo',
  QA_CHECKLIST = 'QA Checklist',
  CONTRACT = 'Contract',
  TECHNICAL_SPEC = 'Technical Spec',
  OTHER = 'Other'
}

// Added missing RmaStatus enum
export enum RmaStatus {
  REPORTED = 'Reported',
  APPROVED = 'Approved',
  SHIPPED = 'Shipped',
  CLOSED = 'Closed'
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
  // Selectable Solutions
  TV = 'NTV+',
  CAST = 'Nonius Cast',
  SIGNAGE = 'Digital Signage',
  VOICE = 'Voice/VoIP',
  MOBILE = 'Mobile App',
  WEBAPP = 'Webapp',
  INTERNET = 'Internet Access',
  NETWORK = 'Nonius Network', 
  
  // Network Sub-modules
  RACK = 'Rack Layout',
  VLAN = 'VLAN & Services',
  SWITCHING = 'Switching Plan',

  // Mandatory Management Tools
  PHOTOS = 'Site Photos',
  LABELS = 'Label Generator',
  RMA = 'RMA / Defect Manager',
  HANDOVER = 'Final Handover'
}

// Added missing ProjectDocument interface
export interface ProjectDocument {
  id: string;
  name: string;
  mimeType: string;
  category: DocumentCategory;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  storageUrl: string;
  moduleId?: string;
}

// Added missing Device interface
export interface Device {
  id: string;
  name: string;
  brand: string;
  model: string;
  macAddress: string;
  ipAddress: string;
  serialNumber: string;
  room: string;
  installed: boolean;
  installedBy?: string;
  installedAt?: string;
}

// Added missing NetworkInterface interface
export interface NetworkInterface {
  ip: string;
  mask: string;
  gateway: string;
  iface: string;
  notes: string;
}

// Added missing TvChannel interface
export interface TvChannel {
  id: string;
  name: string;
  multicastIp: string;
  port: string;
  scrambled: boolean;
}

// Added missing TvTuner interface
export interface TvTuner {
  id: string;
  source: string;
  frequency: string;
  polarity: 'H' | 'V' | 'L' | 'R';
  symbolRate: string;
  diseqc: string;
  camSlot: string;
  smartCardId: string;
  channels: TvChannel[];
}

// Added missing TvStreamer interface
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

// Added missing TvOttStream interface
export interface TvOttStream {
  id: string;
  name: string;
  sourceUrl: string;
  type: 'HLS' | 'DASH' | 'MP4' | 'OTHER';
  multicastIp: string;
  port: string;
  notes: string;
}

// Added missing TvModuleConfig interface
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

// Added missing PhysicalPort interface
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

// Added missing VlanInterface interface
export interface VlanInterface {
  id: string;
  phyPort: string;
  vlanId: string;
  role: string;
  ip: string;
  mask: string;
  dhcpRange: string;
}

// Added missing StaticRoute interface
export interface StaticRoute {
  id: string;
  name: string;
  destNetwork: string;
  destMask: string;
  gateway: string;
  notes: string;
}

// Added missing PortForward interface
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

// Added missing DongleStock interface
export interface DongleStock {
  homatics4k: number;
  homaticsSpares: number;
  ethAdapters: number;
  remotes: number;
  remoteSpares: number;
  coverBoxes: number;
}

// Added missing DongleGlobalConfig interface
export interface DongleGlobalConfig {
  ssid: string;
  security: string;
  password: string;
  timezone: string;
  language: string;
  timeFormat: string;
}

// Added missing DongleRoomRow interface
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

// Added missing CastModuleConfig interface
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

// Added missing WifiController interface
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

// Added missing WifiZone interface
export interface WifiZone {
  id: string;
  name: string;
  description: string;
}

// Added missing WifiApGroup interface
export interface WifiApGroup {
  id: string;
  name: string;
  zoneId: string;
}

// Added missing WifiSsid interface
export interface WifiSsid {
  id: string;
  name: string;
  encryption: 'WPA2' | 'WPA3' | 'Open';
  password?: string;
  description: string;
}

// Added missing AccessPoint interface
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

// Added missing WifiModuleConfig interface
export interface WifiModuleConfig {
  controller: WifiController;
  zones: WifiZone[];
  groups: WifiApGroup[];
  ssids: WifiSsid[];
  inventory: AccessPoint[];
}

// Added missing RackDevice interface
export interface RackDevice {
  id: string;
  uPosition: number;
  height: number;
  label: string;
  type: string;
  isNonius: boolean;
}

// Added missing Rack interface
export interface Rack {
  id: string;
  name: string;
  height: number;
  devices: RackDevice[];
}

// Added missing ServiceAudit interface
export interface ServiceAudit {
  name: string;
  description: string;
  contracted: boolean;
  status: DeploymentStatus;
  comment: string;
}

// Added missing VlanConfig interface
export interface VlanConfig {
  id: string;
  vlanId: string;
  name: string;
  network: string;
  gateway: string;
  physGateway: 'Core Switch' | 'Firewall' | 'Other';
  dhcp: boolean;
  internet: boolean;
  layer7: string;
  description: string;
}

// Added missing SwitchEntry interface
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

// Added missing RmaTicket interface
export interface RmaTicket {
  id: string;
  sn: string;
  deviceType: string;
  issueType: string;
  status: RmaStatus;
  date: string;
  tech: string;
}

// Added missing SiteActivity interface
export interface SiteActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  module?: ModuleType;
  isError?: boolean;
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
  isLocked?: boolean; // Security state
}

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}
