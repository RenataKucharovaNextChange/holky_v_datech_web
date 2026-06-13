// Přijme přihlášku na akci a uloží ji jako kontakt v Ecomailu
// (vyžaduje proměnné prostředí ECOMAIL_API_KEY a ECOMAIL_LIST_ID ve Vercelu)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();

  if (!email || !name) {
    res.status(400).json({ error: 'Chybí jméno nebo e-mail' });
    return;
  }

  const customFields = {
    EVENT: String(body.event || ''),
    DISCORD: body.discord ? 'ano' : 'ne',
  };

  if (body.firstTime) {
    const source = Array.isArray(body.source) ? body.source.join(', ') : '';
    let motivation = Array.isArray(body.motivation) ? body.motivation.join(', ') : '';
    if (body.motivationOther) {
      motivation = motivation ? `${motivation}, ${body.motivationOther}` : body.motivationOther;
    }
    customFields.ZDROJ = source;
    customFields.MOTIVACE = String(motivation);
  }

  const payload = JSON.stringify({
    subscriber_data: {
      email,
      name,
      custom_fields: customFields,
    },
    trigger_autoresponders: true,
    resubscribe: true,
  });

  try {
    const ecomailRes = await fetch(
      `https://api2.ecomailapp.cz/lists/${process.env.ECOMAIL_LIST_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          key: process.env.ECOMAIL_API_KEY,
        },
        body: payload,
      }
    );

    if (ecomailRes.ok) {
      res.status(200).json({ success: true });
    } else {
      const detail = await ecomailRes.text();
      res.status(500).json({ error: 'Chyba při ukládání přihlášky', detail });
    }
  } catch (err) {
    res.status(500).json({ error: 'Chyba serveru', detail: String(err) });
  }
};
