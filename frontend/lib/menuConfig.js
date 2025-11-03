import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotificationsIcon from '@mui/icons-material/Notifications';

const menuConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: MenuBookIcon,
    path: '/courses',
  },
  {
    id: 'my-learning',
    label: 'My Learning',
    icon: SchoolIcon,
    path: '/my-learning',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: AccountCircleIcon,
    path: '/profile',
  },
  {
    id: 'ai-coach',
    label: 'AI Coach',
    icon: SmartToyIcon,
    path: '/ai-coach',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: NotificationsIcon,
    path: '/notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
  },
];

export default menuConfig;
