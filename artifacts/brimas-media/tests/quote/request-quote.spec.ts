import { test as base, expect, type Page } from '@playwright/test';
import { servicePages } from '../../src/seo/service-data';

const recipient = 'https://wa.me/256780347272';
const service = 'business-cards-printing-kampala';
const quantity = '20 cards';
const details = 'Full colour, matte finish';

// Do not replace location.assign (it is non-configurable in Chromium), or mock
// the production helper. Intercept the actual navigation before any network I/O.
// Block ALL off-origin traffic, including fonts, popups and alternate recipients.
const test = base.extend<{ destinations: string[] }>({
  destinations: [async ({ context, baseURL }, use) => {
    const destinations: string[] = [];
    const origin = new URL(baseURL!).origin;
    await context.route('**/*', async (route) => {
      const request = route.request();
      if (new URL(request.url()).origin === origin) {
        await route.continue();
      } else {
        if (request.isNavigationRequest()) destinations.push(request.url());
        await route.abort('blockedbyclient');
      }
    });
    await use(destinations);
  }, { auto: true }],
});

function brief(label = 'Business card printing', order = quantity, specs = details, optional: string[] = []) {
  return [
    'Hello Print Garage, I would like a quote for one job.',
    `Service: ${label}`,
    `Quantity: ${order}`,
    `What I need: ${specs}`,
    ...optional,
    'Please confirm the price and next steps for this specific request.',
  ].join('\n');
}

async function fillRequired(page: Page, selected = service) {
  await page.getByTestId('select-request-service').selectOption(selected);
  await page.getByTestId('input-request-quantity').fill(quantity);
  await page.getByTestId('textarea-request-details').fill(details);
}

async function submitAndCheck(page: Page, destinations: string[], message: string) {
  await page.getByTestId('button-request-whatsapp').click();
  // Exact URL protects recipient, percent encoding, line order, and omission of
  // unwanted fields. Decoding separately catches accidental double encoding.
  await expect.poll(() => destinations).toEqual([
    `${recipient}?text=${encodeURIComponent(message)}`,
  ]);
  const url = new URL(destinations[0]);
  expect(url.searchParams.get('text')).toBe(message);
  expect([...url.searchParams.keys()]).toEqual(['text']);
}

test('every service direct link preselects the service, including after reload', async ({ page }) => {
  for (const item of servicePages) {
    await page.goto(`/request-a-quote?service=${encodeURIComponent(item.slug)}`);
    await expect(page.getByTestId('select-request-service')).toHaveValue(item.slug);
    await page.reload();
    await expect(page.getByTestId('select-request-service')).toHaveValue(item.slug);
  }
});

for (const query of ['', '?service=unknown-service', '?service=', '?service=other']) {
  test(`missing or unsupported query starts unselected: ${query || '(no query)'}`, async ({ page, destinations }) => {
    await page.goto(`/request-a-quote${query}`);
    await expect(page.getByTestId('select-request-service')).toHaveValue('');
    await page.reload();
    await expect(page.getByTestId('select-request-service')).toHaveValue('');
    expect(destinations).toEqual([]);
  });
}

test('direct link and reload submit only the selected service brief', async ({ page, destinations }) => {
  await page.goto(`/request-a-quote?service=${service}`);
  await page.reload();
  await expect(page.getByTestId('select-request-service')).toHaveValue(service);
  // Leave the preselection untouched: submission must use React Hook Form state,
  // not just a visually selected option.
  await page.getByTestId('input-request-quantity').fill(quantity);
  await page.getByTestId('textarea-request-details').fill(details);
  await submitAndCheck(page, destinations, brief());
});

for (const field of ['select-request-service', 'input-request-quantity', 'textarea-request-details']) {
  test(`required field blocks navigation: ${field}`, async ({ page, destinations }) => {
    await page.goto('/request-a-quote');
    await fillRequired(page);
    const input = page.getByTestId(field);
    if (field === 'select-request-service') await input.selectOption('');
    else await input.fill('');
    await page.getByTestId('button-request-whatsapp').click();
    await expect(input).toBeFocused();
    expect(await input.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true);
    expect(destinations).toEqual([]);
    // A positive control also proves there was no late, invalid navigation.
    await fillRequired(page);
    await submitAndCheck(page, destinations, brief());
  });
}

for (const field of ['input-request-quantity', 'textarea-request-details']) {
  test(`whitespace-only required field blocks navigation: ${field}`, async ({ page, destinations }) => {
    await page.goto('/request-a-quote');
    await fillRequired(page);
    const input = page.getByTestId(field);
    await input.fill('   ');
    // Native required accepts spaces; this exercises the form's trim validator.
    expect(await input.evaluate((element: HTMLInputElement) => element.validity.valid)).toBe(true);
    await page.getByTestId('button-request-whatsapp').click();
    // handleSubmit completes asynchronous validation before focusing the error.
    await expect(input).toBeFocused();
    expect(destinations).toEqual([]);
    await fillRequired(page);
    await submitAndCheck(page, destinations, brief());
  });
}

test('custom service overrides query preselection and encodes a trimmed Unicode brief', async ({ page, destinations }) => {
  await page.goto(`/request-a-quote?service=${service}`);
  await expect(page.getByTestId('select-request-service')).toHaveValue(service);
  await fillRequired(page, 'other');
  await page.getByTestId('input-request-quantity').fill('  12 + 3 / samples  ');
  await page.getByTestId('textarea-request-details').fill('  Blue & white\nLogo: 50% + café / #1? "A=B" 🖨️  ');
  await page.getByTestId('input-request-deadline').fill('  Friday & Saturday?  ');
  await page.getByTestId('input-request-name').fill('  Test customer + team  ');
  await submitAndCheck(page, destinations, brief(
    'Other / custom request',
    '12 + 3 / samples',
    'Blue & white\nLogo: 50% + café / #1? "A=B" 🖨️',
    ['When I need it: Friday & Saturday?', 'My name: Test customer + team'],
  ));
});

test('whitespace optional fields are omitted, not added as empty lines', async ({ page, destinations }) => {
  await page.goto('/request-a-quote');
  await fillRequired(page);
  await page.getByTestId('input-request-deadline').fill('   ');
  await page.getByTestId('input-request-name').fill('   ');
  await submitAndCheck(page, destinations, brief());
});

for (const [field, line] of [
  ['input-request-deadline', 'When I need it: Test value'],
  ['input-request-name', 'My name: Test value'],
]) {
  test(`optional fields are included independently: ${field}`, async ({ page, destinations }) => {
    await page.goto('/request-a-quote');
    await fillRequired(page);
    await page.getByTestId(field).fill('  Test value  ');
    await submitAndCheck(page, destinations, brief(undefined, quantity, details, [line]));
  });
}

test('real catalog helper encodes arbitrary messages once with the correct recipient', async ({ page, destinations }) => {
  await page.goto('/request-a-quote');
  for (const message of ['', 'Hello\n& + / ? # = % café 🖨️', 'Already encoded? %20 &text=wrong']) {
    const href = await page.evaluate(async (text) => {
      // Vite serves the real module, not a copied test implementation.
      // @ts-expect-error Browser-only module URL, resolved by the test Vite server.
      const { whatsappHref } = await import('/src/lib/catalog.ts');
      return whatsappHref(text);
    }, message);
    expect(href).toBe(`${recipient}?text=${encodeURIComponent(message)}`);
    expect(new URL(href).searchParams.get('text')).toBe(message);
  }
  expect(destinations).toEqual([]);
});