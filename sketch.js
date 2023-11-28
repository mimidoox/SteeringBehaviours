let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
let state = "liste";


let sizeSlider, speedSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pursuer1 = new Vehicle(100, 100);
  pursuer2 = new Vehicle(random(width), random(height));

  vehicules.push(pursuer1);
  vehicules.push(pursuer2);

  // On cree un obstalce au milieu de l'écran
  // un cercle de rayon 100px
  // TODO
  obstacle = new Obstacle(width / 2, height / 2, 100);
  obstacles.push(obstacle);

  // Création des sliders
  sizeSlider = createSlider(10, 100, 50); // Valeur initiale: 50, plage: 10-100
  sizeSlider.position(10, 10); // Position du slider
  speedSlider = createSlider(1, 10, 5); // Valeur initiale: 5, plage: 1-10
  speedSlider.position(10, 30); // Position du slider
}

function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);

  // Dessin de la cible qui suit la souris
  // Dessine un cercle de rayon 32px à la position de la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);
  text(`Clique w pour Wander`, width - 160, 40);
  text(`Clique s pour Qeuleuleu`, width - 160, 60);
  text(`Clique l pour Leader`, width - 160, 80);
  text(`Clique d pour Debug`, width - 160, 100);
  text(`Clique v pour New vehicule`, width - 160, 120);

  // dessin des obstacles
  // TODO
  obstacles.forEach(o => {
    o.show();
  });
  let targetMouse = createVector(mouseX, mouseY);
  let targetPrevious;
  if(state == "liste"){
    for( i=0; i < vehicules.length; i++) {
      if(i==0){
        vehicules[i].applyBehaviors(targetMouse, obstacles, vehicules);
      }else{
        let vehiculePrecedent = vehicules[i-1];

        //targetPrevious = createVector(vehiculePrecedent.pos.x, vehiculePrecedent.pos.y);

        // en fait on veut viser un point derriere le vehicule précédent
        // On prend la vitesse du précédent et on en fait une copie
        let pointDerriere = vehiculePrecedent.vel.copy();
        // on le normalise
        pointDerriere.normalize();
        // et on le multiplie par une distance derrière le vaisseau
        pointDerriere.mult(-30);
        // on l'ajoute à la position du vaisseau
        pointDerriere.add(vehiculePrecedent.pos);

        // on le dessine sous la forme d'un cercle pour debug
        fill(255, 0, 0)
        circle(pointDerriere.x, pointDerriere.y, 10);

        vehicules[i].applyBehaviors(pointDerriere, obstacles, vehicules);

        // si le vehicule est à moins de 5 pixels du point derriere, on le fait s'arreter
        // en mettant le poids de son comportement arrive à 0
        // et en lui donnant comme direction du vecteur vel la direction du vecteur
        // entre sa position et le vaisseau précédent
        if(vehicules[i].pos.dist(pointDerriere) < 20 && vehicules[i].vel.mag() <0.01) {
          vehicules[i].weightArrive = 0;
          vehicules[i].weightObstacle = 0;
          vehicules[i].vel.setHeading(p5.Vector.sub(vehiculePrecedent.pos, vehicules[i].pos).heading());
          //console.log("stop");
        } else {
          vehicules[i].weightArrive = 0.3;
          vehicules[i].weightObstacle = 0.9;
          //console.log("nonstop");
        }

      }

      vehicules[i].update();
      vehicules[i].show();
    }
  }

  if (state == "leader") {
    let leader = vehicules[0].pos.copy();

    for (let i = 0; i < vehicules.length; i++) {
      if (i === 0) {
        vehicules[i].applyBehaviors(targetMouse, obstacles);
      } else {
        let vehiculePrecedent = vehicules[0];

        //targetPrevious = createVector(vehiculePrecedent.pos.x, vehiculePrecedent.pos.y);

        // en fait on veut viser un point derriere le vehicule précédent
        // END: be15d9bcejpp
      // On prend la vitesse du précédent et on en fait une copie
      let pointDerriere = vehiculePrecedent.vel.copy();
      // on le normalise
      pointDerriere.normalize();
      // et on le multiplie par une distance derrière le vaisseau
      pointDerriere.mult(-50);
      // on l'ajoute à la position du vaisseau
      pointDerriere.add(vehiculePrecedent.pos);

      // on le dessine sous la forme d'un cercle pour debug
      //fill(255, 0, 0)
      //circle(pointDerriere.x, pointDerriere.y, 10);
      
 
      let separation = vehicules[i].separation(vehicules);
      separation.mult(2);
      vehicules[i].applyForce(separation);
      //vehicules[i].applyBehaviors(leader, obstacles);

      let follow = vehicules[i].arrive(pointDerriere);
      follow.mult(0.5);
      vehicules[i].applyForce(follow);

      for (let i = 1; i < vehicules.length; i++) {
        if (vehicules[i].pos.dist(pursuer1.pos) < 20 && vehicules[i].vel.mag() < 0.01) {
          vehicules[i].weightArrive = 0;
          vehicules[i].weightObstacle = 0;
          vehicules[i].vel.setHeading(p5.Vector.sub(pursuer1.pos, vehicules[i].pos).heading());
        } else {
          vehicules[i].weightArrive = 0.3;
          vehicules[i].weightObstacle = 0.9;
        }
      }


      }
      vehicules[i].update();
      vehicules[i].show();
    }
  }
  if(state == "wander"){

      for(let i=1; i < vehicules.length; i++) {
        //vehicules[i].avoid(obstacles);
        vehicules[i].wander();
        vehicules[i].edges();
        vehicules[i].update();  
        vehicules[i].show();
      }
  }
}


function sliderPressed() {
  for(let i=0; i < vehicules.length; i++) {
    vehicules[i].vel = sizeSlider.value();
    vehicules[i].maxSpeed = speedSlider.value();
  }
}


function mousePressed() {
  obstacle = new Obstacle(mouseX, mouseY, random(5, 60));
  obstacles.push(obstacle);
}

function keyPressed() {
  if (key == "v") {
    vehicules.push(new Vehicle(random(width), random(height)));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  }
  if(key == "w"){
    state = "wander";

  }
  if(key == "s"){
    state = "liste";
  }

  if(key == "l"){
    state = "leader";
  }
  
  if (key == "f") {
    const nbMissiles = 10;

    // On tire des missiles !
    for(let i=0; i < nbMissiles; i++) {
      let x = 20+random(10);
      let y = random(height/2-5, random(height/2+5));

      let v = new Vehicle(x, y);
      vehicules.push(v);
    }
  }
}

