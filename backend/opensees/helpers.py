import math
from typing import Dict, Union
from .sections import ISection, HollowCircularSection, RectangularSection

mm = 1E-3
def compute_section_properties(section: Dict) -> Dict[str, float]:
    type = section["type"]
    material = section['material']
    E = material['E']
    nu = material['nu']
    G_mod = E / (2 * (1 + nu))  # Shear modulus

    if type == "Rectangular":
        b = section["width"] * mm
        h = section["height"] * mm
        rectangular_section = RectangularSection(b, h)
        A, Iz, Iy, Jxx = rectangular_section.geometric_properties()

    elif type == "Circular":
        d = section["diameter"]
        A = math.pi * (d**2) / 4
        Iz = Iy = (math.pi * d**4) / 64
        Jxx = (math.pi * d**4) / 32

    elif type == "HollowCircular":
        d = section["diameter"] * mm
        t = section["thickness"] * mm
        hollow_circular_section = HollowCircularSection(d,t)
        A, Iz, Iy, Jxx = hollow_circular_section.geometric_properties()
    elif type == "I":
        h = section['depth'] * mm
        b = section['width'] * mm
        t_w = section['tw'] * mm
        t_f = section['tf'] * mm
        i_section = ISection(h, b, t_f, t_w )
        A, Iz, Iy, Jxx = i_section.geometric_properties()
        
    else:
        raise ValueError(f"Unknown section type: {type}")

    return {
        "E": E,
        "G_mod": G_mod,
        "A": A,
        "Iz": Iz,
        "Iy": Iy,
        "Jxx": Jxx
    }


def distance_between_points(point1: tuple, point2: tuple) -> float:
    """
    Calculate the Euclidean distance between two points in 3D space.
    
    Args:
        point1: Tuple of (x, y, z) coordinates for the first point
        point2: Tuple of (x, y, z) coordinates for the second point
    
    Returns:
        float: The distance between the two points
    """
    x1, y1, z1 = point1
    x2, y2, z2 = point2
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2 + (z2 - z1)**2)