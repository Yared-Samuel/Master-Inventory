import { usePathname } from "next/navigation";

export function getCurrentPathName() {
    const pathNameRaw = usePathname();
    const pathName = pathNameRaw.replace("/", "")
    return pathName;
}