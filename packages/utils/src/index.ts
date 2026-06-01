export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 13 && clean.startsWith('55')) {
    const area = clean.substring(2, 4);
    const first = clean.substring(4, 9);
    const second = clean.substring(9);
    return `+55 (${area}) ${first}-${second}`;
  }
  if (clean.length === 11) {
    const area = clean.substring(0, 2);
    const first = clean.substring(2, 7);
    const second = clean.substring(7);
    return `(${area}) ${first}-${second}`;
  }
  if (clean.length === 10) {
    const area = clean.substring(0, 2);
    const first = clean.substring(2, 6);
    const second = clean.substring(6);
    return `(${area}) ${first}-${second}`;
  }
  return phone;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

export function cleanPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/[\s\+\-\(\)]/g, '');
}
