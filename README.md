# projectsHistory
(Almost )All my past random projects in one place!!

and because I am bad at wring descriptions, here is a JSON file:

{
    demo: {
        "collision_detection" : {
            url: "/demo/collision_detection/main.html",
            name: "Collision detection",
            desc: "Demo of a [Is point in a polygon] test, allow for both convex and concave, O(n).----------------------------------------Algo desciption: Project a beam to the right of the test point, if it crosses an odd number of lines, test point is in polygon, otherwise not."
        },
        "fps" : {
            url: "/demo/fps/main.html",
            name: "No canvas fps",
            desc: "Demo of a fps camera using css rotate3d.----------------------------------------Controls: Move using WASD.--------------------Rotate camara with arrow keys.----------------------------------------Note: very jank, even the collision detection is jank, granted this is the 1st time I deal with 3d maths and this is just a concept to see if the idea works."
        },
        "game_of_life" : {
            url: "/demo/game_of_life/main.html",
            name: "Conway's game of life",
            desc: "Demo of any cellular automaton, the code rn is config to conway game of life.----------------------------------------Note: Somehow the user input canvas and the simulation canvas is offset, idk why and the code is too old at this point to try to understand and fix, pls let me know if you found the cause."
        },
        "graph" : {
            url: "/demo/graph/main.html",
            name: "Graph calc",
            desc: "Demo of a graphing calculator.----------------------------------------Note: Leave offset blank to have it be the defaualt position, offset of the top left corner is 0, down is y+ and right is x+--------------------Technically the input is ANY js function that returns a number, I have support for common math ops + random without typing Math.----------------------------------------Yes the input is being sanitized, im not dum, though I may be dum enough to not sanitize all possible bad code."
        },
        "graph_with_explosion" : {
            url: "/demo/graph_with_explosion/main.html",
            name: "Graph calc with explosion",
            desc: "Demo of the game graph wars, just...input some functions and find out.----------------------------------------Notes: This is a folk of the graphing calculator demo, all notes of that project applies here too."
        },
        "grass_field" : {
            url: "/demo/grass_field/main.html",
            name: "Grass field",
            desc: "Demo of a grassy field that reacts to mouse movement.----------------------------------------Notes: I wonder how I can apply this as wallpaper"
        },
        "hover_3d" : {
            url: "/demo/hover_3d/main.html",
            name: "Hover 3d",
            desc: "Demo of a 3d card that rotates in 3d to your mouse cursor.----------------------------------------Notes: I made this b4 someone told me this is what steam tradin card looks like.--------------------This is the simplest demo code wise so far, just math."
        },
        "wave_sim" : {
            url: "/demo/wave_sim/main.html",
            name: "Wave simulator",
            desc: "Demo of wave physics.----------------------------------------Controls: Left click to send a shockwave away from it, proportional to how far the mouse is from the element----------------------------------------Notes: This was made as a study of how multiple waves interact--------------------There are like a bunch of values that can be tweak like how fast the wave should damp, how strong the force is, etc----------------------------------------No I will not make a slider for every single of them, sorry."
        }
    },
    game : {
        "calculator" : {
            url: "/game/calculator/main.html",
            name: "That one calculator game",
            desc: "The calculator game I demo to the qp community a while back.----------------------------------------Rules and Controls: Each number toggles the lights that number occupies in a 7 segment display, (on -> off and vice versa).--------------------The goal is given a random reachable state, turn off all the lights.----------------------------------------[Shuffle] button enters speedrun mode and [Clear] button disables it, I completely dont know what the [Enter] button do tbh, doesnt seem to affect anything----------------------------------------Notes: You can get a 00:00:00 time.--------------------This is very similar to [Lights out] and since that was solved using linear algebra, this probably can be as well.--------------------I wonder if any possible state is solvable."
        }
    }
}
