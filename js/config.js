export const CONFIG = {
    LEAGUE_ID: 1123735, // Confirma se este é o teu ID de liga
    API: {
        FPL_BASE: 'https://fantasy.premierleague.com/api',
        PROXIES: [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url='
        ]
    },
    RULES: {
        BELOW_50_POINTS: 50,
        FINES: {
            BELOW_50: 1.0,
            LAST_PLACE: 1.0,
            BENCH_LOSS: 0.5,
            MONTHLY_LOSS: 2.0,
            TRANSFER_HIT: 0.5
        }
    }
};