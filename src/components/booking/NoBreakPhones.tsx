/** Keeps every phone number in a data string on one line: it never splits at the space or the hyphen. */
export function NoBreakPhones({ text }: { text: string }) {
  const parts = text.split(/(\(\d{3}\) \d{3}-\d{4})/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 ? <span key={i} className="whitespace-nowrap tnum">{part}</span> : part,
      )}
    </>
  );
}
