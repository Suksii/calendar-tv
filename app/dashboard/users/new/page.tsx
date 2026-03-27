"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createUser } from "@/lib/actions";
import { Eye, EyeOff } from "lucide-react";

const roleOptions = [
  { value: "viewer", label: "Korisnik" },
  { value: "admin", label: "Administrator" },
];

export default function NewUserPage() {
  const router = useRouter();
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const result = await createUser({
      name,
      username,
      password,
      role: role as "admin" | "viewer",
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Korisnik je kreiran.");
      router.push("/dashboard/users");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-100 mb-6">Novi korisnik</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <Input label="Ime i prezime" name="name" required />
        <Input label="Korisničko ime" name="username" type="text" required placeholder="ime.prezime" />
        <Input
          label="Lozinka"
          name="password"
          type={passwordVisible ? "text" : "password"}
          required
          minLength={6}
          icon={
            <div
              onClick={() => setPasswordVisible((prev) => !prev)}
              className="absolute top-1/2 -translate-y-1/2 right-4 text-zinc-400 cursor-pointer"
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          }
        />
        <Select
          label="Rola"
          options={roleOptions}
          value={role}
          onChange={setRole}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            Kreiraj nalog
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Otkaži
          </Button>
        </div>
      </form>
    </div>
  );
}
