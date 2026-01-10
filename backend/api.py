from fastapi import APIRouter, Body
from typing import Dict, Any
from utils.calculations import process_analysis_data, calculate_rectangular_reinforcement
from pydantic import BaseModel, Field

# Création d'un routeur API
router = APIRouter(prefix="/api", tags=["API"])

@router.post("/analysis",
             operation_id="analysis",
             summary="Calculer surface et volume",
             description="Calcule la surface (longueur × largeur) et le volume (longueur × largeur × hauteur)",
             response_description="Données avec surface et volume calculés")
async def analyze_geometry(
    input_data: Dict[str, Any] = Body(
        ...,
        example={
            "length": {"value": 10},
            "width": {"value": 5},
            "height": {"value": 2},
            "surface": {"value": 0},
            "volume": {"value": 0}
        }
    )
):
    """Calcule surface et volume"""

    # Récupérer les données
    if 'data' in input_data:
        data = input_data['data']
    else:
        data = input_data

    # Effectuer les calculs
    result = process_analysis_data(data)

    return result


class ReinforcementRequest(BaseModel):
    b: float = Field(..., description="Largeur de la section (m)")
    h: float = Field(..., description="Hauteur totale de la section (m)")
    M_Ed: float = Field(..., description="Moment de calcul (kN.m)")
    fck: float = Field(25, description="Résistance caractéristique du béton (MPa)")
    fyk: float = Field(500, description="Limite d'élasticité de l'acier (MPa)")


@router.post("/reinforcement",
             operation_id="reinforcement",
             summary="Calculer le ferraillage d'une section rectangulaire",
             description="Calcule le ferraillage d'une section rectangulaire en béton armé en flexion simple selon l'Eurocode 2",
             response_description="Résultats du calcul de ferraillage")
async def calculate_reinforcement_api(request: ReinforcementRequest):
    """Calcule le ferraillage d'une section rectangulaire selon EC2"""

    d = 0.9 * request.h  # Hauteur utile = 0.9 x hauteur totale

    result = calculate_rectangular_reinforcement(
        b=request.b,
        h=request.h,
        d=d,
        M_Ed=request.M_Ed,
        fck=request.fck,
        fyk=request.fyk
    )

    return result

