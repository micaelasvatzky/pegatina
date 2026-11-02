import PasswordRecoveryForm from "@/components/PasswordRecoveryForm";

export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  return <PasswordRecoveryForm token={typeof params.token === "string" ? params.token : ""} />;
}
