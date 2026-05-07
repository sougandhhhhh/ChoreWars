import React from 'react';
import * as Lucide from 'lucide-react';

// Map Material Symbols strings to Lucide-react (Framer) icons
const ICON_MAP = {
  home: Lucide.Home,
  checklist: Lucide.ListChecks,
  leaderboard: Lucide.Trophy,
  group: Lucide.Users,
  person: Lucide.User,
  logout: Lucide.LogOut,
  notifications: Lucide.Bot,
  bolt: Lucide.Zap,
  search: Lucide.Search,
  filter_list: Lucide.Filter,
  person_add: Lucide.UserPlus,
  trophy: Lucide.Trophy,
  local_fire_department: Lucide.Flame,
  mop: Lucide.Brush,
  lock: Lucide.Lock,
  verified: Lucide.BadgeCheck,
  history: Lucide.History,
  star: Lucide.Star,
  stars: Lucide.Sparkles,
  delete: Lucide.Trash2,
  water_drop: Lucide.Droplet,
  local_laundry_service: Lucide.WashingMachine,
  check_circle: Lucide.CheckCircle2,
  casino: Lucide.Dices,
  add_circle: Lucide.PlusCircle,
  arrow_back: Lucide.ArrowLeft,
  backspace: Lucide.Delete,
  fingerprint: Lucide.Fingerprint,
  dialpad: Lucide.Grid3x3,
  badge: Lucide.Badge,
  terminal: Lucide.Terminal,
  error: Lucide.AlertCircle,
  warning: Lucide.AlertTriangle,
  military_tech: Lucide.Medal,
  edit: Lucide.Edit2,
  lock_reset: Lucide.KeyRound,
  calendar_month: Lucide.CalendarDays,
  kitchen: Lucide.Refrigerator,
  shopping_cart: Lucide.ShoppingCart,
  analytics: Lucide.BarChart2,
  local_florist: Lucide.Flower2,
  assignment: Lucide.ClipboardList,
  account_circle: Lucide.UserCircle,
  workspace_premium: Lucide.Award,
  arrow_forward: Lucide.ArrowRight,
  eye: Lucide.Eye,
  eye_off: Lucide.EyeOff,
};

/**
 * Universal Icon Component
 * Maps legacy Material Symbol string names to Lucide React (Framer) SVG icons.
 */
export default function Icon({ name, size, className = '', style = {}, fill }) {
  const LucideIcon = ICON_MAP[name] || Lucide.HelpCircle;
  const px = size || 24;
  
  // Clean up material-symbols-outlined class if it was passed by mistake
  const cleanClassName = className.replace(/material-symbols-outlined/g, '').trim();

  return (
    <LucideIcon
      size={px}
      color={fill || 'currentColor'}
      className={cleanClassName}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  );
}
