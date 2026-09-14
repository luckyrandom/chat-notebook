---
date: 2026-09-13
title: "Understanding Einstein's Relativity: Why, How, and Evidence"
description: "A mathematical but approachable introduction to special and general relativity, the problems they solve, the evidence, and the alternatives."
---

**The central idea is not that everything is relative. It is that the laws of physics preserve a different structure from the one Newton assumed.** Special relativity replaces universal time with an invariant spacetime interval. General relativity makes that spacetime geometry a physical field that responds to energy and momentum.

This note assumes calculus, vectors, and classical mechanics, but not prior knowledge of relativity. The [mathematical reference sections](#relativity-reference) contain longer derivations, an experimental evidence ledger, and exercises. Experimental results below are identified by their publication dates; they are selected examples, not a claim to list every test or the latest bound in every field.

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

The $y$ and $z$ coordinates are unchanged for this particular boost. The reference sections derive these equations rather than treating them as a formula to memorize.

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

The reference sections derive $E$ and $\mathbf p$ from the relativistic free-particle action and the classical definitions of canonical momentum and Hamiltonian. This makes the connection to classical mechanics explicit.[^tong-sr]

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

These are Newton's gravitational equations. The reference sections show the intermediate steps, including where the factor $4\pi$ comes from.[^tong-gr5]

The same approximation gives a particularly useful clock formula:

```{math}
\frac{d\tau}{dt}\approx
1+\frac{\Phi}{c^2}-\frac{v^2}{2c^2}.
```

It contains both gravitational and motion-related time dilation. With $\Phi=-GM/r$, a stationary clock farther from the central mass runs faster relative to this common time coordinate. A moving clock has the opposite motion-related correction.

For a typical GPS orbit, a leading estimate gives roughly **+46 microseconds per day** from the gravitational difference and **−7 microseconds per day** from orbital motion, for a net effect near **+38 microseconds per day** relative to clocks on Earth's reference surface. A full calculation includes Earth's rotation, the reference time scale, and orbital variations. Ashby's technical account explains how these effects enter satellite timing.[^gps]

## 9. What observations support the theory?

A strong case does not rest on one famous eclipse. It combines measurements of different phenomena, at different scales, with different systematic errors. The [evidence ledger](#relativity-evidence-ledger) gives the quantitative details and limitations.

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

The [reference sections](#relativity-reference) follow that route and then derives the Newtonian gravitational limit and leading solar-system effects. David Tong's [Dynamics and Relativity lectures](https://davidtong.org/teaching/dynamics-and-relativity/) provide an undergraduate starting point; his [General Relativity lectures](https://davidtong.org/teaching/general-relativity/) continue into the geometric theory.

(relativity-reference)=
## Derivations, experimental evidence, and exercises

These reference sections separate mathematical deductions from measured results. The derivations use stated idealizations; experimental uncertainties belong to the individual tests, not to relativity as one universal percentage.

Throughout, $c$ is the vacuum speed of light, $G$ is Newton's gravitational constant, and the metric signature is $(-,+,+,+)$. Set $x^0=ct$. Greek indices run from 0 to 3; spatial indices run from 1 to 3. Repeated upper/lower indices are summed. A prime labels another coordinate frame, not a derivative, except where derivatives with respect to an orbital angle are explicitly introduced.

Open a section for the supporting detail; the main explanation above remains the reading path.

(relativity-reference-1-deriving-the-lorentz-transformation)=
````{dropdown} 1. Deriving the Lorentz transformation

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
````

(relativity-reference-2-the-interval-proper-time-and-causality)=
````{dropdown} 2. The interval, proper time, and causality

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
````

(relativity-reference-3-energy-and-momentum-from-the-action)=
````{dropdown} 3. Energy and momentum from the action

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
````

(relativity-reference-4-from-the-metric-to-newton-s-gravitational-equations)=
````{dropdown} 4. From the metric to Newton's gravitational equations

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
````

(relativity-reference-5-three-predictions-from-a-spherical-gravitational-field)=
````{dropdown} 5. Three predictions from a spherical gravitational field

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
````

(relativity-reference-6-why-a-dynamical-metric-predicts-waves)=
````{dropdown} 6. Why a dynamical metric predicts waves

In a region where the metric is close to flat, write $g_{\mu\nu}=\eta_{\mu\nu}+h_{\mu\nu}$ with small $h_{\mu\nu}$. Define the trace-reversed perturbation $\bar h_{\mu\nu}=h_{\mu\nu}-\tfrac12\eta_{\mu\nu}h$, where $h=\eta^{\alpha\beta}h_{\alpha\beta}$.

With a suitable coordinate condition, the linearized vacuum field equation takes the form

```{math}
\Box\bar h_{\mu\nu}=0,
\qquad
\Box=-\frac{1}{c^2}\frac{\partial^2}{\partial t^2}+\nabla^2.
```

This is a wave equation with propagation speed $c$. Some apparent metric changes are just coordinate changes, but radiative solutions have a genuine oscillating tidal effect: they change the relative separations of freely falling bodies.[^detail-weak]

A binary source provides a stronger test than the existence of a wave alone. Its orbital evolution and waveform are linked through the same gravitational dynamics. One estimates physical source parameters and asks whether a consistent model explains the observed signal. Agreement is conditional on the source model and noise analysis; it is not obtained by assigning an arbitrary independent function to every part of the waveform.[^detail-gw150914]
````

(relativity-evidence-ledger)=
````{dropdown} 7. Experimental evidence ledger

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
````

(relativity-reference-8-comparing-alternatives-without-overstating-the-evidence)=
````{dropdown} 8. Comparing alternatives without overstating the evidence

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
````

(relativity-reference-9-exercises-with-answers)=
````{dropdown} 9. Exercises with answers

**Simultaneity.** In $S$, two events occur simultaneously, separated by one light-second along $x$. For a frame moving at $0.8c$, what is $\Delta t'$? Since $\Delta x=c\times1\,\mathrm s$ and $\gamma=5/3$, the answer is $-4/3\,\mathrm s$. The order reverses on changing the boost direction. The pair is spacelike, so no slower-than-light causal order is being reversed.

**A reunion of clocks.** A traveler spends a total of 10 years of laboratory coordinate time moving at speed $0.8c$ on an out-and-back path, ignoring a brief turnaround. The traveler accumulates 6 years. In a more realistic model, integrate over the acceleration segments rather than appending a separate unexplained “acceleration penalty.”

**A clock at greater height.** Two supported clocks near Earth's surface differ in height by $1\,\mathrm{km}$. With constant $g=9.81\,\mathrm{m\,s^{-2}}$, their fractional rate difference is $g\Delta h/c^2\approx1.09\times10^{-13}$. The higher clock gains about **9.43 nanoseconds per day**. This is a leading estimate that neglects rotation and local variations of the gravitational field.

**The Newtonian limit.** Expand $\gamma$ through order $v^4/c^4$. Insert it into $E=\gamma mc^2$ and subtract $mc^2$. The result is $K=\tfrac12mv^2+\tfrac38mv^4/c^2+\cdots$. The correction is small at ordinary speeds because its size relative to the Newtonian term is of order $v^2/c^2$.

**A falsification question.** A new theory predicts exactly the same solar-system metric as GR but a different gravitational-wave propagation speed. Would Mercury's precession alone distinguish it? No. One needs an observation sensitive to the differing prediction, such as a suitably modeled multimessenger propagation test. Conversely, passing that propagation test alone would not establish agreement with every other GR prediction.
````

(relativity-reference-sources-and-scope)=
````{dropdown} Sources and scope

The calculations in Sections 1–6 and 9 are worked deductions from the stated models. Numerical examples use rounded inputs and are not replacements for observational data analysis. The references below provide the theoretical frameworks and the original reports underlying the evidence ledger.
````

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
