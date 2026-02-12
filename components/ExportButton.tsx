
import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Project } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

interface ExportButtonProps {
  project: Project;
}

const ExportButton: React.FC<ExportButtonProps> = ({ project }) => {
  const { addNotification } = useNotifications();

  const handleExport = () => {
    try {
      const headers = ['Room', 'Status', 'Device Type', 'Model', 'MAC Address', 'IP Address', 'Serial Number', 'Installed By', 'Install Date', 'Notes'];
      const rows: string[] = [];

      // Helper to sanitize CSV fields
      const escape = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;

      // 1. Process TV Inventory
      project.tvConfig?.inventory.forEach(dev => {
        rows.push([
          escape(dev.room),
          escape(dev.installed ? 'Completed' : 'Pending'),
          escape('TV/STB'),
          escape(dev.model),
          escape(dev.macAddress),
          escape(dev.ipAddress),
          escape(dev.serialNumber),
          escape(dev.installedBy),
          escape(dev.installedAt),
          escape(dev.notes)
        ].join(','));
      });

      // 2. Process WiFi Inventory
      project.wifiConfig?.inventory.forEach(ap => {
        rows.push([
          escape(ap.location), // Using location as room/area identifier
          escape(ap.installed ? 'Completed' : 'Pending'),
          escape('Access Point'),
          escape(ap.brand), // Brand as Model for APs generally
          escape(ap.mac),
          escape(ap.ip),
          escape('N/A'),
          escape(ap.user), // Assuming user field might hold installer or config user
          escape(''), // Date not tracked on AP object currently in types
          escape(ap.notes)
        ].join(','));
      });

      // 3. Process Cast Dongles
      project.castConfig?.dongleInventory.roomRows.forEach(row => {
        rows.push([
          escape(row.room),
          escape(row.state === 'Online' ? 'Completed' : row.state),
          escape('Cast Dongle'),
          escape('Homatics'),
          escape(row.mac),
          escape('DHCP'),
          escape(row.sn),
          escape(''),
          escape(''),
          escape(row.notes)
        ].join(','));
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nonius_Site_Report_${project.siteId}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification('SYSTEM', `Exported full site inventory for ${project.name}`);
    } catch (e) {
      console.error(e);
      addNotification('ISSUE', 'Failed to generate CSV export.');
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-md bg-[#0070C0] text-white hover:bg-[#0060a0]"
    >
      <FileSpreadsheet size={16} />
      Export Data (.CSV)
    </button>
  );
};

export default ExportButton;
