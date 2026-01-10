# Structural Analysis Benchmarks

This directory contains benchmark test cases for validating structural analysis software. These benchmarks are based on the **Guide de validation des progiciels de calcul de structures** published by AFNOR in 1990 (ISBN 2-12-486611-7).

These tests were developed by the Société Française des Mécaniciens (SFM) with the objective of "contributing to the improvement of the quality and reliability of structural analysis software, essential tools for the design and sizing of mechanical equipment."

## SSLL03 - Slender Beam on Three Supports

### Overview

**Analysis Type:** Static (Planar Problem)  
**Test Level:** Elementary  
**Functions Tested:** Straight Slender Beam, In-Plane Bending, Discrete Elastic Connection

### Problem Description

A slender beam is supported at three points: two pinned supports at the ends (A and C) and an elastic spring support at the middle (B). Two concentrated forces are applied at one-quarter and three-quarter span.

```
         F1                    F2
    A-----------B-------------C
    |           |             |
    |           |             |
```

### Geometry

- **Total beam length:** 4L = 12 m (between A and C)
- **Span AB:** L(AB) = 2L = 6 m
- **Span BC:** L(BC) = 2L = 6 m
- **Force locations:**
  - F1 at distance L = 3 m from A
  - F2 at distance 3L = 9 m from A (3 m from C)

### Material Properties

- **Young's Modulus (E):** 2.1 × 10¹¹ Pa (210 GPa, typical for steel)
- **Moment of Inertia (Izz):** 6.3 × 10⁻⁴ m⁴

### Loading

- **Concentrated force magnitude:** F = -42,000 N (downward)
- Applied at nodes corresponding to positions L and 3L

### Boundary Conditions

- **Nodes A and C (end supports):**
  - Free rotation about RY axis
  - Translation restrained (pinned supports)

- **Node B (middle support):**
  - Vertical spring support
  - Spring stiffness: Ky = 2.1 × 10⁶ N/m
  - Free rotation about RY axis

### Expected Results

- **Vertical deflection at node B:** -0.010 m (10 mm downward)
- **Ground reaction at node B:** 21kN (upward)
- **Bending moment at node B:** -63 kNm (10 mm downward)


### References

- AFNOR Guide de validation des progiciels de calcul de structures (1990)
- Société Française des Mécaniciens (SFM) test suite
- ISBN: 2-12-486611-7
