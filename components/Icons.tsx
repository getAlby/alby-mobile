import {
  AlertCircle,
  CheckCircle,
  LucideIcon,
  XCircle,
  MoveUpRight,
  MoveDownRight,
  MoveDownLeft,
  MoveUp,
  MoveDown,
  Camera,
  Menu,
  ZapIcon,
  WalletIcon,
  Copy,
  Currency,
  Settings2,
  ArrowLeftRight,
  PlusCircle,
  Cog,
  ClipboardPaste,
  Keyboard,
  BookUser,
  Wallet2,
  ArrowDown,
  ChevronDown,
  Bitcoin,
  Share2,
  RefreshCw,
  ChevronUp,
  X,
  Hotel,
  Power,
  CameraOff,
  Palette,
  Egg,
  Fingerprint,
  HelpCircle,
  CircleCheck,
  TriangleAlert,
  Trash2
} from "lucide-react-native";
import { cssInterop } from "nativewind";

function interopIcon(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

interopIcon(AlertCircle);
interopIcon(ArrowDown);
interopIcon(CheckCircle);
interopIcon(Bitcoin);
interopIcon(XCircle);
interopIcon(MoveUp);
interopIcon(MoveDown);
interopIcon(ChevronDown);
interopIcon(ChevronUp);
interopIcon(MoveDownRight);
interopIcon(MoveUpRight);
interopIcon(MoveDownLeft);
interopIcon(Camera);
interopIcon(Menu);
interopIcon(ZapIcon);
interopIcon(WalletIcon);
interopIcon(Copy);
interopIcon(Currency);
interopIcon(Settings2);
interopIcon(ArrowLeftRight);
interopIcon(PlusCircle);
interopIcon(Cog);
interopIcon(ClipboardPaste);
interopIcon(Keyboard);
interopIcon(BookUser);
interopIcon(Wallet2);
interopIcon(Share2);
interopIcon(RefreshCw);
interopIcon(X);
interopIcon(Hotel);
interopIcon(Power);
interopIcon(CameraOff);
interopIcon(Palette);
interopIcon(Egg);
interopIcon(Fingerprint);
interopIcon(HelpCircle);
interopIcon(CircleCheck);
interopIcon(TriangleAlert);
interopIcon(Trash2);

export {
  AlertCircle,
  ArrowDown,
  Bitcoin,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MoveDown,
  MoveUp,
  MoveDownRight,
  MoveUpRight,
  MoveDownLeft,
  Menu,
  ZapIcon,
  WalletIcon,
  Copy,
  Currency,
  Settings2,
  ArrowLeftRight,
  PlusCircle,
  Cog,
  ClipboardPaste,
  Hotel,
  Keyboard,
  BookUser,
  Wallet2,
  Share2,
  RefreshCw,
  X,
  Power,
  Palette,
  Egg,
  Fingerprint,
  HelpCircle,
  CircleCheck,
  TriangleAlert,
  Trash2,
};
