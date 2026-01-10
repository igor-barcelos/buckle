"""
Hollow Circular Section Class for Structural Analysis

This module defines the HollowCircularSection class for calculating geometric properties 
of hollow circular (pipe) sections using the sectionproperties library.
"""
import math
from sectionproperties.pre.library import circular_hollow_section
from sectionproperties.analysis import Section


class HollowCircularSection:
    def __init__(self, diameter: float, thickness: float) -> None:
        """
        Initialize HollowCircularSection with outer diameter and wall thickness.
        
        Args:
            diameter: Outer diameter of the circular section
            thickness: Wall thickness of the circular section
        """
        self.diameter = diameter
        self.thickness = thickness
        self.radius = diameter / 2.0
        self.inner_radius = self.radius - thickness
        
        # Validate inputs
        if thickness <= 0:
            raise ValueError("Thickness must be positive")
        if thickness >= self.radius:
            raise ValueError("Thickness must be less than half the diameter (radius)")
        if diameter <= 0:
            raise ValueError("Diameter must be positive")
        
        # Create geometry using sectionproperties
        self.geometry = circular_hollow_section(
            d=diameter,
            t=thickness,
            n=64  # Number of points for discretization
        )
        
        # Create mesh and section
        self.geometry.create_mesh(mesh_sizes=[0.0])
        self.section = Section(self.geometry)
        
        # Calculate properties
        self.section.calculate_geometric_properties()
        self.section.calculate_warping_properties()

    def geometric_properties(self):
        """
        Calculate geometric properties for hollow circular section.
        
        Returns:
            tuple: (A, Iz, Iy, Jxx) where:
                A: Cross-sectional area
                Iz: Moment of inertia about z-axis
                Iy: Moment of inertia about y-axis  
                Jxx: Torsional moment of inertia
        """
        # Get area
        A = self.section.get_area()
        
        # Get second moments of area
        # For circular sections, Ixx = Iyy
        ixx_g, iyy_g, ixy_g = self.section.get_ig()
        Iy = ixx_g
        Iz = iyy_g  # Should be equal to Iy for circular sections
        
        # Get torsion constant
        Jxx = self.section.get_j()
        
        return A, Iz, Iy, Jxx
    
    def section_modulus(self):
        """
        Calculate section modulus for hollow circular section.
        
        Returns:
            tuple: (Sy, Sz) where:
                Sy: Section modulus about y-axis
                Sz: Section modulus about z-axis
        """
        # Get section moduli
        ixx_g, iyy_g, ixy_g = self.section.get_ig()
        
        # Section modulus S = I / c where c is the distance to extreme fiber
        Sy = ixx_g / self.radius
        Sz = iyy_g / self.radius
        
        return Sy, Sz
    
    def radius_of_gyration(self):
        """
        Calculate radius of gyration for hollow circular section.
        
        Returns:
            tuple: (ry, rz) where:
                ry: Radius of gyration about y-axis
                rz: Radius of gyration about z-axis
        """
        # Get radii of gyration
        rx, ry = self.section.get_rc()
        
        # For circular sections, rx = ry
        return rx, ry
