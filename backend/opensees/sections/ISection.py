# Roak's Formula Table A.1
"""
I-Section Class for Structural Analysis

This module defines the ISection class for calculating geometric properties of I-shaped steel sections
used in structural engineering applications using the sectionproperties library.

Local Axes Convention:
    The local axes y and z lie in the plane of the member section and are arranged according to 
    dextrorotary rotation. By standard, the axes mentioned represent:
    - y axis: the axis of the greater moment of inertia of a member
    - z axis: the axis of the lesser moment of inertia of a member (depending on the member section)

Member Definition Rules:
    When defining a vertical member:
        - The local x axis of the member is vertical
        - The local direction of the y axis is parallel to the global Y axis
    
    When defining a member that is not vertical:
        - The plane formed by the local axes x and z of the member is vertical
        - The local z axis is directed upwards (towards the global Z)
"""
from sectionproperties.pre.library import i_section
from sectionproperties.analysis import Section


class ISection: 
    def __init__(self, h: float, b: float, t_f: float, t_w: float, r: float = 0.0) -> None:
        """
        Initialize I-Section with dimensions.
        
        Args:
            h: Height of the I-section
            b: Width of the flanges
            t_f: Thickness of the flanges
            t_w: Thickness of the web
            r: Root radius (fillet radius)
        """
        self.h = h
        self.b = b
        self.t_f = t_f
        self.t_w = t_w
        self.r = r
        
        # Create geometry using sectionproperties
        self.geometry = i_section(
            d=h,
            b=b,
            t_f=t_f,
            t_w=t_w,
            r=r,
            n_r=8  # Number of points for fillet radius
        )
        
        # Create mesh and section
        self.geometry.create_mesh(mesh_sizes=[0.0])
        self.section = Section(self.geometry)
        
        # Calculate properties
        self.section.calculate_geometric_properties()
        self.section.calculate_warping_properties()

    def geometric_properties(self):
        """
        Calculate geometric properties for I-section using sectionproperties.
        
        Returns:
            tuple: (A, Iz, Iy, Jxx) where:
                A: Cross-sectional area
                Iz: Moment of inertia about z-axis (weak axis)
                Iy: Moment of inertia about y-axis (strong axis)
                Jxx: Torsional moment of inertia
        """
        # Get area
        A = self.section.get_area()
        
        # Get second moments of area
        # Note: sectionproperties uses ixx (about x-axis) and iyy (about y-axis)
        # We map: ixx_g -> Iy (strong axis), iyy_g -> Iz (weak axis)
        ixx_g, iyy_g = self.section.get_ip()
        Iy = ixx_g  # Strong axis (vertical for typical I-section)
        Iz = iyy_g  # Weak axis (horizontal for typical I-section)
        
        # Get torsion constant
        Jxx = self.section.get_j()
        
        return A, Iz, Iy, Jxx
