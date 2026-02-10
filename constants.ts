
import { DocumentCategory, ModuleType, Project, DeploymentStatus } from './types';

export const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

export const HARDWARE_MODELS = {
  TV: ['LG 43-LX761H', 'Samsung HG43AU800', 'Philips 43HFL5214U'],
  CAST: ['Chromecast v3', 'Chromecast with Google TV', 'Apple TV 4K'],
  STB: ['Nonius STB-400', 'Nonius STB-500', 'Infomir MAG524'],
  VOICE: ['Mitel 6920', 'Grandstream GXP2135', 'Snom D717']
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Grand Hyatt Berlin',
    siteId: 'DE-HYA-001',
    address: 'Marlene-Dietrich-Platz 2, 10785 Berlin, Germany',
    pm: 'Alex Tech',
    countryManager: 'Rui Manuel',
    generalManager: 'Hansi Müller',
    itManager: 'Stefan Kohl',
    rooms: 342,
    category: 'Luxury Business',
    updatedAt: '2023-11-20T14:30:00Z',
    selectedModules: [ModuleType.TV, ModuleType.INTERNET, ModuleType.VLAN, ModuleType.SWITCHING],
    clientInfo: {
      socialDesignation: 'Grand Hyatt Berlin Operating GmbH',
      address: 'Marlene-Dietrich-Platz 2, 10785 Berlin, Germany',
      website: 'https://www.hyatt.com/berlin'
    },
    contacts: [
      { id: 'c1', name: 'Alex Tech', role: 'Nonius', jobDescription: 'Nonius Project Manager', email: 'alex.tech@noniussoftware.com', mobile: '+49 170 1234567' },
      { id: 'c2', name: 'Rui Manuel', role: 'Nonius', jobDescription: 'Nonius Country Manager', email: 'rui.m@noniussoftware.com', mobile: '+351 912 345 678' },
      { id: 'c3', name: 'Hansi Müller', role: 'Client', jobDescription: 'General Manager', email: 'hansi.gm@hyatt.com', mobile: '+49 30 2553 1234' },
      { id: 'c4', name: 'Stefan Kohl', role: 'Client', jobDescription: 'IT Director', email: 'stefan.kohl@hyatt.com', mobile: '+49 30 2553 5678' }
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Floor_1_Network_Plan.pdf',
        mimeType: 'application/pdf',
        category: DocumentCategory.NETWORK_DIAGRAM,
        size: 2450000,
        uploadDate: '2023-11-15T10:00:00Z',
        uploadedBy: 'Alex Tech',
        storageUrl: 'https://storage.nonius.com/DE-HYA-001/doc1.pdf'
      }
    ],
    tvConfig: {
      infrastructure: {
        serverMain: 'Nonius Rack Unit',
        serverMainSN: 'SN100200',
        serverSpare: 'None',
        serverSpareSN: '',
        vpnManagement: 'vpn.berlin.nonius.site',
        vpnContent: 'content.berlin.nonius.site',
        credsConfig: 'admin123',
        credsMgmt: 'root123',
        network: {
          ip: '192.168.10.50',
          mask: '255.255.255.0',
          dns1: '8.8.8.8',
          dns2: '8.8.4.4',
          gateway: '192.168.10.1',
          vlan: '100'
        }
      },
      features: [
        { name: 'Nonius TV+ Standard Package', contracted: true, status: DeploymentStatus.IN_PROGRESS, comments: '' }
      ],
      inventory: [
        { 
          id: 'd1', 
          name: 'STB Room 101', 
          brand: 'Nonius',
          model: 'Nonius STB-500', 
          macAddress: '00:1A:2B:3C:4D:5E', 
          serialNumber: 'SN12345', 
          room: '101', 
          ipAddress: '192.168.10.101',
          installed: true 
        }
      ],
      streamers: [],
      ottStreams: []
    }
  }
];
