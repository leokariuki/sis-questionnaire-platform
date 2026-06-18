/**
 * Small-print attribution shown at the bottom of the questionnaire (platform)
 * and the reports / printable profiles. Kept in one place so the wording stays
 * consistent everywhere.
 */
export function CreditLine({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-center font-body text-on-surface-variant ${className}`}
      style={{ fontSize: "11px", lineHeight: 1.4, opacity: 0.75 }}
    >
      © Developed by Alejandra Cortés-Pascual in collaboration with
      EducationalPaths.com &amp; BienesDar.org.
    </p>
  );
}
