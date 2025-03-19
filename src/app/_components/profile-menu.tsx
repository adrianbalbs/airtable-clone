import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfileMenu({ name, email }: { name: string, email: string }) {
  return (
    <Menu>
      <MenuButton className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-white bg-primary">
        <p>{name[0]}</p>
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="z-10 mt-1 h-36 w-[296px] rounded-xl border border-slate-300 bg-white p-4 shadow-lg"
      >
        <MenuItem>
          <div className="pb-2 pt-1">
            <p className="block text-sm font-semibold">{name}</p>
            <span className="text-sm text-gray-700">{email}</span>
          </div>
        </MenuItem>
        <MenuSeparator className="my-2 h-px bg-slate-300" />
        <MenuItem>
          <Link
            href="/api/auth/signout"
            className="flex w-full cursor-pointer items-center rounded-md p-2 text-sm hover:bg-slate-200"
          >
            <LogOut size={15} className="mr-2" />
            <p>Logout</p>
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
