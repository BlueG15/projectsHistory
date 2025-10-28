# projectsHistory
(Almost) All my past random projects in one place!!

URL : https://blueg15.github.io/projectsHistory/main.html

Probably bad tbh, most codes here are very old;

Main website's controls
* `[Hover]` on a file to view its descriptions
* `[Double click]` to go to that page

## Demo section

### [Collision detection](https://blueg15.github.io/projectsHistory/demo/collision_detection/main.html)

Demo of an **“is point in a polygon”** test supporting convex and concave shapes — O(n).
Algorithm: Project a beam to the right of the test point; if it crosses an odd number of lines, the point is inside.
2025 comment: This algo is very primitive and proine to errors, maybe I will explore more options in the future.

---

### [No canvas FPS](https://blueg15.github.io/projectsHistory/demo/fps/main.html)

FPS camera using `rotate3d` CSS transforms.
**Controls:** Move with WASD, rotate with arrow keys.
Note: very jank — first 3D math attempt, mainly a concept test.

---

### [Conway’s Game of Life](https://blueg15.github.io/projectsHistory/demo/game_of_life/main.html)

Demo of a simple cellular automaton (configured as Conway’s Game of Life).
Note: input and simulation canvases are offset for unknown reasons — code too old to fix.

---

### [Graph Calc](https://blueg15.github.io/projectsHistory/demo/graph/main.html)

Graphing calculator.
Offset is optional — (0,0) is top-left; +x right, +y down.
Input accepts any JS function returning a number (common math ops + random supported).
Yes, input is sanitized. *Probably.*

---

### [Graph Calc with Explosion](https://blueg15.github.io/projectsHistory/demo/graph_with_explosion/main.html)

Game-like spin on the graphing calculator — try inputting wild functions and see what happens.
Forked from Graph Calc; same notes apply.

---

### [Grass Simulator 1](https://blueg15.github.io/projectsHistory/demo/grass_field/main.html)

Grassy field reacting to mouse movement.
Note: should probably be a wallpaper someday.

---

### [Hover 3D](https://blueg15.github.io/projectsHistory/demo/hover_3d/main.html)

3D card rotating with mouse movement.
Fun fact: accidentally recreated Steam trading cards.
Simplest demo math-wise.

---

### [Wave Simulator](https://blueg15.github.io/projectsHistory/demo/wave_sim/main.html)

Wave physics playground.
**Controls:** Left click to send a shockwave outward (strength depends on mouse distance).
Adjustable parameters include damping, strength, and more (no sliders, sorry).
Made to study wave interference.

---

### [DVD Bubble Sim](https://blueg15.github.io/projectsHistory/demo/dvd_bubble_sim/main.html)

DVD logo meets bubble effects. Pure fun.

---

### [Gulugulu Translator](https://blueg15.github.io/projectsHistory/demo/gulutrans/main.html)

Early experiment with **lossless encryption/decryption** (inefficient, but funny).

---

### [Glowing Dots](https://blueg15.github.io/projectsHistory/demo/glowing_dots/main.html)

Glowing dots follow your mouse using a **kd-tree** for fast nearest-neighbor search.

---

## Games section

### [That One Calculator Game](https://blueg15.github.io/projectsHistory/game/calculator/main.html)

Puzzle based on 7-segment display toggling.
**Goal:** turn off all the lights.

* `[Shuffle]` → Start playing (with timer)
* `[Clear]` → Restart
* `[Enter]` → Button do tbh, doesnt seem to affect anything

Inspired by *Lights Out*; likely solvable via linear algebra.
2025 note: Yeah totally solvale with algebra.

---

### [Grass Simulator 2 (Now with More FPS!)](https://blueg15.github.io/projectsHistory/game/grass/main.html)

WebGL experiment — faster and smoother than Grass 1, even without a kd-tree.
Now with cutting the grass!
