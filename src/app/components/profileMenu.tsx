import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from "@headlessui/react"
import { LogOut } from "lucide-react"
import Link from "next/link"

export default function ProfileMenu() {
    return (
        <Menu>
            <MenuButton className="w-[30px] h-[30px] flex items-center justify-center bg-primary border border-white rounded-full cursor-pointer">
                <p>A</p>
            </MenuButton>
            <MenuItems anchor="bottom end" className="w-[296px] h-36 bg-white z-10 mt-1 border border-slate-300 rounded-xl shadow-lg p-4">
                <MenuItem>
                    <div className="pt-1 pb-2">
                        <p className="block text-sm font-semibold">
                            Adrian Balbalosa
                        </p>
                        <span className="text-gray-700 text-sm">adrianbalbs@gmail.com</span>
                    </div>
                </MenuItem>
                <MenuSeparator className="my-2 h-px bg-slate-300" />
                <MenuItem>
                    <Link href="/api/auth/signout" className="flex w-full hover:bg-slate-200 text-sm cursor-pointer rounded-md p-2 items-center">
                        <LogOut size={15} className="mr-2" />
                        <p>
                            Logout
                        </p>
                    </Link>
                </MenuItem>
            </MenuItems>
        </Menu>
    )
}
