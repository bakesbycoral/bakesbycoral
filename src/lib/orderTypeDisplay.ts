export interface CookieCupsAndCakesFormData {
  product_type?: string;
  [key: string]: unknown;
}

export function parseOrderFormData(formData: string | null | undefined): Record<string, unknown> {
  if (!formData) return {};

  try {
    const parsed = JSON.parse(formData) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function isCookieCakeFormData(formData: Record<string, unknown>): boolean {
  return formData.product_type === 'cookie_cake' || formData.product_type === 'cookie_cups_and_cake';
}

export function hasCookieCupsFormData(formData: Record<string, unknown>): boolean {
  return formData.product_type === 'cookie_cups' || formData.product_type === 'cookie_cups_and_cake';
}

export function getDisplayOrderTypeLabel(orderType: string, formData: Record<string, unknown> = {}): string {
  if (orderType === 'cookie_cups') {
    if (formData.product_type === 'cookie_cups_and_cake') return 'Cookie Cups + Cake';
    return isCookieCakeFormData(formData) ? 'Cookie Cake' : 'Cookie Cups';
  }

  const orderTypeLabels: Record<string, string> = {
    cookies: 'Cookies',
    cookies_large: 'Large Order',
    cake: 'Cake',
    wedding: 'Wedding',
    tasting: 'Tasting',
    easter_collection: 'Limited Collection',
    mothers_day_collection: "Mother's Day Collection",
  };

  return orderTypeLabels[orderType] || orderType;
}

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getCookieCupsAndCakesDetails(formData: Record<string, unknown>): string[] {
  if (formData.product_type === 'cookie_cups_and_cake') {
    const addOns = Array.isArray(formData.toppings)
      ? (formData.toppings as string[]).map(toTitleCase)
      : [];

    return [
      formData.quantity ? `**Cookie Cups:** ${String(formData.quantity)} cookie cups` : '',
      typeof formData.chocolate_molds === 'boolean'
        ? `**Cookie Cup Chocolate Molds:** ${formData.chocolate_molds ? 'Yes' : 'No'}`
        : '',
      typeof formData.edible_glitter === 'boolean'
        ? `**Cookie Cup Edible Glitter:** ${formData.edible_glitter ? 'Yes' : 'No'}`
        : '',
      formData.colors ? `**Cookie Cup Colors:** ${String(formData.colors)}` : '',
      formData.size ? `**Cookie Cake Size:** ${String(formData.size)}` : '',
      formData.shape ? `**Cookie Cake Shape:** ${toTitleCase(String(formData.shape))}` : '',
      formData.layers ? `**Cookie Cake Layers:** ${String(formData.layers)}` : '',
      formData.servings ? `**Cookie Cake Servings:** ${String(formData.servings)}` : '',
      formData.base_color ? `**Cookie Cake Base Color:** ${String(formData.base_color)}` : '',
      formData.piping_colors ? `**Cookie Cake Piping Colors:** ${String(formData.piping_colors)}` : '',
      formData.custom_messaging ? `**Cookie Cake Message:** ${String(formData.custom_messaging)}` : '',
      formData.message_style ? `**Cookie Cake Message Style:** ${toTitleCase(String(formData.message_style))}` : '',
      addOns.length > 0 ? `**Cookie Cake Add-Ons:** ${addOns.join(', ')}` : '',
      formData.design_details ? `**Design Details:** ${String(formData.design_details)}` : '',
      formData.allergies ? `**Allergies:** ${String(formData.allergies)}` : '',
    ].filter(Boolean);
  }

  if (isCookieCakeFormData(formData)) {
    const addOns = Array.isArray(formData.toppings)
      ? (formData.toppings as string[]).map(toTitleCase)
      : [];

    return [
      formData.size ? `**Size:** ${String(formData.size)}` : '',
      formData.shape ? `**Shape:** ${toTitleCase(String(formData.shape))}` : '',
      formData.layers ? `**Layers:** ${String(formData.layers)}` : '',
      formData.servings ? `**Servings:** ${String(formData.servings)}` : '',
      formData.flavor ? `**Flavor:** ${toTitleCase(String(formData.flavor))}` : '',
      formData.event_type ? `**Event Type:** ${toTitleCase(String(formData.event_type))}` : '',
      formData.base_color ? `**Base Color:** ${String(formData.base_color)}` : '',
      formData.piping_colors ? `**Piping Colors:** ${String(formData.piping_colors)}` : '',
      formData.custom_messaging ? `**Message:** ${String(formData.custom_messaging)}` : '',
      formData.message_style ? `**Message Style:** ${toTitleCase(String(formData.message_style))}` : '',
      addOns.length > 0 ? `**Add-Ons:** ${addOns.join(', ')}` : '',
      formData.design_details ? `**Design Details:** ${String(formData.design_details)}` : '',
      formData.allergies ? `**Allergies:** ${String(formData.allergies)}` : '',
    ].filter(Boolean);
  }

  return [
    formData.quantity ? `**Quantity:** ${String(formData.quantity)} cookie cups` : '',
    formData.event_type ? `**Event Type:** ${toTitleCase(String(formData.event_type))}` : '',
    typeof formData.chocolate_molds === 'boolean'
      ? `**Chocolate Molds:** ${formData.chocolate_molds ? 'Yes' : 'No'}`
      : '',
    typeof formData.edible_glitter === 'boolean'
      ? `**Edible Glitter:** ${formData.edible_glitter ? 'Yes' : 'No'}`
      : '',
    formData.colors ? `**Colors:** ${String(formData.colors)}` : '',
    formData.design_details ? `**Design Details:** ${String(formData.design_details)}` : '',
    formData.allergies ? `**Allergies:** ${String(formData.allergies)}` : '',
  ].filter(Boolean);
}
