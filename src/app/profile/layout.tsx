export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout is now handled by the shared SidebarLayoutProvider in root layout
  return <>{children}</>
}

