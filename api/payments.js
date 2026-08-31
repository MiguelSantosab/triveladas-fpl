// api/payments.js
export default async function handler(req, res) {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const SERVER_ADMIN_PIN = String(process.env.ADMIN_PIN || '').trim();

  if (!kvUrl || !kvToken) {
    return res.status(500).json({ error: "Upstash Redis não configurado na Vercel." });
  }

  // Helper para ler dados do Upstash REST API
  async function getStoredPayments() {
    const response = await fetch(`${kvUrl}/get/triveladas_payments`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    const data = await response.json();
    if (!data.result) return {};
    
    if (typeof data.result === 'string') {
      try {
        return JSON.parse(data.result);
      } catch {
        return {};
      }
    }
    return data.result;
  }

  // GET: Ler pagamentos
  if (req.method === 'GET') {
    try {
      const payments = await getStoredPayments();
      return res.status(200).json(payments);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao ler base de dados." });
    }
  }

  // POST: Gravar pagamento
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: "JSON inválido." });
      }
    }

    const { pin, managerId, amount } = body || {};

    // Validação do PIN de Administrador
    if (!pin || String(pin).trim() !== SERVER_ADMIN_PIN) {
      return res.status(401).json({ error: "PIN de administrador incorreto!" });
    }

    if (!managerId || amount === undefined) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    try {
      const currentPayments = await getStoredPayments();
      currentPayments[managerId] = parseFloat(amount) || 0;

      // Gravar no Upstash via REST API
      const saveRes = await fetch(`${kvUrl}/set/triveladas_payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentPayments)
      });

      if (!saveRes.ok) {
        throw new Error('Falha ao comunicar com o Upstash');
      }

      return res.status(200).json({ success: true, payments: currentPayments });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao gravar na base de dados." });
    }
  }

  return res.status(405).json({ error: "Método não permitido." });
}