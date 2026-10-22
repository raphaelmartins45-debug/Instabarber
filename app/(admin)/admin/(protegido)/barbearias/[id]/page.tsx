import { redirect } from "next/navigation";

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/admin/barbearias/${(await params).id}/identidade`);
}
