---
title: "Relativity: Derivations, Experimental Evidence, and Checks"
description: "The mathematical companion to Understanding Einstein's Relativity, with derivations, quantitative tests, limitations, and worked exercises."
---

This is the supporting layer for [Understanding Einstein's Relativity](understanding-einstein-relativity.md). It separates mathematical deductions from measured results. The derivations use stated idealizations; experimental uncertainties belong to the individual tests, not to relativity as one universal percentage.

Throughout, $c$ is the vacuum speed of light, $G$ is Newton's gravitational constant, and the metric signature is $(-,+,+,+)$. Set $x^0=ct$. Greek indices run from 0 to 3; spatial indices run from 1 to 3. Repeated upper/lower indices are summed. A prime labels another coordinate frame, not a derivative, except where derivatives with respect to an orbital angle are explicitly introduced.

## 1. Deriving the Lorentz transformation

Consider inertial frames whose origins coincide at $t=t'=0$, with $S'$ moving at speed $v$ in the positive $x$ direction. Homogeneity of space and time motivates a linear transformation. The moving origin satisfies $x=vt$ and $x'=0$, so write

```{math}
x'=A(x-vt),\qquad t'=Bt+Dx.
```

Use standard Einstein synchronization in each frame. A right-moving light ray has $x=ct$ and $x'=ct'$, giving

```{math}
A(c-v)=c(B+Dc).
```

A left-moving ray has $x=-ct$ and $x'=-ct'$, giving

```{math}
A(c+v)=c(B-Dc).
```

Adding and subtracting yields $B=A$ and $D=-Av/c^2$. Thus

```{math}
x'=A(x-vt),\qquad
 t'=A\left(t-\frac{vx}{c^2}\right).
```

Relativity and spatial isotropy require the inverse transformation to have the same factor with $v$ replaced by $-v$. Composing the transformations gives

```{math}
x=A^2\left(1-\frac{v^2}{c^2}\right)x.
```

Continuity with the identity transformation selects the positive solution,

```{math}
A=\gamma=\frac{1}{\sqrt{1-v^2/c^2}}.
```

This derivation makes the assumptions visible. The Lorentz transformation does not follow from the number $299\,792\,458$ alone. It follows from the relativity principle, spacetime symmetries, an invariant finite signal speed identified with vacuum light speed, and the synchronization convention used for the coordinates.[^detail-sr]

### What the one-way-speed qualification means

Measuring a one-way speed between distant endpoints requires synchronized clocks. Einstein synchronization assigns a distant reflection event the midpoint time between a light signal's departure and return. A round-trip measurement needs only one clock and avoids that distant-synchronization step.[^detail-einstein]

This does not turn relativity into a convention with no empirical content. Reunion clock comparisons, round-trip optical tests, particle decay, and dynamical predictions remain testable. It does mean that Michelson–Morley should not be described as an independent measurement of every possible definition of one-way light speed.

## 2. The interval, proper time, and causality

Direct substitution of the Lorentz transformation gives

```{math}
-c^2dt'^2+dx'^2=-c^2dt^2+dx^2.
```

Including the unchanged transverse directions gives the invariant interval

```{math}
ds^2=-c^2dt^2+d\mathbf x^2.
```

For the path of a massive clock, $d\mathbf x^2=v^2dt^2$ and $ds^2=-c^2d\tau^2$, so

```{math}
d\tau=dt\sqrt{1-\frac{v^2}{c^2}}.
```

Integrate this expression along each path between departure and reunion. The resulting clock readings do not depend on which coordinates were used to calculate them. A coordinate time is a frame's assignment; proper time is attached to a physical path.

For two events in flat spacetime, a negative interval squared is **timelike**: a slower-than-light traveler could connect them. Zero is **null**, the separation of events connected by a vacuum light ray. A positive interval squared is **spacelike**: connecting them would require faster-than-light travel. Ordinary Lorentz transformations preserve this classification and preserve the time order of causally connected events.[^detail-sr]

For a spacelike pair, the Lorentz equation for $\Delta t'$ can change its sign as the frame changes. Therefore two distant events can have no frame-independent order without producing a contradiction about cause and effect. They cannot exchange a causal signal at or below $c$.

A photon has no inertial rest frame: taking $v=c$ in a Lorentz boost is singular. Although a null path has zero proper-time interval, saying “from the photon's point of view” incorrectly suggests that such a rest frame exists.

## 3. Energy and momentum from the action

The classical action for a free massive particle can be written in invariant form,

```{math}
S=-mc^2\int d\tau
=\int L\,dt,
\qquad L=-mc^2\sqrt{1-v^2/c^2}.
```

Using the same canonical definitions as in classical analytical mechanics,

```{math}
p_i=\frac{\partial L}{\partial v_i}=\gamma mv_i.
```

The Hamiltonian is

```{math}
H=\mathbf p\cdot\mathbf v-L
=\gamma mv^2+\frac{mc^2}{\gamma}
=\gamma mc^2=E.
```

The last identity follows from $\gamma v^2+c^2/\gamma=\gamma c^2$. Consequently,

```{math}
E^2-p^2c^2
=\gamma^2m^2c^4\left(1-\frac{v^2}{c^2}\right)
=m^2c^4.
```

The action was chosen to have the required spacetime symmetry and to reproduce the Newtonian free-particle action at low speed. The algebra then supplies the energy and momentum formulas; they are not unrelated additions to the kinematics.[^detail-sr]

For several noninteracting constituents in flat spacetime, the invariant mass of the complete system is determined by

```{math}
M^2c^4=E_{\mathrm{tot}}^2-c^2|\mathbf P_{\mathrm{tot}}|^2.
```

For example, two photons traveling in opposite directions with equal energy $\varepsilon$ have total momentum zero and system mass $M=2\varepsilon/c^2$, even though each photon has zero invariant mass. “Massless constituents” does not imply “massless system.” Including interactions requires including the interaction energy and momentum as well.

For a massive particle, accelerating toward $c$ makes $\gamma$ diverge, so finite added energy cannot take it from below $c$ to $c$. This statement concerns massive objects accelerated through ordinary timelike states; it is not a universal claim about every coordinate-defined speed.

## 4. From the metric to Newton's gravitational equations

General relativity uses the metric-compatible, torsion-free connection, whose coefficients are

```{math}
\Gamma^\mu_{\alpha\beta}
=\frac12g^{\mu\nu}
\left(\partial_\alpha g_{\nu\beta}
+\partial_\beta g_{\nu\alpha}
-\partial_\nu g_{\alpha\beta}\right).
```

Here $g^{\mu\nu}$ is the inverse metric, and $\partial_\alpha$ means differentiation with respect to $x^\alpha$. The coefficients describe how coordinate basis vectors change; by themselves they are not coordinate-invariant measures of gravity. Curvature is built from their derivatives and products.[^detail-geometry]

### Recover the force law

Assume a weak, static field, slow test-body motion, negligible mixed time-space components, and

```{math}
g_{00}=-\left(1+\frac{2\Phi}{c^2}\right),
\qquad g_{ij}\approx\delta_{ij}.
```

To leading order,

```{math}
\Gamma^i_{00}\approx-\frac12\partial_i g_{00}
=\frac{\partial_i\Phi}{c^2}.
```

Because the time component of the test body's four-velocity dominates its spatial components, the spatial geodesic equation becomes

```{math}
\frac{d^2x^i}{dt^2}\approx-c^2\Gamma^i_{00}
=-\partial_i\Phi.
```

This is Newton's acceleration law. A spatially varying clock-rate component already contains the leading gravitational acceleration; spatial curvature is also necessary for the complete relativistic predictions.

### Recover the source equation

Neglect $\Lambda$ at the scale under consideration. Taking the trace of Einstein's equation gives the equivalent form

```{math}
R_{\mu\nu}=\frac{8\pi G}{c^4}
\left(T_{\mu\nu}-\frac12g_{\mu\nu}T\right).
```

For slow matter with negligible pressure, $T_{00}\approx\rho c^2$ and $T\approx-\rho c^2$. Hence

```{math}
R_{00}\approx\frac{4\pi G\rho}{c^2}.
```

The static weak-field geometry gives $R_{00}\approx\nabla^2\Phi/c^2$. Combining them yields

```{math}
\nabla^2\Phi=4\pi G\rho.
```

The coefficient $8\pi G/c^4$ in Einstein's equation is therefore tied to the measured strength of Newtonian gravity, not an independently adjustable parameter for each relativistic test.[^detail-weak]

### What conservation means here

The geometric identity $\nabla_\mu G^{\mu\nu}=0$ makes Einstein's equation consistent with $\nabla_\mu T^{\mu\nu}=0$. This is a local, covariant conservation statement. It should not be confused with a guarantee of a globally conserved total energy in every curved, time-dependent spacetime. Global conserved energies require appropriate additional symmetry or boundary structure.[^detail-field]

## 5. Three predictions from a spherical gravitational field

Outside an ideal spherical, nonrotating source, neglecting $\Lambda$, the Schwarzschild metric is

```{math}
ds^2=-\left(1-\frac{2GM}{rc^2}\right)c^2dt^2
+\left(1-\frac{2GM}{rc^2}\right)^{-1}dr^2
+r^2(d\theta^2+\sin^2\theta\,d\phi^2).
```

These are specific coordinates; $r$ is defined so that a symmetry sphere has area $4\pi r^2$. The following exterior weak-field results follow from this metric and its geodesics.[^detail-gr1]

### Stationary clock rates and redshift

For a clock held at fixed $r,\theta,\phi$ outside the source,

```{math}
\frac{d\tau}{dt}=\sqrt{1-\frac{2GM}{rc^2}}.
```

Two supported clocks at different radii can therefore accumulate different proper times over the same coordinate-time interval. A photon sent upward from a lower stationary emitter to a higher stationary receiver is measured at a lower frequency than at emission. In a static field, the ratio is

```{math}
\frac{\nu_{\mathrm{received}}}{\nu_{\mathrm{emitted}}}
=\sqrt{\frac{1-2GM/(r_{\mathrm e}c^2)}
{1-2GM/(r_{\mathrm r}c^2)}}.
```

For $r_{\mathrm r}>r_{\mathrm e}$, the ratio is below one. Clock-rate comparisons and photon-frequency comparisons are related, but the signs must be attached to the specified comparison rather than remembered as “gravity slows everything.”

### Mercury's perihelion advance

In the orbital plane, let $u=1/r$ and let $h=r^2d\phi/d\tau$ be specific angular momentum. Primes in this paragraph mean derivatives with respect to $\phi$. The massive-particle orbit equation is

```{math}
u''+u=\frac{GM}{h^2}+\frac{3GM}{c^2}u^2.
```

The Newtonian solution is $u_0=(1+e\cos\phi)/p$, with $p=h^2/(GM)\approx a(1-e^2)$. The extra term contains a contribution proportional to $\cos\phi$, which shifts the orbital frequency. Writing

```{math}
u\approx\frac{1}{p}\left[1+e\cos((1-\delta)\phi)\right]
```

and matching that contribution to first order gives $\delta=3GM/(pc^2)$. A radial cycle then takes slightly more than $2\pi$ in azimuth, giving

```{math}
\Delta\varpi\approx2\pi\delta
=\frac{6\pi GM}{a(1-e^2)c^2}.
```

Using rounded illustrative Mercury inputs $GM_\odot=1.3271244\times10^{20}\,\mathrm{m^3s^{-2}}$, $a=5.7909\times10^{10}\,\mathrm m$, $e=0.20563$, and period $87.969$ days gives approximately **0.1035 arcsecond per orbit**, or **42.98 arcseconds per century**. This calculation reproduces the leading relativistic contribution, not Mercury's total observed precession or a modern full ephemeris fit.[^detail-gr1][^detail-mercury]

### Why light bending distinguishes theories

For a weak static field, write an isotropic metric in a parameterized form,

```{math}
ds^2\approx-\left(1+\frac{2\Phi}{c^2}\right)c^2dt^2
+\left(1-\frac{2\gamma_{\mathrm{PPN}}\Phi}{c^2}\right)d\ell^2.
```

The subscript PPN means **parameterized post-Newtonian**: a framework for comparing the leading weak-field predictions of different gravitational theories. This $\gamma_{\mathrm{PPN}}$ is not the Lorentz factor $\gamma$.

Setting $ds^2=0$ gives an effective coordinate optical path factor

```{math}
c\,dt\approx\left[1-\frac{(1+\gamma_{\mathrm{PPN}})\Phi}{c^2}\right]d\ell.
```

For $\Phi=-GM/r$, integrating its transverse gradient along a nearly straight ray gives the deflection magnitude

```{math}
\alpha\approx\frac{2(1+\gamma_{\mathrm{PPN}})GM}{bc^2}.
```

GR predicts $\gamma_{\mathrm{PPN}}=1$, so the coefficient is 4. At a solar impact parameter of $6.957\times10^8\,\mathrm m$, the rounded calculation gives **1.751 arcseconds**. Nordstrom's theory has $\gamma_{\mathrm{PPN}}=-1$ in this comparison and predicts zero deflection. This is a concrete example of observations selecting between relativistic theories.[^detail-cassini][^detail-nordstrom]

Statements that “half the bending comes from time and half from space” refer to this useful weak-field coordinate decomposition. The complete bending angle is the observable; that verbal split is not a unique invariant division into two forces.

## 6. Why a dynamical metric predicts waves

In a region where the metric is close to flat, write $g_{\mu\nu}=\eta_{\mu\nu}+h_{\mu\nu}$ with small $h_{\mu\nu}$. Define the trace-reversed perturbation $\bar h_{\mu\nu}=h_{\mu\nu}-\tfrac12\eta_{\mu\nu}h$, where $h=\eta^{\alpha\beta}h_{\alpha\beta}$.

With a suitable coordinate condition, the linearized vacuum field equation takes the form

```{math}
\Box\bar h_{\mu\nu}=0,
\qquad
\Box=-\frac{1}{c^2}\frac{\partial^2}{\partial t^2}+\nabla^2.
```

This is a wave equation with propagation speed $c$. Some apparent metric changes are just coordinate changes, but radiative solutions have a genuine oscillating tidal effect: they change the relative separations of freely falling bodies.[^detail-weak]

A binary source provides a stronger test than the existence of a wave alone. Its orbital evolution and waveform are linked through the same gravitational dynamics. One estimates physical source parameters and asks whether a consistent model explains the observed signal. Agreement is conditional on the source model and noise analysis; it is not obtained by assigning an arbitrary independent function to every part of the waveform.[^detail-gw150914]

(relativity-evidence-ledger)=
## 7. Experimental evidence ledger

These are representative published measurements. They test different ingredients and regimes. “Consistent with zero” means a measured difference is compatible with zero within stated uncertainty, not that exact equality has been proven.

| Measurement | Result or observable | What it tests, and an important limitation |
| --- | --- | --- |
| Michelson–Morley, 1887 | About 0.4 fringe expected under the assumed ether model; the paper reports a displacement less than one twentieth of that amount. | Rejects the simple predicted orientation effect. Does not distinguish SR from a completed ether interpretation designed to reproduce the same observables.[^detail-mm] |
| Positive muons in a storage ring, 1977 | $\gamma=29.33$; laboratory lifetime $64.419\pm0.058\,\mu\mathrm s$. The paper reports a time-dilation test at fractional accuracy $2\times10^{-3}$, 95% confidence. | Compares moving-particle decay with an independent rest-lifetime measurement. The negative-muon rest lifetime inferred by assuming SR is not a separate independent confirmation.[^detail-muons] |
| Mass–energy comparison, 2005 | Atomic-mass differences and emitted gamma-ray energies in neutron-capture reactions agree with $\Delta E=\Delta m c^2$. | Tests the quantitative link between rest-mass differences and released energy; the analysis also uses established atomic and quantum measurement relations.[^detail-rainville] |
| GPS timing | The reference calculation gives a net clock-rate offset about $4.4647\times10^{-10}$, equivalent to about $38.6\,\mu\mathrm s$ per day. | Practical use of combined motion and gravitational clock effects. Clock calibration, Earth rotation, and orbit variations matter; GPS is not by itself a clean isolated test of every GR field equation.[^detail-gps] |
| Cassini, 2003 | $\gamma_{\mathrm{PPN}}-1=(2.1\pm2.3)\times10^{-5}$. | Tests the weak-field metric through solar radio propagation. It is neither a Lorentz-factor measurement nor a bound on every possible modification of gravity.[^detail-cassini] |
| MICROSCOPE, 2022 | $\eta_{\mathrm{Ti,Pt}}=[-1.5\pm2.3\ (\mathrm{stat})\pm1.5\ (\mathrm{syst})]\times10^{-15}$. | Tests differential free fall of the specific alloy pair. Statistical and systematic uncertainties are reported separately; this does not prove all versions of the strong equivalence principle.[^detail-microscope] |
| Double Pulsar, 2021 | The quadrupolar-radiation prediction was validated at $1.3\times10^{-4}$, or 0.013%, at 95% confidence. | A strong-gravity-body test using orbital timing and additional observables. This precision belongs to that radiation test, not to GR as a whole.[^detail-pulsar] |
| GW150914, observed 2015 and published 2016 | A gravitational-wave signal consistent with black-hole inspiral, merger, and final relaxation. | Tests strong-field dynamics through waveform structure. Interpretation includes fitted source parameters and a detector-noise model.[^detail-gw150914] |
| GW170817 / GRB 170817A, 2017 | Gamma rays followed the gravitational-wave merger time by $1.74\pm0.05$ s. The paper inferred $-3\times10^{-15}\lesssim(v_g-c)/c\lesssim7\times10^{-16}$. | Constrains propagation using an astrophysical distance and assumptions about intrinsic emission delay. It restricts many models with nonluminal gravitational waves, not every modified-gravity theory.[^detail-gw170817] |

For the MICROSCOPE row, the differential-acceleration parameter is schematically

```{math}
\eta=\frac{2(a_1-a_2)}{a_1+a_2},
```

with a sign determined by the chosen ordering. The experiment measured the electrostatic forces needed to keep its test masses in controlled equilibrium inside a drag-free satellite; it did not simply photograph two objects falling side by side.

For GPS, a deliberately simplified spherical-Earth calculation with radius $6.378137\times10^6\,\mathrm m$ and orbit radius $2.656\times10^7\,\mathrm m$ gives $+45.65\,\mu\mathrm s$ per day from the potential difference and $-7.21\,\mu\mathrm s$ per day from orbital motion. Their sum is $+38.44\,\mu\mathrm s$ per day. The difference from the reference calculation reflects the simplified model and its clock reference, not a disagreement between SR and GR.[^detail-gps]

The evidence is persuasive because it is varied and overconstrained. For example, the 2021 Double Pulsar analysis measured seven post-Keplerian parameters. A consistent pair of stellar masses must account for multiple timing effects, not just one chosen discrepancy.[^detail-pulsar]

## 8. Comparing alternatives without overstating the evidence

### A failed prediction is different from an unobservable interpretation

Suppose two theories assign exactly the same probability to every possible measurement in a specified domain. Data in that domain cannot distinguish them. One can prefer a simpler interpretation or one that connects better with other theories, but it is incorrect to call that preference an experimental refutation.

That logical distinction matters for completed Lorentz-type ether theories versus special relativity. It does not imply that all historical ether theories were equivalent, or that an arbitrary ether theory has automatically been extended to reproduce general relativity.[^detail-acuna]

### The equivalence principle is not enough to select Einstein's equation

Nordstrom's theory supplies an instructive counterexample: it can satisfy important forms of equivalence while predicting the wrong light deflection. The additional geometrical field dynamics and their experimental consequences matter.[^detail-nordstrom]

For standard massless Brans–Dicke theory with constant coupling,

```{math}
\gamma_{\mathrm{PPN}}=\frac{1+\omega}{2+\omega},
\qquad
\gamma_{\mathrm{PPN}}-1=-\frac{1}{\omega+2}.
```

For sufficiently large positive $\omega$, the solar-system parameter approaches the GR value. A Cassini-type result constrains $\omega$ under those assumptions. It does not exclude all scalar fields, screened theories, or all scalar-tensor cosmologies. Changing the field's mass or coupling can change how an experimental bound applies.[^detail-bd][^detail-cassini]

### A useful phenomenology is not yet a complete replacement

MOND-inspired proposals illustrate another distinction. A relation that describes galaxy accelerations must be supplemented by a relativistic account of light, cosmological evolution, and additional degrees of freedom before it can be compared with all the evidence above. Some such completions have been constructed. The 2021 Skordis–Zlosnik model demonstrated a particular linear-cosmology success; that result should neither be ignored nor promoted into a claim that all tests have been passed.[^detail-mond]

Quantum-gravity proposals address a further problem: the regime where quantum effects of gravity itself become important. Their existence does not erase established classical tests. Donoghue's effective-field-theory calculation also shows why the question is subtler than declaring classical gravity and quantum theory unusable together at every scale.[^detail-eft]

## 9. Exercises with answers

**Simultaneity.** In $S$, two events occur simultaneously, separated by one light-second along $x$. For a frame moving at $0.8c$, what is $\Delta t'$? Since $\Delta x=c\times1\,\mathrm s$ and $\gamma=5/3$, the answer is $-4/3\,\mathrm s$. The order reverses on changing the boost direction. The pair is spacelike, so no slower-than-light causal order is being reversed.

**A reunion of clocks.** A traveler spends a total of 10 years of laboratory coordinate time moving at speed $0.8c$ on an out-and-back path, ignoring a brief turnaround. The traveler accumulates 6 years. In a more realistic model, integrate over the acceleration segments rather than appending a separate unexplained “acceleration penalty.”

**A clock at greater height.** Two supported clocks near Earth's surface differ in height by $1\,\mathrm{km}$. With constant $g=9.81\,\mathrm{m\,s^{-2}}$, their fractional rate difference is $g\Delta h/c^2\approx1.09\times10^{-13}$. The higher clock gains about **9.43 nanoseconds per day**. This is a leading estimate that neglects rotation and local variations of the gravitational field.

**The Newtonian limit.** Expand $\gamma$ through order $v^4/c^4$. Insert it into $E=\gamma mc^2$ and subtract $mc^2$. The result is $K=\tfrac12mv^2+\tfrac38mv^4/c^2+\cdots$. The correction is small at ordinary speeds because its size relative to the Newtonian term is of order $v^2/c^2$.

**A falsification question.** A new theory predicts exactly the same solar-system metric as GR but a different gravitational-wave propagation speed. Would Mercury's precession alone distinguish it? No. One needs an observation sensitive to the differing prediction, such as a suitably modeled multimessenger propagation test. Conversely, passing that propagation test alone would not establish agreement with every other GR prediction.

## Sources and scope

The calculations in Sections 1–6 and 9 are worked deductions from the stated models. Numerical examples use rounded inputs and are not replacements for observational data analysis. The references below provide the theoretical frameworks and the original reports underlying the evidence ledger.

[^detail-einstein]: Albert Einstein (1905), [On the Electrodynamics of Moving Bodies](https://fourmilab.ch/etexts/einstein/specrel/www/), particularly the synchronization discussion.

[^detail-sr]: David Tong, [Dynamics and Relativity, Chapter 7](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf).

[^detail-geometry]: David Tong, [General Relativity, Chapter 3](https://davidtong.org/teaching/general-relativity/grhtml/S3).

[^detail-field]: David Tong, [General Relativity, Chapter 4](https://davidtong.org/teaching/general-relativity/grhtml/S4).

[^detail-weak]: David Tong, [General Relativity, Chapter 5](https://davidtong.org/teaching/general-relativity/grhtml/S5).

[^detail-gr1]: David Tong, [General Relativity, Chapter 1](https://davidtong.org/teaching/general-relativity/grhtml/S1), including Schwarzschild motion and the leading solar-system calculations.

[^detail-mercury]: Michel Janssen and Jurgen Renn (2021), [Einstein and the Perihelion Motion of Mercury](https://arxiv.org/abs/2111.11238).

[^detail-mm]: A. A. Michelson and E. W. Morley (1887), [On the Relative Motion of the Earth and the Luminiferous Ether](https://en.wikisource.org/wiki/On_the_Relative_Motion_of_the_Earth_and_the_Luminiferous_Ether), original-paper transcription.

[^detail-muons]: J. Bailey et al. (1977), [Measurements of relativistic time dilatation for positive and negative muons in a circular orbit](https://www.nature.com/articles/268301a0), Nature 268, 301–305.

[^detail-rainville]: S. Rainville et al. (2005), [A direct test of E=mc2](https://www.nature.com/articles/4381096a), Nature 438, 1096–1097.

[^detail-gps]: Neil Ashby (2003), [Relativity in the Global Positioning System](https://link.springer.com/article/10.12942/lrr-2003-1), especially the reference surface and clock corrections in Sections 3–6. Equation 35 gives the reference net rate offset used above.

[^detail-cassini]: B. Bertotti, L. Iess, and P. Tortora (2003), [A test of general relativity using radio links with the Cassini spacecraft](https://www.nature.com/articles/nature01997), Nature 425, 374–376.

[^detail-microscope]: P. Touboul et al. (2022), [MICROSCOPE Mission: Final Results of the Test of the Equivalence Principle](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.129.121102), Physical Review Letters 129, 121102.

[^detail-pulsar]: M. Kramer et al. (2021), [Strong-field Gravity Tests with the Double Pulsar](https://arxiv.org/abs/2112.06795), Physical Review X 11, 041050.

[^detail-gw150914]: B. P. Abbott et al., LIGO and Virgo (2016), [Observation of Gravitational Waves from a Binary Black Hole Merger](https://arxiv.org/abs/1602.03837), Physical Review Letters 116, 061102.

[^detail-gw170817]: B. P. Abbott et al. (2017), [Gravitational Waves and Gamma-rays from a Binary Neutron Star Merger: GW170817 and GRB 170817A](https://arxiv.org/abs/1710.05834), Astrophysical Journal Letters 848, L13.

[^detail-acuna]: Pablo Acuna (2014), [On the empirical equivalence between special relativity and Lorentz's ether theory](https://www.sciencedirect.com/science/article/pii/S1355219814000124).

[^detail-nordstrom]: Nathalie Deruelle (2011), [Nordstrom's scalar theory of gravity and the equivalence principle](https://arxiv.org/abs/1104.4608), especially Section III.

[^detail-bd]: C. Brans and R. H. Dicke (1961), [Mach's Principle and a Relativistic Theory of Gravitation](https://journals.aps.org/pr/abstract/10.1103/PhysRev.124.925), Physical Review 124, 925–935.

[^detail-mond]: C. Skordis and T. Zlosnik (2021), [A new relativistic theory for Modified Newtonian Dynamics](https://arxiv.org/abs/2007.00082), Physical Review Letters 127, 161302.

[^detail-eft]: J. F. Donoghue (1994), [General relativity as an effective field theory: The leading quantum corrections](https://arxiv.org/abs/gr-qc/9405057), Physical Review D 50, 3874–3888.
