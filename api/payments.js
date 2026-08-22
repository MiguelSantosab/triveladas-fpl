// api/payments.js
export default async function handler(req, res) {
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const SERVER_ADMIN_PIN = process.env.ADMIN_PIN;

    if (!kvUrl || !kvToken) {
        return res.status(500).json({ error: "Upstash Redis não configurado na Vercel." });
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(`${kvUrl}/get/triveladas_payments`, {
                headers: { Authorization: `Bearer ${kvToken}` }
            });
            const result = await response.json();
            const payments = result.result ? JSON.parse(result.result) : {};
            return res.status(200).json(payments);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao ler base de dados." });
        }
    }

    if (req.method === 'POST') {
        const { pin, managerId, amount } = req.body;

        // Validação no servidor Vercel
        if (!pin || pin !== SERVER_ADMIN_PIN) {
            return res.status(401).json({ error: "PIN de administrador incorreto!" });
        }

        if (!managerId || amount === undefined) {
            return res.status(400).json({ error: "Dados incompletos." });
        }

        try {
            const getRes = await fetch(`${kvUrl}/get/triveladas_payments`, {
                headers: { Authorization: `Bearer ${kvToken}` }
            });
            const getResult = await getRes.json();
            const currentPayments = getResult.result ? JSON.parse(getResult.result) : {};

            currentPayments[managerId] = parseFloat(amount) || 0;

            await fetch(`${kvUrl}/set/triveladas_payments`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}` },
                body: JSON.stringify(JSON.stringify(currentPayments))
            });

            return res.status(200).json({ success: true, payments: currentPayments });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao gravar na base de dados." });
        }
    }

    return res.status(405).json({ error: "Método não permitido." });
}