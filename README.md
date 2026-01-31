# Rocket Launch Aerodynamics Simulator

Interactive 3D rocket launch simulator with pre-launch stability analysis (Barrowman), real-time flight physics, and React Three Fiber visualization.

---

## CORE FEATURES

### 1. PRE-LAUNCH AERODYNAMICS ANALYSIS

- **Static stability calculator** using Barrowman equations (subsonic)
- **Center of Gravity (CG)** – calculated from component masses and positions; visualized on the rocket
- **Center of Pressure (CP)** – from Barrowman (nose, body, fins); visualized on the rocket
- **Stability margin** – CP should be 1–2 calibers behind CG for stable flight; displayed in calibers
- **Interactive sliders** to adjust:
  - Fin dimensions (span, root chord, tip chord, sweep, leading-edge position)
  - Nose cone shape (cone / ogive) and length
  - Body tube diameter and length
  - Payload mass and position
  - Motor selection and position
- **Real-time updates** – design changes immediately update CG, CP, and stability
- **Visual stability indicator** – stable/unstable warning and status

### 2. FLIGHT SIMULATION WITH REAL-TIME AERODYNAMICS

Physics implemented:

- **Atmospheric model** – air density and temperature vs altitude (exponential density, lapse rate to 11 km)
- **Speed of sound** – \( a = \sqrt{\gamma R T} \) from temperature
- **Mach number** – velocity / speed of sound
- **Drag coefficient (Cd) vs Mach:**
  - Subsonic (Mach &lt; 0.8): Cd ≈ 0.35
  - Transonic (0.8–1.2): drag spike (smooth interpolation)
  - Supersonic (&gt; 1.2): Cd ≈ 0.6, slowly decreasing
- **Drag force** – \( F_d = \frac{1}{2} \rho v^2 C_d A \) (opposes velocity)
- **Thrust** – motor thrust curves (trapezoidal / Estes-like); **increases slightly with altitude** as ambient pressure drops
- **Gravity** – \( g = 9.81\,\text{m/s}^2 \)
- **Mass change** – propellant burn; dry mass + motor casing after burnout
- **Apogee detection** and parachute deployment (recovery phase)

To accelerate upward: **thrust &gt; weight + drag**.

### 3. 3D VISUALIZATION (React Three Fiber)

Scene elements:

- **Rocket** – built from Three.js primitives (cylinder body, cone/ogive nose, rectangular fins); no STL
- **Launch pad** and ground plane
- **Flight path trail** behind the rocket, colored by Mach number
- **Force vector arrows** (relative scaling so all stay visible):
  - **Thrust** (red) – upward; high during burn, rises slightly with altitude
  - **Drag** (blue) – opposes motion; 0 → peak at Max-Q → 0
  - **Gravity** (green) – constant downward (weight)
- **CG and CP markers** on the rocket in pre-launch mode
- **Camera** – OrbitControls; follows rocket in flight with closer, tighter view

### 4. USER INTERFACE

**Left sidebar**

- Rocket design inputs (sliders / number inputs):
  - Nose cone length and shape
  - Body diameter and length
  - Fin dimensions (root chord, tip chord, span, sweep, leading edge)
  - Payload mass and position
  - Motor selection
  - Body/fin/nose mass
- Pre-launch results:
  - CG position (from nose)
  - CP position (from nose)
  - Stability margin (calibers)
  - Stability status (stable / unstable)
- Tooltips on terms (CG, CP, Barrowman, etc.)

**Right sidebar**

- Simulation: Play / Pause / Reset, simulation speed
- Real-time telemetry:
  - Altitude, velocity, acceleration
  - Mach number, Cd, air density (ρ)
- **Recharts** graphs:
  - Altitude vs time
  - Velocity vs time

**3D view**

- Toggle for force vectors; legend explains thrust/drag/weight behavior and “thrust &gt; weight + drag” for climb.

---

## TECHNICAL REQUIREMENTS

- **Next.js 14+** (App Router)
- **React Three Fiber** (`@react-three/fiber`) for 3D
- **Drei** (`@react-three/drei`) for OrbitControls and helpers
- **Recharts** for 2D graphs
- **TypeScript**
- **Tailwind CSS** for layout and UI
- **API routes** – design analysis and full trajectory simulation run on the server; frontend plays back precomputed states

---

## IMPLEMENTATION NOTES

- **Constants:** \( g = 9.81\,\text{m/s}^2 \), sea-level density \( \rho_0 = 1.225\,\text{kg/m}^3 \), sea-level pressure \( P_0 = 101325\,\text{Pa} \).
- **Atmosphere:** \( \rho = \rho_0 \exp(-h/7400) \); temperature \( T = 288.15 - 0.0065 \times h \) up to 11 km.
- **Simulation:** 60 FPS timestep (\( dt = 1/60\,\text{s} \)); trajectory computed in API; playback with optional interpolation for smooth force arrows.
- **Barrowman:** Standard model-rocketry equations for CP (nose, body, fins); CG from component masses and positions.
- **Motors:** Trapezoidal thrust curves (ramp up, sustain, ramp down); Estes-style options (A8, B6, C6, D12, etc.); thrust scaled by altitude (lower ambient pressure → slightly higher thrust).
- **Drag:** \( C_d(\text{Mach}) \) with subsonic, transonic spike, and supersonic regime; \( F_d = \frac{1}{2}\rho v^2 C_d A \).

---

## GETTING STARTED

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the left sidebar to design the rocket and check stability; pick a motor and press **Launch** in the right sidebar to run the simulation and watch the 3D flight.

**Clean build (if you see 404/500 on chunks):**

```bash
cd frontend
npm run clean
npm run dev
```

---

## REPOSITORY STRUCTURE

```
rocket-aerodynamics/
├── README.md           # This file
├── .gitignore
└── frontend/           # Next.js app
    ├── package.json
    ├── next.config.mjs
    ├── src/
    │   ├── app/        # App Router, API routes (design/analyze, simulation/run)
    │   ├── components/ # RocketSimulator, Scene, R3F components, sidebars, charts
    │   ├── lib/        # atmosphere, barrowman, cg, drag, motors, simulation, designToSim
    │   └── types/      # rocket, simulation
    └── ...
```

Analysis and simulation logic live in `frontend/src/lib/` and are used by API routes; the UI calls the APIs and displays results and playback.
