---
title: "Understanding Einstein's Relativity: Why, How, and Evidence"
description: "A mathematical but approachable introduction to special and general relativity, the problems they solve, the evidence, and the alternatives."
---

**The central idea is not that everything is relative. It is that the laws of physics preserve a different structure from the one Newton assumed.** Special relativity replaces universal time with an invariant spacetime interval. General relativity makes that spacetime geometry a physical field that responds to energy and momentum.

This note assumes calculus, vectors, and classical mechanics, but not prior knowledge of relativity. The [mathematical companion](relativity-derivations-and-evidence.md) contains longer derivations, an experimental evidence ledger, and exercises. Experimental results below are identified by their publication dates; they are selected examples, not a claim to list every test or the latest bound in every field.

## 1. What changes, and what survives?

In Newtonian mechanics, two observers moving relative to each other can disagree about position and velocity, but agree about elapsed time. In special relativity, they can also disagree about elapsed coordinate time and about which distant events are simultaneous. Their measurements nevertheless obey exact transformation rules.

The mathematical replacement is:

```{math}
\underbrace{dt'=dt}_{\text{Newtonian time}}
\quad\longrightarrow\quad
\underbrace{ds^2=-c^2dt^2+dx^2+dy^2+dz^2}_{\text{special-relativistic interval}}
\quad\longrightarrow\quad
\underbrace{ds^2=g_{\mu\nu}(x)\,dx^\mu dx^\nu}_{\text{general-relativistic metric}}.
```

An **event** is something at a particular place and time, such as a flash or two particles colliding. An **invariant** is a quantity different coordinate systems assign the same value. The **metric** is the mathematical rule for calculating intervals from coordinate differences. We will build up the last expression later.

Newtonian physics remains an excellent approximation when speeds are small compared with $c$ and gravitational effects are sufficiently weak for the required accuracy. Relativity must reproduce those successes, not discard them. Its corrections can still matter at low speeds when clocks are precise or small effects accumulate over many orbits. The relevant questions are scale and accuracy, not whether an object looks ordinary.[^tong-sr][^tong-gr1]

## 2. Why change Newton's picture at all?

### Mechanics and electromagnetism did not fit together

Let an inertial frame $S'$ move at speed $v$ along the $x$ axis of another inertial frame $S$. An **inertial frame** is one in which a freely moving object travels with constant velocity. Newtonian mechanics uses the Galilean transformation

```{math}
x'=x-vt,\qquad t'=t.
```

Differentiating gives $u'=u-v$. Thus a light ray moving at $c$ in $S$ would move at $c-v$ in $S'$.

However, Maxwell's vacuum equations lead to a wave equation with characteristic speed

```{math}
\nabla^2\mathbf E-\frac{1}{c^2}\frac{\partial^2\mathbf E}{\partial t^2}=0,
\qquad c=\frac{1}{\sqrt{\epsilon_0\mu_0}}.
```

This creates a choice. Perhaps Maxwell's equations have their familiar form only in a preferred frame. Perhaps electromagnetism must change. Or perhaps the Galilean rules for space and time must change. Maxwell's equations alone do not decide between these possibilities.

The proposed preferred frame was often associated with a **luminiferous ether**: a medium supposed to carry light, as air carries sound. That was a reasonable hypothesis to investigate. The problem was finding observable motion relative to it.

Einstein's 1905 paper also emphasized a conceptual asymmetry: moving a magnet near a conductor and moving the conductor near the magnet give an induction effect governed by relative motion, yet the then-standard explanations treated the cases differently. He sought a unified account of mechanics and electromagnetism, not merely a correction to one instrument.[^einstein1905]

### What Michelson and Morley actually tested

Michelson and Morley compared the travel times of light along perpendicular arms of an interferometer. In a simple stationary-ether model, Earth's motion should make the round trips depend on arm orientation. Rotating the apparatus should change the interference pattern.

Their 1887 paper estimated an expected shift of about **0.4 fringe** for the assumed orbital motion. The observed displacement was much smaller: they described it as certainly less than one twentieth of that prediction. This was powerful evidence against that simple combination of ether assumptions and ordinary kinematics.[^mm]

It was **not** a logical proof that every conceivable ether model was impossible. A theory that also changes moving rulers and clocks can predict a null result. Nor should the history be reduced to “one experiment happened, so Einstein immediately invented relativity.” Lorentz and Poincare also developed crucial parts of the mathematical framework.[^acuna]

The deeper lesson is that experiments constrain a package of assumptions. When a prediction fails, one must identify which assumption to change.

## 3. Special relativity: change the meaning of simultaneity

Einstein's starting principles are that the laws of physics have the same form in all inertial frames, and that light in vacuum has speed $c$ in those frames, independent of the source's motion. With the usual assumptions of uniform space and time, spatial isotropy, and standard clock synchronization, the transformation becomes:[^einstein1905]

```{math}
x'=\gamma(x-vt),\qquad
 t'=\gamma\left(t-\frac{vx}{c^2}\right),\qquad
\gamma=\frac{1}{\sqrt{1-v^2/c^2}}.
```

The $y$ and $z$ coordinates are unchanged for this particular boost. The companion derives these equations rather than treating them as a formula to memorize.

The most important new term is **$-vx/c^2$**. The time assigned to an event depends on its position as well as on the original time.

Suppose two events occur at different locations but at the same time in $S$. Then

```{math}
\Delta t=0
\quad\Rightarrow\quad
\Delta t'=-\gamma\frac{v\Delta x}{c^2}.
```

They are generally not simultaneous in $S'$.

This is not just the delay before someone sees a flash. Each frame has already accounted for signal travel and assigned event times using its synchronized clocks. The disagreement remains after that correction. Ordinary perspective changes what light reaches your eyes; relativity changes the relationship between operationally defined coordinates.

### Why this is not a contradiction

Imagine that two people rotate their coordinate axes on a sheet of paper. They disagree about a vector's horizontal and vertical components, but agree about its Euclidean length. In relativity, changing inertial frames mixes time and position while preserving the spacetime interval. The analogy is useful, although the minus sign in the interval makes the geometry different from an ordinary rotation.

Substituting the Lorentz transformation directly gives

```{math}
-c^2\Delta t'^2+\Delta x'^2
=-c^2\Delta t^2+\Delta x^2.
```

There is an objective structure beneath the different descriptions. “Relative” does not mean arbitrary.

## 4. What clocks and rulers actually measure

### A light clock explains time dilation

Imagine two mirrors separated vertically by a distance $L$, with a light pulse bouncing between them. In the clock's rest frame, one round trip takes

```{math}
\Delta\tau=\frac{2L}{c}.
```

Now describe that same clock from a frame in which it moves horizontally at speed $v$. The pulse follows a longer diagonal path between moving mirrors. Since its speed is still $c$, one half-trip obeys

```{math}
\left(\frac{c\Delta t}{2}\right)^2
=L^2+\left(\frac{v\Delta t}{2}\right)^2.
```

Solving yields

```{math}
\Delta t=\gamma\Delta\tau.
```

Here **proper time**, written $\tau$, means the time accumulated by the clock following its own path. It does not mean that one observer's coordinate system is uniquely “proper” or correct.

At $v=0.8c$, $\gamma=5/3$. A clock moving at that speed accumulates 3 seconds while 5 seconds pass in the chosen inertial laboratory frame.

A light clock is a transparent way to derive the effect, not a claim that only light-based clocks slow. For an ideal clock on a general path through flat spacetime,

```{math}
\tau=\int \sqrt{1-\frac{v(t)^2}{c^2}}\,dt.
```

The testable claim is that different good clocks measure this same proper time, regardless of their internal mechanism. Particle-decay experiments provide one very different kind of clock.[^muons]

### The twin example is about different paths

Suppose one person remains at rest in an inertial frame while another travels out and back at $0.8c$, with a brief turnaround. If the round trip lasts 10 years in the first person's frame, the traveler's elapsed time approaches

```{math}
10\sqrt{1-0.8^2}=6\text{ years}
```

as the turnaround duration becomes negligible.

There is no contradiction in each traveler describing the other's clock as slow during uniform relative motion. The outbound and inbound descriptions use different inertial frames and different assignments of distant simultaneity. The two complete journeys are not symmetric.

Acceleration identifies the change of path; it is not a mysterious process that damages a clock. Special relativity can describe accelerated motion in flat spacetime. General relativity is not required merely because something accelerates.

### Length contraction also depends on simultaneity

Let a rod have rest length $L_0$. To measure its length in a frame where it moves, record both endpoint positions **at the same time in that measuring frame**. The Lorentz transformation then gives

```{math}
L=\frac{L_0}{\gamma}.
```

Different frames select different pairs of simultaneous endpoint events. That is why length contraction and the relativity of simultaneity belong together. This is a measurement of length, not a description of what a camera photograph must look like.

### Speeds no longer add in the Newtonian way

Taking the ratio of transformed position and time differences gives

```{math}
u=\frac{u'+v}{1+u'v/c^2}.
```

For $u'=v=0.8c$, the result is $u\approx0.9756c$, not $1.6c$. Setting $u'=c$ gives $u=c$.

Two objects may have a separation that decreases at more than $c$ in a third frame. That is not the speed one object measures for the other in its own rest frame, and it does not itself transmit information faster than light.

## 5. Why energy and momentum must change too

Once the transformation rules change, the Newtonian formulas for momentum and kinetic energy cannot remain exact at all speeds. Relativistic mechanics organizes energy and momentum into one four-dimensional object. For a free massive particle,

```{math}
\mathbf p=\gamma m\mathbf v,\qquad
E=\gamma mc^2,\qquad
E^2=p^2c^2+m^2c^4.
```

Here $m$ is invariant mass. We do not need the older convention of calling $\gamma m$ a velocity-dependent “relativistic mass.”

At rest, $p=0$, so **$E_0=mc^2$**. The subscript matters: $mc^2$ is rest energy, not the total energy of a moving massive object. A photon has zero invariant mass but nonzero energy, satisfying $E=pc$.

Expanding for $v\ll c$ gives

```{math}
E=mc^2+\frac12mv^2+\frac38\frac{mv^4}{c^2}+\cdots.
```

The familiar kinetic energy is the leading motion-dependent term. This is a concrete example of the older theory surviving inside the newer one.

The companion derives $E$ and $\mathbf p$ from the relativistic free-particle action and the classical definitions of canonical momentum and Hamiltonian. This makes the connection to classical mechanics explicit.[^tong-sr]

For a composite system, rest mass includes internal energy. Adding heat to a closed box increases its mass by the added energy divided by $c^2$. A bound system can have less mass than its separated constituents because energy was released in binding. In 2005, Rainville and colleagues directly compared nuclear-reaction mass differences with emitted gamma-ray energies to test that relationship.[^rainville]

## 6. Why special relativity was not enough for gravity

Newton's gravitational force depends on another body's position at the same universal time. That instantaneous picture does not fit straightforwardly with a theory that has no universal distant simultaneity. Simply inserting a travel-time delay into an inverse-square force is not a complete relativistic theory: one must also specify the field's dynamics, its energy and momentum, and its interaction with matter.

There was also a striking clue already present in classical mechanics. Write

```{math}
m_{\mathrm i}\mathbf a=m_{\mathrm g}\mathbf g.
```

The inertial mass $m_{\mathrm i}$ describes resistance to acceleration. The gravitational mass $m_{\mathrm g}$ describes response to gravity. If their ratio is universal, all sufficiently small freely falling test bodies follow the same motion in the same external field, regardless of composition. This is very different from an electric force, for which the ratio of charge to mass varies greatly.

Einstein took this universality seriously. A freely falling laboratory can remove the local effects of gravity on freely falling objects. Inside a small falling capsule, a released ball floats beside you rather than falling toward the floor. Conversely, a rocket accelerating through otherwise empty space can make its floor push on you as a floor on Earth does. This is the route to the **equivalence principle**.[^tong-gr1]

The statement is local and concerns idealized experiments. Air resistance, large object size, spin, and an object's own gravity can require additional treatment. The equivalence principle is not a claim that every imaginable experiment in a finite laboratory must look identical in every gravitational field.

### What cannot be removed: tidal effects

Release two nearby objects above Earth. Their trajectories are directed toward Earth's center, so their separation can change. A falling observer can eliminate the apparent gravitational acceleration at one location, but cannot in general eliminate these relative accelerations throughout a region.

In the Newtonian approximation, with separation $\xi^j$ and potential $\Phi$,

```{math}
\frac{d^2\xi^i}{dt^2}\approx
-\frac{\partial^2\Phi}{\partial x^i\partial x^j}\,\xi^j.
```

The first derivative controls ordinary acceleration; the second derivative describes how it changes across space. General relativity encodes this surviving tidal structure in spacetime **curvature**. This is a more useful physical meaning of curvature than a picture of a ball depressing a rubber sheet.[^tong-gr3]

## 7. General relativity: geometry becomes dynamical

Set $x^0=ct$ and let $x^1,x^2,x^3$ be spatial coordinates. Greek indices run from 0 to 3, and a repeated upper/lower index means a sum. Then

```{math}
ds^2=g_{\mu\nu}(x)\,dx^\mu dx^\nu.
```

Think of $g_{\mu\nu}$ as a symmetric matrix at each event. It tells us how coordinates translate into clock readings and measured intervals. In flat inertial coordinates,

```{math}
g_{\mu\nu}=\eta_{\mu\nu}
=\operatorname{diag}(-1,1,1,1).
```

In a general gravitational field, its components can depend on position and time. But coordinate-dependent components alone do not prove curvature: even flat space has nonconstant metric components in polar coordinates. The invariant tidal structure is the important distinction.

For a massive clock, $ds^2=-c^2d\tau^2$. For a light ray, $ds^2=0$. Every local freely falling laboratory measures light in vacuum at $c$, although a coordinate speed over an extended region need not equal $c$.

### The motion law

An ideal freely falling test body follows a **geodesic**, the spacetime version of a straightest possible path:

```{math}
\frac{d^2x^\mu}{d\tau^2}
+\Gamma^\mu_{\alpha\beta}
\frac{dx^\alpha}{d\tau}
\frac{dx^\beta}{d\tau}=0.
```

The $\Gamma$ coefficients are calculated from first derivatives of the metric. They are not a second, independent gravitational field. For light, use an affine path parameter instead of proper time, because proper time along a light ray is zero.

The geometric picture explains a useful reversal of intuition: an orbiting astronaut is freely falling, while someone standing on Earth is being pushed away from free fall by the ground. Gravity has not vanished in orbit; support forces have.[^tong-gr1][^tong-gr3]

### The field law

How is the metric determined? Einstein's field equation is

```{math}
G_{\mu\nu}+\Lambda g_{\mu\nu}
=\frac{8\pi G}{c^4}T_{\mu\nu},
\qquad
G_{\mu\nu}=R_{\mu\nu}-\frac12R g_{\mu\nu}.
```

The meanings are:

- $G_{\mu\nu}$ is the **Einstein tensor**, built from curvature. It is not the same object as Newton's constant $G$.
- $T_{\mu\nu}$ is the **stress-energy tensor**: energy density, momentum density, energy flow, and stresses, including pressure.
- $\Lambda$ is the cosmological constant, an allowed term in the gravitational field equation.

The equation does not merely say that mass causes gravity. Energy, momentum, and stress enter together. Because the metric also determines motion and the curvature terms depend nonlinearly on that metric, matter and geometry must be solved consistently.

Why this equation? It has the required coordinate-independent form, is compatible with local energy-momentum conservation, and recovers Newtonian gravity in the appropriate limit. Restricting attention to a four-dimensional metric theory with local, second-order field equations strongly singles out this structure, including the allowed $\Lambda$ term. But the equivalence principle **alone** does not derive the equation: extra fields or higher-derivative dynamics allow alternatives.[^tong-gr4]

Also, empty space need not be flat. With $T_{\mu\nu}=0$ and $\Lambda=0$, the equation sets the Ricci tensor to zero, not the entire curvature tensor. The exterior field of a star and gravitational waves can both exist in vacuum.

## 8. How Newton's gravity comes back

For a weak, nearly static field, with $|\Phi|/c^2\ll1$, the time-time metric component is approximately

```{math}
g_{00}\approx-\left(1+\frac{2\Phi}{c^2}\right).
```

The geodesic equation for slow motion reduces to

```{math}
\frac{d^2\mathbf x}{dt^2}\approx-\nabla\Phi,
```

while the field equation, for ordinary slow matter and negligible $\Lambda$ on the scale considered, reduces to

```{math}
\nabla^2\Phi=4\pi G\rho.
```

These are Newton's gravitational equations. The companion shows the intermediate steps, including where the factor $4\pi$ comes from.[^tong-gr5]

The same approximation gives a particularly useful clock formula:

```{math}
\frac{d\tau}{dt}\approx
1+\frac{\Phi}{c^2}-\frac{v^2}{2c^2}.
```

It contains both gravitational and motion-related time dilation. With $\Phi=-GM/r$, a stationary clock farther from the central mass runs faster relative to this common time coordinate. A moving clock has the opposite motion-related correction.

For a typical GPS orbit, a leading estimate gives roughly **+46 microseconds per day** from the gravitational difference and **−7 microseconds per day** from orbital motion, for a net effect near **+38 microseconds per day** relative to clocks on Earth's reference surface. A full calculation includes Earth's rotation, the reference time scale, and orbital variations. Ashby's technical account explains how these effects enter satellite timing.[^gps]

## 9. What observations support the theory?

A strong case does not rest on one famous eclipse. It combines measurements of different phenomena, at different scales, with different systematic errors. The [evidence ledger](relativity-derivations-and-evidence.md#relativity-evidence-ledger) gives the quantitative details and limitations.

### Moving particles: time dilation

A muon is an unstable particle and therefore a statistical clock. A 1977 storage-ring experiment measured a positive-muon lifetime of about **64.4 microseconds** at a Lorentz factor of about **29.3**, compared with a rest lifetime of about **2.2 microseconds**. This tests the predicted relationship between laboratory time and proper decay time, not a visual illusion or delayed arrival of an image.[^muons]

### Mercury: an old discrepancy explained

Mercury's orbital ellipse slowly changes orientation. Newtonian calculations including other planets explain most of that motion, but historically left an extra contribution of about **43 arcseconds per century**. An arcsecond is $1/3600$ of a degree.

General relativity predicts, to leading order for an orbit around a nearly spherical central mass,

```{math}
\Delta\varpi=\frac{6\pi GM}{a(1-e^2)c^2}
\quad\text{per orbit},
```

where $a$ is the semimajor axis and $e$ the eccentricity. For Mercury, this supplies the missing contribution. The residual was known before Einstein's final 1915 theory: this is an explanation of an existing anomaly, not a completely blind prediction of new data.[^mercury]

### Light propagation: bending and time delay

For light passing a spherical mass with impact parameter $b$, the leading general-relativistic deflection is

```{math}
\alpha\approx\frac{4GM}{bc^2}.
```

At the Sun's limb this is about **1.75 arcseconds**. A simple Newtonian corpuscular calculation gives half that value. The 1919 eclipse observations were historically important, but their role should not be confused with the much broader and more precise later evidence.[^tong-gr1]

Gravity also changes radio-signal travel times. Cassini's 2003 experiment measured the parameter controlling spatial curvature in a weak-field test framework to be consistent with general relativity at a scale of a few parts in $10^5$. This tests more than the loose statement that “gravity affects light.”[^cassini]

### Universality of free fall

The MICROSCOPE mission's 2022 final result compared titanium-alloy and platinum-alloy test masses. It found no difference in their gravitational acceleration within uncertainties of a few parts in $10^{15}$. This is exceptionally strong support for universality of free fall for those materials and conditions. It is not a measurement proving exact equality for every possible kind of matter.[^microscope]

### Binary pulsars and gravitational waves

General relativity predicts that changing gravitational fields can radiate. A binary system consequently loses orbital energy in a calculable way. In a 2021 analysis of the Double Pulsar, the prediction for quadrupolar gravitational radiation was validated at the **0.013% level, at 95% confidence**, after accounting for relevant additional effects.[^pulsar]

The GW150914 observation in 2015, published in 2016, directly detected a signal matching the inspiral, merger, and settling of two black holes. The evidence is not just “something oscillated”; the changing waveform can be compared with relativistic predictions.[^gw150914]

In 2017, gravitational waves and gamma rays from GW170817 also strongly constrained differences between gravitational-wave speed and light speed. Inferring a propagation bound requires assumptions about the source's emission delay. The observation does not establish that the signals were emitted at exactly the same instant.[^gw170817]

**Different tests establish different things.** A free-fall test supports an ingredient shared by several theories. Light-deflection tests constrain a particular part of the weak-field metric. Binary systems test dynamics and radiation. Their combined consistency is far more informative than treating every result as an independent proof of every equation.

## 10. What about the alternatives?

It is useful to separate a theory that is excluded, one that is approximately useful, and one that makes the same observable predictions.

| Approach | What it tries to preserve or change | What can fairly be concluded? |
| --- | --- | --- |
| Newtonian mechanics and gravity | Universal time and instantaneous gravitational interaction | Excellent approximation in its domain, but not an exact account of relativistic clock effects, light propagation, or gravitational radiation. |
| Simple stationary ether with Galilean rulers and clocks | A preferred medium for light, without relativistic changes to measurement | The expected orientation-dependent effect was inconsistent with Michelson–Morley observations. This conclusion applies to that model's assumptions.[^mm] |
| Completed Lorentz-type ether interpretation | A preferred frame, but rulers, clocks, and dynamics reproduce Lorentz transformations | When constructed to match special relativity's observable predictions, it cannot be rejected by experiments that both descriptions predict identically. Extra unobservable structure is a theoretical issue, not an experimental falsification.[^acuna] |
| Nordstrom's scalar gravity | A relativistic gravitational field represented by a scalar rather than Einstein's full metric dynamics | It predicts no gravitational bending of light in the relevant model and fails observed light-propagation tests. Satisfying important equivalence principles was not sufficient.[^nordstrom] |
| Scalar-tensor gravity, including Brans–Dicke theory | A metric plus an additional scalar field | Experiments restrict the extra field's coupling and behavior. A family with a limit close to GR is not excluded in its entirety by agreement with GR.[^bd][^cassini] |
| Relativistic theories motivated by MOND | Explain low-acceleration galactic behavior through changed gravitational dynamics | A galactic acceleration rule alone is not a complete theory of light, cosmology, and gravitational waves. Relativistic completions exist and require model-by-model testing.[^mond] |

Nordstrom's theory is especially instructive. It can be expressed using a metric proportional to a flat metric. Such a rescaling changes intervals but preserves unparameterized null trajectories. Therefore it cannot provide the observed solar bending. The problem is a specific wrong prediction, not that using a scalar is intrinsically unscientific.[^nordstrom]

Brans–Dicke theory illustrates a different situation. In its standard massless, constant-coupling weak-field setting, a large positive coupling parameter $\omega$ makes its predictions approach those of GR. Better experiments then constrain how far away from that limit the theory may be. Agreement with Einstein does not mathematically eliminate every neighboring model.[^bd]

Nor is it accurate to say that every MOND-related theory automatically fails every cosmological observation. For example, Skordis and Zlosnik's 2021 relativistic proposal demonstrated agreement with observed cosmic microwave background and matter power spectra at linear scales. That is a specific result for a specific model, not proof of success on every astrophysical test.[^mond]

The correct question is: **Which predictions differ, which measurements distinguish them, and which parameter ranges survive?**

## 11. Where the explanation stops

Relativity is a framework with a tested domain, not a declaration that physics is finished.

General relativity is classical. Understanding gravity when quantum effects of spacetime become important requires more. But “GR and quantum mechanics are completely incompatible” is too strong: low-energy quantum corrections to gravity can be calculated using effective field theory. The harder question is the behavior beyond that controlled regime.[^eft]

Likewise, singularities in classical solutions indicate that the theory can become incomplete in describing physical histories; they are not direct observations of literal infinite densities. And an explanation of cosmological data always involves assumptions about matter and initial conditions as well as gravity. One should not silently attribute every success or every unresolved issue of a whole cosmological model to Einstein's field equation alone.[^tong-gr4][^mond]

The durable conclusion is this: **Einstein's theories connect a small set of structural principles to many quantitative effects that Newton's exact framework cannot jointly explain.** Some alternatives fail those tests. Some remain close competitors in restricted regimes. Some are different descriptions of the same predictions. Keeping those categories separate is part of understanding the evidence.

## 12. A useful route through the mathematics

First derive the Lorentz transformation, then calculate proper times along two different paths. Next derive relativistic energy and momentum and recover the Newtonian limit. Only after those ideas are comfortable should the metric, geodesics, and curvature become the main focus.

The [companion note](relativity-derivations-and-evidence.md) follows that route and then derives the Newtonian gravitational limit and leading solar-system effects. David Tong's [Dynamics and Relativity lectures](https://davidtong.org/teaching/dynamics-and-relativity/) provide an undergraduate starting point; his [General Relativity lectures](https://davidtong.org/teaching/general-relativity/) continue into the geometric theory.

## Sources

[^einstein1905]: Albert Einstein (1905), [On the Electrodynamics of Moving Bodies](https://fourmilab.ch/etexts/einstein/specrel/www/), English translation. Original source for the postulates, synchronization, and magnet–conductor motivation.

[^mm]: A. A. Michelson and E. W. Morley (1887), [On the Relative Motion of the Earth and the Luminiferous Ether](https://en.wikisource.org/wiki/On_the_Relative_Motion_of_the_Earth_and_the_Luminiferous_Ether), transcription of the original paper. See the expected and observed fringe displacements in the results discussion.

[^acuna]: Pablo Acuna (2014), [On the empirical equivalence between special relativity and Lorentz's ether theory](https://doi.org/10.1016/j.shpsb.2014.01.002). A research analysis of the distinction between predictive equivalence and theoretical interpretation.

[^tong-sr]: David Tong, [Dynamics and Relativity, Chapter 7](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf). Author's lecture notes for the standard mathematical framework. Derivations and worked examples in this notebook are written out independently.

[^tong-gr1]: David Tong, [General Relativity, Chapter 1](https://davidtong.org/teaching/general-relativity/grhtml/S1). Introduction to equivalence, metrics, and solar-system effects.

[^tong-gr3]: David Tong, [General Relativity, Chapter 3](https://davidtong.org/teaching/general-relativity/grhtml/S3). Differential geometry, geodesics, and curvature.

[^tong-gr4]: David Tong, [General Relativity, Chapter 4](https://davidtong.org/teaching/general-relativity/grhtml/S4). Einstein's equation, the action, conservation, and qualifications to uniqueness.

[^tong-gr5]: David Tong, [General Relativity, Chapter 5](https://davidtong.org/teaching/general-relativity/grhtml/S5). Weak gravitational fields and gravitational waves.

[^muons]: J. Bailey et al. (1977), [Measurements of relativistic time dilatation for positive and negative muons in a circular orbit](https://doi.org/10.1038/268301a0), Nature 268, 301–305. The positive-muon comparison provides the stated test against an independently measured rest lifetime.

[^rainville]: S. Rainville et al. (2005), [A direct test of E=mc2](https://doi.org/10.1038/4381096a), Nature 438, 1096–1097. Compares atomic-mass differences with gamma-ray energies in neutron-capture reactions.

[^gps]: Neil Ashby (2003), [Relativity in the Global Positioning System](https://doi.org/10.12942/lrr-2003-1), especially Sections 3–6. Technical treatment of coordinate time, clock corrections, and an orbiting-receiver experiment.

[^mercury]: Michel Janssen and Jurgen Renn (2021), [Einstein and the Perihelion Motion of Mercury](https://arxiv.org/abs/2111.11238). Historical research on the anomaly and Einstein's calculations; see also Tong's Chapter 1 for the orbit equation.

[^cassini]: B. Bertotti, L. Iess, and P. Tortora (2003), [A test of general relativity using radio links with the Cassini spacecraft](https://doi.org/10.1038/nature01997), Nature 425, 374–376.

[^microscope]: P. Touboul et al. (2022), [MICROSCOPE Mission: Final Results of the Test of the Equivalence Principle](https://doi.org/10.1103/PhysRevLett.129.121102), Physical Review Letters 129, 121102.

[^pulsar]: M. Kramer et al. (2021), [Strong-field Gravity Tests with the Double Pulsar](https://arxiv.org/abs/2112.06795), Physical Review X 11, 041050. The quoted precision concerns its test of quadrupolar radiation, not all possible departures from GR.

[^gw150914]: B. P. Abbott et al., LIGO and Virgo (2016), [Observation of Gravitational Waves from a Binary Black Hole Merger](https://arxiv.org/abs/1602.03837), Physical Review Letters 116, 061102.

[^gw170817]: B. P. Abbott et al. (2017), [Gravitational Waves and Gamma-rays from a Binary Neutron Star Merger: GW170817 and GRB 170817A](https://arxiv.org/abs/1710.05834), Astrophysical Journal Letters 848, L13.

[^nordstrom]: Nathalie Deruelle (2011), [Nordstrom's scalar theory of gravity and the equivalence principle](https://arxiv.org/abs/1104.4608), especially Section III on null trajectories and the predicted light deflection.

[^bd]: C. Brans and R. H. Dicke (1961), [Mach's Principle and a Relativistic Theory of Gravitation](https://doi.org/10.1103/PhysRev.124.925), Physical Review 124, 925–935.

[^mond]: C. Skordis and T. Zlosnik (2021), [A new relativistic theory for Modified Newtonian Dynamics](https://arxiv.org/abs/2007.00082), Physical Review Letters 127, 161302. The cosmological comparison cited here is at linear scales.

[^eft]: J. F. Donoghue (1994), [General relativity as an effective field theory: The leading quantum corrections](https://arxiv.org/abs/gr-qc/9405057), Physical Review D 50, 3874–3888.
