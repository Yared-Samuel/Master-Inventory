import { usePathname } from "next/navigation";

export function GetCurrentPathName() {
    const pathNameRaw = usePathname();
    const pathName = pathNameRaw.replace("/", "")
    return pathName;
}