import math

def process_analysis_data(data):
    """Calcule surface et volume selon le format spécifié"""

    # Initialiser les variables
    length = None
    width = None
    height = None
    surface = None
    volume = None

    # Calcul de la surface si length et width présents
    if ('length' in data and 'width' in data and
        'value' in data['length'] and 'value' in data['width']):
        length = float(data['length']['value'])
        width = float(data['width']['value'])
        surface = length * width
        if isinstance(data.get('surface'), dict):
            data['surface']['value'] = surface

    # Calcul du volume si length, width et height présents
    if ('length' in data and 'width' in data and 'height' in data and
        'value' in data['length'] and 'value' in data['width'] and 'value' in data['height']):
        length = float(data['length']['value'])
        width = float(data['width']['value'])
        height = float(data['height']['value'])
        volume = length * width * height
        if isinstance(data.get('volume'), dict):
            data['volume']['value'] = volume

    result = {}

    # Ajouter seulement si calculés
    if surface is not None:
        result["surface"] = {
            "id": "surface",
            "name": "surface",
            "label": "A",
            "description": "Surface en m2",
            "unit": {"value": "m2", "label": "m2"},
            "value": surface,
        }

        result["perimeter"] = 2 * (length + width)
        result["formula"] = f"{length} × {width} = {surface}"

    if volume is not None:
        result["volume"] = {
            "id": "volume",
            "name": "volume",
            "label": "V",
            "description": "Volume en m3",
            "unit": {"value": "m3", "label": "m3"},
            "value": volume,
        }

    return result


def calculate_rectangular_reinforcement(b: float, h: float, d: float, M_Ed: float,
                                        fck: float, fyk: float) -> dict:
    """
    Calcule le ferraillage d'une section rectangulaire en béton armé en flexion simple (Eurocode 2)

    Paramètres:
        b: Largeur de la section (m)
        h: Hauteur totale de la section (m)
        d: Hauteur utile (m)
        M_Ed: Moment de calcul (kN.m)
        fck: Résistance caractéristique du béton en compression (MPa)
        fyk: Limite d'élasticité caractéristique de l'acier (MPa)

    Retourne:
        dict: Résultats des calculs (As, mu, pivot, etc.)
    """

    # Coefficients de sécurité Eurocode 2
    gamma_c = 1.5  # Béton
    gamma_s = 1.15  # Acier

    # Résistances de calcul
    fcd = fck / gamma_c  # MPa
    fyd = fyk / gamma_s  # MPa

    # Coefficient de béton comprimé (pour fck ≤ 50 MPa)
    if fck <= 50:
        lambda_factor = 0.8
        eta = 1.0
    else:
        lambda_factor = 0.8 - (fck - 50) / 400
        eta = 1.0 - (fck - 50) / 200

    # Moment réduit
    mu = (M_Ed * 1e6) / (b * 1000 * d**2 * 1000 * fcd)  # sans dimension

    # Moment réduit limite (pivot A/B)
    epsilon_cu = 0.0035  # Déformation ultime du béton
    epsilon_uk = 0.01    # Déformation ultime de l'acier (valeur courante)

    alpha_AB = epsilon_cu / (epsilon_cu + epsilon_uk)
    mu_AB = lambda_factor * alpha_AB * eta * (1 - lambda_factor * alpha_AB / 2)

    # Vérification du pivot
    if mu > mu_AB:
        pivot = "B (armatures comprimées nécessaires)"
        # Calcul simplifié pour section doublement armée
        mu_lim = mu_AB
        alpha = 1 - math.sqrt(1 - 2 * mu_lim)
        z = d * (1 - lambda_factor * alpha / 2)
        As1 = (M_Ed * 1e6) / (z * 1000 * fyd)  # mm²
        delta_M = M_Ed - mu_lim * b * d**2 * fcd / 1e3
        As2 = (delta_M * 1e6) / ((d - 0.05) * 1000 * fyd)  # mm² (d' = 5cm supposé)
        As_total = As1 + As2
        section_doublement_armee = True
    else:
        pivot = "A" if mu < 0.186 else "B"
        section_doublement_armee = False
        As2 = 0

        # Position de l'axe neutre
        alpha = 1 - math.sqrt(1 - 2 * mu)

        # Bras de levier
        z = d * (1 - lambda_factor * alpha / 2)

        # Section d'acier tendu
        As_total = (M_Ed * 1e6) / (z * 1000 * fyd)  # mm²

    # Section minimale Eurocode 2
    fctm = 0.3 * fck**(2/3) if fck <= 50 else 2.12 * math.log(1 + (fck + 8) / 10)
    As_min = max(0.26 * fctm / fyk * b * 1000 * d * 1000, 0.0013 * b * 1000 * d * 1000)  # mm²

    As_final = max(As_total, As_min)

    return {
        "As_calcul": round(As_total, 2),
        "As_min": round(As_min, 2),
        "As_final": round(As_final, 2),
        "As_compression": round(As2, 2) if section_doublement_armee else 0,
        "mu": round(mu, 4),
        "mu_AB": round(mu_AB, 4),
        "pivot": pivot,
        "section_doublement_armee": section_doublement_armee,
        "fcd": round(fcd, 2),
        "fyd": round(fyd, 2),
        "alpha": round(alpha, 4) if not section_doublement_armee else None,
        "z": round(z, 4) if not section_doublement_armee else None
    }