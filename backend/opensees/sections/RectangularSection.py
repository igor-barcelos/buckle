"""
Rectangular Section Class for Structural Analysis

This module defines the RectangularSection class for calculating geometric properties 
of rectangular sections using the sectionproperties library.
"""
from sectionproperties.pre.library import rectangular_section
from sectionproperties.analysis import Section


class RectangularSection:
    def __init__(self, width: float, height: float) -> None:
        """
        Initialize RectangularSection with dimensions.
        
        Args:
            width: Width of the rectangular section (b)
            height: Height of the rectangular section (h)
        """
        self.width = width
        self.height = height
        
        # Validate inputs
        if width <= 0:
            raise ValueError("Width must be positive")
        if height <= 0:
            raise ValueError("Height must be positive")
        
        # Create geometry using sectionproperties
        self.geometry = rectangular_section(
            d=height,
            b=width
        )
        
        # Create mesh and section
        mesh_size = min(self.width, self.height) / 20
        print('mesh_size', mesh_size)
        self.geometry.create_mesh(mesh_sizes=[mesh_size])
        self.section = Section(self.geometry)
        
        # Calculate properties
        self.section.calculate_geometric_properties()
        self.section.calculate_warping_properties()

    def geometric_properties(self):
        """
        Calculate geometric properties for rectangular section.
        
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
        # ixx_g is about the horizontal axis (strong axis for tall rectangle)
        # iyy_g is about the vertical axis (weak axis for tall rectangle)
        ixx_g, iyy_g = self.section.get_ip()
        Iy = ixx_g  # Moment of inertia about y-axis
        Iz = iyy_g  # Moment of inertia about z-axis
        # Get torsion constant
        Jxx = self.section.get_j()
        
        return A, Iz, Iy, Jxx
    
    def section_modulus(self):
        """
        Calculate section modulus for rectangular section.
        
        Returns:
            tuple: (Sy, Sz) where:
                Sy: Section modulus about y-axis
                Sz: Section modulus about z-axis
        """
        # Get section moduli
        ixx_g, iyy_g, ixy_g = self.section.get_ig()
        
        # Section modulus S = I / c where c is the distance to extreme fiber
        Sy = ixx_g / (self.height / 2.0)
        Sz = iyy_g / (self.width / 2.0)
        
        return Sy, Sz
    
    def radius_of_gyration(self):
        """
        Calculate radius of gyration for rectangular section.
        
        Returns:
            tuple: (ry, rz) where:
                ry: Radius of gyration about y-axis
                rz: Radius of gyration about z-axis
        """
        # Get radii of gyration
        rx, ry = self.section.get_rc()
        
        return rx, ry

