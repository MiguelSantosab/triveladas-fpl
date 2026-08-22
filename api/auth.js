// api/auth.js
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { pin } = req.body || {};
    const serverPin = process.env.ADMIN_PIN;

    if (!serverPin) {
        return res.status(500).json({ error: 'ADMIN_PIN não configurado na Vercel.' });
    }

    if (pin && pin.trim() === serverPin.trim()) {
        return res.status(200).json({ success: true });
    }

    return res.status(401).json({ error: 'PIN incorreto.' });
}